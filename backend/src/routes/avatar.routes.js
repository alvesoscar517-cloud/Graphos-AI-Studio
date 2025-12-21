/**
 * Avatar Routes
 * 
 * Routes for avatar upload, removal, and retrieval
 */

const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatar.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Upload/Update avatar
router.post('/', avatarController.uploadAvatar);

// Remove avatar
router.delete('/', avatarController.removeAvatar);

// Get avatar
router.get('/', avatarController.getAvatar);

module.exports = router;
