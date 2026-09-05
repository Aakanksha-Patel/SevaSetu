// =======================================================
// Donations API Routes (Table: donations)
// Fields: id, user_id, ngo_id, amount, status, donated_at
// All queries strictly use parameterized SQL
// =======================================================

import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// PROCESS A DONATION to an NGO
// Open to logged-in users, volunteers, or guest donors
router.post('/', async (req, res) => {
  try {
    let { ngo_id, amount, user_id, donor_name, donor_email } = req.body;

    // If user_id is not explicitly sent, attempt to extract from Bearer token
    if (!user_id && req.headers.authorization) {
      try {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
          const decoded = jwt.verify(parts[1], JWT_SECRET);
          if (decoded && decoded.id) {
            user_id = decoded.id;
          }
        }
      } catch (e) {
        // Guest or invalid token, proceed with null or guest
      }
    }

    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please specify a valid donation amount.' });
    }

    if (!ngo_id) {
      return res.status(400).json({ success: false, message: 'Target NGO ID is required.' });
    }

    // Verify NGO exists
    const [ngoRows] = await query('SELECT id, name FROM ngos WHERE id = ?', [Number(ngo_id)]);
    if (!ngoRows || ngoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'NGO organization not found.' });
    }
    const ngo = ngoRows[0];

    // Parameterized INSERT into donations table
    const [result] = await query(
      'INSERT INTO donations (user_id, ngo_id, amount, status) VALUES (?, ?, ?, ?)',
      [user_id ? Number(user_id) : null, Number(ngo_id), donationAmount, 'completed']
    );

    const transactionId = `TXN-SEVA-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    res.status(201).json({
      success: true,
      message: `Thank you! Your donation of ₹${donationAmount.toLocaleString()} to ${ngo.name} was successfully recorded.`,
      donationId: result.insertId,
      transactionId,
      donation: {
        id: result.insertId,
        user_id: user_id ? Number(user_id) : null,
        ngo_id: Number(ngo_id),
        ngo_name: ngo.name,
        amount: donationAmount,
        status: 'completed',
        donated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Donation error:', error);
    res.status(500).json({ success: false, message: 'Failed to process donation', error: error.message });
  }
});

// GET My Donations (Logged-in User)
router.get('/my-donations', authenticateToken, async (req, res) => {
  try {
    const [donations] = await query(
      'SELECT * FROM donations WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );

    // Fetch NGOs to attach names
    const [ngos] = await query('SELECT id, name, logo, category FROM ngos');
    const ngoMap = {};
    (ngos || []).forEach((n) => {
      ngoMap[n.id] = n;
    });

    const enriched = (donations || []).map((d) => ({
      ...d,
      ngo_name: ngoMap[d.ngo_id]?.name || 'Social Impact Partner',
      ngo_logo: ngoMap[d.ngo_id]?.logo || '',
      ngo_category: ngoMap[d.ngo_id]?.category || 'Charity',
    }));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving your donations' });
  }
});

// GET Donations Received by Logged-in NGO
router.get('/my-ngo-donations', authenticateToken, async (req, res) => {
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

    const [donations] = await query(
      'SELECT * FROM donations WHERE ngo_id = ? ORDER BY id DESC',
      [ngoId]
    );

    const [users] = await query('SELECT id, name, email, phone FROM users');
    const userMap = {};
    (users || []).forEach((u) => {
      userMap[u.id] = u;
    });

    const enriched = (donations || []).map((d) => ({
      ...d,
      donor_name: d.user_id ? userMap[d.user_id]?.name || 'Registered Citizen' : 'Generous Citizen',
      donor_email: d.user_id ? userMap[d.user_id]?.email || 'donor@citizen.org' : 'anonymous@donor.org',
      donor_phone: d.user_id ? userMap[d.user_id]?.phone || '' : '',
      ngo_name: ngoName,
    }));

    const totalAmount = enriched.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

    res.json({ success: true, count: enriched.length, totalAmount, ngo_id: ngoId, data: enriched });
  } catch (error) {
    console.error('Fetch my-ngo-donations error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving NGO donations' });
  }
});

// GET Donations Received by an NGO
router.get('/ngo/:ngoId', async (req, res) => {
  try {
    const ngoId = parseInt(req.params.ngoId, 10);
    const [donations] = await query(
      'SELECT * FROM donations WHERE ngo_id = ? ORDER BY id DESC',
      [ngoId]
    );

    const [users] = await query('SELECT id, name, email FROM users');
    const userMap = {};
    (users || []).forEach((u) => {
      userMap[u.id] = u;
    });

    const enriched = (donations || []).map((d) => ({
      ...d,
      donor_name: d.user_id ? userMap[d.user_id]?.name || 'Registered Citizen' : 'Generous Citizen',
    }));

    const totalAmount = enriched.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

    res.json({ success: true, count: enriched.length, totalAmount, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving NGO donations' });
  }
});

export default router;
