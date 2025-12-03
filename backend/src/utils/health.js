/**
 * Health Check Module - Powered by @godaddy/terminus
 * Standardized health endpoints and graceful shutdown
 * 
 * @module utils/health
 */

const { createTerminus } = require('@godaddy/terminus');
const logger = require('./logger');
const { getHealthStatus: getCircuitBreakerHealth } = require('./circuitBreaker');

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

/**
 * Check Redis connectivity
 * @param {Object} redisClient - Redis client instance
 * @returns {Promise<{status: string, latency?: number}>}
 */
async function checkRedis(redisClient) {
  if (!redisClient) {
    return { status: 'not_configured' };
  }
  
  try {
    const start = Date.now();
    await redisClient.ping();
    const latency = Date.now() - start;
    
    return { status: 'healthy', latency };
  } catch (error) {
    logger.error('Redis health check failed', { error: error.message });
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Check Firestore connectivity
 * @param {Object} db - Firestore database instance
 * @returns {Promise<{status: string, latency?: number}>}
 */
async function checkFirestore(db) {
  if (!db) {
    return { status: 'not_configured' };
  }
  
  try {
    const start = Date.now();
    // Simple read operation to check connectivity
    await db.collection('_health').limit(1).get();
    const latency = Date.now() - start;
    
    return { status: 'healthy', latency };
  } catch (error) {
    logger.error('Firestore health check failed', { error: error.message });
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Check memory usage
 * @returns {{status: string, usage: Object}}
 */
function checkMemory() {
  const usage = process.memoryUsage();
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const rssMB = Math.round(usage.rss / 1024 / 1024);
  
  // Consider unhealthy if heap usage > 90%
  const heapPercent = (usage.heapUsed / usage.heapTotal) * 100;
  const status = heapPercent > 90 ? 'degraded' : 'healthy';
  
  return {
    status,
    usage: {
      heapUsedMB,
      heapTotalMB,
      heapPercent: Math.round(heapPercent),
      rssMB
    }
  };
}

// ============================================================================
// TERMINUS SETUP
// ============================================================================

/**
 * Setup health checks with terminus
 * @param {Object} server - HTTP server instance
 * @param {Object} options - Configuration options
 * @param {Object} options.redisClient - Redis client for health checks
 * @param {Object} options.db - Firestore database for health checks
 * @param {Function} options.onShutdown - Custom shutdown handler
 */
function setupHealthCheck(server, options = {}) {
  const { redisClient, db, onShutdown } = options;
  
  createTerminus(server, {
    // Health check endpoints
    healthChecks: {
      // Full health check
      '/health': async () => {
        const checks = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: Math.round(process.uptime()),
          memory: checkMemory()
        };
        
        // Check Redis if configured
        if (redisClient) {
          checks.redis = await checkRedis(redisClient);
        }
        
        // Check Firestore if configured
        if (db) {
          checks.firestore = await checkFirestore(db);
        }
        
        // Check circuit breakers
        try {
          checks.circuitBreakers = getCircuitBreakerHealth();
        } catch (e) {
          checks.circuitBreakers = { status: 'unknown' };
        }
        
        // Determine overall status
        const allHealthy = Object.values(checks)
          .filter(v => typeof v === 'object' && v.status)
          .every(v => v.status === 'healthy' || v.status === 'not_configured' || v.status === 'unknown');
        
        // Also check circuit breakers
        if (checks.circuitBreakers?.healthy === false) {
          checks.status = 'degraded';
        } else if (!allHealthy) {
          checks.status = 'degraded';
        }
        
        return checks;
      },
      
      // Liveness probe (simple check)
      '/health/live': () => Promise.resolve({ status: 'ok' }),
      
      // Readiness probe
      '/health/ready': async () => {
        const checks = {};
        
        if (redisClient) {
          checks.redis = await checkRedis(redisClient);
        }
        
        if (db) {
          checks.firestore = await checkFirestore(db);
        }
        
        const allReady = Object.values(checks)
          .every(v => v.status === 'healthy' || v.status === 'not_configured');
        
        if (!allReady) {
          throw new Error('Service not ready');
        }
        
        return { status: 'ready', checks };
      }
    },
    
    // Graceful shutdown configuration
    timeout: 30000, // 30 seconds
    
    // Signal handlers
    signals: ['SIGTERM', 'SIGINT'],
    
    // Before shutdown - stop accepting new connections
    beforeShutdown: async () => {
      logger.info('Received shutdown signal, starting graceful shutdown...');
      // Wait a bit for load balancer to stop sending traffic
      await new Promise(resolve => setTimeout(resolve, 5000));
    },
    
    // On signal - cleanup resources
    onSignal: async () => {
      logger.info('Cleaning up resources...');
      
      try {
        // Close Redis connection
        if (redisClient) {
          await redisClient.quit();
          logger.info('Redis connection closed');
        }
        
        // Custom shutdown handler
        if (onShutdown) {
          await onShutdown();
        }
      } catch (error) {
        logger.error('Error during cleanup', { error: error.message });
      }
    },
    
    // On shutdown complete
    onShutdown: async () => {
      logger.info('Cleanup finished, server is shutting down');
    },
    
    // Log terminus events
    logger: (msg, err) => {
      if (err) {
        logger.error(msg, { error: err.message });
      } else {
        logger.info(msg);
      }
    }
  });
  
  logger.info('Health check endpoints configured', {
    endpoints: ['/health', '/health/live', '/health/ready']
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  setupHealthCheck,
  checkRedis,
  checkFirestore,
  checkMemory
};
