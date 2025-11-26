/**
 * Chat Routes
 * All AI-consuming endpoints have credit middleware applied
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const creditMiddleware = require('../middleware/credit.middleware');

// === Standard chat routes ===
router.post('/', creditMiddleware.chatMessage, chatController.sendMessage);
router.post('/stream', creditMiddleware.chatMessage, chatController.sendMessageStream);

// === Humanized chat routes (higher cost due to additional processing) ===
router.post('/humanized', creditMiddleware.chatHumanized, chatController.sendMessageHumanized);
router.post('/humanized/stream', creditMiddleware.chatHumanized, chatController.sendMessageHumanizedStream);

// === Utility routes (with credit middleware) ===
router.post('/upload', creditMiddleware.fileUpload, chatController.uploadFile);
router.post('/summarize', creditMiddleware.conversationSummarize, chatController.summarizeConversation);

module.exports = router;
