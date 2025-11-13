const express = require('express');
const { body, query } = require('express-validator');
const exhibitionController = require('../controllers/exhibitionController');
const { authenticate, optionalAuth } = require('../middleware/authenticate');

const router = express.Router();

/**
 * @route   POST /api/exhibitions
 * @desc    Create exhibition
 * @access  Private (Premium/Artists)
 */
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title too long'),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }).withMessage('Description too long'),
    body('startDate').isISO8601().withMessage('Invalid start date'),
    body('endDate').isISO8601().withMessage('Invalid end date'),
    body('artworkIds').optional().isArray().withMessage('Artwork IDs must be an array'),
    body('isPrivate').optional().isBoolean().withMessage('isPrivate must be boolean'),
    body('coverImage').optional().trim().isURL().withMessage('Invalid cover image URL'),
  ],
  exhibitionController.createExhibition
);

/**
 * @route   GET /api/exhibitions
 * @desc    Get exhibitions
 * @access  Public
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
    query('status').optional().isIn(['upcoming', 'current', 'past', 'published']).withMessage('Invalid status'),
    query('userId').optional().isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  ],
  exhibitionController.getExhibitions
);

/**
 * @route   GET /api/exhibitions/:id
 * @desc    Get exhibition details
 * @access  Public
 */
router.get('/:id', optionalAuth, exhibitionController.getExhibitionById);

/**
 * @route   PUT /api/exhibitions/:id
 * @desc    Update exhibition
 * @access  Private (Owner)
 */
router.put(
  '/:id',
  authenticate,
  [
    body('title').optional().trim().isLength({ max: 255 }).withMessage('Title too long'),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description too long'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date'),
    body('isPrivate').optional().isBoolean().withMessage('isPrivate must be boolean'),
    body('coverImage').optional().trim().isURL().withMessage('Invalid cover image URL'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  ],
  exhibitionController.updateExhibition
);

/**
 * @route   DELETE /api/exhibitions/:id
 * @desc    Delete exhibition
 * @access  Private (Owner)
 */
router.delete('/:id', authenticate, exhibitionController.deleteExhibition);

/**
 * @route   POST /api/exhibitions/:id/like
 * @desc    Like exhibition
 * @access  Private
 */
router.post('/:id/like', authenticate, exhibitionController.likeExhibition);

/**
 * @route   DELETE /api/exhibitions/:id/like
 * @desc    Unlike exhibition
 * @access  Private
 */
router.delete('/:id/like', authenticate, exhibitionController.unlikeExhibition);

module.exports = router;
