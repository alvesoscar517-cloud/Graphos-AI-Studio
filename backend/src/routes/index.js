/**
 * Main Routes Index
 * Aggregates all route modules with enhanced security
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const analysisRoutes = require('./analysis.routes');
const chatRoutes = require('./chat.routes');
const notificationRoutes = require('./notification.routes');
const shareRoutes = require('./share.routes');
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

// Home
router.get('/', (_req, res) => {
  res.json({
    service: 'AI Content Authenticator - Backend',
    version: '2.1',
    status: 'running',
    powered_by: 'Google Gemini Ecosystem',
    architecture: 'Modular',
    endpoints: {
      '/health': 'GET - Health check',
      '/ready': 'GET - Readiness check',
      '/profiles/*': 'Profile management',
      '/analysis/*': 'Text analysis & AI detection',
      '/api/chat': 'Workspace chat',
      '/api/notifications': 'User notifications',
      '/send-feedback': 'Feedback & support'
    }
  });
});

// Webhook endpoint (NO AUTH - verified by signature)
router.post('/webhooks/lemonsqueezy', paymentController.handleWebhook);

// ============================================================================
// AUTH ROUTES
// ============================================================================

router.use('/', authRoutes);

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

// Share routes
router.use('/api/share', protectedMiddleware, shareRoutes);

// Credit routes
router.use('/api/credits', protectedMiddleware, creditRoutes);

// Payment routes (allow locked users to make payments to unlock)
router.use('/api/payment', authenticate, paymentRoutes);

// Realtime routes (SSE)
router.use('/api/realtime', protectedMiddleware, realtimeRoutes);

// ============================================================================
// LEGACY ROUTES (Backward Compatibility)
// These will be deprecated in future versions
// ============================================================================

// === Profile legacy endpoints ===
router.post('/create_profile', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  asyncHandler(profileController.createProfile)
);

router.post('/create_profile_complete', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  creditMiddleware.profileComplete, 
  asyncHandler(profileController.createProfileComplete)
);

router.post('/add_sample', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  validators.addSample,
  creditMiddleware.profileSampleAdd, 
  asyncHandler(profileController.addSample)
);

router.post('/add_samples_batch', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  creditMiddleware.profileSamplesBatch, 
  asyncHandler(profileController.addSamplesBatch)
);

router.post('/finalize_profile', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  creditMiddleware.profileFinalize, 
  asyncHandler(profileController.finalizeProfile)
);

router.get('/get_profile', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  asyncHandler(profileController.getProfile)
);

router.get('/get_profiles', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  asyncHandler(profileController.getProfiles)
);

router.post('/delete_profile', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  asyncHandler(profileController.deleteProfile)
);

// === Analysis legacy endpoints with validation and credit middleware ===
router.post('/authenticate', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  validators.detectAI,
  creditMiddleware.aiDetection, 
  asyncHandler(analysisController.authenticateContent)
);

router.post('/analyze', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  validators.analyzeText,
  creditMiddleware.textAnalysis, 
  asyncHandler(analysisController.analyzeText)
);

router.post('/suggest_improvements', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  validators.getSuggestions,
  creditMiddleware.improvementSuggestions, 
  asyncHandler(analysisController.suggestImprovements)
);

router.post('/rewrite', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  validators.rewriteText,
  creditMiddleware.textRewrite, 
  asyncHandler(analysisController.rewriteText)
);

router.post('/rewrite_stream', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  validators.rewriteText,
  creditMiddleware.textRewrite, 
  asyncHandler(analysisController.rewriteTextStream)
);

// === Translation legacy endpoint ===
router.post('/api/translate', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  validators.translate,
  creditMiddleware.translation, 
  asyncHandler(analysisController.translateText)
);

// === Humanization legacy endpoints ===
router.post('/check-humanization', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  creditMiddleware.checkHumanization, 
  asyncHandler(analysisController.checkHumanization)
);

router.post('/iterative-humanize', 
  optionalAuth,
  checkLocked,
  activityLoggerMiddleware,
  validators.iterativeHumanize,
  creditMiddleware.iterativeHumanize, 
  asyncHandler(analysisController.iterativeHumanize)
);

module.exports = router;
