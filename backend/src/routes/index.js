/**
 * Main Routes Index
 * Aggregates all route modules with enhanced security
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const emailAuthRoutes = require('./emailAuth.routes');
const profileRoutes = require('./profile.routes');
const analysisRoutes = require('./analysis.routes');
const chatRoutes = require('./chat.routes');
const notificationRoutes = require('./notification.routes');

const creditRoutes = require('./credit.routes');
const paymentRoutes = require('./payment.routes');
const realtimeRoutes = require('./realtime.routes');
const paymentController = require('../controllers/payment.controller');

// Middleware
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { checkLocked } = require('../middleware/checkLocked.middleware');
const { validators } = require('../middleware/validation.middleware');
const creditMiddleware = require('../middleware/credit.middleware');
const { asyncHandler } = require('../middleware/errorHandler.middleware');
const { activityLoggerMiddleware } = require('../middleware/activityLogger.middleware');

// Controllers
const profileController = require('../controllers/profile.controller');
const analysisController = require('../controllers/analysis.controller');

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES (No Auth Required)
// ============================================================================

// Public Firebase config for frontend Firestore Realtime
router.get('/api/config/firebase', async (_req, res) => {
  try {
    const envConfigService = require('../services/envConfig.service');
    const sharedConfig = await envConfigService.getEnvConfig('shared');
    
    // Only return Firebase-related config (non-sensitive)
    const firebaseConfig = {
      apiKey: sharedConfig.variables?.FIREBASE_API_KEY || '',
      authDomain: sharedConfig.variables?.FIREBASE_AUTH_DOMAIN || '',
      projectId: sharedConfig.variables?.FIREBASE_PROJECT_ID || '',
      storageBucket: sharedConfig.variables?.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: sharedConfig.variables?.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: sharedConfig.variables?.FIREBASE_APP_ID || '',
    };
    
    // Check if config is valid
    const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;
    
    res.json({
      success: true,
      config: firebaseConfig,
      isConfigured
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load Firebase config',
      config: {},
      isConfigured: false
    });
  }
});

// Home
router.get('/', (_req, res) => {
  res.json({
    service: 'Graphos AI Studio - Backend',
    version: '2.1',
    status: 'running',
    powered_by: 'Google Gemini Ecosystem',
    architecture: 'Modular',
    documentation: '/api/docs',
    endpoints: {
      '/health': 'GET - Health check',
      '/ready': 'GET - Readiness check',
      '/api/docs': 'GET - API documentation (OpenAPI)',
      '/profiles/*': 'Profile management',
      '/analysis/*': 'Text analysis & AI detection',
      '/api/chat': 'Workspace chat',
      '/api/notifications': 'User notifications',
      '/send-feedback': 'Feedback & support'
    }
  });
});

// API Documentation endpoint
router.get('/api/docs', (_req, res) => {
  const fs = require('fs');
  const path = require('path');
  const YAML = require('yaml');
  
  try {
    const openapiPath = path.join(__dirname, '../../docs/openapi.yaml');
    
    if (!fs.existsSync(openapiPath)) {
      return res.status(404).json({
        success: false,
        error: 'API documentation not found'
      });
    }
    
    const openapiContent = fs.readFileSync(openapiPath, 'utf8');
    const openapiJson = YAML.parse(openapiContent);
    
    res.json(openapiJson);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load API documentation',
      details: error.message
    });
  }
});

// Swagger UI redirect
router.get('/api/docs/ui', (_req, res) => {
  const swaggerUrl = `https://petstore.swagger.io/?url=${encodeURIComponent(
    'https://graphosai-472729326429.us-central1.run.app/api/docs'
  )}`;
  res.redirect(swaggerUrl);
});

// Webhook endpoint (NO AUTH - verified by signature)
router.post('/webhooks/lemonsqueezy', paymentController.handleWebhook);

// ============================================================================
// AUTH ROUTES
// ============================================================================

router.use('/', authRoutes);

// Email authentication routes
router.use('/auth/email', emailAuthRoutes);

// ============================================================================
// PROTECTED ROUTES (Auth Required + Locked Check)
// ============================================================================

// Apply checkLocked middleware to all protected routes
// This ensures locked users cannot access any functionality
// Also apply activityLoggerMiddleware to track user activities
const protectedMiddleware = [authenticate, checkLocked, activityLoggerMiddleware];

// Profile routes
router.use('/profiles', protectedMiddleware, profileRoutes);

// Analysis routes
router.use('/analysis', protectedMiddleware, analysisRoutes);

// Chat routes
router.use('/api/chat', protectedMiddleware, chatRoutes);

// Notification routes (allow locked users to see notifications about their lock)
router.use('/api/notifications', authenticate, notificationRoutes);



// Credit routes
router.use('/api/credits', protectedMiddleware, creditRoutes);

// Payment routes (allow locked users to make payments to unlock)
router.use('/api/payment', authenticate, paymentRoutes);

// Realtime routes (SSE)
router.use('/api/realtime', protectedMiddleware, realtimeRoutes);

// Internal API for backend-to-backend communication (broadcast notifications)
const realtimeController = require('../controllers/realtime.controller');
const envConfig = require('../config/envConfigHelper');

const internalApiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validKey = envConfig.get('INTERNAL_API_KEY');
  if (validKey && apiKey === validKey) {
    return next();
  }
  // Also allow authenticated users
  return authenticate(req, res, next);
};
router.post('/api/internal/broadcast-notification', internalApiKeyAuth, realtimeController.broadcastNotificationApi);
router.post('/api/internal/broadcast-credits', internalApiKeyAuth, realtimeController.broadcastCreditsApi);

// Refresh environment config from Firestore
router.post('/api/internal/refresh-env-config', internalApiKeyAuth, async (req, res) => {
  try {
    const envConfigService = require('../services/envConfig.service');
    await envConfigService.refreshCache();
    res.json({ success: true, message: 'Environment config refreshed from Firestore' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// LEGACY ROUTES (Deprecated - will be removed in v3.0)
// Use new routes under /profiles/*, /analysis/* instead
// ============================================================================

const logger = require('../utils/logger');

/**
 * Deprecation warning middleware
 * Logs warning and adds deprecation header
 */
