// =======================================================
// Volunteer Applications API Routes (Table: volunteer_applications)
// Fields: id, volunteer_id, event_id, status, applied_at
// Status values: pending, accepted, rejected, completed
// All queries strictly use parameterized SQL
// =======================================================

import express from 'express';
import { query } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// APPLY for an Event (Volunteers or Citizens)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const event_id = req.body.event_id || req.body.opportunity_id;
    if (!event_id) {
      return res.status(400).json({ success: false, message: 'Event ID is required.' });
    }

    // Verify Event exists
    const [eventRows] = await query('SELECT * FROM events WHERE id = ?', [Number(event_id)]);
    if (!eventRows || eventRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    const event = eventRows[0];

    // Find or create volunteer record for the logged-in user
    let volunteerId = null;
    const [volRows] = await query('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);
    if (volRows && volRows.length > 0) {
      volunteerId = volRows[0].id;
    } else {
      // Auto-create volunteer profile if user applies
      const [newVol] = await query(
        'INSERT INTO volunteers (user_id, skills, interests, availability, location) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'General Volunteering', 'Community Impact', 'Weekends', 'India']
      );
      volunteerId = newVol.insertId;
    }

    // Check duplicate application
    const [existing] = await query(
      'SELECT id, status FROM volunteer_applications WHERE volunteer_id = ? AND event_id = ?',
      [volunteerId, Number(event_id)]
    );
    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `You have already applied for this event (Current status: ${existing[0].status}).`,
      });
    }

    // Insert into volunteer_applications with status = 'pending'
    const [result] = await query(
      'INSERT INTO volunteer_applications (volunteer_id, event_id, status) VALUES (?, ?, ?)',
      [volunteerId, Number(event_id), 'pending']
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! The organizing NGO will review your application.',
      applicationId: result.insertId,
      id: result.insertId,
      application: {
        id: result.insertId,
        volunteer_id: volunteerId,
        event_id: Number(event_id),
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit volunteer application', error: error.message });
  }
});

// GET My Applications (Logged-in Volunteer)
router.get('/my-applications', authenticateToken, async (req, res) => {
  try {
    // Find volunteer ID
    const [volRows] = await query('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);
    if (!volRows || volRows.length === 0) {
      return res.json({ success: true, count: 0, data: [] });
    }
    const volunteerId = volRows[0].id;

    // Fetch applications
    const [apps] = await query('SELECT * FROM volunteer_applications WHERE volunteer_id = ? ORDER BY id DESC', [
      volunteerId,
    ]);

    // Attach event and NGO details
    const [events] = await query('SELECT * FROM events');
    const [ngos] = await query('SELECT id, name, logo, category FROM ngos');

    const eventMap = {};
    (events || []).forEach((e) => {
      eventMap[e.id] = e;
    });

    const ngoMap = {};
    (ngos || []).forEach((n) => {
      ngoMap[n.id] = n;
    });

    const enriched = (apps || []).map((app) => {
      const ev = eventMap[app.event_id] || {};
      const ng = ev.ngo_id ? ngoMap[ev.ngo_id] || {} : {};
      return {
        ...app,
        event: ev,
        event_title: ev.title || 'Community Event',
        event_date: ev.date || '',
        event_time: ev.time || '',
        event_location: ev.location || '',
        event_category: ev.category || 'Volunteering',
        event_image: ev.image || '',
        required_volunteers: ev.required_volunteers || 10,
        ngo_name: ng.name || 'NGO Partner',
        ngo_logo: ng.logo || '',
        ngo_category: ng.category || '',
        ngo_id: ev.ngo_id,
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

// GET Applications for NGO's Events
router.get('/ngo-applications', authenticateToken, authorizeRoles('ngo', 'admin'), async (req, res) => {
  try {
    let ngoId = null;
    if (req.user.role === 'ngo') {
      const [ngoRows] = await query('SELECT id FROM ngos WHERE user_id = ?', [req.user.id]);
      if (ngoRows && ngoRows.length > 0) {
        ngoId = ngoRows[0].id;
      }
    }

    const [apps] = await query('SELECT * FROM volunteer_applications ORDER BY id DESC');
    const [events] = await query('SELECT * FROM events');
    const [volunteers] = await query('SELECT * FROM volunteers');
    const [users] = await query('SELECT id, name, email, phone, profile_image FROM users');

    const eventMap = {};
    (events || []).forEach((e) => {
      eventMap[e.id] = e;
    });

    const volMap = {};
    (volunteers || []).forEach((v) => {
      volMap[v.id] = v;
    });

    const userMap = {};
    (users || []).forEach((u) => {
      userMap[u.id] = u;
    });

    let list = (apps || []).map((app) => {
      const ev = eventMap[app.event_id] || {};
      const vol = volMap[app.volunteer_id] || {};
      const usr = vol.user_id ? userMap[vol.user_id] || {} : {};

      return {
        ...app,
        event_title: ev.title || 'Community Drive',
        event_ngo_id: ev.ngo_id,
        volunteer_name: usr.name || 'Volunteer',
        volunteer_email: usr.email || '',
        volunteer_phone: usr.phone || '',
        volunteer_skills: vol.skills || 'General Outreach',
      };
    });

    if (ngoId) {
      list = list.filter((a) => a.event_ngo_id === ngoId);
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve applications' });
  }
});

// UPDATE application status (accepted, rejected, completed)
const handleApplicationStatusUpdate = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    await query('UPDATE volunteer_applications SET status = ? WHERE id = ?', [status, id]);

    // If status is completed, automatically ensure certificate is issued in MySQL
    if (status === 'completed') {
      const [apps] = await query('SELECT * FROM volunteer_applications WHERE id = ?', [id]);
      if (apps && apps.length > 0) {
        const app = apps[0];
        const [existingCerts] = await query(
          'SELECT id FROM certificates WHERE volunteer_id = ? AND event_id = ?',
          [app.volunteer_id, app.event_id]
        );
        if (!existingCerts || existingCerts.length === 0) {
          const certNumber = `SEVA-${new Date().getFullYear()}-CERT-${Math.floor(1000 + Math.random() * 9000)}`;
          await query(
            'INSERT INTO certificates (volunteer_id, event_id, certificate_number) VALUES (?, ?, ?)',
            [app.volunteer_id, app.event_id, certNumber]
          );
        }
      }
    }

    res.json({ success: true, message: `Application status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
};

router.patch('/:id/status', authenticateToken, authorizeRoles('ngo', 'admin'), handleApplicationStatusUpdate);
router.put('/:id/status', authenticateToken, authorizeRoles('ngo', 'admin'), handleApplicationStatusUpdate);

export default router;
