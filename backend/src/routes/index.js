/**
 * Main Routes Index
 * Aggregates all route modules
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
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

// Home
router.get('/', (_req, res) => {
  res.json({
    service: 'AI Content Authenticator - Backend',
    version: '2.0',
    status: 'running',
    powered_by: 'Google Gemini Ecosystem',
    architecture: 'Modular',
    endpoints: {
      '/health': 'GET - Health check',
      '/profiles/*': 'Profile management',
      '/analysis/*': 'Text analysis & AI detection',
      '/api/chat': 'Workspace chat',
      '/api/notifications': 'User notifications',
      '/api/admin/*': 'Admin panel',
      '/send-feedback': 'Feedback & support'
    }
  });
});

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-content-authenticator',
    runtime: 'Node.js',
    version: '2.0',
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoint (NO AUTH - verified by signature)
// Note: rawBody is captured in main index.js before express.json() parses it
router.post('/webhooks/lemonsqueezy', paymentController.handleWebhook);

// Mount routes
router.use('/', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/analysis', analysisRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/chat', chatRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/share', shareRoutes);
router.use('/api/credits', creditRoutes);
router.use('/api/payment', paymentRoutes);

// Backward compatibility routes (legacy endpoints)
const profileController = require('../controllers/profile.controller');
const analysisController = require('../controllers/analysis.controller');
const creditMiddleware = require('../middleware/credit.middleware');

router.post('/create_profile', profileController.createProfile);
router.post('/create_profile_complete', profileController.createProfileComplete);
router.post('/add_sample', profileController.addSample);
router.post('/add_samples_batch', profileController.addSamplesBatch);
router.post('/finalize_profile', profileController.finalizeProfile);
router.get('/get_profile', profileController.getProfile);
router.get('/get_profiles', profileController.getProfiles);
router.post('/delete_profile', profileController.deleteProfile);

// Legacy endpoints with credit middleware
router.post('/authenticate', creditMiddleware.aiDetection, analysisController.authenticateContent);
router.post('/analyze', creditMiddleware.textAnalysis, analysisController.analyzeText);
router.post('/suggest_improvements', creditMiddleware.improvementSuggestions, analysisController.suggestImprovements);
router.post('/rewrite', creditMiddleware.textRewrite, analysisController.rewriteText);
router.post('/rewrite_stream', creditMiddleware.textRewrite, analysisController.rewriteTextStream);
router.post('/api/translate', analysisController.translateText);

module.exports = router;
