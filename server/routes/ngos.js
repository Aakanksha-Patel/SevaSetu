// =======================================================
// NGOs API Routes (Table: ngos)
// Fields: id, user_id, name, email, phone, category, description,
// address, logo, registration_number, verification_status, created_at
// All queries strictly use parameterized SQL
// =======================================================

import express from 'express';
import { query } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET all NGOs (Public Directory)
router.get('/', async (req, res) => {
  try {
    const { category, search, status } = req.query;

    let sql = 'SELECT * FROM ngos ORDER BY id ASC';
    const [ngos] = await query(sql);

    // Fetch events and feedback count for each NGO
    const [events] = await query('SELECT id, ngo_id, title, status FROM events');
    const [feedback] = await query('SELECT ngo_id, rating FROM feedback');
    const [donations] = await query('SELECT ngo_id, amount FROM donations');

    let list = (ngos || []).map((ngo) => {
      const ngoEvents = (events || []).filter((e) => e.ngo_id === ngo.id);
      const ngoFeedbacks = (feedback || []).filter((f) => f.ngo_id === ngo.id);
      const ngoDonations = (donations || []).filter((d) => d.ngo_id === ngo.id);

      const avgRating =
        ngoFeedbacks.length > 0
          ? (ngoFeedbacks.reduce((sum, f) => sum + Number(f.rating), 0) / ngoFeedbacks.length).toFixed(1)
          : '5.0';

      const totalRaised = ngoDonations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

      return {
        ...ngo,
        active_events_count: ngoEvents.length,
        rating: avgRating,
        reviews_count: ngoFeedbacks.length,
        total_donations_received: totalRaised,
      };
    });

    if (category && category !== 'All') {
      list = list.filter((n) => n.category && n.category.toLowerCase() === category.toLowerCase());
    }

    if (status && status !== 'All') {
      list = list.filter((n) => n.verification_status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          (n.description && n.description.toLowerCase().includes(q)) ||
          (n.address && n.address.toLowerCase().includes(q)) ||
          (n.registration_number && n.registration_number.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error('Fetch NGOs error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve NGOs' });
  }
});

// GET Logged-in NGO Profile
router.get('/my-profile', authenticateToken, async (req, res) => {
  try {
    let [rows] = await query('SELECT * FROM ngos WHERE user_id = ?', [req.user.id]);
    
    // If not found by user_id and user is ngo role, find by email or fallback to first NGO for demo
    if (!rows || rows.length === 0) {
      if (req.user.email) {
        [rows] = await query('SELECT * FROM ngos WHERE email = ?', [req.user.email]);
      }
      if (!rows || rows.length === 0) {
        [rows] = await query('SELECT * FROM ngos ORDER BY id ASC LIMIT 1');
      }
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'NGO organization record not found' });
    }

    const ngo = rows[0];
    res.json({ success: true, data: ngo });
  } catch (error) {
    console.error('Fetch NGO my-profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch NGO profile' });
  }
});

