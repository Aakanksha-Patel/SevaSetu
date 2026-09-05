// =======================================================
// Authentication Routes (JWT + bcryptjs + Parameterized SQL)
// Strict Rule: Public registration only permits 'user', 'volunteer', 'ngo'.
// 'admin' role is forbidden from public registration.
// =======================================================

import express from 'express';
import bcrypt from 'bcryptjs';
import { query, getDbStatus, mockDatabase } from '../db.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register new user (User, Volunteer, or NGO only)
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'user',
      phone = '',
      location = 'Mumbai, Maharashtra',
      organization_name = '',
      registration_number = '',
      category = 'Healthcare',
      description = '',
      skills = 'Community Outreach, Teaching, General Assistance',
      interests = 'Social Welfare, Education',
      availability = 'Flexible Weekends',
    } = req.body;

    // 1. Basic required fields validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid full name (minimum 2 characters).',
      });
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address (e.g. name@example.com).',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.',
      });
    }

    // 2. CRITICAL SECURITY MANDATE: Enforce that Admin is never registered via public signup
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Security Policy Violation: Administrator registration is not permitted via public registration.',
      });
    }

    // 3. Allowed roles for public registration
    const allowedRoles = ['user', 'volunteer', 'ngo'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Allowed registration roles are: ${allowedRoles.join(', ')}.`,
      });
    }

    // 4. Role-specific validation
    if (role === 'ngo' && (!organization_name || organization_name.trim().length < 2)) {
      return res.status(400).json({
        success: false,
        message: 'NGO registration requires a valid organization name.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 5. Parameterized check if email exists
    const [existing] = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    // 6. Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const defaultProfileImage =
      role === 'ngo'
        ? 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200'
        : role === 'volunteer'
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

    // 7. Parameterized INSERT into users table
    const [result] = await query(
      'INSERT INTO users (name, email, password, phone, location, profile_image, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, phone.trim(), location.trim(), defaultProfileImage, role]
    );

    const userId = result.insertId || Date.now();

    // 8. If role is NGO, insert into ngos table
    if (role === 'ngo') {
      const orgName = organization_name ? organization_name.trim() : name.trim();
      const regNumber = registration_number
        ? registration_number.trim()
        : `NGO/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

      await query(
        'INSERT INTO ngos (user_id, name, email, phone, category, description, address, logo, registration_number, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          orgName,
          cleanEmail,
          phone.trim(),
          category,
          description || `${orgName} dedicated to transparent grassroots community support.`,
          location.trim(),
          defaultProfileImage,
          regNumber,
          'pending', // Newly registered NGOs default to pending verification
        ]
      );
    }

    // 9. If role is Volunteer, insert into volunteers table
    if (role === 'volunteer') {
      await query(
        'INSERT INTO volunteers (user_id, skills, interests, availability, location) VALUES (?, ?, ?, ?, ?)',
        [userId, skills, interests, availability, location.trim()]
      );
    }

    // 10. Generate JWT containing user identity and role
    const token = generateToken({ id: userId, email: cleanEmail, role, name: name.trim() });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        role,
        phone: phone.trim(),
        location: location.trim(),
        profile_image: defaultProfileImage,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
});

// User Login (Supports bcrypt hash verification)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.',
      });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Parameterized query to fetch user
    const [rows] = await query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Check bcrypt hash with bcryptjs
    let isMatch = false;
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (err) {
        isMatch = false;
      }
    } else {
      isMatch = password === user.password;
    }

    // Convenience credentials fallback for testing seed accounts
    if (!isMatch) {
      const demoMatches =
        (user.email === 'admin@sevasetu.org' && password === 'admin123') ||
        (user.email === 'contact@aarogya.org' && password === 'ngo123') ||
        (user.email === 'info@vidyajyoti.ngo' && password === 'ngo123') ||
        (user.email === 'priya.volunteer@gmail.com' && password === 'volunteer123') ||
        (user.email === 'rohan.volunteer@gmail.com' && password === 'volunteer123') ||
        (user.email === 'rahul.user@gmail.com' && password === 'user123') ||
        (user.email === 'ananya.user@gmail.com' && password === 'user123');
      if (demoMatches) isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Issue JWT token with user id, email, role, and name
    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
});

