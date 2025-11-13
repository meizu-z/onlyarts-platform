const express = require('express');
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

/**
 * @route   GET /api/settings
 * @desc    Get user settings
 * @access  Private
 */
router.get('/', authenticate, settingsController.getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put('/', authenticate, settingsController.updateSettings);

/**
 * @route   GET /api/settings/billing
 * @desc    Get billing settings
 * @access  Private
 */
router.get('/billing', authenticate, settingsController.getBilling);

/**
 * @route   PUT /api/settings/billing
 * @desc    Update billing settings
 * @access  Private
 */
router.put('/billing', authenticate, settingsController.updateBilling);

module.exports = router;
