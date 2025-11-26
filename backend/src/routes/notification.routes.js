/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.get('/', notificationController.getUserNotifications);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.post('/:id/read', notificationController.markAsRead);
router.post('/:id/click', notificationController.markAsClicked);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
