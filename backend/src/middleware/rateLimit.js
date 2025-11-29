/**
 * Rate Limiting Middleware
 */

const config = require('../config');

// Simple in-memory rate limiter
const requestCounts = new Map();

// Auth routes have higher limits (login, register, etc.)
const AUTH_ROUTES = ['/auth/email/login', '/auth/email/register', '/auth/email/verify', '/auth/email/resend-otp'];
const AUTH_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const AUTH_RATE_LIMIT_MAX = 20; // 20 requests per minute for auth

function rateLimit(req, res, next) {
  if (!config.FEATURES.ENABLE_RATE_LIMITING) {
    return next();
  }

  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const path = req.path;
  
  // Check if this is an auth route (use different limits)
  const isAuthRoute = AUTH_ROUTES.some(route => path.includes(route));
  const rateLimitWindow = isAuthRoute ? AUTH_RATE_LIMIT_WINDOW : config.RATE_LIMIT_WINDOW;
  const rateLimitMax = isAuthRoute ? AUTH_RATE_LIMIT_MAX : config.RATE_LIMIT_MAX_REQUESTS;
  
  // Use different key for auth routes
  const key = isAuthRoute ? `auth:${ip}` : ip;
  
  // Get or create request log for this IP
  if (!requestCounts.has(key)) {
    requestCounts.set(key, []);
  }
  
  const requests = requestCounts.get(key);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(
    timestamp => now - timestamp < rateLimitWindow
  );
  
  // Check if limit exceeded
  if (validRequests.length >= rateLimitMax) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(rateLimitWindow / 1000)
    });
  }
  
  // Add current request
  validRequests.push(now);
  requestCounts.set(key, validRequests);
  
  // Cleanup old IPs periodically
  if (Math.random() < 0.01) { // 1% chance
    const cutoff = now - config.RATE_LIMIT_WINDOW * 2;
    for (const [k, timestamps] of requestCounts.entries()) {
      if (timestamps.every(t => t < cutoff)) {
        requestCounts.delete(k);
      }
    }
  }
  
  next();
}

module.exports = rateLimit;
