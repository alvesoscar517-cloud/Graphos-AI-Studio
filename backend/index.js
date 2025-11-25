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
const routes = require('./src/routes');
const logger = require('./src/utils/logger');

// ============================================================================
// INITIALIZE APP
// ============================================================================

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

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

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   AI Content Authenticator - Backend Server               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${config.NODE_ENV}`);
  console.log(`🔧 Project ID: ${config.PROJECT_ID}`);
  console.log(`📍 Location: ${config.LOCATION}`);
  console.log(`🤖 Gemini Model: ${config.GEMINI_MODEL}`);
  console.log('');
  console.log('✅ Features:');
  console.log(`   - Caching: ${config.FEATURES.ENABLE_CACHING ? '✓' : '✗'}`);
  console.log(`   - Rate Limiting: ${config.FEATURES.ENABLE_RATE_LIMITING ? '✓' : '✗'}`);
  console.log(`   - Analytics: ${config.FEATURES.ENABLE_ANALYTICS ? '✓' : '✗'}`);
  console.log('');
  console.log(`🌐 Server ready at http://localhost:${PORT}`);
  console.log('');
  
  logger.info('Server started successfully', { port: PORT, env: config.NODE_ENV });
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
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
