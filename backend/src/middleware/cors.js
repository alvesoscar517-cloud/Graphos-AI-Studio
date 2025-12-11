/**
 * Enhanced CORS Middleware Configuration
 * Supports environment-based origin whitelisting with dynamic Firestore config
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
 * Dynamically reads from envConfigHelper to support Firestore config
 */
function getAllowedOrigins() {
  // Try to get CORS_WHITELIST from envConfigHelper (supports Firestore config)
  try {
    const envConfigHelper = require('../config/envConfigHelper');
    const corsWhitelist = envConfigHelper.get('CORS_WHITELIST', '');
    
    // Parse whitelist if it's a string (comma-separated)
    if (corsWhitelist && typeof corsWhitelist === 'string') {
      const origins = corsWhitelist.split(',').map(o => o.trim()).filter(Boolean);
      if (origins.length > 0) {
        // Combine with default origins for development convenience
        return [...new Set([...DEFAULT_ORIGINS, ...origins])];
      }
    }
    
    // If it's already an array
    if (Array.isArray(corsWhitelist) && corsWhitelist.length > 0) {
      return [...new Set([...DEFAULT_ORIGINS, ...corsWhitelist])];
    }
  } catch (e) {
    // envConfigHelper not loaded yet, fall through to static config
  }
  
  // Fallback to static config
  if (config.IS_PRODUCTION && config.SECURITY?.CORS_WHITELIST?.length > 0) {
    return [...new Set([...DEFAULT_ORIGINS, ...config.SECURITY.CORS_WHITELIST])];
  }
  
  // In development or no whitelist configured, allow default origins
  return DEFAULT_ORIGINS;
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin) {
  // Allow requests with no origin (same-origin, Postman, etc.)
  if (!origin) return true;
  
  // Always allow localhost for development/testing
  // This is safe because localhost can only be accessed from the local machine
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    return true;
  }
  
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
    'X-Source',
    'X-Auth-Type'
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
