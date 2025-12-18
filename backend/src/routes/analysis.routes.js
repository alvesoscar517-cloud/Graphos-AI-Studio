/**
 * Analysis Routes
 * All AI-consuming endpoints have credit middleware applied
 */

const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');
const creditMiddleware = require('../middleware/credit.middleware');
const { validators } = require('../middleware/validation.middleware');

// ============================================================================
// TIMEOUT CONFIGURATION
// Timeouts are set based on operation complexity and text length
// ============================================================================

// Standard AI timeout (2 minutes) - for detection, analysis, suggestions
const standardTimeout = (req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
};

// Heavy AI timeout (3 minutes) - for rewrite, humanization check
const heavyTimeout = (req, res, next) => {
  req.setTimeout(180000);
  res.setTimeout(180000);
  next();
};

// Iterative timeout (5 minutes) - for iterative humanization (multiple passes)
const iterativeTimeout = (req, res, next) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
};

// Streaming timeout (5 minutes) - for streaming operations
const streamingTimeout = (req, res, next) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
};

// ============================================================================
// ROUTES
// ============================================================================

// === Detection ===
router.post('/authenticate', standardTimeout, creditMiddleware.aiDetection, analysisController.authenticateContent);

// === Analysis ===
router.post('/analyze', standardTimeout, creditMiddleware.textAnalysis, analysisController.analyzeText);
router.post('/suggest-improvements', standardTimeout, creditMiddleware.improvementSuggestions, analysisController.suggestImprovements);

// === Rewrite (with credit middleware) ===
router.post('/rewrite', heavyTimeout, validators.rewriteText, creditMiddleware.textRewrite, analysisController.rewriteText);
router.post('/rewrite-stream', streamingTimeout, validators.rewriteTextStream, creditMiddleware.textRewrite, analysisController.rewriteTextStream);

// === Translation (with credit middleware) ===
router.post('/translate', standardTimeout, creditMiddleware.translation, analysisController.translateText);

// === Humanization endpoints (with credit middleware) ===
router.post('/check-humanization', heavyTimeout, creditMiddleware.checkHumanization, analysisController.checkHumanization);
router.post('/iterative-humanize', iterativeTimeout, creditMiddleware.iterativeHumanize, analysisController.iterativeHumanize);

// === Async Humanization (for long-running operations) ===
// Note: Credits are deducted AFTER job completion based on actual iterations used
// No credit middleware here - handled in humanizeJob.service.js
router.post('/iterative-humanize/start', iterativeTimeout, analysisController.startIterativeHumanize);
router.get('/iterative-humanize/status/:job_id', analysisController.getHumanizeJobStatus);
router.get('/iterative-humanize/stream/:job_id', streamingTimeout, analysisController.streamHumanizeJobResult);

module.exports = router;
