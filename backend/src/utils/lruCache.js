/**
 * LRU Cache Wrapper
 * Uses lru-cache library for production-ready caching
 * 
 * @module utils/lruCache
 */

const { LRUCache: LRUCacheLib } = require('lru-cache');

// ============================================================================
// LRU CACHE WRAPPER CLASS
// ============================================================================

class LRUCache {
  /**
   * Create a new LRU Cache using lru-cache library
   * @param {Object} options - Configuration options
   * @param {number} options.maxSize - Maximum number of items (default: 1000)
   * @param {number} options.maxAge - Maximum age in ms (default: 1 hour)
   * @param {Function} options.onEvict - Callback when item is evicted
   * @param {boolean} options.updateAgeOnGet - Update TTL on get (default: false)
   * @param {boolean} options.updateAgeOnHas - Update TTL on has (default: false)
   */
  constructor(options = {}) {
    const maxSize = options.maxSize || options.max || 1000;
    const maxAge = options.maxAge || options.ttl || 3600000; // 1 hour
    
    this.cache = new LRUCacheLib({
      max: maxSize,
      ttl: maxAge,
      updateAgeOnGet: options.updateAgeOnGet || false,
      updateAgeOnHas: options.updateAgeOnHas || false,
      allowStale: options.allowStale || false,
      
      // Eviction callback
      dispose: (value, key, reason) => {
        if (options.onEvict && reason !== 'set') {
          options.onEvict(key, value, reason);
        }
      },
      
      // Size calculation for memory-based limits
      sizeCalculation: options.sizeCalculation || undefined,
      maxSize: options.maxMemory || undefined,
    });
    
    // Store config for getStats
    this._maxSize = maxSize;
    this._maxAge = maxAge;
  }
  
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    return this.cache.get(key);
  }
  
  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number|Object} ttlOrOptions - TTL in ms or options object
   * @returns {LRUCache} This instance for chaining
   */
  set(key, value, ttlOrOptions = null) {
    const options = typeof ttlOrOptions === 'number' 
      ? { ttl: ttlOrOptions }
      : ttlOrOptions || {};
    
    this.cache.set(key, value, options);
    return this;
  }
  
  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }
  
  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key existed
   */
  delete(key) {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all entries
   */
  clear() {
    this.cache.clear();
  }
  
  /**
   * Get cache size
   * @returns {number}
   */
  get size() {
    return this.cache.size;
  }
  
  /**
   * Get all keys
   * @returns {string[]}
   */
  keys() {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Get all values
   * @returns {*[]}
   */
  values() {
    return Array.from(this.cache.values());
  }
  
  /**
   * Get all entries
   * @returns {[string, *][]}
   */
  entries() {
    return Array.from(this.cache.entries());
  }
  
  /**
   * Iterate over cache
   * @param {Function} callback - Callback function
   */
  forEach(callback) {
    this.cache.forEach((value, key) => {
      callback(value, key, this);
    });
  }
  
  /**
   * Cleanup expired entries (purge stale)
   * @returns {number} Number of entries removed
   */
  cleanup() {
    const sizeBefore = this.cache.size;
    this.cache.purgeStale();
    return sizeBefore - this.cache.size;
  }
  
  /**
   * Get cache statistics
   * @returns {Object}
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this._maxSize,
      maxAge: this._maxAge,
      utilization: (this.cache.size / this._maxSize * 100).toFixed(2) + '%',
      // Additional stats from lru-cache
      calculatedSize: this.cache.calculatedSize,
      maxEntrySize: this.cache.maxEntrySize,
    };
  }
  
  /**
   * Peek at value without updating LRU order
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  peek(key) {
    return this.cache.peek(key);
  }
  
  /**
   * Get remaining TTL for a key
   * @param {string} key - Cache key
   * @returns {number} Remaining TTL in ms, or 0 if expired/not found
   */
  getRemainingTTL(key) {
    return this.cache.getRemainingTTL(key);
  }
  
  /**
   * Fetch with automatic loading (async)
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Async function to fetch value if not cached
   * @param {Object} options - Fetch options
   * @returns {Promise<*>} Cached or fetched value
   */
  async fetch(key, fetchFn, options = {}) {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    
    // Fetch and cache
    const value = await fetchFn();
    this.cache.set(key, value, options);
    return value;
  }
  
  /**
   * Get or set with synchronous loader
   * @param {string} key - Cache key
   * @param {Function} loaderFn - Sync function to load value if not cached
   * @param {Object} options - Set options
   * @returns {*} Cached or loaded value
   */
  getOrSet(key, loaderFn, options = {}) {
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    
    const value = loaderFn();
    this.cache.set(key, value, options);
    return value;
  }
  
  /**
   * Update value if exists
   * @param {string} key - Cache key
   * @param {Function} updateFn - Function to update value
   * @returns {boolean} True if updated
   */
  update(key, updateFn) {
    const current = this.cache.get(key);
    if (current === undefined) {
      return false;
    }
    
    const updated = updateFn(current);
    this.cache.set(key, updated);
    return true;
  }
  
  /**
   * Get native lru-cache instance for advanced operations
   * @returns {LRUCacheLib}
   */
  getNativeCache() {
    return this.cache;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new LRU cache
 * @param {Object} options - Cache options
 * @returns {LRUCache}
 */
function createLRUCache(options = {}) {
  return new LRUCache(options);
}

/**
 * Create a cache with automatic cleanup interval
 * @param {Object} options - Cache options
 * @param {number} cleanupInterval - Cleanup interval in ms (default: 60000)
 * @returns {LRUCache}
 */
function createAutoCleanupCache(options = {}, cleanupInterval = 60000) {
  const cache = new LRUCache(options);
  
  const interval = setInterval(() => {
    cache.cleanup();
  }, cleanupInterval);
  
  // Prevent interval from keeping process alive
  if (interval.unref) {
    interval.unref();
  }
  
  // Store interval reference for cleanup
  cache._cleanupInterval = interval;
  
  // Override clear to also clear interval
  const originalClear = cache.clear.bind(cache);
  cache.clear = () => {
    clearInterval(cache._cleanupInterval);
    originalClear();
  };
  
  // Add stop method
  cache.stopCleanup = () => {
    clearInterval(cache._cleanupInterval);
  };
  
  return cache;
}

/**
 * Create a memory-bounded cache
 * @param {Object} options - Cache options
 * @param {number} maxMemoryMB - Maximum memory in MB
 * @returns {LRUCache}
 */
function createMemoryBoundedCache(options = {}, maxMemoryMB = 50) {
  return new LRUCache({
    ...options,
    maxSize: maxMemoryMB * 1024 * 1024, // Convert to bytes
    sizeCalculation: (value) => {
      // Estimate size of value
      if (typeof value === 'string') {
        return value.length * 2; // UTF-16
      }
      if (Buffer.isBuffer(value)) {
        return value.length;
      }
      // Rough estimate for objects
      return JSON.stringify(value).length * 2;
    }
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  LRUCache,
  createLRUCache,
  createAutoCleanupCache,
  createMemoryBoundedCache
};
