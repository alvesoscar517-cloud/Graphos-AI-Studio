/**
 * Main Routes Index
 * Aggregates all route modules with enhanced security
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const analysisRoutes = require('./analysis.routes');
const adminRoutes = require('./admin.routes');
const chatRoutes = require('./chat.routes');
const notificationRoutes = require('./notification.routes');
const shareRoutes = require('./share.routes');
const creditRoutes = require('./credit.routes');
const paymentRoutes = require('./payment.routes');
const realtimeRoutes = require('./realtime.routes');
const paymentController = require('../controllers/payment.controller');

// Middleware
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { validators } = require('../middleware/validation.middleware');
const creditMiddleware = require('../middleware/credit.middleware');
const { asyncHandler } = require('../middleware/errorHandler.middleware');

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
      '/api/admin/*': 'Admin panel',
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
// PROTECTED ROUTES (Auth Required)
// ============================================================================

// Profile routes
router.use('/profiles', profileRoutes);

// Analysis routes
router.use('/analysis', analysisRoutes);

// Admin routes (requires admin key)
router.use('/api/admin', adminRoutes);

// Chat routes
router.use('/api/chat', chatRoutes);

// Notification routes
router.use('/api/notifications', notificationRoutes);

// Share routes
router.use('/api/share', shareRoutes);

// Credit routes
router.use('/api/credits', creditRoutes);

// Payment routes
router.use('/api/payment', paymentRoutes);

// Realtime routes (SSE)
router.use('/api/realtime', realtimeRoutes);

// ============================================================================
// LEGACY ROUTES (Backward Compatibility)
// These will be deprecated in future versions
// ============================================================================

// === Profile legacy endpoints ===
router.post('/create_profile', 
  optionalAuth,
  asyncHandler(profileController.createProfile)
);

router.post('/create_profile_complete', 
  optionalAuth,
  creditMiddleware.profileComplete, 
  asyncHandler(profileController.createProfileComplete)
);

router.post('/add_sample', 
  optionalAuth,
  validators.addSample,
  creditMiddleware.profileSampleAdd, 
  asyncHandler(profileController.addSample)
);

router.post('/add_samples_batch', 
  optionalAuth,
  creditMiddleware.profileSamplesBatch, 
  asyncHandler(profileController.addSamplesBatch)
);

router.post('/finalize_profile', 
  optionalAuth,
  creditMiddleware.profileFinalize, 
  asyncHandler(profileController.finalizeProfile)
);

router.get('/get_profile', 
  optionalAuth,
  asyncHandler(profileController.getProfile)
);

router.get('/get_profiles', 
  optionalAuth,
  asyncHandler(profileController.getProfiles)
);

router.post('/delete_profile', 
  optionalAuth,
  asyncHandler(profileController.deleteProfile)
);

// === Analysis legacy endpoints with validation and credit middleware ===
router.post('/authenticate', 
  optionalAuth,
  validators.detectAI,
  creditMiddleware.aiDetection, 
  asyncHandler(analysisController.authenticateContent)
);

router.post('/analyze', 
  optionalAuth,
  validators.analyzeText,
  creditMiddleware.textAnalysis, 
  asyncHandler(analysisController.analyzeText)
);

router.post('/suggest_improvements', 
  optionalAuth,
  validators.getSuggestions,
  creditMiddleware.improvementSuggestions, 
  asyncHandler(analysisController.suggestImprovements)
);

router.post('/rewrite', 
  optionalAuth,
  validators.rewriteText,
  creditMiddleware.textRewrite, 
  asyncHandler(analysisController.rewriteText)
);

router.post('/rewrite_stream', 
  optionalAuth,
  validators.rewriteText,
  creditMiddleware.textRewrite, 
  asyncHandler(analysisController.rewriteTextStream)
);

// === Translation legacy endpoint ===
router.post('/api/translate', 
  optionalAuth,
  validators.translate,
  creditMiddleware.translation, 
  asyncHandler(analysisController.translateText)
);

// === Humanization legacy endpoints ===
router.post('/check-humanization', 
  optionalAuth,
  creditMiddleware.checkHumanization, 
  asyncHandler(analysisController.checkHumanization)
);

router.post('/iterative-humanize', 
  optionalAuth,
  validators.iterativeHumanize,
  creditMiddleware.iterativeHumanize, 
  asyncHandler(analysisController.iterativeHumanize)
);

module.exports = router;
