/**
 * Chat Routes
 * All AI-consuming endpoints have credit middleware applied
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const creditMiddleware = require('../middleware/credit.middleware');

// ============================================================================
// TIMEOUT CONFIGURATION
// ============================================================================

// Standard AI timeout (2 minutes) - for regular chat messages
const standardTimeout = (req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
};

// Heavy AI timeout (3 minutes) - for humanized responses
const heavyTimeout = (req, res, next) => {
  req.setTimeout(180000);
  res.setTimeout(180000);
  next();
};

// Streaming timeout (5 minutes) - for long streaming operations
const streamingTimeout = (req, res, next) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
};

// ============================================================================
// ROUTES
// ============================================================================

// === Standard chat routes ===
router.post('/', standardTimeout, creditMiddleware.chatMessage, chatController.sendMessage);
router.post('/stream', streamingTimeout, creditMiddleware.chatMessage, chatController.sendMessageStream);

// === Humanized chat routes (higher cost due to additional processing) ===
router.post('/humanized', heavyTimeout, creditMiddleware.chatHumanized, chatController.sendMessageHumanized);
router.post('/humanized/stream', streamingTimeout, creditMiddleware.chatHumanized, chatController.sendMessageHumanizedStream);

// === Utility routes (with credit middleware) ===
router.post('/upload', standardTimeout, creditMiddleware.fileUpload, chatController.uploadFile);
router.post('/summarize', standardTimeout, creditMiddleware.conversationSummarize, chatController.summarizeConversation);

module.exports = router;
