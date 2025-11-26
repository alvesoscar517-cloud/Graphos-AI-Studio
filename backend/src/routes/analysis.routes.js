/**
 * Analysis Routes
 * All AI-consuming endpoints have credit middleware applied
 */

const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');
const creditMiddleware = require('../middleware/credit.middleware');

// === Detection ===
router.post('/authenticate', creditMiddleware.aiDetection, analysisController.authenticateContent);

// === Analysis ===
router.post('/analyze', creditMiddleware.textAnalysis, analysisController.analyzeText);
router.post('/suggest-improvements', creditMiddleware.improvementSuggestions, analysisController.suggestImprovements);

// === Rewrite (with credit middleware) ===
router.post('/rewrite', creditMiddleware.textRewrite, analysisController.rewriteText);
router.post('/rewrite-stream', creditMiddleware.textRewrite, analysisController.rewriteTextStream);

// === Translation (with credit middleware) ===
router.post('/translate', creditMiddleware.translation, analysisController.translateText);

// === Humanization endpoints (with credit middleware) ===
router.post('/check-humanization', creditMiddleware.checkHumanization, analysisController.checkHumanization);
router.post('/iterative-humanize', creditMiddleware.iterativeHumanize, analysisController.iterativeHumanize);

module.exports = router;
