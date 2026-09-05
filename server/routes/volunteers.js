// =======================================================
// Volunteers API Routes (Table: volunteers)
// Fields: id, user_id, skills, interests, availability, location, created_at
// All queries strictly use parameterized SQL
// =======================================================

import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all registered volunteers (Directory for NGOs & Admins)
router.get('/', async (req, res) => {
  try {
    const { location, search } = req.query;

    const [volunteers] = await query('SELECT * FROM volunteers ORDER BY id ASC');
    const [users] = await query('SELECT id, name, email, phone, profile_image, location FROM users');
    const [apps] = await query('SELECT volunteer_id, status FROM volunteer_applications');
    const [certs] = await query('SELECT volunteer_id FROM certificates');

    const userMap = {};
    (users || []).forEach((u) => {
      userMap[u.id] = u;
    });

    let list = (volunteers || []).map((v) => {
      const u = userMap[v.user_id] || {};
      const volunteerApps = (apps || []).filter((a) => a.volunteer_id === v.id);
      const volunteerCerts = (certs || []).filter((c) => c.volunteer_id === v.id);

      return {
        id: v.id,
        user_id: v.user_id,
        name: u.name || 'Dedicated Volunteer',
        email: u.email || '',
        phone: u.phone || '',
        location: v.location || u.location || 'India',
        profile_image: u.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        skills: v.skills || 'Community Support, Mentorship',
        interests: v.interests || 'Education, Health, Environment',
        availability: v.availability || 'Weekends & Evenings',
        total_drives_completed: volunteerApps.filter((a) => a.status === 'completed').length,
        certificates_count: volunteerCerts.length,
        created_at: v.created_at,
      };
    });

    if (location && location !== 'All') {
      list = list.filter((v) => v.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.skills.toLowerCase().includes(q) ||
          v.interests.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error('Fetch volunteers error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve volunteers' });
  }
});

// GET current logged-in volunteer profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [volRows] = await query('SELECT * FROM volunteers WHERE user_id = ?', [req.user.id]);
    const [userRows] = await query(
      'SELECT id, name, email, phone, profile_image, location, role FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = userRows && userRows.length > 0 ? userRows[0] : {};
    let volunteer = volRows && volRows.length > 0 ? volRows[0] : null;

    if (!volunteer) {
      // Auto create empty profile if doesn't exist
      const [insertRes] = await query(
        'INSERT INTO volunteers (user_id, skills, interests, availability, location) VALUES (?, ?, ?, ?, ?)',
        [
          req.user.id,
          'Community Support, Event Coordination',
          'Education, Healthcare, Environment',
          'Weekends & Evenings',
          user.location || 'India',
        ]
      );
      volunteer = {
        id: insertRes.insertId,
        user_id: req.user.id,
        skills: 'Community Support, Event Coordination',
        interests: 'Education, Healthcare, Environment',
        availability: 'Weekends & Evenings',
        location: user.location || 'India',
      };
    }

    res.json({
      success: true,
      data: {
        ...volunteer,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile_image: user.profile_image,
        user_location: user.location,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Fetch volunteer profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch volunteer profile' });
  }
});

// GET volunteer dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [volRows] = await query('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);
    if (!volRows || volRows.length === 0) {
      return res.json({
        success: true,
        data: {
          volunteer_hours: 0,
          events_joined: 0,
          pending_applications: 0,
          certificates_count: 0,
        },
      });
    }

    const volunteerId = volRows[0].id;
    const [apps] = await query(
      'SELECT status FROM volunteer_applications WHERE volunteer_id = ?',
      [volunteerId]
    );

    const [certs] = await query(
      'SELECT id FROM certificates WHERE volunteer_id = ?',
      [volunteerId]
    );

    const completedCount = (apps || []).filter((a) => a.status === 'completed').length;
    const acceptedCount = (apps || []).filter((a) => a.status === 'accepted').length;
    const pendingCount = (apps || []).filter((a) => a.status === 'pending').length;

    // Standard 4 hours per completed drive
    const volunteerHours = completedCount * 4;
    const eventsJoined = completedCount + acceptedCount;
    const certificatesCount = (certs || []).length;

    res.json({
      success: true,
      data: {
        volunteer_hours: volunteerHours,
        events_joined: eventsJoined,
        pending_applications: pendingCount,
        certificates_count: certificatesCount,
      },
    });
  } catch (error) {
    console.error('Fetch volunteer stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch volunteer statistics' });
  }
});

// UPDATE Volunteer Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { skills, interests, availability, location, name, phone, profile_image } = req.body;

    const [volRows] = await query('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);
    if (volRows && volRows.length > 0) {
      await query(
        'UPDATE volunteers SET skills = ?, interests = ?, availability = ?, location = ? WHERE user_id = ?',
        [skills, interests, availability, location, req.user.id]
      );
    } else {
      await query(
        'INSERT INTO volunteers (user_id, skills, interests, availability, location) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, skills, interests, availability, location]
      );
    }

    // Also update users table if personal info provided
    if (name || phone || profile_image || location) {
      await query(
        'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), profile_image = COALESCE(?, profile_image), location = COALESCE(?, location) WHERE id = ?',
        [name || null, phone || null, profile_image || null, location || null, req.user.id]
      );
    }

    res.json({ success: true, message: 'Volunteer profile updated successfully' });
  } catch (error) {
    console.error('Update volunteer profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

export default router;
