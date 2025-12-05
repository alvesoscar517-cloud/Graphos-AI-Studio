/**
 * Authentication Middleware (Optimized)
 * 
 * Supports 2 token types with smart detection:
 * 1. Firebase ID Token - for Google OAuth users
 * 2. JWT Token (type: email_auth) - for email/password users
 * 
 * OPTIMIZATION: Uses X-Auth-Type header hint to avoid double verification.
 * If header is provided, only verifies the specified token type.
 * Falls back to trying both types if header is missing (backward compatible).
 * 
 * Legacy tokens (direct_, Firebase custom token) are no longer supported.
 */

const { getAdmin } = require('../config/firebaseAdmin');
const admin = getAdmin();
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const localization = require('../services/localization.service');
const { getLanguage } = require('./language.middleware');
const { db } = require('../config/firebase');

const JWT_SECRET = config.JWT_SECRET;

// Auth type constants
const AUTH_TYPE = {
  EMAIL: 'email',    // JWT token for email/password users
  GOOGLE: 'google',  // Firebase ID token for Google OAuth users
};

/**
 * Verify Firebase ID Token (for Google OAuth users)
 * @param {string} idToken - Firebase ID token from client
 * @param {boolean} silent - If true, don't log errors (for fallback attempts)
 * @returns {Promise<Object|null>} - Decoded token or null
 */
async function verifyFirebaseToken(idToken, silent = false) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      userId: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name || decodedToken.email?.split('@')[0],
      picture: decodedToken.picture,
      authType: 'firebase'
    };
  } catch (error) {
    if (!silent) {
      logger.debug('Firebase token verification failed', { 
        code: error.code,
        message: error.message?.substring(0, 100)
      });
    }
    return null;
  }
}

/**
 * Verify JWT Token (for email/password users)
 * 
 * OPTIMIZED: User info is embedded in JWT payload, no DB query needed.
 * Locked/deleted status is checked only during token refresh.
 * 
 * @param {string} token - JWT token
 * @param {boolean} silent - If true, don't log errors (for fallback attempts)
 * @returns {Object|null} - User info or null (sync, no DB call)
 */
function verifyJWTToken(token, silent = false) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: 'graphosai' });

    // Must be email_auth type
    if (decoded.type !== 'email_auth' || !decoded.userId) {
      if (!silent) {
        logger.debug('JWT token invalid type', { type: decoded.type });
      }
      return null;
    }

    // User info is embedded in JWT - no DB query needed
    // Locked/deleted status is checked during token refresh (every 1h max)
    return {
      userId: decoded.userId,
      email: decoded.email || '',
      emailVerified: decoded.emailVerified ?? true,
      name: decoded.name || decoded.email?.split('@')[0] || '',
      picture: decoded.picture || '',
      authType: 'jwt'
    };
  } catch (error) {
    if (!silent) {
      if (error.name === 'TokenExpiredError') {
        logger.debug('JWT token expired');
      } else {
        logger.debug('JWT verification failed', { 
          name: error.name,
          message: error.message?.substring(0, 50)
        });
      }
    }
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
 * Determine token type and verify accordingly
 * 
 * OPTIMIZED: Uses authTypeHint to avoid double verification.
 * - If hint is 'email', only try JWT verification
 * - If hint is 'google', only try Firebase verification
 * - If no hint, try JWT first then Firebase (backward compatible)
 * 
 * @param {string} token - Token to verify
 * @param {string|null} authTypeHint - Optional hint: 'email' or 'google'
 * @returns {Promise<Object|null>} - User info or null
 */
async function verifyToken(token, authTypeHint = null) {
  if (!token) return null;
  
  // All our tokens start with 'eyJ' (base64 of '{"')
  if (!token.startsWith('eyJ')) {
    return null;
  }
  
  // If auth type hint is provided, only verify that type
  if (authTypeHint === AUTH_TYPE.EMAIL) {
    // Only try JWT for email auth
    return verifyJWTToken(token, false);
  }
  
  if (authTypeHint === AUTH_TYPE.GOOGLE) {
    // Only try Firebase for Google auth
    return await verifyFirebaseToken(token, false);
  }
  
  // No hint provided - try both (backward compatible)
  // Try JWT first (most common for email users, faster - no network call)
  const jwtUser = verifyJWTToken(token, true); // silent mode
  if (jwtUser) return jwtUser;
  
  // If JWT fails, try Firebase ID token (for Google users)
  const firebaseUser = await verifyFirebaseToken(token, true); // silent mode
  if (firebaseUser) return firebaseUser;
  
  // Both failed - log once
  logger.debug('Token verification failed for both JWT and Firebase');
  return null;
}

/**
 * Authentication middleware - verifies user identity
 * 
 * Checks in order:
 * 1. Bearer token in Authorization header (JWT or Firebase ID token)
 * 2. Token in query param (for SSE/EventSource)
 * 3. API key in X-API-Key header (for service-to-service)
 * 
 * OPTIMIZATION: Uses X-Auth-Type header to determine token type:
 * - 'email' = JWT token (email/password users)
 * - 'google' = Firebase ID token (Google OAuth users)
 * - If not provided, tries both types (backward compatible)
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function authenticate(req, res, next) {
  try {
    // 1. Try token from Authorization header
    const authHeader = req.headers.authorization;
    let token = extractBearerToken(authHeader);
    
    // 2. Try token from query param (for SSE/EventSource)
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    if (token) {
      // Get auth type hint from header (optimization)
      // This avoids trying both JWT and Firebase verification
      const authTypeHint = req.headers['x-auth-type'] || req.query.authType || null;
      
      const user = await verifyToken(token, authTypeHint);
      if (user) {
        req.user = user;
        req.userId = user.userId;
        req.authMethod = user.authType === 'firebase' ? 'google' : 'email';
        return next();
      }
    }
    
    // 3. Try API key authentication (for service-to-service calls)
    const apiKey = req.headers['x-api-key'];
    if (apiKey && config.API_KEYS && config.API_KEYS.includes(apiKey)) {
      req.user = { userId: 'service', isService: true };
      req.userId = 'service';
      req.authMethod = 'api_key';
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
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractBearerToken(authHeader);
    
    if (token) {
      // Get auth type hint from header (optimization)
      const authTypeHint = req.headers['x-auth-type'] || null;
      
      const user = await verifyToken(token, authTypeHint);
      if (user) {
        req.user = user;
        req.userId = user.userId;
        req.authMethod = user.authType === 'firebase' ? 'google' : 'email';
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
  verifyJWTToken,
  verifyToken,
  extractBearerToken
};
