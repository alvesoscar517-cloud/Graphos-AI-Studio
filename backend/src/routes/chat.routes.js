/**
 * Chat Routes
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.post('/', chatController.sendMessage);
router.post('/stream', chatController.sendMessageStream);
router.post('/upload', chatController.uploadFile);

module.exports = router;
