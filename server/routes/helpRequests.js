// =======================================================
// Community Help Requests API Routes
// =======================================================

import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all help requests (Public / Authenticated)
router.get('/', async (req, res) => {
  try {
    const { status, urgency } = req.query;
    const [requests] = await query('SELECT * FROM help_requests ORDER BY id DESC');
    
    let list = requests || [];
    if (status && status !== 'All') {
      list = list.filter((r) => r.status === status);
    }
    if (urgency && urgency !== 'All') {
      list = list.filter((r) => r.urgency === urgency);
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving help requests' });
  }
});

// POST new help request (Users or Visitors)
router.post('/', async (req, res) => {
  try {
    const { requester_name, contact_number, location, urgency = 'medium', category, description, user_id } = req.body;

    if (!requester_name || !contact_number || !location || !category || !description) {
      return res.status(400).json({ success: false, message: 'Please fill in all required contact and request fields.' });
    }

    const [result] = await query(
      'INSERT INTO help_requests (user_id, requester_name, contact_number, location, urgency, category, description, status, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        user_id || null,
        requester_name.trim(),
        contact_number.trim(),
        location.trim(),
        urgency,
        category,
        description.trim(),
        'pending',
        'Unassigned',
      ]
    );

    // Audit log
    await query(
      'INSERT INTO activity_logs (actor_name, actor_role, action, details) VALUES (?, ?, ?, ?)',
      [requester_name, 'user', 'Submitted Help Request', `Requested assistance for: ${category} (${urgency} urgency)`]
    );

    res.status(201).json({
      success: true,
      message: 'Help request submitted successfully. Local NGOs and community volunteers have been alerted.',
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit help request' });
  }
});

// CLAIM or ASSIGN request (NGO / Volunteer / Admin)
router.patch('/:id/assign', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const assignedTo = req.body.assigned_to || req.user.name;

    const [reqs] = await query('SELECT * FROM help_requests WHERE id = ?', [id]);
    if (!reqs || reqs.length === 0) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    const target = reqs[0];
    target.status = 'in_progress';
    target.assigned_to = assignedTo;

    await query('UPDATE help_requests SET status = ?, assigned_to = ? WHERE id = ?', ['in_progress', assignedTo, id]);

    res.json({ success: true, message: `Help request assigned to ${assignedTo}`, data: target });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to assign help request' });
  }
});

// UPDATE status directly
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, assigned_to } = req.body;
    const [reqs] = await query('SELECT * FROM help_requests WHERE id = ?', [id]);
    if (!reqs || reqs.length === 0) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    const assigned = assigned_to || reqs[0].assigned_to || req.user?.name || 'Local Volunteer';
    await query('UPDATE help_requests SET status = ?, assigned_to = ? WHERE id = ?', [status, assigned, id]);

    res.json({ success: true, message: `Status updated to ${status}`, data: { ...reqs[0], status, assigned_to: assigned } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update help request status' });
  }
});

// RESOLVE request
router.patch('/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [reqs] = await query('SELECT * FROM help_requests WHERE id = ?', [id]);
    if (!reqs || reqs.length === 0) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    const target = reqs[0];
    target.status = 'resolved';

    await query('UPDATE help_requests SET status = ? WHERE id = ?', ['resolved', id]);

    res.json({ success: true, message: 'Help request marked as resolved. Great work!', data: target });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to resolve request' });
  }
});

export default router;
