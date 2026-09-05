// =======================================================
// JWT Authentication & Role Authorization Middleware
// =======================================================

import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'sevasetu_jwt_super_secret_key_2026';

/**
 * Middleware to authenticate JWT tokens from Authorization header
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No authorization header provided.',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Format must be "Bearer <token>".',
    });
  }

  const token = parts[1];

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your authentication token has expired. Please sign in again.',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid or forged authentication token.',
    });
  }
}

/**
 * Optional authentication: attaches user if token is present and valid,
 * otherwise allows request to proceed as unauthenticated guest.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return next();

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    try {
      const verified = jwt.verify(parts[1], JWT_SECRET);
      req.user = verified;
    } catch (err) {
      // ignore token error for optional auth
    }
  }
  next();
}

/**
 * Middleware to enforce role-based access control
 * @param  {...string} roles Allowed roles (e.g. 'admin', 'ngo', 'volunteer', 'user')
 */
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. You must be signed in to perform this action.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${roles.join(', ')}.`,
      });
    }

    next();
  };
}

/**
 * Helper to generate signed JWT tokens
 * @param {object} payload { id, email, role, name }
 * @returns {string} JWT Token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

