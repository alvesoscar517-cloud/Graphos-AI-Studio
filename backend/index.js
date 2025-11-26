/**
 * AI Content Authenticator - Main Server Entry Point
 * Modular Architecture with Google Gemini Ecosystem
 * Version: 2.0
 */

const express = require('express');
const config = require('./src/config');
const corsMiddleware = require('./src/middleware/cors');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const rateLimitMiddleware = require('./src/middleware/rateLimit');
const { activityLoggerMiddleware } = require('./src/middleware/activityLogger.middleware');
const routes = require('./src/routes');
const logger = require('./src/utils/logger');
const redisService = require('./src/services/redis.service');
const activityLogService = require('./src/services/activityLog.service');

// ============================================================================
// INITIALIZE APP
// ============================================================================

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Response compression (manual implementation without external dependency)
app.use((req, res, next) => {
  // Set cache headers for static responses
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes for GET requests
  }
  next();
});

// CORS
app.use(corsMiddleware);

// Capture raw body for webhook signature verification (MUST be before express.json)
app.use('/webhooks/lemonsqueezy', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Store raw body for signature verification
  req.rawBody = req.body.toString();
  // Parse JSON for handler
  try {
    req.body = JSON.parse(req.rawBody);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});

// Body parser for all other routes
app.use(express.json({ limit: config.MAX_REQUEST_SIZE }));
app.use(express.urlencoded({ extended: true, limit: config.MAX_REQUEST_SIZE }));

// Rate limiting (optional)
if (config.FEATURES.ENABLE_RATE_LIMITING) {
  app.use(rateLimitMiddleware);
}

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Activity logging middleware (logs user activities automatically)
app.use(activityLoggerMiddleware);

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

// Initialize services and start server
async function startServer() {
  // Initialize Redis (optional, will fallback to memory cache)
  const redisConnected = await redisService.initRedis();
  
  app.listen(PORT, () => {
    console.log('');
    console.log('========================================================');
    console.log('   AI Content Authenticator - Backend Server');
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
    console.log('');
    console.log(`[READY] Server ready at http://localhost:${PORT}`);
    console.log('');
    
    logger.info('Server started successfully', { 
      port: PORT, 
      env: config.NODE_ENV,
      redisConnected 
    });
  });
}

startServer();

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await activityLogService.flushBuffer(); // Flush pending activity logs
  await redisService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await activityLogService.flushBuffer(); // Flush pending activity logs
  await redisService.close();
  process.exit(0);
});

// ============================================================================
// UNHANDLED ERRORS
// ============================================================================

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});
