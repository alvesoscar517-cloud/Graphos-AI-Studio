/**
 * Cache Service - Powered by ioredis, keyv, and lru-cache
 * Multi-tier caching with Redis backend and LRU memory fallback
 * 
 * @module services/cache
 */

const KeyvModule = require('keyv');
const KeyvRedisModule = require('@keyv/redis');
const { createLRUCache, createAutoCleanupCache } = require('../utils/lruCache');
const logger = require('../utils/logger');

// Handle both ESM and CJS exports
const Keyv = KeyvModule.default || KeyvModule;
const KeyvRedis = KeyvRedisModule.default || KeyvRedisModule;

// ============================================================================
// CONFIGURATION
// ============================================================================

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const PROFILE_TTL = 5 * 60 * 1000; // 5 minutes
const ANALYSIS_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_MEMORY_CACHE_SIZE = 1000;

// ============================================================================
// CACHE INSTANCES
// ============================================================================

let redisStore = null;
let isRedisConnected = false;

// LRU memory cache with automatic cleanup (replaces simple Map)
const memoryCache = createAutoCleanupCache({
  maxSize: MAX_MEMORY_CACHE_SIZE,
  maxAge: DEFAULT_TTL,
  onEvict: (key, value, reason) => {
    logger.debug('Memory cache eviction', { key, reason });
  }
}, 60000); // Cleanup every minute

/**
 * Initialize Redis connection
 */
function initializeRedis() {
  try {
    redisStore = new KeyvRedis(REDIS_URL);
    
    redisStore.on('error', (err) => {
      logger.warn('Redis cache error, falling back to memory', { error: err.message });
      isRedisConnected = false;
    });
    
    isRedisConnected = true;
    logger.info('Cache service Redis connected');
  } catch (error) {
    logger.warn('Failed to connect to Redis, using memory cache', { error: error.message });
    isRedisConnected = false;
  }
}

// Initialize on module load
initializeRedis();

/**
 * Create Keyv instance with namespace
 * @param {string} namespace - Cache namespace
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Keyv} Keyv instance
 */
function createCache(namespace, ttl = DEFAULT_TTL) {
  if (isRedisConnected && redisStore) {
    return new Keyv({
      store: redisStore,
      namespace,
      ttl
    });
  }
  
  // Memory fallback
  return new Keyv({
    namespace,
    ttl
  });
}

// Create namespaced caches
const profileCache = createCache('profile', PROFILE_TTL);
const analysisCache = createCache('analysis', ANALYSIS_TTL);
const generalCache = createCache('general', DEFAULT_TTL);

// ============================================================================
// CORE CACHE OPERATIONS
// ============================================================================

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @param {string} namespace - Cache namespace
 * @returns {Promise<*>} Cached value or undefined
 */
async function getCache(key, namespace = 'general') {
  try {
    const cache = namespace === 'profile' ? profileCache :
                  namespace === 'analysis' ? analysisCache : generalCache;
    
    const value = await cache.get(key);
    
    if (value !== undefined) {
      logger.debug('Cache HIT', { key, namespace });
    } else {
      logger.debug('Cache MISS', { key, namespace });
    }
    
    return value;
  } catch (error) {
    logger.warn('Cache get error', { key, namespace, error: error.message });
    return getFromMemory(key, namespace);
  }
}

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds
 * @param {string} namespace - Cache namespace
 * @returns {Promise<boolean>} Success status
 */
async function setCache(key, value, ttl = DEFAULT_TTL, namespace = 'general') {
  try {
    const cache = namespace === 'profile' ? profileCache :
                  namespace === 'analysis' ? analysisCache : generalCache;
    
    await cache.set(key, value, ttl);
    logger.debug('Cache SET', { key, namespace, ttl });
    
    // Also set in memory for fast access
    setInMemory(key, value, ttl, namespace);
    
    return true;
  } catch (error) {
    logger.warn('Cache set error', { key, namespace, error: error.message });
    setInMemory(key, value, ttl, namespace);
    return false;
  }
}

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @param {string} namespace - Cache namespace
 * @returns {Promise<boolean>} Success status
 */
