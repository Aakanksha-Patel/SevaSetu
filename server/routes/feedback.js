// =======================================================
// Feedback API Routes (Table: feedback)
// Fields: id, user_id, ngo_id, event_id, rating, comment, created_at
// Rating range: 1 to 5
// All queries strictly use parameterized SQL
// =======================================================

import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// SUBMIT FEEDBACK (Authenticated User or Volunteer)
router.post('/', authenticateToken, async (req, res) => {
  try {
    let { ngo_id, event_id = null, rating, comment } = req.body;

    const numRating = parseInt(rating, 10);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    // Auto-resolve ngo_id from event_id if omitted
    if (!ngo_id && event_id) {
      const [evRows] = await query('SELECT ngo_id FROM events WHERE id = ?', [Number(event_id)]);
      if (evRows && evRows.length > 0) {
        ngo_id = evRows[0].ngo_id;
      }
    }

    if (!ngo_id) {
      return res.status(400).json({ success: false, message: 'Target NGO ID is required.' });
    }

    // Verify NGO
    const [ngoRows] = await query('SELECT id, name FROM ngos WHERE id = ?', [Number(ngo_id)]);
    if (!ngoRows || ngoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'NGO organization not found.' });
    }

    // Parameterized INSERT into feedback table
    const [result] = await query(
      'INSERT INTO feedback (user_id, ngo_id, event_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, Number(ngo_id), event_id ? Number(event_id) : null, numRating, (comment || '').trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been registered.',
      feedbackId: result.insertId,
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
});

// GET My Submitted Feedback (Logged-in User)
router.get('/my-feedback', authenticateToken, async (req, res) => {
  try {
    const [rows] = await query(
      'SELECT * FROM feedback WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );

    const [ngos] = await query('SELECT id, name, logo, category FROM ngos');
    const [events] = await query('SELECT id, title FROM events');

    const ngoMap = {};
    (ngos || []).forEach((n) => {
      ngoMap[n.id] = n;
    });

    const eventMap = {};
    (events || []).forEach((e) => {
      eventMap[e.id] = e;
    });

    const enriched = (rows || []).map((f) => ({
      ...f,
      ngo_name: ngoMap[f.ngo_id]?.name || 'NGO Partner',
      ngo_logo: ngoMap[f.ngo_id]?.logo || '',
      ngo_category: ngoMap[f.ngo_id]?.category || '',
      event_title: f.event_id ? eventMap[f.event_id]?.title || 'Community Event' : null,
    }));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    console.error('Fetch my feedback error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve your feedback' });
  }
});

// GET Feedback Received by Logged-in NGO
router.get('/my-ngo-feedback', authenticateToken, async (req, res) => {
  try {
    let [ngoRows] = await query('SELECT id, name FROM ngos WHERE user_id = ?', [req.user.id]);
    if (!ngoRows || ngoRows.length === 0) {
      if (req.user.email) {
        [ngoRows] = await query('SELECT id, name FROM ngos WHERE email = ?', [req.user.email]);
      }
      if (!ngoRows || ngoRows.length === 0) {
        [ngoRows] = await query('SELECT id, name FROM ngos ORDER BY id ASC LIMIT 1');
      }
    }

    const ngoId = ngoRows && ngoRows.length > 0 ? ngoRows[0].id : 1;
    const ngoName = ngoRows && ngoRows.length > 0 ? ngoRows[0].name : 'NGO Partner';

    const [rows] = await query(
      'SELECT * FROM feedback WHERE ngo_id = ? ORDER BY id DESC',
      [ngoId]
    );

    const [users] = await query('SELECT id, name, profile_image, role FROM users');
    const userMap = {};
    (users || []).forEach((u) => {
      userMap[u.id] = u;
    });

    const [events] = await query('SELECT id, title FROM events');
    const eventMap = {};
    (events || []).forEach((e) => {
      eventMap[e.id] = e;
    });

    const enriched = (rows || []).map((f) => ({
      ...f,
      user_name: userMap[f.user_id]?.name || 'Community Member',
      user_avatar: userMap[f.user_id]?.profile_image || '',
      user_role: userMap[f.user_id]?.role || 'volunteer',
      ngo_name: ngoName,
      event_title: f.event_id ? eventMap[f.event_id]?.title || 'Event' : 'General Organization Feedback',
    }));

    const avgRating =
      enriched.length > 0
        ? (enriched.reduce((sum, f) => sum + Number(f.rating), 0) / enriched.length).toFixed(1)
        : '5.0';

    res.json({ success: true, count: enriched.length, avgRating, ngo_id: ngoId, data: enriched });
  } catch (error) {
    console.error('Fetch my-ngo-feedback error:', error);
    res.status(500).json({ success: false, message: 'Error fetching NGO feedback' });
  }
});

// GET Feedback for an NGO
router.get('/ngo/:ngoId', async (req, res) => {
  try {
    const ngoId = parseInt(req.params.ngoId, 10);
    const [rows] = await query(
      'SELECT * FROM feedback WHERE ngo_id = ? ORDER BY id DESC',
      [ngoId]
    );

    const [users] = await query('SELECT id, name, profile_image, role FROM users');
    const userMap = {};
    (users || []).forEach((u) => {
      userMap[u.id] = u;
    });

    const enriched = (rows || []).map((f) => ({
      ...f,
      user_name: userMap[f.user_id]?.name || 'Anonymous Contributor',
      user_avatar: userMap[f.user_id]?.profile_image || '',
      user_role: userMap[f.user_id]?.role || 'user',
    }));

    const avgRating =
      enriched.length > 0
        ? (enriched.reduce((sum, f) => sum + Number(f.rating), 0) / enriched.length).toFixed(1)
        : null;

    res.json({ success: true, count: enriched.length, avgRating, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching NGO feedback' });
  }
});

// GET Feedback for an Event
router.get('/event/:eventId', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const [rows] = await query(
      'SELECT * FROM feedback WHERE event_id = ? ORDER BY id DESC',
      [eventId]
    );

    const [users] = await query('SELECT id, name, profile_image FROM users');
    const userMap = {};
    (users || []).forEach((u) => {
      userMap[u.id] = u;
    });

    const enriched = (rows || []).map((f) => ({
      ...f,
      user_name: userMap[f.user_id]?.name || 'Participant',
      user_avatar: userMap[f.user_id]?.profile_image || '',
    }));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching event feedback' });
  }
});

export default router;
