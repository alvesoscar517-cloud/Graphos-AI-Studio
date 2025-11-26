/**
 * Redis Cache Service
 * Provides distributed caching for embeddings and other data
 * Falls back to in-memory cache if Redis is not available
 */

const logger = require('../utils/logger');

// Redis client (lazy initialization)
let redisClient = null;
let redisAvailable = false;

// Fallback in-memory cache
const memoryCache = new Map();
const MEMORY_CACHE_MAX_SIZE = 1000;

// Cache configuration
const CACHE_CONFIG = {
  EMBEDDING_TTL: 30 * 60, // 30 minutes in seconds
  PROFILE_TTL: 5 * 60,    // 5 minutes
  DEFAULT_TTL: 10 * 60    // 10 minutes
};

/**
 * Initialize Redis connection
 */
async function initRedis() {
  // Skip if REDIS_URL is not configured
  if (!process.env.REDIS_URL) {
    logger.info('Redis URL not configured, using in-memory cache');
    return false;
  }

  try {
    const Redis = require('ioredis');
    
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      connectTimeout: 5000,
      lazyConnect: true
    });

    // Event handlers
    redisClient.on('connect', () => {
      logger.info('Redis connected');
      redisAvailable = true;
    });

    redisClient.on('error', (err) => {
      logger.warn('Redis error, falling back to memory cache', { error: err.message });
      redisAvailable = false;
    });

    redisClient.on('close', () => {
      logger.info('Redis connection closed');
      redisAvailable = false;
    });

    // Try to connect
    await redisClient.connect();
    await redisClient.ping();
    
    redisAvailable = true;
    logger.info('Redis initialized successfully');
    return true;
  } catch (error) {
    logger.warn('Failed to initialize Redis, using in-memory cache', { error: error.message });
    redisAvailable = false;
    return false;
  }
}

/**
 * Get value from cache
 */
async function get(key) {
  try {
    if (redisAvailable && redisClient) {
      const value = await redisClient.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    }
    
    // Fallback to memory cache
    const cached = memoryCache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }
    
    // Clean up expired entry
    if (cached) {
      memoryCache.delete(key);
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
async function set(key, value, ttlSeconds = CACHE_CONFIG.DEFAULT_TTL) {
  try {
    if (redisAvailable && redisClient) {
      await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    }
    
    // Fallback to memory cache
    // Evict oldest entry if cache is full
    if (memoryCache.size >= MEMORY_CACHE_MAX_SIZE) {
      const firstKey = memoryCache.keys().next().value;
      memoryCache.delete(firstKey);
    }
    
    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
    
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
    if (redisAvailable && redisClient) {
      await redisClient.del(key);
    }
    memoryCache.delete(key);
    return true;
  } catch (error) {
    logger.warn('Cache delete error', { key, error: error.message });
    return false;
  }
}

/**
 * Delete multiple keys by pattern
 */
async function delByPattern(pattern) {
  try {
    if (redisAvailable && redisClient) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    }
    
    // Also clean memory cache
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        memoryCache.delete(key);
      }
    }
    
    return true;
  } catch (error) {
    logger.warn('Cache delete by pattern error', { pattern, error: error.message });
    return false;
  }
}

/**
 * Check if Redis is available
 */
function isRedisAvailable() {
  return redisAvailable;
}

/**
 * Get cache stats
 */
async function getStats() {
  const stats = {
    type: redisAvailable ? 'redis' : 'memory',
    memoryCacheSize: memoryCache.size
  };
  
  if (redisAvailable && redisClient) {
    try {
      const info = await redisClient.info('memory');
      const usedMemory = info.match(/used_memory:(\d+)/);
      if (usedMemory) {
        stats.redisMemoryBytes = parseInt(usedMemory[1]);
      }
    } catch (error) {
      // Ignore
    }
  }
  
  return stats;
}

/**
 * Close Redis connection
 */
async function close() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    redisAvailable = false;
  }
}

// Embedding-specific helpers
const embeddingCache = {
  /**
   * Get cached embedding
   */
  async get(textHash, taskType) {
    const key = `emb:${taskType}:${textHash}`;
    return await get(key);
  },
  
  /**
   * Set cached embedding
   */
  async set(textHash, taskType, embedding) {
    const key = `emb:${taskType}:${textHash}`;
    return await set(key, embedding, CACHE_CONFIG.EMBEDDING_TTL);
  }
};

// Profile-specific helpers
const profileCache = {
  /**
   * Invalidate profile cache
   */
  async invalidate(profileId) {
    await delByPattern(`profile:${profileId}:*`);
  }
};

module.exports = {
  initRedis,
  get,
  set,
  del,
  delByPattern,
  isRedisAvailable,
  getStats,
  close,
  embeddingCache,
  profileCache,
  CACHE_CONFIG
};
