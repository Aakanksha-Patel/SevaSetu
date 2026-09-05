// =======================================================
// Contact API Route (/api/contact)
// Handles public inquiries, volunteer queries & partnerships
// =======================================================

import express from 'express';

const router = express.Router();

// In-memory inquiries store for runtime review
const contactInquiries = [];

// POST /api/contact - Submit a contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, category = 'General Inquiry', message, phone = '' } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const inquiry = {
      id: contactInquiries.length + 1,
      ticket_id: `SEVA-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject ? subject.trim() : 'General Inquiry via SevaSetu',
      category,
      message: message.trim(),
      status: 'received',
      created_at: new Date().toISOString(),
    };

    contactInquiries.unshift(inquiry);

    res.status(201).json({
      success: true,
      message: `Thank you, ${inquiry.name}! Your message has been received. Our team will get back to you within 24 hours.`,
      data: {
        ticket_id: inquiry.ticket_id,
        created_at: inquiry.created_at,
      },
    });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to process inquiry. Please try again later.' });
  }
});

// GET /api/contact/recent - For admin or review
router.get('/recent', (req, res) => {
  res.json({ success: true, count: contactInquiries.length, data: contactInquiries.slice(0, 10) });
});

export default router;
