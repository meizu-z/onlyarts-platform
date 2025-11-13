const express = require('express');
const { body, query } = require('express-validator');
const livestreamController = require('../controllers/livestreamController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

/**
 * @route   POST /api/livestreams
 * @desc    Create/Schedule livestream
 * @access  Private (Premium Artists)
 */
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title too long'),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }).withMessage('Description too long'),
    body('scheduledFor').isISO8601().withMessage('Invalid scheduled date'),
    body('thumbnailUrl').optional().trim().isURL().withMessage('Invalid thumbnail URL'),
  ],
  livestreamController.createLivestream
);

/**
 * @route   GET /api/livestreams
 * @desc    Get livestreams
 * @access  Public
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
    query('status').optional().isIn(['live', 'scheduled', 'ended']).withMessage('Invalid status'),
  ],
  livestreamController.getLivestreams
);

/**
 * @route   GET /api/livestreams/:id
 * @desc    Get livestream details
 * @access  Public
 */
router.get('/:id', livestreamController.getLivestreamById);

/**
 * @route   PUT /api/livestreams/:id/start
 * @desc    Start livestream
 * @access  Private (Host)
 */
router.put('/:id/start', authenticate, livestreamController.startLivestream);

/**
 * @route   PUT /api/livestreams/:id/end
 * @desc    End livestream
 * @access  Private (Host)
 */
router.put('/:id/end', authenticate, livestreamController.endLivestream);

/**
 * @route   DELETE /api/livestreams/:id
 * @desc    Delete/Cancel livestream
 * @access  Private (Host)
 */
router.delete('/:id', authenticate, livestreamController.deleteLivestream);

module.exports = router;