const deprecationWarning = (newPath) => (req, res, next) => {
  logger.warn('Deprecated endpoint accessed', {
    deprecatedPath: req.path,
    newPath,
    userId: req.userId,
    ip: req.ip
  });
  res.set('Deprecation', 'true');
  res.set('Sunset', 'Wed, 01 Jan 2025 00:00:00 GMT');
  res.set('Link', `<${newPath}>; rel="successor-version"`);
  next();
};

// === Profile legacy endpoints ===
router.post('/create_profile', 
  deprecationWarning('/profiles/create'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  asyncHandler(profileController.createProfile)
);

// Rate limiter for profile creation - max 3 requests per 60 seconds per user
const { operationRateLimiter } = require('../middleware/rateLimit');
const profileCreationRateLimiter = operationRateLimiter('profile_creation', {
  points: 3,      // Max 3 profile creations
  duration: 60,   // Per 60 seconds
  blockDuration: 120 // Block for 2 minutes if exceeded
});

// Debug middleware for create_profile_complete
const debugProfileCreate = (req, res, next) => {
  const logger = require('../utils/logger');
  logger.info('create_profile_complete request received', {
    hasBody: !!req.body,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    hasUserId: !!req.body?.user_id,
    hasSamples: !!req.body?.samples,
    samplesCount: req.body?.samples?.length || 0,
    contentType: req.headers['content-type'],
    authHeader: req.headers['authorization'] ? 'present' : 'missing'
  });
  next();
};

router.post('/create_profile_complete', 
  deprecationWarning('/profiles/create'),
  debugProfileCreate, // Add debug logging first
  optionalAuth, checkLocked, activityLoggerMiddleware,
  profileCreationRateLimiter, // Add rate limiting BEFORE credit check
  creditMiddleware.profileComplete, 
  asyncHandler(profileController.createProfileComplete)
);

router.post('/add_sample', 
  deprecationWarning('/profiles/add-sample'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  validators.addSample, creditMiddleware.profileSampleAdd, 
  asyncHandler(profileController.addSample)
);

router.post('/add_samples_batch', 
  deprecationWarning('/profiles/add-samples-batch'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  creditMiddleware.profileSamplesBatch, 
  asyncHandler(profileController.addSamplesBatch)
);

router.post('/finalize_profile', 
  deprecationWarning('/profiles/finalize'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  creditMiddleware.profileFinalize, 
  asyncHandler(profileController.finalizeProfile)
);

router.get('/get_profile', 
  deprecationWarning('/profiles/:id'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  asyncHandler(profileController.getProfile)
);

router.get('/get_profiles', 
  deprecationWarning('/profiles'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  asyncHandler(profileController.getProfiles)
);

router.post('/delete_profile', 
  deprecationWarning('/profiles/:id (DELETE)'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  asyncHandler(profileController.deleteProfile)
);

// Rate limiter for AI detection - max 10 requests per 60 seconds per user
const aiDetectionRateLimiter = operationRateLimiter('ai_detection', {
  points: 10,     // Max 10 AI detections
  duration: 60,   // Per 60 seconds
  blockDuration: 60 // Block for 1 minute if exceeded
});

// === Analysis legacy endpoints ===
router.post('/authenticate', 
  deprecationWarning('/analysis/authenticate'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  aiDetectionRateLimiter, // Add rate limiting BEFORE credit check
  validators.detectAI, creditMiddleware.aiDetection, 
  asyncHandler(analysisController.authenticateContent)
);

router.post('/analyze', 
  deprecationWarning('/analysis/analyze'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  validators.analyzeText, creditMiddleware.textAnalysis, 
  asyncHandler(analysisController.analyzeText)
);

router.post('/suggest_improvements', 
  deprecationWarning('/analysis/suggest-improvements'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  validators.getSuggestions, creditMiddleware.improvementSuggestions, 
  asyncHandler(analysisController.suggestImprovements)
);

router.post('/rewrite', 
  deprecationWarning('/analysis/rewrite'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  validators.rewriteText, creditMiddleware.textRewrite, 
  asyncHandler(analysisController.rewriteText)
);

router.post('/rewrite_stream', 
  deprecationWarning('/analysis/rewrite-stream'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  validators.rewriteTextStream, creditMiddleware.textRewrite, 
  asyncHandler(analysisController.rewriteTextStream)
);

router.post('/api/translate', 
  deprecationWarning('/analysis/translate'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  validators.translate, creditMiddleware.translation, 
  asyncHandler(analysisController.translateText)
);

router.post('/check-humanization', 
  deprecationWarning('/analysis/check-humanization'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  creditMiddleware.checkHumanization, 
  asyncHandler(analysisController.checkHumanization)
);

router.post('/iterative-humanize', 
  deprecationWarning('/analysis/iterative-humanize'),
  optionalAuth, checkLocked, activityLoggerMiddleware,
  validators.iterativeHumanize, creditMiddleware.iterativeHumanize, 
  asyncHandler(analysisController.iterativeHumanize)
);

module.exports = router;
