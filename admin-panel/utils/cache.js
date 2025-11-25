/**
 * Enhanced in-memory cache with TTL and stale-while-revalidate support
 */

class Cache {
  constructor() {
    this.store = new Map();
    this.fetchPromises = new Map(); // Prevent duplicate fetches
  }

  set(key, value, ttl = 5 * 60 * 1000) { // Default 5 minutes
    const expiry = Date.now() + ttl;
    const staleTime = Date.now() + (ttl * 0.8); // Mark as stale at 80% of TTL
    this.store.set(key, { value, expiry, staleTime, createdAt: Date.now() });
  }

  get(key) {
    const item = this.store.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Check if cached data is stale (should be revalidated in background)
   */
  isStale(key) {
    const item = this.store.get(key);
    if (!item) return true;
    return Date.now() > item.staleTime;
  }

  /**
   * Get cache metadata
   */
  getMeta(key) {
    const item = this.store.get(key);
    if (!item) return null;
    return {
      createdAt: item.createdAt,
      expiry: item.expiry,
      staleTime: item.staleTime,
      isStale: Date.now() > item.staleTime,
      isExpired: Date.now() > item.expiry,
      age: Date.now() - item.createdAt
    };
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.store.delete(key);
    this.fetchPromises.delete(key);
  }

  /**
   * Clear cache entries matching a pattern
   */
  clearPattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        this.fetchPromises.delete(key);
      }
    }
  }

  clear() {
    this.store.clear();
    this.fetchPromises.clear();
  }

  /**
   * Get or fetch pattern with deduplication
   * Prevents multiple simultaneous fetches for the same key
   */
  async getOrFetch(key, fetchFn, ttl) {
    const cached = this.get(key);
    if (cached) return cached;
    
    // Check if there's already a fetch in progress
    if (this.fetchPromises.has(key)) {
      return this.fetchPromises.get(key);
    }
    
    // Start new fetch
    const fetchPromise = fetchFn().then(value => {
      this.set(key, value, ttl);
      this.fetchPromises.delete(key);
      return value;
    }).catch(err => {
      this.fetchPromises.delete(key);
      throw err;
    });
    
    this.fetchPromises.set(key, fetchPromise);
    return fetchPromise;
  }

  /**
   * Stale-while-revalidate pattern
   * Returns cached data immediately and revalidates in background
   */
  async getStaleWhileRevalidate(key, fetchFn, ttl) {
    const cached = this.get(key);
    
    if (cached) {
      // If stale, revalidate in background
      if (this.isStale(key) && !this.fetchPromises.has(key)) {
        const revalidatePromise = fetchFn().then(value => {
          this.set(key, value, ttl);
          this.fetchPromises.delete(key);
        }).catch(() => {
          this.fetchPromises.delete(key);
        });
        this.fetchPromises.set(key, revalidatePromise);
      }
      return cached;
    }
    
    // No cache, fetch fresh
    return this.getOrFetch(key, fetchFn, ttl);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let total = 0;
    let stale = 0;
    let expired = 0;
    
    for (const [key, item] of this.store.entries()) {
      total++;
      if (Date.now() > item.expiry) expired++;
      else if (Date.now() > item.staleTime) stale++;
    }
    
    return { total, stale, expired, active: total - expired };
  }
}

export const cache = new Cache();
