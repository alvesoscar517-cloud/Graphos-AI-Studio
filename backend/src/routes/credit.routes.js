/**
 * Credit Routes
 */

const express = require('express');
const router = express.Router();
const creditController = require('../controllers/credit.controller');

// Credit Packages
router.get('/packages', creditController.getCreditPackages);
router.post('/purchase', creditController.purchaseCreditPackage);
router.get('/balance', creditController.getCreditBalance);
router.get('/history', creditController.getCreditHistory);

module.exports = router;
