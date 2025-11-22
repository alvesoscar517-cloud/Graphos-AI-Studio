/**
 * Rate Limiting Middleware
 */

const config = require('../config');

// Simple in-memory rate limiter
const requestCounts = new Map();

function rateLimit(req, res, next) {
  if (!config.FEATURES.ENABLE_RATE_LIMITING) {
    return next();
  }

  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Get or create request log for this IP
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(
    timestamp => now - timestamp < config.RATE_LIMIT_WINDOW
  );
  
  // Check if limit exceeded
  if (validRequests.length >= config.RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW / 1000)
    });
  }
  
  // Add current request
  validRequests.push(now);
  requestCounts.set(ip, validRequests);
  
  // Cleanup old IPs periodically
  if (Math.random() < 0.01) { // 1% chance
    const cutoff = now - config.RATE_LIMIT_WINDOW * 2;
    for (const [key, timestamps] of requestCounts.entries()) {
      if (timestamps.every(t => t < cutoff)) {
        requestCounts.delete(key);
      }
    }
  }
  
  next();
}

module.exports = rateLimit;
