/**
 * Chat Routes
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const creditMiddleware = require('../middleware/credit.middleware');

// Apply credit middleware to chat routes
router.post('/', creditMiddleware.chatMessage, chatController.sendMessage);
router.post('/stream', creditMiddleware.chatMessage, chatController.sendMessageStream);
router.post('/upload', chatController.uploadFile);

module.exports = router;
