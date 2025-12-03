/**
 * Rate Limiting Middleware - Powered by rate-limiter-flexible
 * Distributed rate limiting with Redis backend and memory fallback
 * 
 * @module middleware/rateLimit
 */

const { RateLimiterRedis, RateLimiterMemory, RateLimiterUnion } = require('rate-limiter-flexible');
const config = require('../config');
const logger = require('../utils/logger');

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Rate limit configurations by tier
 */
const RATE_LIMITS = {
  // Default limits for unauthenticated users
  default: {
    points: 200,      // Number of requests (increased from 100)
    duration: 60,     // Per 60 seconds
    blockDuration: 30 // Block for 30 seconds if exceeded (reduced from 60)
  },
  
  // Auth routes (login, register, etc.)
  auth: {
    points: 50,       // Increased from 20
    duration: 60,
    blockDuration: 60 // Reduced from 120
  },
  
  // API routes for authenticated users
  authenticated: {
    points: 200,
    duration: 60,
    blockDuration: 30
  },
  
  // Premium users
  premium: {
    points: 500,
    duration: 60,
    blockDuration: 10
  },
  
  // Heavy operations (AI analysis, etc.)
  heavy: {
    points: 10,
    duration: 60,
    blockDuration: 300
  }
};

/**
 * Routes that use auth rate limiting
 */
const AUTH_ROUTES = [
  '/auth/email/login',
  '/auth/email/register',
  '/auth/email/verify',
  '/auth/email/resend-otp',
  '/auth/email/forgot-password',
  '/auth/email/reset-password'
];

/**
 * Routes that use heavy rate limiting
 */
const HEAVY_ROUTES = [
  '/api/analysis/analyze',
  '/api/analysis/rewrite',
  '/api/analysis/humanize'
];

// ============================================================================
// RATE LIMITERS
// ============================================================================

let redisClient = null;
const limiters = new Map();

/**
 * Initialize Redis client for rate limiting
 * @param {Object} client - ioredis client instance
 */
function initializeRedis(client) {
  redisClient = client;
  logger.info('Rate limiter Redis client initialized');
}

/**
 * Create rate limiter with Redis backend and memory fallback
 * @param {string} name - Limiter name
 * @param {Object} options - Rate limit options
 * @returns {Object} Rate limiter instance
 */
function createLimiter(name, options) {
  const { points, duration, blockDuration } = options;
  
  // Memory fallback limiter
  const memoryLimiter = new RateLimiterMemory({
    points,
    duration,
    blockDuration
  });
  
  // If Redis is available, use it with memory fallback
  if (redisClient) {
    try {
      const redisLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: `rl:${name}`,
        points,
        duration,
        blockDuration,
        insuranceLimiter: memoryLimiter
      });
      
      return redisLimiter;
    } catch (error) {
      logger.warn(`Failed to create Redis rate limiter for ${name}, using memory`, { error: error.message });
      return memoryLimiter;
    }
  }
  
  return memoryLimiter;
}

/**
 * Get or create rate limiter by name
 * @param {string} name - Limiter name
 * @returns {Object} Rate limiter instance
 */
function getLimiter(name) {
  if (!limiters.has(name)) {
    const config = RATE_LIMITS[name] || RATE_LIMITS.default;
    limiters.set(name, createLimiter(name, config));
  }
  return limiters.get(name);
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Determine rate limit tier based on request
 * @param {Object} req - Express request
 * @returns {string} Rate limit tier name
 */
function getTier(req) {
  const path = req.path;
  
  // Check for auth routes
  if (AUTH_ROUTES.some(route => path.includes(route))) {
    return 'auth';
  }
  
  // Check for heavy routes
  if (HEAVY_ROUTES.some(route => path.includes(route))) {
    return 'heavy';
  }
  
  // Check user tier
  if (req.user?.tier === 'premium') {
    return 'premium';
  }
  
  if (req.userId) {
    return 'authenticated';
  }
  
  return 'default';
}

/**
 * Get rate limit key for request
 * @param {Object} req - Express request
 * @param {string} tier - Rate limit tier
 * @returns {string} Rate limit key
 */
function getKey(req, tier) {
  const identifier = req.userId || req.ip || req.connection?.remoteAddress || 'unknown';
  return `${tier}:${identifier}`;
}

/**
 * Main rate limiting middleware
 */
async function rateLimit(req, res, next) {
  // Check if rate limiting is enabled
  if (config.FEATURES && !config.FEATURES.ENABLE_RATE_LIMITING) {
    return next();
  }
  
  const tier = getTier(req);
  const key = getKey(req, tier);
  const limiter = getLimiter(tier);
  
  try {
    const result = await limiter.consume(key);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': RATE_LIMITS[tier]?.points || RATE_LIMITS.default.points,
      'X-RateLimit-Remaining': result.remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + result.msBeforeNext).toISOString()
    });
    
    next();
  } catch (rejRes) {
    // Rate limit exceeded
    const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
    
    res.set({
      'Retry-After': retryAfter,
      'X-RateLimit-Limit': RATE_LIMITS[tier]?.points || RATE_LIMITS.default.points,
      'X-RateLimit-Remaining': 0,
      'X-RateLimit-Reset': new Date(Date.now() + rejRes.msBeforeNext).toISOString()
    });
    
    logger.warn('Rate limit exceeded', {
      key,
      tier,
      path: req.path,
      retryAfter
    });
    
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      code: 'RATE_LIMITED',
      retryAfter
    });
  }
}

/**
 * Create custom rate limiter middleware
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware
 */
function createRateLimiter(options = {}) {
  const {
    points = 100,
    duration = 60,
    blockDuration = 60,
    keyGenerator = (req) => req.userId || req.ip
  } = options;
  
  const limiter = new RateLimiterMemory({
    points,
    duration,
    blockDuration
  });
  
  return async (req, res, next) => {
    const key = keyGenerator(req);
    
    try {
      const result = await limiter.consume(key);
      
      res.set({
        'X-RateLimit-Limit': points,
        'X-RateLimit-Remaining': result.remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + result.msBeforeNext).toISOString()
      });
      
      next();
    } catch (rejRes) {
      const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
      
      res.set({
        'Retry-After': retryAfter,
        'X-RateLimit-Limit': points,
        'X-RateLimit-Remaining': 0
      });
      
      res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        retryAfter
      });
    }
  };
}

/**
 * Rate limiter for specific operations (e.g., OTP verification)
 * @param {string} operation - Operation name
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware
 */
function operationRateLimiter(operation, options = {}) {
  const {
    points = 5,
    duration = 300,
    blockDuration = 600
  } = options;
  
  const limiter = new RateLimiterMemory({
    points,
    duration,
    blockDuration
  });
  
  return async (req, res, next) => {
    const key = `${operation}:${req.body?.email || req.userId || req.ip}`;
    
    try {
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
      
      res.set('Retry-After', retryAfter);
      res.status(429).json({
        error: 'Too many attempts',
        message: `Too many ${operation} attempts. Please try again later.`,
        code: 'RATE_LIMITED',
        retryAfter
      });
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = rateLimit;
module.exports.initializeRedis = initializeRedis;
module.exports.createRateLimiter = createRateLimiter;
module.exports.operationRateLimiter = operationRateLimiter;
module.exports.getLimiter = getLimiter;
module.exports.RATE_LIMITS = RATE_LIMITS;
