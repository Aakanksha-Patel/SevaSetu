// =======================================================
// Events API Routes (Table: events)
// Fields: id, ngo_id, title, description, category, date,
// time, location, image, required_volunteers, status, created_at
// Status: pending, approved, rejected, completed
// All queries strictly use parameterized SQL ($1 or ?)
// =======================================================

import express from 'express';
import { query, mockDatabase } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET all events (Public)
router.get('/', async (req, res) => {
  try {
    const { category, status, search, ngo_id } = req.query;
    
    // Parameterized base query
    let sql = 'SELECT * FROM events ORDER BY id DESC';
    const [events] = await query(sql);

    // Fetch NGOs to attach NGO organization names and details
    const [ngos] = await query('SELECT id, name, logo, category, verification_status FROM ngos');
    const ngoMap = {};
    (ngos || []).forEach((n) => {
      ngoMap[n.id] = n;
    });

    // Fetch volunteer applications count
    const [apps] = await query('SELECT event_id, status FROM volunteer_applications');
    const appCountMap = {};
    (apps || []).forEach((a) => {
      if (a.status === 'accepted' || a.status === 'completed') {
        appCountMap[a.event_id] = (appCountMap[a.event_id] || 0) + 1;
      }
    });

    let list = (events || []).map((e) => ({
      ...e,
      ngo: ngoMap[e.ngo_id] || { name: 'Verified NGO Partner', category: e.category },
      ngo_name: ngoMap[e.ngo_id]?.name || 'Verified NGO Partner',
      volunteers_registered: appCountMap[e.id] || 0,
    }));

    if (category && category !== 'All') {
      list = list.filter((e) => e.category && e.category.toLowerCase() === category.toLowerCase());
    }

    if (status && status.toLowerCase() !== 'all') {
      list = list.filter((e) => e.status && e.status.toLowerCase() === status.toLowerCase());
    } else if (!status && !ngo_id) {
      // Default public visibility: only approved events are visible to public visitors
      list = list.filter((e) => e.status === 'approved');
    }

    if (ngo_id) {
      list = list.filter((e) => e.ngo_id === Number(ngo_id));
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          (e.ngo_name && e.ngo_name.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve events' });
  }
});

// GET single event by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows] = await query('SELECT * FROM events WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const event = rows[0];

    // Fetch organizing NGO
    const [ngoRows] = await query('SELECT * FROM ngos WHERE id = ?', [event.ngo_id]);
    const ngo = ngoRows && ngoRows.length > 0 ? ngoRows[0] : null;

    // Fetch event feedback
    const [feedbackRows] = await query('SELECT * FROM feedback WHERE event_id = ? ORDER BY id DESC', [id]);

    // Fetch accepted volunteers count
    const [apps] = await query('SELECT * FROM volunteer_applications WHERE event_id = ?', [id]);

    res.json({
      success: true,
      data: {
        ...event,
        ngo,
        feedback: feedbackRows || [],
        applications: apps || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving event' });
  }
});

// CREATE new event (NGO or Admin only)
router.post('/', authenticateToken, authorizeRoles('ngo', 'admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      location,
      image,
      required_volunteers = 10,
    } = req.body;

    if (!title || !description || !category || !date || !time || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, date, time, and location.',
      });
    }

    // Determine NGO ID
    let ngoId = req.body.ngo_id ? Number(req.body.ngo_id) : null;
    if (req.user.role === 'ngo') {
      let [ngoRows] = await query('SELECT id FROM ngos WHERE user_id = ?', [req.user.id]);
      if (!ngoRows || ngoRows.length === 0) {
        if (req.user.email) {
          [ngoRows] = await query('SELECT id FROM ngos WHERE email = ?', [req.user.email]);
        }
      }
      if (ngoRows && ngoRows.length > 0) {
        ngoId = ngoRows[0].id;
      } else {
        return res.status(400).json({ success: false, message: 'NGO organization profile not found for this account.' });
      }
    } else if (!ngoId) {
      const [allNgos] = await query('SELECT id FROM ngos ORDER BY id ASC LIMIT 1');
      ngoId = allNgos && allNgos.length > 0 ? allNgos[0].id : 1;
    }

    const eventImage =
      image ||
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=800';

    // Status: New events created by NGO have status 'pending' awaiting Admin approval. Admin-created events are 'approved'.
    const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

    const [result] = await query(
      'INSERT INTO events (ngo_id, title, description, category, date, time, location, image, required_volunteers, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        ngoId,
        title.trim(),
        description.trim(),
        category,
        date,
        time,
        location.trim(),
        eventImage,
        Number(required_volunteers) || 10,
        initialStatus,
      ]
    );

    const createdEvent = {
      id: result.insertId,
      ngo_id: ngoId,
      title: title.trim(),
      description: description.trim(),
      category,
      date,
      time,
      location: location.trim(),
      image: eventImage,
      required_volunteers: Number(required_volunteers) || 10,
      status: initialStatus,
    };

    res.status(201).json({
      success: true,
      message:
        initialStatus === 'pending'
          ? 'Event submitted successfully! It is now pending admin approval before being visible publicly.'
          : 'Event published successfully!',
      eventId: result.insertId,
      id: result.insertId,
      event: createdEvent,
      data: createdEvent,
      status: initialStatus,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

// EDIT event (NGO owner or Admin)
router.put('/:id', authenticateToken, authorizeRoles('ngo', 'admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows] = await query('SELECT * FROM events WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const event = rows[0];

    // Check ownership if role is ngo
    if (req.user.role === 'ngo') {
      const [ngoRows] = await query('SELECT id FROM ngos WHERE user_id = ?', [req.user.id]);
      if (ngoRows && ngoRows.length > 0 && event.ngo_id !== ngoRows[0].id) {
        return res.status(403).json({ success: false, message: 'You do not have permission to edit this event' });
      }
    }

    const {
      title = event.title,
      description = event.description,
      category = event.category,
      date = event.date,
      time = event.time,
      location = event.location,
      image = event.image,
      required_volunteers = event.required_volunteers,
    } = req.body;

    await query(
      'UPDATE events SET title = ?, description = ?, category = ?, date = ?, time = ?, location = ?, image = ?, required_volunteers = ? WHERE id = ?',
      [
        title.trim(),
        description.trim(),
        category,
        date,
        time,
        location.trim(),
        image,
        Number(required_volunteers) || 10,
        id,
      ]
    );

    res.json({
      success: true,
      message: 'Event updated successfully!',
      data: {
        ...event,
        title,
        description,
        category,
        date,
        time,
        location,
        image,
        required_volunteers: Number(required_volunteers) || 10,
      },
    });
  } catch (error) {
    console.error('Edit event error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
});

// DELETE event (NGO owner or Admin)
router.delete('/:id', authenticateToken, authorizeRoles('ngo', 'admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows] = await query('SELECT * FROM events WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const event = rows[0];

    // Check ownership if role is ngo
    if (req.user.role === 'ngo') {
      const [ngoRows] = await query('SELECT id FROM ngos WHERE user_id = ?', [req.user.id]);
      if (ngoRows && ngoRows.length > 0 && event.ngo_id !== ngoRows[0].id) {
        return res.status(403).json({ success: false, message: 'You do not have permission to delete this event' });
      }
    }

    // Delete event
    await query('DELETE FROM events WHERE id = ?', [id]);

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

// UPDATE event status (pending, approved, rejected, completed)
const handleEventStatusUpdate = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    await query('UPDATE events SET status = ? WHERE id = ?', [status, id]);

    // If event is marked completed, mark all accepted volunteer applications as completed and issue certificates
    if (status === 'completed') {
      const [acceptedApps] = await query(
        'SELECT * FROM volunteer_applications WHERE event_id = ? AND status = ?',
        [id, 'accepted']
      );
      if (acceptedApps && acceptedApps.length > 0) {
        for (const app of acceptedApps) {
          await query('UPDATE volunteer_applications SET status = ? WHERE id = ?', ['completed', app.id]);
          const [existingCerts] = await query(
            'SELECT id FROM certificates WHERE volunteer_id = ? AND event_id = ?',
            [app.volunteer_id, id]
          );
          if (!existingCerts || existingCerts.length === 0) {
            const certNumber = `SEVA-${new Date().getFullYear()}-CERT-${Math.floor(1000 + Math.random() * 9000)}`;
            await query(
              'INSERT INTO certificates (volunteer_id, event_id, certificate_number) VALUES (?, ?, ?)',
              [app.volunteer_id, id, certNumber]
            );
          }
        }
      }
    }

    res.json({ success: true, message: `Event status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update event status' });
  }
};

router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'ngo'), handleEventStatusUpdate);
router.put('/:id/status', authenticateToken, authorizeRoles('admin', 'ngo'), handleEventStatusUpdate);

export default router;
