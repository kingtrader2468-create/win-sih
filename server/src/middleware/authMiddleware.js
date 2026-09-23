const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'polar-india-hub-sovereign-secret-key-2026';

async function protect(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: { message: 'Authentication required. Please sign in with your MoES Scholar account or Google.' }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        error: { message: 'Scholar account associated with this token is no longer active.' }
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: { message: 'Invalid or expired session token. Please sign in again.' }
    });
  }
}

async function optionalAuth(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { protect, optionalAuth, JWT_SECRET };
