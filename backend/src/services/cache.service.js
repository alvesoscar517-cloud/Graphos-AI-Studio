/**
 * Unified Cache Service
 * 
 * MERGED: redis.service.js + cache.service.js
 * Single source of truth for all caching operations
 * 
 * Features:
 * - Redis distributed cache with ioredis
 * - LRU memory fallback for Cloud Run cold starts
 * - Specialized caches (profile, analysis, embedding, session)
 * - Rate limiting with sliding window
 * - Automatic cleanup and eviction
 * 
 * @module services/cache
 */

const Redis = require('ioredis');
const { createLRUCache, createAutoCleanupCache } = require('../utils/lruCache');
const logger = require('../utils/logger');
const envConfig = require('../config/envConfigHelper');

// ============================================================================
// CONFIGURATION
// ============================================================================

// Use lazy getter for REDIS_URL to support Firestore config
const getRedisUrl = () => envConfig.get('REDIS_URL') || 'redis://localhost:6379';
const MAX_RETRIES = 10;
const RETRY_DELAY = 100;

// TTL Configuration (in milliseconds for memory, seconds for Redis)
const TTL = {
  DEFAULT: 5 * 60,        // 5 minutes
  PROFILE: 5 * 60,        // 5 minutes
  ANALYSIS: 10 * 60,      // 10 minutes
  EMBEDDING: 24 * 60 * 60, // 24 hours
  SESSION: 60 * 60,       // 1 hour
};

const MAX_MEMORY_CACHE_SIZE = 1000;

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
  const redisUrl = getRedisUrl();
  if (!redisUrl || redisUrl === 'redis://localhost:6379') {
    // Only skip if truly not configured (empty or default localhost)
    const configuredUrl = envConfig.get('REDIS_URL');
    if (!configuredUrl) {
      logger.info('[CACHE] Redis URL not configured, using memory cache only');
      return false;
    }
  }
  
  try {
    redisClient = new Redis(getRedisUrl(), {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > MAX_RETRIES) {
          logger.error('[CACHE] Redis max reconnection attempts reached');
          return null;
        }
        return Math.min(times * RETRY_DELAY, 3000);
      },
      enableReadyCheck: true,
      enableOfflineQueue: true,
      connectTimeout: 10000,
      keepAlive: 30000,
      reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
        return targetErrors.some(e => err.message.includes(e));
      }
    });
    
    redisClient.on('error', (err) => {
      logger.error('[CACHE] Redis error', { error: err.message });
      isConnected = false;
    });
    
    redisClient.on('ready', () => {
      logger.info('[CACHE] Redis ready');
      isConnected = true;
    });
    
    redisClient.on('close', () => {
      logger.info('[CACHE] Redis connection closed');
      isConnected = false;
    });
    
    await redisClient.connect();
    await redisClient.ping();
    isConnected = true;
    
    logger.info('[CACHE] Redis initialized successfully');
    return true;
  } catch (error) {
    logger.warn('[CACHE] Redis initialization failed, using memory fallback', { 
      error: error.message 
    });
    isConnected = false;
    return false;
  }
}

function getClient() {
  return redisClient;
}

async function close() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('[CACHE] Redis connection closed gracefully');
    } catch (error) {
      redisClient.disconnect();
    }
    redisClient = null;
    isConnected = false;
  }
}

function isAvailable() {
  return isConnected && redisClient !== null && redisClient.status === 'ready';
}

// ============================================================================
// MEMORY CACHE (LRU with auto cleanup)
// ============================================================================

const memoryCache = createAutoCleanupCache({
  maxSize: MAX_MEMORY_CACHE_SIZE,
  maxAge: TTL.DEFAULT * 1000,
  onEvict: (key, value, reason) => {
    logger.debug('[CACHE] Memory eviction', { key, reason });
  }
}, 60000);

// ============================================================================
// CORE CACHE OPERATIONS
// ============================================================================

/**
 * Get value from cache (Redis first, then memory)
 */
async function get(key) {
  try {
    if (isAvailable()) {
      const value = await redisClient.get(key);
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
    }
    return memoryCache.get(key) || null;
  } catch (error) {
    logger.warn('[CACHE] Get error', { key, error: error.message });
    return memoryCache.get(key) || null;
  }
}

/**
 * Set value in cache (both Redis and memory)
 */
async function set(key, value, ttlSeconds = TTL.DEFAULT) {
  try {
    const serialized = JSON.stringify(value);
    
    if (isAvailable()) {
      await redisClient.setex(key, ttlSeconds, serialized);
    }
    
    memoryCache.set(key, value, ttlSeconds * 1000);
    return true;
  } catch (error) {
    logger.warn('[CACHE] Set error', { key, error: error.message });
    memoryCache.set(key, value, ttlSeconds * 1000);
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
    return true;
  } catch (error) {
    logger.warn('[CACHE] Delete error', { key, error: error.message });
    memoryCache.delete(key);
    return false;
  }
}

/**
 * Check if key exists
 */
async function exists(key) {
  try {
    if (isAvailable()) {
      return (await redisClient.exists(key)) === 1;
    }
    return memoryCache.has(key);
  } catch (error) {
    return memoryCache.has(key);
  }
}

/**
 * Set only if not exists (for locks)
 */
async function setNX(key, value, ttlSeconds = 60) {
  try {
    if (isAvailable()) {
      const result = await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    }
    
    if (memoryCache.has(key)) {
      return false;
    }
    
    memoryCache.set(key, value, ttlSeconds * 1000);
    return true;
  } catch (error) {
    logger.warn('[CACHE] SetNX error', { key, error: error.message });
    return false;
  }
}

/**
 * Increment counter
 */
