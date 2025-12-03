/**
 * Enhanced Redis Service - Powered by ioredis
 * Distributed caching with memory fallback
 * Optimized for Cloud Run with lazy connect
 * 
 * @module services/redis
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

// ============================================================================
// CONFIGURATION
// ============================================================================

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MAX_RETRIES = 10;
const RETRY_DELAY = 100;

// ============================================================================
// REDIS CLIENT
// ============================================================================

let redisClient = null;
let isConnected = false;
let cleanupInterval = null;

/**
 * Initialize Redis connection with ioredis
 * Optimized for Cloud Run with lazy connect
 */
async function initRedis() {
  // Skip if Redis URL not configured
  if (!process.env.REDIS_URL) {
    logger.info('Redis URL not configured, using memory cache');
    return false;
  }
  
  try {
    redisClient = new Redis(REDIS_URL, {
      // Cloud Run optimization: lazy connect for faster cold start
      lazyConnect: true,
      
      // Connection settings
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > MAX_RETRIES) {
          logger.error('Redis max reconnection attempts reached');
          return null; // Stop retrying
        }
        const delay = Math.min(times * RETRY_DELAY, 3000);
        logger.info('Redis reconnecting...', { attempt: times, delay });
        return delay;
      },
      
      // Performance settings
      enableReadyCheck: true,
      enableOfflineQueue: true,
      connectTimeout: 10000,
      
      // Keep alive for Cloud Run
      keepAlive: 30000,
      
      // Auto reconnect
      reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
        return targetErrors.some(e => err.message.includes(e));
      }
    });
    
    // Event handlers
    redisClient.on('error', (err) => {
      logger.error('Redis error', { error: err.message });
      isConnected = false;
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis connecting...');
    });
    
    redisClient.on('ready', () => {
      logger.info('Redis ready');
      isConnected = true;
    });
    
    redisClient.on('close', () => {
      logger.info('Redis connection closed');
      isConnected = false;
    });
    
    redisClient.on('reconnecting', (delay) => {
      logger.info('Redis reconnecting...', { delay });
    });
    
    // Connect
    await redisClient.connect();
    
    // Verify connection
    await redisClient.ping();
    isConnected = true;
    
    logger.info('Redis initialized successfully');
    return true;
  } catch (error) {
    logger.warn('Redis initialization failed, using memory fallback', { 
      error: error.message 
    });
    isConnected = false;
    return false;
  }
}

/**
 * Get Redis client instance
 * @returns {Redis|null} Redis client or null
 */
function getClient() {
  return redisClient;
}

/**
 * Close Redis connection gracefully
 */
async function close() {
  // Clear cleanup interval
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed gracefully');
    } catch (error) {
      logger.warn('Redis close error, forcing disconnect', { error: error.message });
      redisClient.disconnect();
    }
    redisClient = null;
    isConnected = false;
  }
}

/**
 * Check if Redis is available
 * @returns {boolean}
 */
function isAvailable() {
  return isConnected && redisClient !== null && redisClient.status === 'ready';
}

// ============================================================================
// MEMORY FALLBACK CACHE (LRU-like)
// ============================================================================

const MAX_MEMORY_CACHE_SIZE = 1000;
const memoryCache = new Map();
const memoryCacheTTL = new Map();

/**
 * Cleanup expired memory cache entries
 */
function cleanupMemoryCache() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, expiry] of memoryCacheTTL.entries()) {
    if (now > expiry) {
      memoryCache.delete(key);
      memoryCacheTTL.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    logger.debug('Memory cache cleanup', { cleaned, remaining: memoryCache.size });
  }
}

// Start cleanup interval
cleanupInterval = setInterval(cleanupMemoryCache, 60000); // Every minute

/**
 * Evict oldest entries if cache is full
 */
function evictIfNeeded() {
  if (memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
    // Remove oldest 10% of entries
    const toRemove = Math.ceil(MAX_MEMORY_CACHE_SIZE * 0.1);
    const keys = Array.from(memoryCache.keys()).slice(0, toRemove);
    
    for (const key of keys) {
      memoryCache.delete(key);
      memoryCacheTTL.delete(key);
    }
    
    logger.debug('Memory cache eviction', { evicted: toRemove });
  }
}

// ============================================================================
// GENERIC CACHE OPERATIONS
// ============================================================================

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<*>} Cached value or null
 */
async function get(key) {
  try {
    if (isAvailable()) {
      const value = await redisClient.get(key);
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value; // Return as-is if not JSON
        }
      }
      return null;
    }
    
    // Memory fallback
    const expiry = memoryCacheTTL.get(key);
    if (expiry && Date.now() > expiry) {
      memoryCache.delete(key);
      memoryCacheTTL.delete(key);
      return null;
    }
    
    return memoryCache.get(key) || null;
  } catch (error) {
    logger.warn('Cache get error', { key, error: error.message });
    // Try memory fallback on Redis error
    return memoryCache.get(key) || null;
  }
}

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttlSeconds - TTL in seconds (default: 1 hour)
 * @returns {Promise<boolean>} Success status
 */
async function set(key, value, ttlSeconds = 3600) {
  try {
    const serialized = JSON.stringify(value);
    
    if (isAvailable()) {
      await redisClient.setex(key, ttlSeconds, serialized);
    }
    
    // Also set in memory for fast access
    evictIfNeeded();
    memoryCache.set(key, value);
    memoryCacheTTL.set(key, Date.now() + (ttlSeconds * 1000));
    
    return true;
  } catch (error) {
    logger.warn('Cache set error', { key, error: error.message });
    
    // Memory fallback
    evictIfNeeded();
    memoryCache.set(key, value);
    memoryCacheTTL.set(key, Date.now() + (ttlSeconds * 1000));
    
    return false;
  }
}

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
async function del(key) {
  try {
    if (isAvailable()) {
      await redisClient.del(key);
    }
    
    memoryCache.delete(key);
    memoryCacheTTL.delete(key);
    
    return true;
  } catch (error) {
    logger.warn('Cache delete error', { key, error: error.message });
    memoryCache.delete(key);
    memoryCacheTTL.delete(key);
    return false;
  }
}

