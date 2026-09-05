// =======================================================
// Certificates API Routes (Table: certificates)
// Fields: id, volunteer_id, event_id, certificate_number, issued_date
// All queries strictly use parameterized SQL
// =======================================================

import express from 'express';
import { query } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// ISSUE / GENERATE CERTIFICATE (NGO or Admin upon completed service)
router.post('/generate', authenticateToken, authorizeRoles('ngo', 'admin'), async (req, res) => {
  try {
    const { volunteer_id, event_id } = req.body;

    if (!volunteer_id || !event_id) {
      return res.status(400).json({ success: false, message: 'Both volunteer_id and event_id are required.' });
    }

    // Check if certificate already exists
    const [existing] = await query(
      'SELECT * FROM certificates WHERE volunteer_id = ? AND event_id = ?',
      [Number(volunteer_id), Number(event_id)]
    );
    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A certificate has already been issued for this volunteer and event.',
        certificate: existing[0],
      });
    }

    // Generate unique verifiable certificate number
    const certNumber = `SEVA-${new Date().getFullYear()}-CERT-${Math.floor(1000 + Math.random() * 9000)}`;

    const [result] = await query(
      'INSERT INTO certificates (volunteer_id, event_id, certificate_number) VALUES (?, ?, ?)',
      [Number(volunteer_id), Number(event_id), certNumber]
    );

    // Also mark the application as completed if still pending/accepted
    await query(
      'UPDATE volunteer_applications SET status = ? WHERE volunteer_id = ? AND event_id = ?',
      ['completed', Number(volunteer_id), Number(event_id)]
    );

    res.status(201).json({
      success: true,
      message: `Official certificate generated: ${certNumber}`,
      certificateId: result.insertId,
      certificateNumber: certNumber,
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to issue certificate' });
  }
});

// GET My Certificates (Logged-in Volunteer)
router.get('/my-certificates', authenticateToken, async (req, res) => {
  try {
    // Find volunteer ID
    const [volRows] = await query('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);
    if (!volRows || volRows.length === 0) {
      return res.json({ success: true, count: 0, data: [] });
    }
    const volunteerId = volRows[0].id;

    const [certs] = await query(
      'SELECT * FROM certificates WHERE volunteer_id = ? ORDER BY id DESC',
      [volunteerId]
    );

    // Attach Event and NGO details
    const [events] = await query('SELECT * FROM events');
    const [ngos] = await query('SELECT id, name, logo FROM ngos');

    const eventMap = {};
    (events || []).forEach((e) => {
      eventMap[e.id] = e;
    });

    const ngoMap = {};
    (ngos || []).forEach((n) => {
      ngoMap[n.id] = n;
    });

    const enriched = (certs || []).map((c) => {
      const ev = eventMap[c.event_id] || {};
      const ng = ev.ngo_id ? ngoMap[ev.ngo_id] || {} : {};
      return {
        ...c,
        event_title: ev.title || 'Community Service Drive',
        event_category: ev.category || 'Volunteering',
        event_date: ev.date || '',
        event_location: ev.location || '',
        ngo_name: ng.name || 'SevaSetu Verified Partner',
        recipient_name: req.user.name,
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving certificates' });
  }
});

// PUBLIC VERIFICATION of Certificate Number
router.get('/verify/:certNumber', async (req, res) => {
  try {
    const certNumber = req.params.certNumber.trim().toUpperCase();
    const [rows] = await query(
      'SELECT * FROM certificates WHERE certificate_number = ?',
      [certNumber]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, verified: false, message: 'Certificate not found or invalid.' });
    }

    const cert = rows[0];

    // Fetch volunteer user
    const [volRows] = await query('SELECT user_id FROM volunteers WHERE id = ?', [cert.volunteer_id]);
    let volunteerName = 'Certified Volunteer';
    if (volRows && volRows.length > 0) {
      const [uRows] = await query('SELECT name FROM users WHERE id = ?', [volRows[0].user_id]);
      if (uRows && uRows.length > 0) volunteerName = uRows[0].name;
    }

    // Fetch event and NGO
    const [eventRows] = await query('SELECT * FROM events WHERE id = ?', [cert.event_id]);
    const event = eventRows && eventRows.length > 0 ? eventRows[0] : {};
    let ngoName = 'SevaSetu Verified NGO';
    if (event.ngo_id) {
      const [ngoRows] = await query('SELECT name FROM ngos WHERE id = ?', [event.ngo_id]);
      if (ngoRows && ngoRows.length > 0) ngoName = ngoRows[0].name;
    }

    res.json({
      success: true,
      verified: true,
      data: {
        certificate_number: cert.certificate_number,
        issued_date: cert.issued_date,
        volunteer_name: volunteerName,
        event_title: event.title || 'Community Drive',
        event_date: event.date || '',
        ngo_name: ngoName,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Certificate verification failed' });
  }
});

export default router;