async function incr(key, amount = 1) {
  try {
    if (isAvailable()) {
      return amount === 1 
        ? await redisClient.incr(key)
        : await redisClient.incrby(key, amount);
    }
    
    const current = memoryCache.get(key) || 0;
    const newValue = current + amount;
    memoryCache.set(key, newValue);
    return newValue;
  } catch (error) {
    logger.warn('[CACHE] Incr error', { key, error: error.message });
    return 0;
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

const rateLimitMemory = new Map();

const rateLimit = {
  async check(key, limit, windowSeconds) {
    const fullKey = `ratelimit:${key}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    
    try {
      if (isAvailable()) {
        const pipeline = redisClient.pipeline();
        pipeline.zremrangebyscore(fullKey, 0, now - windowMs);
        pipeline.zadd(fullKey, now, `${now}-${Math.random()}`);
        pipeline.zcard(fullKey);
        pipeline.expire(fullKey, windowSeconds);
        
        const results = await pipeline.exec();
        const count = results[2][1];
        
        return {
          allowed: count <= limit,
          remaining: Math.max(0, limit - count),
          resetAt: now + windowMs
        };
      }
      
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
      logger.warn('[CACHE] Rate limit error', { key, error: error.message });
      return { allowed: true, remaining: limit, resetAt: now + windowMs };
    }
  },
  
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
    return set(`embedding:${taskType}:${textHash}`, embedding, TTL.EMBEDDING);
  }
};

const sessionCache = {
  async get(userId) {
    return get(`session:${userId}`);
  },
  async set(userId, data, ttlSeconds = TTL.SESSION) {
    return set(`session:${userId}`, data, ttlSeconds);
  },
  async delete(userId) {
    return del(`session:${userId}`);
  }
};

const profileCache = {
  async get(profileId) {
    return get(`profile:${profileId}`);
  },
  async set(profileId, data) {
    return set(`profile:${profileId}`, data, TTL.PROFILE);
  },
  async invalidate(profileId) {
    await del(`profile:${profileId}`);
    await del(`centroid:${profileId}`);
  }
};

const analysisCache = {
  async get(profileId, textHash) {
    return get(`analysis:${profileId}:${textHash}`);
  },
  async set(profileId, textHash, result) {
    return set(`analysis:${profileId}:${textHash}`, result, TTL.ANALYSIS);
  },
  async invalidateProfile(profileId) {
    if (isAvailable()) {
      try {
        let cursor = '0';
        do {
          const [newCursor, keys] = await redisClient.scan(
            cursor, 'MATCH', `analysis:${profileId}:*`, 'COUNT', 100
          );
          cursor = newCursor;
          if (keys.length > 0) {
            await redisClient.del(...keys);
          }
        } while (cursor !== '0');
        logger.info('[CACHE] Analysis cache invalidated', { profileId });
      } catch (error) {
        logger.warn('[CACHE] Failed to invalidate analysis cache', { profileId, error: error.message });
      }
    }
    
    for (const key of memoryCache.keys()) {
      if (key.startsWith(`analysis:${profileId}:`)) {
        memoryCache.delete(key);
      }
    }
  }
};

// ============================================================================
// UTILITIES
// ============================================================================

function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

function getStats() {
  const lruStats = memoryCache.getStats ? memoryCache.getStats() : { size: memoryCache.size };
  return {
    redisConnected: isAvailable(),
    redisStatus: redisClient?.status || 'not_initialized',
    memoryCacheSize: lruStats.size || memoryCache.size,
    maxMemoryCacheSize: MAX_MEMORY_CACHE_SIZE
  };
}

/**
 * Wrap function with caching
 */
function withCache(fn, keyGenerator, options = {}) {
  const { ttl = TTL.DEFAULT, namespace = 'general' } = options;
  
  return async (...args) => {
    const key = `${namespace}:${keyGenerator(...args)}`;
    const cached = await get(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }
    const result = await fn(...args);
    await set(key, result, ttl);
    return result;
  };
}

// ============================================================================
// LEGACY COMPATIBILITY (for cache.service.js consumers)
// ============================================================================

const getCache = get;
const setCache = set;
const deleteCache = del;
const clearCache = async (namespace) => {
  logger.info('[CACHE] Clear namespace', { namespace });
  // Clear memory cache for namespace
  for (const key of memoryCache.keys()) {
    if (key.startsWith(`${namespace}:`)) {
      memoryCache.delete(key);
    }
  }
  return true;
};

// Legacy profile functions
const getCachedProfile = (profileId) => profileCache.get(profileId);
const setCachedProfile = (profileId, data) => profileCache.set(profileId, data);
const invalidateProfileCache = (profileId) => profileCache.invalidate(profileId);

// Legacy analysis functions
const getCachedAnalysis = (profileId, text) => analysisCache.get(profileId, hashText(text));
const setCachedAnalysis = (profileId, text, result) => analysisCache.set(profileId, hashText(text), result);

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Lifecycle
  initRedis,
  close,
  isAvailable,
  getClient,
  
  // Core operations
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
  profileCache,
  analysisCache,
  
  // Utilities
  hashText,
  getStats,
  withCache,
  
  // Legacy compatibility (cache.service.js interface)
  getCache,
  setCache,
  deleteCache,
  clearCache,
  getCachedProfile,
  setCachedProfile,
  invalidateProfileCache,
  getCachedAnalysis,
  setCachedAnalysis,
  
  // TTL constants
  TTL,
  DEFAULT_TTL: TTL.DEFAULT * 1000,
  PROFILE_TTL: TTL.PROFILE * 1000,
  ANALYSIS_TTL: TTL.ANALYSIS * 1000,
};
