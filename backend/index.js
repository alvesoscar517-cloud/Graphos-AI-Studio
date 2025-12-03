/**
 * Graphos AI Studio - Main Server Entry Point
 * Modular Architecture with Google Gemini Ecosystem
 * Version: 2.1 - Enhanced Security & Monitoring
 */

const express = require('express');
const config = require('./src/config');
const corsMiddleware = require('./src/middleware/cors');
const { errorHandler, notFoundHandler, requestTimeout } = require('./src/middleware/errorHandler.middleware');
const rateLimitMiddleware = require('./src/middleware/rateLimit');
const { activityLoggerMiddleware } = require('./src/middleware/activityLogger.middleware');
const { languageMiddleware } = require('./src/middleware/language.middleware');
const { responseLocalizationMiddleware } = require('./src/utils/response.util');
const { correlationMiddleware, requestLogger } = require('./src/utils/logger');
const compressionMiddleware = require('./src/middleware/compression');
const routes = require('./src/routes');
const logger = require('./src/utils/logger');
const redisService = require('./src/services/redis.service');
const activityLogService = require('./src/services/activityLog.service');
const { setupHealthCheck } = require('./src/utils/health');
const queueService = require('./src/services/queue.service');
const { startEmailWorker, stopEmailWorker } = require('./src/workers/email.worker');
const { startAnalysisWorker, stopAnalysisWorker } = require('./src/workers/analysis.worker');
const { getAllStates: getCircuitBreakerStates } = require('./src/utils/circuitBreaker');

// ============================================================================
// INITIALIZE APP
// ============================================================================

const app = express();

// Trust proxy for correct IP detection behind load balancers
app.set('trust proxy', 1);

// ============================================================================
// SECURITY HEADERS
// ============================================================================

app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove server identification
  res.removeHeader('X-Powered-By');
  
  // Cache headers for GET requests
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
  
  next();
});

// ============================================================================
// MIDDLEWARE STACK
// ============================================================================

// 1. Response compression (early in middleware chain)
app.use(compressionMiddleware);

// 2. Correlation ID for request tracing
app.use(correlationMiddleware);

// 3. Request timeout (30 seconds default)
app.use(requestTimeout(30000));

// 4. CORS
app.use(corsMiddleware);

// 5. Capture raw body for webhook signature verification (MUST be before express.json)
app.use('/webhooks/lemonsqueezy', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body.toString();
  try {
    req.body = JSON.parse(req.rawBody);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});

// 6. Body parser for all other routes
app.use(express.json({ 
  limit: config.MAX_REQUEST_SIZE,
  verify: (req, res, buf) => {
    // Store raw body for signature verification if needed
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: config.MAX_REQUEST_SIZE }));

// 7. Rate limiting
if (config.FEATURES.ENABLE_RATE_LIMITING) {
  app.use(rateLimitMiddleware);
}

// 8. Request logging
app.use(requestLogger);

// 9. Activity logging middleware
app.use(activityLoggerMiddleware);

// 10. Language detection middleware
app.use(languageMiddleware);

// 11. Response localization helpers
app.use(responseLocalizationMiddleware);

// 12. Input sanitization middleware (if enabled)
if (config.SECURITY.SANITIZE_INPUT) {
  const { sanitizeMiddleware } = require('./src/utils/sanitize');
  app.use(sanitizeMiddleware({
    sanitizeBody: true,
    sanitizeQuery: true,
    sanitizeParams: true,
    textFields: ['text', 'content', 'message', 'sentence'],
    maxTextLength: config.MAX_TEXT_LENGTH,
  }));
}

// ============================================================================
// HEALTH CHECK (before auth)
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-content-authenticator',
    version: '2.1',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    }
  });
});

// Readiness check for Kubernetes/Cloud Run
app.get('/ready', async (req, res) => {
  const checks = {
    redis: redisService.isAvailable(),
    memory: process.memoryUsage().heapUsed < 500 * 1024 * 1024 // < 500MB
  };
  
  const allHealthy = Object.values(checks).every(v => v);
  
  res.status(allHealthy ? 200 : 503).json({
    ready: allHealthy,
    checks
  });
});

