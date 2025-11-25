/**
 * Analysis Routes
 */

const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');
const creditMiddleware = require('../middleware/credit.middleware');

// Apply credit middleware to routes
router.post('/authenticate', creditMiddleware.aiDetection, analysisController.authenticateContent);
router.post('/analyze', creditMiddleware.textAnalysis, analysisController.analyzeText);
router.post('/suggest-improvements', creditMiddleware.improvementSuggestions, analysisController.suggestImprovements);
router.post('/rewrite', analysisController.rewriteText);
router.post('/rewrite-stream', analysisController.rewriteTextStream);
router.post('/translate', analysisController.translateText);

module.exports = router;
