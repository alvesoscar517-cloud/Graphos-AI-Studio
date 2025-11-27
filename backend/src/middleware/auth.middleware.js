/**
 * Enhanced Authentication Middleware
 * Supports Firebase Auth token verification and API key authentication
 */

const admin = require('firebase-admin');
const config = require('../config');
const logger = require('../utils/logger');

// Initialize Firebase Admin if not already initialized
let firebaseAdmin = null;

function getFirebaseAdmin() {
  if (!firebaseAdmin) {
    try {
      // Check if already initialized
      firebaseAdmin = admin.apps.length ? admin.app() : admin.initializeApp({
        projectId: config.PROJECT_ID
      });
    } catch (error) {
      logger.error('Firebase Admin initialization failed', { error: error.message });
    }
  }
  return firebaseAdmin;
}

/**
 * Verify Firebase ID Token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<Object|null>} - Decoded token or null
 */
async function verifyFirebaseToken(idToken) {
  try {
    const app = getFirebaseAdmin();
    if (!app) return null;
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      userId: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name || decodedToken.email?.split('@')[0],
      picture: decodedToken.picture
    };
  } catch (error) {
    logger.warn('Firebase token verification failed', { error: error.message });
    return null;
  }
}

/**
 * Extract token from Authorization header
 * Supports: "Bearer <token>" format
 */
function extractBearerToken(authHeader) {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Authentication middleware - verifies user identity
 * Checks in order:
 * 1. Firebase ID token in Authorization header
 * 2. API key in X-API-Key header (for service-to-service)
 * 3. Legacy user_id in body/query (deprecated, will be removed)
 */
async function authenticate(req, res, next) {
  try {
    // 1. Try Firebase token authentication
    const authHeader = req.headers.authorization;
    const idToken = extractBearerToken(authHeader);
    
    if (idToken) {
      const user = await verifyFirebaseToken(idToken);
      if (user) {
        req.user = user;
        req.userId = user.userId;
        req.authMethod = 'firebase';
        return next();
      }
    }
    
    // 2. Try API key authentication (for service-to-service calls)
    const apiKey = req.headers['x-api-key'];
    if (apiKey && config.API_KEYS && config.API_KEYS.includes(apiKey)) {
      req.user = { userId: 'service', isService: true };
      req.userId = req.body.user_id || req.query.user_id || 'service';
      req.authMethod = 'api_key';
      return next();
    }
    
    // 3. Legacy: user_id in body/query (deprecated)
    // This is for backward compatibility during migration
    const legacyUserId = req.body.user_id || req.query.user_id;
    if (legacyUserId && config.IS_DEVELOPMENT) {
      logger.warn('Using deprecated user_id authentication', { 
        userId: legacyUserId,
        path: req.path 
      });
      req.user = { userId: legacyUserId, isLegacy: true };
      req.userId = legacyUserId;
      req.authMethod = 'legacy';
      return next();
    }
    
    // No valid authentication found
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
      message: 'Please provide a valid authentication token'
    });
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    return res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * Optional authentication - doesn't fail if no auth provided
 * Useful for public endpoints that behave differently for authenticated users
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const idToken = extractBearerToken(authHeader);
    
    if (idToken) {
      const user = await verifyFirebaseToken(idToken);
      if (user) {
        req.user = user;
        req.userId = user.userId;
        req.authMethod = 'firebase';
      }
    }
    
    // Also check legacy user_id
    if (!req.userId) {
      const legacyUserId = req.body.user_id || req.query.user_id;
      if (legacyUserId) {
        req.userId = legacyUserId;
        req.authMethod = 'legacy';
      }
    }
    
    next();
  } catch (error) {
    // Don't fail on optional auth errors
    logger.warn('Optional auth error', { error: error.message });
    next();
  }
}

/**
 * Rate limit by user - more granular than IP-based
 */
const userRateLimits = new Map();
const USER_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const USER_RATE_LIMIT_MAX = 60; // 60 requests per minute per user

function userRateLimit(req, res, next) {
  if (!config.FEATURES.ENABLE_RATE_LIMITING) {
    return next();
  }
  
  const userId = req.userId || req.ip;
  const now = Date.now();
  
  if (!userRateLimits.has(userId)) {
    userRateLimits.set(userId, []);
  }
  
  const requests = userRateLimits.get(userId);
  const validRequests = requests.filter(t => now - t < USER_RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= USER_RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(USER_RATE_LIMIT_WINDOW / 1000)
    });
  }
  
  validRequests.push(now);
  userRateLimits.set(userId, validRequests);
  
  next();
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [userId, requests] of userRateLimits.entries()) {
    const valid = requests.filter(t => now - t < USER_RATE_LIMIT_WINDOW);
    if (valid.length === 0) {
      userRateLimits.delete(userId);
    } else {
      userRateLimits.set(userId, valid);
    }
  }
}, 60000); // Cleanup every minute

module.exports = {
  authenticate,
  optionalAuth,
  userRateLimit,
  verifyFirebaseToken,
  extractBearerToken
};
