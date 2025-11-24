/**
 * Subscription Routes
 */

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');

// Plans & Packages
router.get('/plans', subscriptionController.getPlans);
router.get('/packages', subscriptionController.getCreditPackages);

// User Subscription
router.get('/subscription', subscriptionController.getUserSubscription);
router.post('/subscription/upgrade', subscriptionController.upgradePlan);
router.post('/subscription/cancel', subscriptionController.cancelSubscription);

// Credit Packages
router.post('/credits/purchase', subscriptionController.purchaseCreditPackage);
router.get('/credits/balance', subscriptionController.getCreditBalance);
router.get('/credits/history', subscriptionController.getCreditHistory);

module.exports = router;
