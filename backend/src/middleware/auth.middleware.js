/**
 * Enhanced Authentication Middleware
 * Supports Firebase Auth token verification and API key authentication
 */

const { getAdmin } = require('../config/firebaseAdmin');
const admin = getAdmin();
const config = require('../config');
const logger = require('../utils/logger');
const localization = require('../services/localization.service');
const { getLanguage } = require('./language.middleware');

/**
 * Verify Firebase ID Token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<Object|null>} - Decoded token or null
 */
async function verifyFirebaseToken(idToken) {
  try {
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
 * Verify email auth token (direct_ prefix or custom token)
 * For email users who don't have Firebase ID token
 */
async function verifyEmailAuthToken(token) {
  try {
    // Handle direct auth token (direct_{userId})
    if (token.startsWith('direct_')) {
      const userId = token.replace('direct_', '');
      
      // Verify user exists in database
      const { db } = require('../config/firebase');
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.authProvider === 'email') {
          return {
            userId: userId,
            email: userData.email,
            emailVerified: userData.emailVerified,
            name: userData.name || userData.email?.split('@')[0],
            picture: userData.picture || ''
          };
        }
      }
      return null;
    }
    
    // Try to verify as custom token by checking if it's a valid userId
    // Custom tokens are JWT but we can't verify them server-side without Firebase client SDK
    // So we check if the token looks like a Firebase custom token and extract userId
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        if (payload.uid) {
          const { db } = require('../config/firebase');
          const userDoc = await db.collection('users').doc(payload.uid).get();
          
          if (userDoc.exists) {
            const userData = userDoc.data();
            return {
              userId: payload.uid,
              email: userData.email,
              emailVerified: userData.emailVerified,
              name: userData.name || userData.email?.split('@')[0],
              picture: userData.picture || ''
            };
          }
        }
      }
    } catch {
      // Not a valid JWT
    }
    
    return null;
  } catch (error) {
    logger.warn('Email auth token verification failed', { error: error.message });
    return null;
  }
}

/**
 * Authentication middleware - verifies user identity
 * Checks in order:
 * 1. Firebase ID token in Authorization header
 * 2. Firebase ID token in query param (for SSE/EventSource which doesn't support headers)
 * 3. Email auth token (direct_ prefix or custom token)
 * 4. API key in X-API-Key header (for service-to-service)
 * 5. Legacy user_id in body/query (deprecated, will be removed)
 */
async function authenticate(req, res, next) {
  try {
    // 1. Try Firebase token authentication from header
    const authHeader = req.headers.authorization;
    let idToken = extractBearerToken(authHeader);
    
    // 2. Try token from query param (for SSE/EventSource)
    if (!idToken && req.query.token) {
      idToken = req.query.token;
    }
    
    if (idToken) {
      // First try Firebase ID token verification
      const user = await verifyFirebaseToken(idToken);
      if (user) {
        req.user = user;
        req.userId = user.userId;
        req.authMethod = 'firebase';
        return next();
      }
      
      // Then try email auth token verification
      const emailUser = await verifyEmailAuthToken(idToken);
      if (emailUser) {
        req.user = emailUser;
        req.userId = emailUser.userId;
        req.authMethod = 'email';
        return next();
      }
    }
    
    // 3. Try API key authentication (for service-to-service calls)
    const apiKey = req.headers['x-api-key'];
    if (apiKey && config.API_KEYS && config.API_KEYS.includes(apiKey)) {
      req.user = { userId: 'service', isService: true };
      req.userId = req.body.user_id || req.query.user_id || 'service';
      req.authMethod = 'api_key';
      return next();
    }
    
    // 4. Legacy: user_id in body/query (deprecated)
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
    const lang = getLanguage(req);
    return res.status(401).json({
      success: false,
      error: localization.translate('errors.unauthorized', lang),
      code: 'AUTH_REQUIRED'
    });
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    const lang = getLanguage(req);
    return res.status(500).json({
      success: false,
      error: localization.translate('errors.server_error', lang),
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
    const lang = getLanguage(req);
    return res.status(429).json({
      success: false,
      error: localization.translate('errors.rate_limited', lang),
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
