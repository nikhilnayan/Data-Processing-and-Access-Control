const jwt = require('jsonwebtoken');
const config = require('../config');
const { getDatabase } = require('../config/database');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Authentication middleware.
 * Verifies JWT token from Authorization header and attaches user to request.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 401, 'Authentication required. Please provide a valid Bearer token.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // Verify user still exists and is active
    const db = getDatabase();
    const user = db.prepare('SELECT id, email, full_name, role, status FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return errorResponse(res, 401, 'User account no longer exists.');
    }

    if (user.status !== 'active') {
      return errorResponse(res, 403, 'User account is inactive. Contact an administrator.');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token has expired. Please log in again.');
    }
    if (err.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid token. Please log in again.');
    }
    return errorResponse(res, 500, 'Authentication failed.');
  }
}

module.exports = { authenticate };