async function deleteCache(key, namespace = 'general') {
  try {
    const cache = namespace === 'profile' ? profileCache :
                  namespace === 'analysis' ? analysisCache : generalCache;
    
    await cache.delete(key);
    deleteFromMemory(key, namespace);
    
    logger.debug('Cache DELETE', { key, namespace });
    return true;
  } catch (error) {
    logger.warn('Cache delete error', { key, namespace, error: error.message });
    deleteFromMemory(key, namespace);
    return false;
  }
}

/**
 * Clear all cache in namespace
 * @param {string} namespace - Cache namespace
 * @returns {Promise<boolean>} Success status
 */
async function clearCache(namespace = 'general') {
  try {
    const cache = namespace === 'profile' ? profileCache :
                  namespace === 'analysis' ? analysisCache : generalCache;
    
    await cache.clear();
    clearMemoryNamespace(namespace);
    
    logger.info('Cache CLEAR', { namespace });
    return true;
  } catch (error) {
    logger.warn('Cache clear error', { namespace, error: error.message });
    return false;
  }
}

// ============================================================================
// MEMORY CACHE HELPERS (using LRU cache)
// ============================================================================

function getMemoryKey(key, namespace) {
  return `${namespace}:${key}`;
}

function getFromMemory(key, namespace) {
  const memKey = getMemoryKey(key, namespace);
  return memoryCache.get(memKey);
}

function setInMemory(key, value, ttl, namespace) {
  const memKey = getMemoryKey(key, namespace);
  // LRU cache handles size limits automatically
  memoryCache.set(memKey, value, ttl);
}

function deleteFromMemory(key, namespace) {
  const memKey = getMemoryKey(key, namespace);
  memoryCache.delete(memKey);
}

function clearMemoryNamespace(namespace) {
  const keys = memoryCache.keys();
  for (const key of keys) {
    if (key.startsWith(`${namespace}:`)) {
      memoryCache.delete(key);
    }
  }
}

// ============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================================================

/**
 * Get cached profile (legacy)
 */
async function getCachedProfile(profileId) {
  return getCache(profileId, 'profile');
}

/**
 * Set cached profile (legacy)
 */
async function setCachedProfile(profileId, data) {
  return setCache(profileId, data, PROFILE_TTL, 'profile');
}

/**
 * Invalidate profile cache (legacy)
 */
async function invalidateProfileCache(profileId) {
  await deleteCache(profileId, 'profile');
  await deleteCache(`centroid:${profileId}`, 'profile');
}

/**
 * Hash text for cache key
 */
function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

/**
 * Get cached analysis (legacy)
 */
async function getCachedAnalysis(profileId, text) {
  const key = `${profileId}_${hashText(text)}`;
  return getCache(key, 'analysis');
}

/**
 * Set cached analysis (legacy)
 */
async function setCachedAnalysis(profileId, text, result) {
  const key = `${profileId}_${hashText(text)}`;
  return setCache(key, result, ANALYSIS_TTL, 'analysis');
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
function getCacheStats() {
  const lruStats = memoryCache.getStats();
  return {
    memorySize: memoryCache.size,
    memoryMaxSize: lruStats.maxSize,
    memoryUtilization: lruStats.utilization,
    redisConnected: isRedisConnected
  };
}

/**
 * Wrap function with caching
 * @param {Function} fn - Function to wrap
 * @param {Function} keyGenerator - Function to generate cache key
 * @param {Object} options - Cache options
 * @returns {Function} Wrapped function
 */
function withCache(fn, keyGenerator, options = {}) {
  const { ttl = DEFAULT_TTL, namespace = 'general' } = options;
  
  return async (...args) => {
    const key = keyGenerator(...args);
    
    // Try to get from cache
    const cached = await getCache(key, namespace);
    if (cached !== undefined) {
      return cached;
    }
    
    // Execute function and cache result
    const result = await fn(...args);
    await setCache(key, result, ttl, namespace);
    
    return result;
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Core operations
  getCache,
  setCache,
  deleteCache,
  clearCache,
  
  // Legacy compatibility
  getCachedProfile,
  setCachedProfile,
  invalidateProfileCache,
  getCachedAnalysis,
  setCachedAnalysis,
  
  // Utilities
  getCacheStats,
  withCache,
  hashText,
  
  // Configuration
  DEFAULT_TTL,
  PROFILE_TTL,
  ANALYSIS_TTL
};
