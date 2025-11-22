/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/auth');

// Apply admin auth to all routes
router.use(requireAdmin);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);

// Analytics
router.get('/analytics/overview', adminController.getOverview);
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/usage', adminController.getUsageAnalytics);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Translation
router.post('/translate', adminController.translateText);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.createNotification);
router.put('/notifications/:id', adminController.updateNotification);
router.delete('/notifications/:id', adminController.deleteNotification);
router.post('/notifications/:id/send', adminController.sendNotification);
router.get('/notifications/:id/stats', adminController.getNotificationStats);

module.exports = router;
