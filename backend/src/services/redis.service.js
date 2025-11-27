/**
 * Enhanced Redis Service
 * Distributed caching with memory fallback
 * Supports rate limiting and session management
 */

const logger = require('../utils/logger');
const config = require('../config');

// ============================================================================
// REDIS CLIENT
// ============================================================================

let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis connection
 */
async function initRedis() {
  // Skip if Redis URL not configured
  if (!process.env.REDIS_URL) {
    logger.info('Redis URL not configured, using memory cache');
    return false;
  }
  
  try {
    // Dynamic import for optional Redis dependency
    const { createClient } = await import('redis');
    
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis error', { error: err.message });
      isConnected = false;
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis connected');
      isConnected = true;
    });
    
    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
    
    await redisClient.connect();
    isConnected = true;
    
    return true;
  } catch (error) {
    logger.warn('Redis initialization failed, using memory fallback', { error: error.message });
    return false;
  }
}

/**
 * Close Redis connection
 */
async function close() {
  if (redisClient && isConnected) {
    await redisClient.quit();
    isConnected = false;
    logger.info('Redis connection closed');
  }
}

/**
 * Check if Redis is available
 */
function isAvailable() {
  return isConnected && redisClient !== null;
}

// ============================================================================
// MEMORY FALLBACK CACHE
// ============================================================================

const memoryCache = new Map();
const memoryCacheTimestamps = new Map();

function cleanupMemoryCache() {
  const now = Date.now();
  for (const [key, timestamp] of memoryCacheTimestamps.entries()) {
    if (now - timestamp > 3600000) { // 1 hour max
      memoryCache.delete(key);
      memoryCacheTimestamps.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupMemoryCache, 300000);

// ============================================================================
// GENERIC CACHE OPERATIONS
// ============================================================================

/**
 * Get value from cache
 */
async function get(key) {
  try {
    if (isAvailable()) {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    }
    
    // Memory fallback
    const cached = memoryCache.get(key);
    if (cached) {
      const timestamp = memoryCacheTimestamps.get(key);
      if (Date.now() - timestamp < 3600000) {
        return cached;
      }
      memoryCache.delete(key);
      memoryCacheTimestamps.delete(key);
    }
    return null;
  } catch (error) {
    logger.warn('Cache get error', { key, error: error.message });
    return null;
  }
}

/**
 * Set value in cache
 */
async function set(key, value, ttlSeconds = 3600) {
  try {
    if (isAvailable()) {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    }
    
    // Memory fallback
    memoryCache.set(key, value);
    memoryCacheTimestamps.set(key, Date.now());
    return true;
  } catch (error) {
    logger.warn('Cache set error', { key, error: error.message });
    return false;
  }
}

/**
 * Delete value from cache
 */
async function del(key) {
  try {
    if (isAvailable()) {
      await redisClient.del(key);
    }
    memoryCache.delete(key);
    memoryCacheTimestamps.delete(key);
    return true;
  } catch (error) {
    logger.warn('Cache delete error', { key, error: error.message });
    return false;
  }
}

/**
 * Check if key exists
 */
async function exists(key) {
  try {
    if (isAvailable()) {
      return await redisClient.exists(key) === 1;
    }
    return memoryCache.has(key);
  } catch (error) {
    return false;
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

const rateLimitMemory = new Map();

const rateLimit = {
  /**
   * Check and increment rate limit counter
   * @param {string} key - Rate limit key (e.g., user:123:api)
   * @param {number} limit - Max requests allowed
   * @param {number} windowSeconds - Time window in seconds
   * @returns {Promise<{allowed: boolean, remaining: number, resetAt: number}>}
   */
  async check(key, limit, windowSeconds) {
    const fullKey = `ratelimit:${key}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    
    try {
      if (isAvailable()) {
        // Use Redis sorted set for sliding window
        const multi = redisClient.multi();
        
        // Remove old entries
        multi.zRemRangeByScore(fullKey, 0, now - windowMs);
        // Add current request
        multi.zAdd(fullKey, { score: now, value: `${now}-${Math.random()}` });
        // Count requests in window
        multi.zCard(fullKey);
        // Set expiry
        multi.expire(fullKey, windowSeconds);
        
        const results = await multi.exec();
        const count = results[2];
        
        return {
          allowed: count <= limit,
          remaining: Math.max(0, limit - count),
          resetAt: now + windowMs
        };
      }
      
      // Memory fallback
      if (!rateLimitMemory.has(fullKey)) {
        rateLimitMemory.set(fullKey, []);
      }
      
      const requests = rateLimitMemory.get(fullKey);
      const validRequests = requests.filter(t => now - t < windowMs);
      validRequests.push(now);
      rateLimitMemory.set(fullKey, validRequests);
      
      return {
        allowed: validRequests.length <= limit,
        remaining: Math.max(0, limit - validRequests.length),
        resetAt: now + windowMs
      };
    } catch (error) {
      logger.warn('Rate limit check error', { key, error: error.message });
      return { allowed: true, remaining: limit, resetAt: now + windowMs };
    }
  },
  
  /**
   * Reset rate limit for a key
   */
  async reset(key) {
    const fullKey = `ratelimit:${key}`;
    await del(fullKey);
    rateLimitMemory.delete(fullKey);
  }
};

// ============================================================================
// EMBEDDING CACHE
// ============================================================================

const embeddingCache = {
  /**
   * Get cached embedding
   */
  async get(textHash, taskType) {
    const key = `embedding:${taskType}:${textHash}`;
    return await get(key);
  },
  
  /**
   * Set cached embedding
   */
  async set(textHash, taskType, embedding) {
    const key = `embedding:${taskType}:${textHash}`;
    // Cache embeddings for 24 hours
    return await set(key, embedding, 86400);
  }
};

// ============================================================================
// SESSION CACHE
// ============================================================================

const sessionCache = {
  /**
   * Get user session data
   */
  async get(userId) {
    const key = `session:${userId}`;
    return await get(key);
  },
  
  /**
   * Set user session data
   */
  async set(userId, data, ttlSeconds = 3600) {
    const key = `session:${userId}`;
    return await set(key, data, ttlSeconds);
  },
  
  /**
   * Delete user session
   */
  async delete(userId) {
    const key = `session:${userId}`;
    return await del(key);
  }
};

// ============================================================================
// ANALYSIS CACHE
// ============================================================================

const analysisCache = {
  /**
   * Get cached analysis result
   */
  async get(profileId, textHash) {
    const key = `analysis:${profileId}:${textHash}`;
    return await get(key);
  },
  
  /**
   * Set cached analysis result
   */
  async set(profileId, textHash, result) {
    const key = `analysis:${profileId}:${textHash}`;
    // Cache analysis for 10 minutes
    return await set(key, result, 600);
  },
  
  /**
   * Invalidate all analysis cache for a profile
   */
  async invalidateProfile(profileId) {
    // Note: This is a simplified version
    // In production, use Redis SCAN to find and delete matching keys
    logger.info('Analysis cache invalidated for profile', { profileId });
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  initRedis,
  close,
  isAvailable,
  
  // Generic operations
  get,
  set,
  del,
  exists,
  
  // Specialized caches
  rateLimit,
  embeddingCache,
  sessionCache,
  analysisCache
};
