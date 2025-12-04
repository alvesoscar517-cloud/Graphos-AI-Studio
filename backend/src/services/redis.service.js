/**
 * Redis Service - DEPRECATED
 * 
 * This file is kept for backward compatibility.
 * All functionality has been merged into cache.service.js
 * 
 * New code should import from cache.service.js directly:
 * const cache = require('./cache.service');
 * 
 * @deprecated Use cache.service.js instead
 * @module services/redis
 */

// Re-export everything from unified cache service
module.exports = require('./cache.service');
