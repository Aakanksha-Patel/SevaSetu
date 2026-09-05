// =======================================================
// Donation Campaigns API Routes
// =======================================================

import express from 'express';
import { query, mockDatabase } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET all campaigns (Public)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const [campaigns] = await query('SELECT * FROM campaigns ORDER BY id DESC');
    
    let filtered = campaigns || [];
    if (category && category !== 'All') {
      filtered = filtered.filter((c) => c.category && c.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.ngo_name.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('Fetch campaigns error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
  }
});

// GET single campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [campaigns] = await query('SELECT * FROM campaigns WHERE id = ?', [id]);
    if (!campaigns || campaigns.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    
    // Also fetch recent donations for this campaign
    const [donations] = await query('SELECT * FROM donations WHERE campaign_id = ? ORDER BY id DESC LIMIT 10', [id]);
    
    res.json({ success: true, data: campaigns[0], donations: donations || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving campaign' });
  }
});

// CREATE new campaign (NGO and Admin only)
router.post('/', authenticateToken, authorizeRoles('ngo', 'admin'), async (req, res) => {
  try {
    const { title, category, description, target_amount, image_url, location, end_date } = req.body;
    if (!title || !category || !description || !target_amount) {
      return res.status(400).json({ success: false, message: 'Title, category, description, and target amount are required.' });
    }

    let ngoName = req.user.name || 'Empowerment Partner NGO';
    let ngoId = req.user.id;

    if (req.user.role === 'ngo') {
      const [ngoRows] = await query('SELECT id, name FROM ngos WHERE user_id = ?', [req.user.id]);
      if (ngoRows && ngoRows.length > 0) {
        ngoId = ngoRows[0].id;
        ngoName = ngoRows[0].name;
      }
    }
    const img = image_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800';

    const [result] = await query(
      'INSERT INTO campaigns (ngo_id, ngo_name, title, category, description, target_amount, raised_amount, donors_count, image_url, status, location, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        ngoId,
        ngoName,
        title.trim(),
        category,
        description.trim(),
        parseFloat(target_amount),
        0.0,
        0,
        img,
        'active',
        location || 'India',
        end_date || '2026-12-31',
      ]
    );

    // Record activity log
    await query(
      'INSERT INTO activity_logs (actor_name, actor_role, action, details) VALUES (?, ?, ?, ?)',
      [req.user.name, req.user.role, 'Created Campaign', `Created campaign: ${title}`]
    );

    res.status(201).json({
      success: true,
      message: 'Campaign published successfully!',
      campaignId: result.insertId,
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ success: false, message: 'Failed to create campaign' });
  }
});

// DONATE to campaign (Open to Users, Volunteers, Guests)
router.post('/:id/donate', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    const { amount, donor_name, donor_email, payment_method = 'UPI', message = '', user_id = null } = req.body;

    const donationAmt = parseFloat(amount);
    if (!donationAmt || donationAmt <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid donation amount.' });
    }

    const [campaigns] = await query('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    if (!campaigns || campaigns.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    const campaign = campaigns[0];

    const txnId = `TXN${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

    // Insert into donations table
    await query(
      'INSERT INTO donations (campaign_id, campaign_title, user_id, donor_name, donor_email, amount, payment_method, transaction_id, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        campaignId,
        campaign.title,
        user_id || null,
        donor_name || 'Anonymous Donor',
        donor_email || '',
        donationAmt,
        payment_method,
        txnId,
        message,
      ]
    );

    // Update campaign raised_amount and donors_count
    const updatedRaised = (parseFloat(campaign.raised_amount) || 0) + donationAmt;
    const updatedDonors = (parseInt(campaign.donors_count, 10) || 0) + 1;
    
    // If in-memory mock or real DB
    campaign.raised_amount = updatedRaised;
    campaign.donors_count = updatedDonors;

    await query(
      'UPDATE campaigns SET raised_amount = ?, donors_count = ? WHERE id = ?',
      [updatedRaised, updatedDonors, campaignId]
    );

    // Audit log
    await query(
      'INSERT INTO activity_logs (actor_name, actor_role, action, details) VALUES (?, ?, ?, ?)',
      [donor_name || 'Anonymous Donor', 'user', 'Donation Completed', `Donated ₹${donationAmt.toLocaleString()} to ${campaign.title}`]
    );

    res.json({
      success: true,
      message: `Thank you for your generous donation of ₹${donationAmt.toLocaleString()}!`,
      transactionId: txnId,
      updatedCampaign: {
        id: campaignId,
        raised_amount: updatedRaised,
        donors_count: updatedDonors,
      },
    });
  } catch (error) {
    console.error('Donation error:', error);
    res.status(500).json({ success: false, message: 'Failed to process donation' });
  }
});

// GET My Donations (Authenticated User)
router.get('/user/my-donations', authenticateToken, async (req, res) => {
  try {
    const [donations] = await query('SELECT * FROM donations WHERE user_id = ? ORDER BY id DESC', [req.user.id]);
    res.json({ success: true, data: donations || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching donations' });
  }
});

// UPDATE Campaign Status (Admin or NGO)
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'ngo'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    await query('UPDATE campaigns SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: `Campaign status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update campaign status' });
  }
});

export default router;
