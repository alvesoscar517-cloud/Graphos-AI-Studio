/**
 * Profile Routes
 * AI-consuming endpoints (embedding, voice generation) have credit middleware
 */

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const creditMiddleware = require('../middleware/credit.middleware');

// ============================================================================
// TIMEOUT CONFIGURATION
// ============================================================================

// Standard AI timeout (2 minutes) - for single sample operations
const standardTimeout = (req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
};

// Heavy AI timeout (3 minutes) - for batch operations and finalization
const heavyTimeout = (req, res, next) => {
  req.setTimeout(180000);
  res.setTimeout(180000);
  next();
};

// Profile creation timeout (5 minutes) - for complete profile creation with many samples
const profileCreationTimeout = (req, res, next) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
};

// ============================================================================
// ROUTES
// ============================================================================

// === Profile creation (no credits - just creates empty profile) ===
router.post('/create', profileController.createProfile);

// === Sample operations (with credit middleware - uses embedding API) ===
router.post('/add-sample', standardTimeout, creditMiddleware.profileSampleAdd, profileController.addSample);
router.post('/add-samples-batch', heavyTimeout, creditMiddleware.profileSamplesBatch, profileController.addSamplesBatch);

// === Finalize profile (with credit middleware - uses voice generation) ===
router.post('/finalize', heavyTimeout, creditMiddleware.profileFinalize, profileController.finalizeProfile);

// === Read operations (no credits) ===
router.get('/:id', profileController.getProfile);
router.get('/', profileController.getProfiles);

// === Delete (no credits) ===
router.delete('/:id', profileController.deleteProfile);

module.exports = router;
