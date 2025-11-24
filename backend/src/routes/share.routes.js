/**
 * Share Routes
 * Routes for sharing notes and conversations
 */

const express = require('express');
const shareController = require('../controllers/share.controller');

const router = express.Router();

// Create share
router.post('/', shareController.createShare);

// Get share by ID
router.get('/:shareId', shareController.getShare);

// Delete share
router.delete('/:shareId', shareController.deleteShare);

module.exports = router;