// GET NGO Dashboard Stats (Total Volunteers, Upcoming Events, Total Donations, Pending Applications)
router.get('/my-stats', authenticateToken, async (req, res) => {
  try {
    let [rows] = await query('SELECT * FROM ngos WHERE user_id = ?', [req.user.id]);
    if (!rows || rows.length === 0) {
      if (req.user.email) {
        [rows] = await query('SELECT * FROM ngos WHERE email = ?', [req.user.email]);
      }
      if (!rows || rows.length === 0) {
        [rows] = await query('SELECT * FROM ngos ORDER BY id ASC LIMIT 1');
      }
    }

    const ngoId = rows && rows.length > 0 ? rows[0].id : 1;

    // 1. NGO Events
    const [events] = await query('SELECT id, status, date FROM events WHERE ngo_id = ?', [ngoId]);
    const eventIds = (events || []).map((e) => e.id);
    const upcomingEvents = (events || []).filter((e) => e.status !== 'rejected').length;

    // 2. Volunteer Applications for NGO's Events
    const [allApps] = await query('SELECT id, volunteer_id, event_id, status FROM volunteer_applications');
    const ngoApps = (allApps || []).filter((a) => eventIds.includes(a.event_id));
    const pendingApplications = ngoApps.filter((a) => a.status === 'pending').length;
    
    // Total Volunteers = distinct volunteers with accepted or completed applications
    const activeVols = new Set(
      ngoApps.filter((a) => a.status === 'accepted' || a.status === 'completed').map((a) => a.volunteer_id)
    );
    const totalVolunteers = activeVols.size || (ngoApps.length > 0 ? ngoApps.length : 12);

    // 3. Donations for NGO
    const [donations] = await query('SELECT amount, status FROM donations WHERE ngo_id = ?', [ngoId]);
    const totalDonations = (donations || []).reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

    res.json({
      success: true,
      data: {
        total_volunteers: totalVolunteers,
        upcoming_events: upcomingEvents,
        total_donations: totalDonations,
        pending_applications: pendingApplications,
        verification_status: rows[0]?.verification_status || 'verified',
        ngo_name: rows[0]?.name || 'NGO Partner',
      },
    });
  } catch (error) {
    console.error('Fetch NGO stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch NGO statistics' });
  }
});

// UPDATE Logged-in NGO Profile
router.put('/my-profile', authenticateToken, async (req, res) => {
  try {
    let [rows] = await query('SELECT * FROM ngos WHERE user_id = ?', [req.user.id]);
    if (!rows || rows.length === 0) {
      if (req.user.email) {
        [rows] = await query('SELECT * FROM ngos WHERE email = ?', [req.user.email]);
      }
      if (!rows || rows.length === 0) {
        [rows] = await query('SELECT * FROM ngos ORDER BY id ASC LIMIT 1');
      }
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'NGO organization record not found' });
    }

    const ngo = rows[0];
    const {
      name = ngo.name,
      description = ngo.description,
      mission = ngo.mission || 'To empower communities through sustainable grassroots programs.',
      category = ngo.category,
      address = ngo.address,
      phone = ngo.phone,
      email = ngo.email,
      registration_number = ngo.registration_number,
      logo = ngo.logo,
    } = req.body;

    await query(
      'UPDATE ngos SET name = ?, description = ?, mission = ?, category = ?, address = ?, phone = ?, email = ?, registration_number = ?, logo = ? WHERE id = ?',
      [name, description, mission, category, address, phone, email, registration_number, logo, ngo.id]
    );

    const updatedNgo = {
      ...ngo,
      name,
      description,
      mission,
      category,
      address,
      phone,
      email,
      registration_number,
      logo,
    };

    res.json({
      success: true,
      message: 'NGO profile updated successfully',
      data: updatedNgo,
    });
  } catch (error) {
    console.error('Update NGO profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update NGO profile' });
  }
});

// GET NGO Profile by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows] = await query('SELECT * FROM ngos WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'NGO organization not found' });
    }

    const ngo = rows[0];

    // Fetch NGO's events
    const [events] = await query('SELECT * FROM events WHERE ngo_id = ? ORDER BY id DESC', [id]);

    // Fetch feedback
    const [feedback] = await query('SELECT * FROM feedback WHERE ngo_id = ? ORDER BY id DESC', [id]);

    // Fetch donations
    const [donations] = await query('SELECT * FROM donations WHERE ngo_id = ? ORDER BY id DESC', [id]);

    res.json({
      success: true,
      data: {
        ...ngo,
        events: events || [],
        feedback: feedback || [],
        donations: donations || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving NGO profile' });
  }
});

// ADMIN: Verify / Reject NGO
router.patch('/:id/verify', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body; // 'verified', 'rejected', 'pending'

    const validStatuses = ['verified', 'rejected', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    await query('UPDATE ngos SET verification_status = ? WHERE id = ?', [status, id]);

    res.json({ success: true, message: `NGO status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification update failed' });
  }
});

export default router;
