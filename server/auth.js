import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { dbGet } from './db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dhanekula_ece_secret_token_key_2026';

// Helper to parse cookies from headers
export const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(cookie => {
    const index = cookie.indexOf('=');
    if (index !== -1) {
      const key = cookie.substring(0, index).trim();
      const val = cookie.substring(index + 1).trim();
      cookies[key] = decodeURIComponent(val);
    }
  });
  return cookies;
};

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '2h' } // Expiry set to 2 hours
  );
};

// Middleware to authenticate token
export const authenticateToken = async (req, res, next) => {
  let token = null;

  // 1. Try to read token from cookies
  const cookies = parseCookies(req.headers.cookie);
  if (cookies.token) {
    token = cookies.token;
  }

  // 2. Try to read token from Authorization header
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No session token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch latest user details from DB to check status and permissions
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }
    
    if (user.status === 'Disabled') {
      return res.status(403).json({ error: 'Your administrator account has been disabled.' });
    }

    // Attach parsed permissions array
    user.permissionsList = JSON.parse(user.permissions || '[]');
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(403).json({ error: 'Session expired or invalid token.' });
  }
};

// Middleware to restrict access by role
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
    }
    
    next();
  };
};

// Middleware to restrict access by permission
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    
    // Super Admin has ALL permissions bypass
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }
    
    if (!req.user.permissionsList.includes(permission)) {
      return res.status(403).json({ error: `Permission denied. Requires "${permission}".` });
    }
    
    next();
  };
};
