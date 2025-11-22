/**
 * Analysis Routes
 */

const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');

router.post('/authenticate', analysisController.authenticateContent);
router.post('/analyze', analysisController.analyzeText);
router.post('/suggest-improvements', analysisController.suggestImprovements);
router.post('/rewrite', analysisController.rewriteText);
router.post('/rewrite-stream', analysisController.rewriteTextStream);
router.post('/translate', analysisController.translateText);

module.exports = router;
