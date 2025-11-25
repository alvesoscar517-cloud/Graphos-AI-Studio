/**
 * Payment Routes
 * Lemon Squeezy integration endpoints
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Checkout
router.post('/checkout', paymentController.createCheckout);

// Products & Plans
router.get('/products', paymentController.getProducts);

// Subscription management
router.get('/subscription', paymentController.getSubscriptionStatus);
router.post('/subscription/cancel', paymentController.cancelSubscription);
router.post('/subscription/pause', paymentController.pauseSubscription);
router.post('/subscription/resume', paymentController.resumeSubscription);
router.post('/subscription/update', paymentController.updateSubscriptionPlan);

// Customer portal
router.get('/portal', paymentController.getCustomerPortal);

// License key management
router.post('/license/validate', paymentController.validateLicense);
router.post('/license/activate', paymentController.activateLicense);
router.post('/license/deactivate', paymentController.deactivateLicense);

// Order history
router.get('/orders', paymentController.getOrderHistory);

// Payment status check (for polling after checkout - legacy fallback)
router.get('/check-status', paymentController.checkPaymentStatus);

// Note: SSE endpoint moved to /api/realtime/events/:userId for unified real-time updates

module.exports = router;