// Debug endpoints - ONLY enabled when ENABLE_DEBUG_ENDPOINTS is true (disabled in production by default)
if (config.FEATURES.ENABLE_DEBUG_ENDPOINTS) {
  app.get('/debug/firebase-admin', async (req, res) => {
    try {
      const admin = require('firebase-admin');
      const app = admin.apps.length ? admin.app() : null;
      
      res.json({
        initialized: !!app,
        projectId: app?.options?.projectId || 'not set',
        appsCount: admin.apps.length
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        stack: error.stack
      });
    }
  });
  
  // Cache statistics endpoint
  app.get('/debug/cache-stats', async (req, res) => {
    try {
      const geminiService = require('./src/services/gemini.service');
      const cacheStats = geminiService.getCacheStats();
      
      res.json({
        embedding_cache: cacheStats,
        redis: redisService.getStats(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Queue statistics endpoint
  app.get('/debug/queue-stats', async (req, res) => {
    try {
      const { QUEUE_NAMES, getQueueStats } = require('./src/services/queue.service');
      const stats = {};
      
      for (const name of Object.values(QUEUE_NAMES)) {
        try {
          stats[name] = await getQueueStats(name);
        } catch (e) {
          stats[name] = { error: e.message };
        }
      }
      
      res.json({ queues: stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Circuit breaker status endpoint
  app.get('/debug/circuit-breakers', (req, res) => {
    res.json({ circuitBreakers: getCircuitBreakerStates() });
  });
  
  console.log('[WARNING] Debug endpoints are ENABLED - disable in production!');
}

// ============================================================================
// ROUTES
// ============================================================================

app.use('/', routes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================

const PORT = config.PORT;

async function startServer() {
  try {
    // Start server FIRST to respond to health checks immediately
    const server = app.listen(PORT, async () => {
      // Setup terminus health checks with graceful shutdown
      setupHealthCheck(server, {
        redisClient: redisService.getClient?.(),
        onShutdown: async () => {
          // Stop workers first
          await stopEmailWorker();
          await stopAnalysisWorker();
          // Close queue service
          await queueService.closeAll();
          // Flush activity logs
          await activityLogService.flushBuffer();
          // Close Redis
          await redisService.close();
        }
      });
      console.log(`[START] Server listening on port ${PORT}`);
      
      // Initialize Redis AFTER server is listening (optional, will fallback to memory cache)
      const redisConnected = await redisService.initRedis().catch(() => false);
      
      // Start background workers if Redis is connected
      let workersStarted = false;
      if (redisConnected) {
        try {
          startEmailWorker();
          startAnalysisWorker();
          workersStarted = true;
        } catch (workerError) {
          console.warn('[WORKERS] Failed to start workers:', workerError.message);
        }
      }
      console.log('');
      console.log('========================================================');
      console.log('   Graphos AI Studio - Backend Server v2.1');
      console.log('========================================================');
      console.log('');
      console.log(`[START] Server running on port ${PORT}`);
      console.log(`[ENV] Environment: ${config.NODE_ENV}`);
      console.log(`[CONFIG] Project ID: ${config.PROJECT_ID}`);
      console.log(`[CONFIG] Location: ${config.LOCATION}`);
      console.log(`[MODEL] Gemini Model: ${config.GEMINI_MODEL}`);
      console.log('');
      console.log('[FEATURES]');
      console.log(`   - Caching: ${config.FEATURES.ENABLE_CACHING ? 'ENABLED' : 'DISABLED'}`);
      console.log(`   - Rate Limiting: ${config.FEATURES.ENABLE_RATE_LIMITING ? 'ENABLED' : 'DISABLED'}`);
      console.log(`   - Analytics: ${config.FEATURES.ENABLE_ANALYTICS ? 'ENABLED' : 'DISABLED'}`);
      console.log(`   - Redis Cache: ${redisConnected ? 'ENABLED (distributed)' : 'DISABLED (memory fallback)'}`);
      console.log(`   - Background Workers: ${workersStarted ? 'ENABLED' : 'DISABLED (no Redis)'}`);
      console.log('');
      console.log('[SECURITY]');
      console.log(`   - CORS: Configured`);
      console.log(`   - Rate Limiting: ${config.FEATURES.ENABLE_RATE_LIMITING ? 'Active' : 'Disabled'}`);
      console.log(`   - Request Timeout: 30s`);
      console.log(`   - Correlation IDs: Enabled`);
      console.log('');
      
      // Log config warnings if any
      if (config.CONFIG_WARNINGS && config.CONFIG_WARNINGS.length > 0) {
        console.log('[WARNINGS]');
        config.CONFIG_WARNINGS.forEach(w => console.log(`   ⚠️  ${w}`));
        console.log('');
      }
      
      console.log(`[READY] Server ready at http://localhost:${PORT}`);
      console.log('');
      
      logger.info('Server started successfully', { 
        port: PORT, 
        env: config.NODE_ENV,
        redisConnected 
      });
    });
    
    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error', { error: error.message });
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const shutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  
  try {
    // Stop cache cleanup interval
    try {
      const geminiService = require('./src/services/gemini.service');
      geminiService.stopCacheCleanup();
    } catch (e) {
      // Ignore if service not loaded
    }
    
    // Flush pending activity logs
    await activityLogService.flushBuffer();
    
    // Close Redis connection
    await redisService.close();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ============================================================================
// UNHANDLED ERRORS
// ============================================================================

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { 
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { 
    error: error.message, 
    stack: error.stack 
  });
  // Give time for logs to flush
  setTimeout(() => process.exit(1), 1000);
});
