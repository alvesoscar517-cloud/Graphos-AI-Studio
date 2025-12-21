/**
 * Graphos AI Studio - Main Server Entry Point
 * Modular Architecture with Google Gemini Ecosystem
 * Version: 2.1 - Enhanced Security & Monitoring
 */

// Early error catching for debugging startup issues
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught Exception during startup:', error.message);
  console.error(error.stack);
  // Don't exit immediately - let logs flush
  setTimeout(() => process.exit(1), 3000);
});

console.log('[STARTUP] ====================================');
console.log('[STARTUP] Starting Graphos AI Studio Backend');
console.log('[STARTUP] ====================================');
console.log('[STARTUP] Node version:', process.version);
console.log('[STARTUP] NODE_ENV:', process.env.NODE_ENV);
console.log('[STARTUP] PORT:', process.env.PORT);
console.log('[STARTUP] GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT);
console.log('[STARTUP] ====================================');

// Track startup errors but don't exit immediately
const startupErrors = [];

let express, config, corsMiddleware, errorHandler, notFoundHandler, requestTimeout;
let rateLimitMiddleware, activityLoggerMiddleware, languageMiddleware;
let responseLocalizationMiddleware, correlationMiddleware, requestLogger;
let compressionMiddleware, routes, logger, redisService, activityLogService;
let setupHealthCheck, queueService, startEmailWorker, stopEmailWorker;
let startAnalysisWorker, stopAnalysisWorker, getCircuitBreakerStates;
let realtimeEventsService, realtimeController;

// Helper to load module with error tracking
function loadModule(name, loader) {
  try {
    const result = loader();
    console.log(`[STARTUP] [OK] ${name}`);
    return result;
  } catch (e) {
    console.error(`[STARTUP] [FAIL] ${name}:`, e.message);
    console.error(`[STARTUP] [FAIL] ${name} stack:`, e.stack);
    startupErrors.push({ module: name, error: e.message });
    return null;
  }
}

// Load critical modules first
express = loadModule('express', () => require('express'));
if (!express) {
  console.error('[FATAL] Cannot start without express');
  setTimeout(() => process.exit(1), 3000);
}

config = loadModule('config', () => require('./src/config'));
if (!config) {
  // Use defaults if config fails
  config = { 
    MAX_REQUEST_SIZE: '10mb', 
    FEATURES: { ENABLE_RATE_LIMITING: false, ENABLE_CACHING: true, ENABLE_ANALYTICS: false, ENABLE_DEBUG_ENDPOINTS: true },
    SECURITY: { SANITIZE_INPUT: false },
    MAX_TEXT_LENGTH: 20000,
    NODE_ENV: process.env.NODE_ENV || 'production',
    PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT,
    LOCATION: 'us-central1',
    GEMINI_MODEL: 'gemini-2.5-flash',
    PORT: 8080
  };
  console.log('[STARTUP] Using fallback config');
}

// Load other modules - continue even if some fail
const errorHandlerModule = loadModule('errorHandler', () => require('./src/middleware/errorHandler.middleware'));
if (errorHandlerModule) {
  errorHandler = errorHandlerModule.errorHandler;
  notFoundHandler = errorHandlerModule.notFoundHandler;
  requestTimeout = errorHandlerModule.requestTimeout;
} else {
  // Fallback error handlers
  errorHandler = (err, req, res, next) => res.status(500).json({ error: err.message });
  notFoundHandler = (req, res) => res.status(404).json({ error: 'Not found' });
  requestTimeout = () => (req, res, next) => next();
}

corsMiddleware = loadModule('cors', () => require('./src/middleware/cors')) || ((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

rateLimitMiddleware = loadModule('rateLimit', () => require('./src/middleware/rateLimit')) || ((req, res, next) => next());
activityLoggerMiddleware = loadModule('activityLogger', () => require('./src/middleware/activityLogger.middleware').activityLoggerMiddleware) || ((req, res, next) => next());
languageMiddleware = loadModule('language', () => require('./src/middleware/language.middleware').languageMiddleware) || ((req, res, next) => next());
responseLocalizationMiddleware = loadModule('response.util', () => require('./src/utils/response.util').responseLocalizationMiddleware) || ((req, res, next) => next());

const loggerModule = loadModule('logger', () => require('./src/utils/logger'));
if (loggerModule) {
  correlationMiddleware = loggerModule.correlationMiddleware;
  requestLogger = loggerModule.requestLogger;
  logger = loggerModule;
} else {
  correlationMiddleware = (req, res, next) => next();
  requestLogger = (req, res, next) => next();
  logger = { info: console.log, error: console.error, warn: console.warn };
}

compressionMiddleware = loadModule('compression', () => require('./src/middleware/compression')) || ((req, res, next) => next());
routes = loadModule('routes', () => require('./src/routes'));
redisService = loadModule('redis.service', () => require('./src/services/redis.service')) || { 
  isAvailable: () => false, 
  initRedis: async () => false, 
  close: async () => {}, 
  getClient: () => null 
};
activityLogService = loadModule('activityLog.service', () => require('./src/services/activityLog.service')) || { flushBuffer: async () => {} };
setupHealthCheck = loadModule('health', () => require('./src/utils/health').setupHealthCheck) || (() => {});
queueService = loadModule('queue.service', () => require('./src/services/queue.service')) || { closeAll: async () => {} };

const emailWorker = loadModule('email.worker', () => require('./src/workers/email.worker'));
startEmailWorker = emailWorker?.startEmailWorker || (() => {});
stopEmailWorker = emailWorker?.stopEmailWorker || (async () => {});

const analysisWorker = loadModule('analysis.worker', () => require('./src/workers/analysis.worker'));
startAnalysisWorker = analysisWorker?.startAnalysisWorker || (() => {});
stopAnalysisWorker = analysisWorker?.stopAnalysisWorker || (async () => {});

getCircuitBreakerStates = loadModule('circuitBreaker', () => require('./src/utils/circuitBreaker').getAllStates) || (() => ({}));
realtimeEventsService = loadModule('realtimeEvents.service', () => require('./src/services/realtimeEvents.service')) || { initialize: () => {}, shutdown: () => {} };
realtimeController = loadModule('realtime.controller', () => require('./src/controllers/realtime.controller'));
loadModule('envConfig.service', () => require('./src/services/envConfig.service'));

// Report startup status
if (startupErrors.length > 0) {
  console.error('[STARTUP] ====================================');
  console.error(`[STARTUP] WARNING: ${startupErrors.length} modules failed to load:`);
  startupErrors.forEach(e => console.error(`[STARTUP]   - ${e.module}: ${e.error}`));
  console.error('[STARTUP] ====================================');
} else {
  console.log('[STARTUP] All dependencies loaded successfully!');
}

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
    // Debug: log raw body for auth routes
    if (req.url.includes('/auth/')) {
      console.log('[BODY-PARSER] Auth route raw body:', buf ? buf.toString().substring(0, 200) : 'empty');
    }
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

if (routes) {
  app.use('/', routes);
} else {
  // Fallback route if routes failed to load
  app.use('/', (req, res) => {
    res.status(503).json({ 
      error: 'Service starting up',
      startupErrors: startupErrors.map(e => e.module)
    });
  });
}

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

const PORT = process.env.PORT || config.PORT || 8080;

async function startServer() {
  try {
    console.log(`[STARTUP] Attempting to start server on port ${PORT}...`);
    console.log(`[STARTUP] Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    
    // Start server FIRST to respond to health checks immediately
    // Use synchronous callback to ensure port is bound ASAP
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[START] Server listening on port ${PORT} - READY FOR HEALTH CHECKS`);
    });
    
    // Wait a tick to ensure server is bound
    await new Promise(resolve => setImmediate(resolve));
    
    // Setup terminus health checks with graceful shutdown (sync, fast)
    setupHealthCheck(server, {
      redisClient: redisService.getClient?.(),
      onShutdown: async () => {
        await stopEmailWorker();
        await stopAnalysisWorker();
        await queueService.closeAll();
        await activityLogService.flushBuffer();
        await redisService.close();
      }
    });
    
    console.log(`[START] Health check endpoints ready`);
    
    // Now do async initialization in background (non-blocking)
    setImmediate(async () => {
      try {
        // Initialize Redis (optional, will fallback to memory cache)
        const redisConnected = await redisService.initRedis().catch((err) => {
          console.warn('[REDIS] Connection failed, using memory fallback:', err.message);
          return false;
        });
        
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
        
        // Initialize realtime events listener (Firestore -> SSE bridge)
        try {
          realtimeEventsService.initialize(realtimeController);
          console.log('[STARTUP] [SUCCESS] Realtime events listener initialized');
        } catch (realtimeError) {
          console.warn('[STARTUP] [WARNING] Realtime events listener failed:', realtimeError.message);
        }
        
        // Initialize environment config from Firestore (async, non-blocking)
        try {
          const envConfigHelper = require('./src/config/envConfigHelper');
          await envConfigHelper.loadFromFirestore();
          console.log('[STARTUP] [SUCCESS] Environment config loaded from Firestore');
        } catch (envError) {
          console.warn('[STARTUP] [WARNING] Environment config from Firestore failed:', envError.message);
        }
        
        // Check and deploy Firestore indexes (one-time, non-blocking)
        try {
          const { initializeIndexes } = require('./src/utils/firestoreIndexes');
          initializeIndexes().catch(err => {
            console.warn('[STARTUP] [WARNING] Index check failed:', err.message);
          });
          
          // Also try to deploy any missing indexes via API
          const { deployIndexes } = require('./scripts/deploy-indexes');
          deployIndexes().catch(err => {
            console.warn('[STARTUP] [WARNING] Index deployment check failed:', err.message);
          });
        } catch (indexError) {
          console.log('[STARTUP] [INFO] Skipping index deployment check');
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
        console.log(`[READY] Server fully initialized at http://localhost:${PORT}`);
        console.log('');
        
        logger.info('Server started successfully', { 
          port: PORT, 
          env: config.NODE_ENV,
          redisConnected 
        });
      } catch (initError) {
        console.error('[STARTUP] Background initialization error:', initError.message);
        // Don't crash - server is already running and can handle requests
      }
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
    // Stop realtime events listener
    try {
      realtimeEventsService.shutdown();
    } catch (e) {
      // Ignore if service not loaded
    }
    
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
