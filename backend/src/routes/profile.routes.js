/**
 * Profile Routes
 * AI-consuming endpoints (embedding, voice generation) have credit middleware
 */

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const creditMiddleware = require('../middleware/credit.middleware');

// === Profile creation (no credits - just creates empty profile) ===
router.post('/create', profileController.createProfile);

// === Sample operations (with credit middleware - uses embedding API) ===
router.post('/add-sample', creditMiddleware.profileSampleAdd, profileController.addSample);
router.post('/add-samples-batch', creditMiddleware.profileSamplesBatch, profileController.addSamplesBatch);

// === Finalize profile (with credit middleware - uses voice generation) ===
router.post('/finalize', creditMiddleware.profileFinalize, profileController.finalizeProfile);

// === Read operations (no credits) ===
router.get('/:id', profileController.getProfile);
router.get('/', profileController.getProfiles);

// === Delete (no credits) ===
router.delete('/:id', profileController.deleteProfile);

module.exports = router;
