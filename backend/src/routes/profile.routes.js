/**
 * Profile Routes
 */

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');

router.post('/create', profileController.createProfile);
router.post('/add-sample', profileController.addSample);
router.post('/add-samples-batch', profileController.addSamplesBatch);
router.post('/finalize', profileController.finalizeProfile);
router.get('/:id', profileController.getProfile);
router.get('/', profileController.getProfiles);
router.delete('/:id', profileController.deleteProfile);

module.exports = router;
