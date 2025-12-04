/**
 * Realtime Routes
 * SSE endpoints for real-time updates
 */

const express = require('express');
const router = express.Router();
const realtimeController = require('../controllers/realtime.controller');

// SSE endpoint - unified real-time updates
router.get('/events/:userId', realtimeController.events);

// Stats endpoint (for monitoring)
router.get('/stats', realtimeController.getStats);

// Broadcast notification (called by admin backend via internal API)
router.post('/broadcast-notification', realtimeController.broadcastNotificationApi);

// Broadcast credits update (called by admin backend via internal API)
router.post('/broadcast-credits', realtimeController.broadcastCreditsApi);

module.exports = router;
