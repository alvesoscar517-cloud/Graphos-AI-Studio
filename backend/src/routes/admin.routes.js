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
router.get('/users/:id/logs', adminController.getUserLogs);
router.put('/users/:id/lock', adminController.toggleUserLock);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/notification', adminController.sendUserNotification);

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

// Support Tickets
const supportController = require('../controllers/support.controller');
router.get('/support', supportController.getTickets);
router.get('/support/statistics', supportController.getStatistics);
router.get('/support/:id', supportController.getTicketDetails);
router.put('/support/:id/status', supportController.updateTicketStatus);
router.post('/support/:id/reply', supportController.replyToTicket);
router.delete('/support/:id', supportController.deleteTicket);

// System Logs
router.get('/logs', adminController.getSystemLogs);
router.delete('/logs', adminController.clearSystemLogs);

module.exports = router;
