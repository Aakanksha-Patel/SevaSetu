// =======================================================
// Saved NGOs API Routes (Table: saved_ngos)
// Fields: id, user_id, ngo_id, saved_at
// All queries strictly use parameterized SQL
// =======================================================

import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all saved NGOs for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [savedRows] = await query(
      'SELECT * FROM saved_ngos WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );

    const [ngos] = await query('SELECT * FROM ngos');
    const ngoMap = {};
    (ngos || []).forEach((n) => {
      ngoMap[n.id] = n;
    });

    const enriched = (savedRows || [])
      .map((item) => {
        const ngo = ngoMap[item.ngo_id];
        if (!ngo) return null;
        return {
          saved_id: item.id,
          saved_at: item.saved_at,
          ...ngo,
        };
      })
      .filter(Boolean);

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    console.error('Fetch saved NGOs error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve saved NGOs' });
  }
});

// GET saved NGO IDs list for quick UI status checks
router.get('/ids', authenticateToken, async (req, res) => {
  try {
    const [savedRows] = await query(
      'SELECT ngo_id FROM saved_ngos WHERE user_id = ?',
      [req.user.id]
    );

    const ids = (savedRows || []).map((row) => row.ngo_id);
    res.json({ success: true, ids });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve saved IDs' });
  }
});

// SAVE an NGO (Bookmark)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { ngo_id } = req.body;
    if (!ngo_id) {
      return res.status(400).json({ success: false, message: 'NGO ID is required' });
    }

    const numNgoId = Number(ngo_id);

    // Verify NGO exists
    const [ngoRows] = await query('SELECT id, name FROM ngos WHERE id = ?', [numNgoId]);
    if (!ngoRows || ngoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }

    // Check if already saved
    const [existing] = await query(
      'SELECT id FROM saved_ngos WHERE user_id = ? AND ngo_id = ?',
      [req.user.id, numNgoId]
    );

    if (existing && existing.length > 0) {
      return res.json({
        success: true,
        message: 'NGO is already in your saved list',
        savedId: existing[0].id,
      });
    }

    const [result] = await query(
      'INSERT INTO saved_ngos (user_id, ngo_id) VALUES (?, ?)',
      [req.user.id, numNgoId]
    );

    res.status(201).json({
      success: true,
      message: `${ngoRows[0].name} saved to your favorites`,
      savedId: result.insertId,
    });
  } catch (error) {
    console.error('Save NGO error:', error);
    res.status(500).json({ success: false, message: 'Failed to save NGO' });
  }
});

// REMOVE saved NGO
router.delete('/:ngoId', authenticateToken, async (req, res) => {
  try {
    const ngoId = Number(req.params.ngoId);
    await query('DELETE FROM saved_ngos WHERE user_id = ? AND ngo_id = ?', [req.user.id, ngoId]);

    res.json({
      success: true,
      message: 'NGO removed from saved list',
    });
  } catch (error) {
    console.error('Remove saved NGO error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove saved NGO' });
  }
});

export default router;