/**
 * Check if key exists
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
async function exists(key) {
  try {
    if (isAvailable()) {
      return (await redisClient.exists(key)) === 1;
    }
    
    const expiry = memoryCacheTTL.get(key);
    if (expiry && Date.now() > expiry) {
      memoryCache.delete(key);
      memoryCacheTTL.delete(key);
      return false;
    }
    
    return memoryCache.has(key);
  } catch (error) {
    return memoryCache.has(key);
  }
}

/**
 * Set value with expiry only if key doesn't exist (for locks)
 * @param {string} key - Cache key
 * @param {*} value - Value to set
 * @param {number} ttlSeconds - TTL in seconds
 * @returns {Promise<boolean>} True if set, false if key exists
 */
async function setNX(key, value, ttlSeconds = 60) {
  try {
    if (isAvailable()) {
      const result = await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    }
    
    // Memory fallback
    if (memoryCache.has(key)) {
      const expiry = memoryCacheTTL.get(key);
      if (expiry && Date.now() < expiry) {
        return false;
      }
    }
    
    evictIfNeeded();
    memoryCache.set(key, value);
    memoryCacheTTL.set(key, Date.now() + (ttlSeconds * 1000));
    return true;
  } catch (error) {
    logger.warn('Cache setNX error', { key, error: error.message });
    return false;
  }
}

/**
 * Increment a counter
 * @param {string} key - Cache key
 * @param {number} amount - Amount to increment (default: 1)
 * @returns {Promise<number>} New value
 */
async function incr(key, amount = 1) {
  try {
    if (isAvailable()) {
      if (amount === 1) {
        return await redisClient.incr(key);
      }
      return await redisClient.incrby(key, amount);
    }
    
    // Memory fallback
    const current = memoryCache.get(key) || 0;
    const newValue = current + amount;
    memoryCache.set(key, newValue);
    return newValue;
  } catch (error) {
    logger.warn('Cache incr error', { key, error: error.message });
    return 0;
  }
}

// ============================================================================
// RATE LIMITING (Sliding Window)
// ============================================================================

const rateLimitMemory = new Map();

const rateLimit = {
  /**
   * Check and increment rate limit counter using sliding window
   * @param {string} key - Rate limit key
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
        const pipeline = redisClient.pipeline();
        
        // Remove old entries
        pipeline.zremrangebyscore(fullKey, 0, now - windowMs);
        // Add current request
        pipeline.zadd(fullKey, now, `${now}-${Math.random()}`);
        // Count requests in window
        pipeline.zcard(fullKey);
        // Set expiry
        pipeline.expire(fullKey, windowSeconds);
        
        const results = await pipeline.exec();
        const count = results[2][1]; // zcard result
        
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
   * @param {string} key - Rate limit key
   */
  async reset(key) {
    const fullKey = `ratelimit:${key}`;
    await del(fullKey);
    rateLimitMemory.delete(fullKey);
  }
};

// ============================================================================
// SPECIALIZED CACHES
// ============================================================================

const embeddingCache = {
  async get(textHash, taskType) {
    return get(`embedding:${taskType}:${textHash}`);
  },
  
  async set(textHash, taskType, embedding) {
    // Cache embeddings for 24 hours
    return set(`embedding:${taskType}:${textHash}`, embedding, 86400);
  }
};

const sessionCache = {
  async get(userId) {
    return get(`session:${userId}`);
  },
  
  async set(userId, data, ttlSeconds = 3600) {
    return set(`session:${userId}`, data, ttlSeconds);
  },
  
  async delete(userId) {
    return del(`session:${userId}`);
  }
};

const analysisCache = {
  async get(profileId, textHash) {
    return get(`analysis:${profileId}:${textHash}`);
  },
  
  async set(profileId, textHash, result) {
    // Cache analysis for 10 minutes
    return set(`analysis:${profileId}:${textHash}`, result, 600);
  },
  
  async invalidateProfile(profileId) {
    if (isAvailable()) {
      try {
        // Use SCAN to find and delete matching keys
        let cursor = '0';
        do {
          const [newCursor, keys] = await redisClient.scan(
            cursor, 
            'MATCH', `analysis:${profileId}:*`,
            'COUNT', 100
          );
          cursor = newCursor;
          
          if (keys.length > 0) {
            await redisClient.del(...keys);
          }
        } while (cursor !== '0');
        
        logger.info('Analysis cache invalidated for profile', { profileId });
      } catch (error) {
        logger.warn('Failed to invalidate analysis cache', { profileId, error: error.message });
      }
    }
    
    // Also clear from memory
    for (const key of memoryCache.keys()) {
      if (key.startsWith(`analysis:${profileId}:`)) {
        memoryCache.delete(key);
        memoryCacheTTL.delete(key);
      }
    }
  }
};

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
function getStats() {
  return {
    redisConnected: isAvailable(),
    redisStatus: redisClient?.status || 'not_initialized',
    memoryCacheSize: memoryCache.size,
    maxMemoryCacheSize: MAX_MEMORY_CACHE_SIZE
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Lifecycle
  initRedis,
  close,
  isAvailable,
  getClient,
  
  // Generic operations
  get,
  set,
  del,
  exists,
  setNX,
  incr,
  
  // Specialized caches
  rateLimit,
  embeddingCache,
  sessionCache,
  analysisCache,
  
  // Stats
  getStats
};