// Demo Login for rapid evaluation & testing
router.post('/demo-login', async (req, res) => {
  try {
    const { role = 'user' } = req.body;

    const emailMap = {
      admin: 'admin@sevasetu.org',
      ngo: 'contact@aarogya.org',
      volunteer: 'priya.volunteer@gmail.com',
      user: 'rahul.user@gmail.com',
    };

    const targetEmail = emailMap[role] || emailMap.user;
    const [rows] = await query('SELECT * FROM users WHERE email = ?', [targetEmail]);
    const user = rows && rows.length > 0 ? rows[0] : mockDatabase.users.find((u) => u.email === targetEmail);

    if (!user) {
      return res.status(404).json({ success: false, message: `Demo user for role ${role} not found.` });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    return res.json({
      success: true,
      message: `Signed in as ${user.name} (${role.toUpperCase()})`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    console.error('Demo Login Error:', error);
    return res.status(500).json({ success: false, message: 'Demo login error', error: error.message });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'User logged out successfully.',
  });
});

// Get Current User Profile (with relational NGO or Volunteer data)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const user = rows[0];

    let extra = {};
    if (user.role === 'ngo') {
      const [ngoRows] = await query('SELECT * FROM ngos WHERE user_id = ?', [user.id]);
      if (ngoRows && ngoRows.length > 0) extra.ngo = ngoRows[0];
    } else if (user.role === 'volunteer') {
      const [volRows] = await query('SELECT * FROM volunteers WHERE user_id = ?', [user.id]);
      if (volRows && volRows.length > 0) extra.volunteer = volRows[0];
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profile_image: user.profile_image,
        ...extra,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving profile.', error: error.message });
  }
});

// Update User Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone = '', location = '', profile_image = '' } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide a valid full name.' });
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanLocation = location.trim();

    // Update user record
    if (profile_image && profile_image.trim()) {
      await query(
        'UPDATE users SET name = ?, phone = ?, location = ?, profile_image = ? WHERE id = ?',
        [cleanName, cleanPhone, cleanLocation, profile_image.trim(), req.user.id]
      );
    } else {
      await query(
        'UPDATE users SET name = ?, phone = ?, location = ? WHERE id = ?',
        [cleanName, cleanPhone, cleanLocation, req.user.id]
      );
    }

    const [updatedRows] = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const updatedUser = updatedRows && updatedRows.length > 0 ? updatedRows[0] : null;

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Issue refreshed token
    const token = generateToken({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        location: updatedUser.location,
        profile_image: updatedUser.profile_image,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// Become a Volunteer Endpoint (Converts/Registers User as Volunteer)
router.post('/become-volunteer', authenticateToken, async (req, res) => {
  try {
    const {
      skills = 'Community Support, Mentorship',
      interests = 'Education, Healthcare, Environment',
      availability = 'Flexible Weekends',
      location = '',
    } = req.body;

    // 1. Fetch user
    const [userRows] = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const currentUser = userRows[0];

    const volLocation = (location || currentUser.location || 'India').trim();
    const volSkills = skills.trim() || 'General Volunteering';
    const volInterests = interests.trim() || 'Social Impact';
    const volAvailability = availability.trim() || 'Weekends & Evenings';

    // 2. Check if volunteer record exists, insert or update
    const [existingVol] = await query('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);
    if (existingVol && existingVol.length > 0) {
      await query(
        'UPDATE volunteers SET skills = ?, interests = ?, availability = ?, location = ? WHERE user_id = ?',
        [volSkills, volInterests, volAvailability, volLocation, req.user.id]
      );
    } else {
      await query(
        'INSERT INTO volunteers (user_id, skills, interests, availability, location) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, volSkills, volInterests, volAvailability, volLocation]
      );
    }

    // 3. Upgrade user role to 'volunteer' so they have access to volunteer panel
    await query('UPDATE users SET role = ?, location = ? WHERE id = ?', [
      'volunteer',
      volLocation,
      req.user.id,
    ]);

    // 4. Generate new token with 'volunteer' role
    const token = generateToken({
      id: currentUser.id,
      email: currentUser.email,
      role: 'volunteer',
      name: currentUser.name,
    });

    return res.json({
      success: true,
      message: 'Welcome to the SevaSetu Volunteer Network! Your volunteer profile is active.',
      token,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: 'volunteer',
        phone: currentUser.phone,
        location: volLocation,
        profile_image: currentUser.profile_image,
        volunteer: {
          skills: volSkills,
          interests: volInterests,
          availability: volAvailability,
          location: volLocation,
        },
      },
    });
  } catch (error) {
    console.error('Become volunteer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process volunteer registration.' });
  }
});

// Database & Connection Health Status
router.get('/db-status', (req, res) => {
  res.json(getDbStatus());
});

export default router;

