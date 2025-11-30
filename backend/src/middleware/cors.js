/**
 * Enhanced CORS Middleware Configuration
 * Supports environment-based origin whitelisting
 */

const cors = require('cors');
const config = require('../config');
const logger = require('../utils/logger');

// Default allowed origins
const DEFAULT_ORIGINS = [
  'chrome-extension://', // Chrome extensions
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Alternative dev server
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

/**
 * Get allowed origins based on environment
 */
function getAllowedOrigins() {
  // In production, use configured whitelist
  if (config.IS_PRODUCTION && config.SECURITY?.CORS_WHITELIST?.length > 0) {
    return config.SECURITY.CORS_WHITELIST;
  }
  
  // In development, allow default origins
  return DEFAULT_ORIGINS;
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin) {
  // Allow requests with no origin (same-origin, Postman, etc.)
  if (!origin) return true;
  
  const allowedOrigins = getAllowedOrigins();
  
  // Check exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Check Chrome extension pattern
  if (origin.startsWith('chrome-extension://')) {
    // In production, could validate specific extension IDs
    return true;
  }
  
  // Check wildcard patterns
  for (const allowed of allowedOrigins) {
    if (allowed.includes('*')) {
      const pattern = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
      if (pattern.test(origin)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * CORS options with dynamic origin checking
 */
const corsOptions = {
  origin: function(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
    'X-Correlation-ID',
    'X-Source'
  ],
  
  exposedHeaders: [
    'X-Correlation-ID',
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  
  credentials: true,
  
  maxAge: 86400, // 24 hours - cache preflight requests
  
  preflightContinue: false,
  
  optionsSuccessStatus: 204
};

/**
 * Create CORS middleware
 */
const corsMiddleware = cors(corsOptions);

/**
 * Enhanced CORS middleware with logging
 */
function enhancedCorsMiddleware(req, res, next) {
  // Log CORS requests in debug mode
  if (config.IS_DEVELOPMENT) {
    const origin = req.get('Origin');
    if (origin) {
      logger.debug('CORS request', { origin, method: req.method, path: req.path });
    }
  }
  
  return corsMiddleware(req, res, next);
}

module.exports = enhancedCorsMiddleware;
module.exports.corsOptions = corsOptions;
module.exports.isOriginAllowed = isOriginAllowed;
