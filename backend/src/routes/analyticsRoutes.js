const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authenticate');

/**
 * @route   GET /api/analytics/overview
 * @desc    Get analytics overview (tier-based)
 * @access  Private
 */
router.get('/overview', authenticate, analyticsController.getOverview);

/**
 * @route   GET /api/analytics/artworks
 * @desc    Get artwork performance analytics
 * @access  Private
 */
router.get('/artworks', authenticate, analyticsController.getArtworkAnalytics);

module.exports = router;
