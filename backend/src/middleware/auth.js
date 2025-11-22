/**
 * Authentication Middleware
 */

const config = require('../config');

/**
 * Require admin authentication
 */
function requireAdmin(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  
  if (!adminKey || adminKey !== config.ADMIN_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing admin key'
    });
  }
  
  next();
}

/**
 * Optional user authentication
 * Extracts user info from request if available
 */
function optionalAuth(req, res, next) {
  // Extract user info from headers or body
  req.userId = req.body.user_id || req.query.user_id || null;
  next();
}

module.exports = {
  requireAdmin,
  optionalAuth
};
