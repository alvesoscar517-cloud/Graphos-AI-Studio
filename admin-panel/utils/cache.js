/**
 * Simple in-memory cache with TTL
 */

class Cache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttl = 5 * 60 * 1000) { // Default 5 minutes
    const expiry = Date.now() + ttl;
    this.store.set(key, { value, expiry });
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

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  // Get or fetch pattern
  async getOrFetch(key, fetchFn, ttl) {
    const cached = this.get(key);
    if (cached) return cached;
    
    const value = await fetchFn();
    this.set(key, value, ttl);
    return value;
  }
}

export const cache = new Cache();
