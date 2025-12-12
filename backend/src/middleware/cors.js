/**
 * CORS Middleware Configuration
 */

const cors = require('cors');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Allowed origins whitelist
 */
const allowedOrigins = [
  // Localhost development ports
  'http://localhost:3000',
  'http://localhost:4174',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:8080',
  'http://localhost:8081',
  // Production domains
  'https://graphosai.com',
  'https://www.graphosai.com',
  'https://app.graphosai.com',
  'https://admin.graphosai.com',
  'https://api.graphosai.com',
  // Cloud Run URLs
  'https://graphosai-472729326429.us-central1.run.app',
  'https://ai-backend-admin-472729326429.us-central1.run.app',
];

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin) {
  if (!origin) return true; // Allow requests with no origin (mobile apps, Postman, etc.)
  
  // Check exact match
  if (allowedOrigins.includes(origin)) return true;
  
  // Check chrome extension
  if (origin.startsWith('chrome-extension://')) return true;
  
  // Check all subdomains of graphosai.com (supports multiple levels like api.admin.graphosai.com)
  if (origin.match(/^https:\/\/([a-z0-9-]+\.)*graphosai\.com$/)) return true;
  
  return false;
}

/**
 * CORS options
 */
const corsOptions = {
  origin: (origin, callback) => {
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
    'X-Auth-Type',
    'X-Admin-Key'
  ],
  
  exposedHeaders: [
    'X-Correlation-ID',
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  
  credentials: true,
  
  maxAge: 86400, // 24 hours
  
  preflightContinue: false,
  
  optionsSuccessStatus: 204
};

const corsMiddleware = cors(corsOptions);

function enhancedCorsMiddleware(req, res, next) {
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
module.exports.allowedOrigins = allowedOrigins;
