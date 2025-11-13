const express = require('express');
const { body, query } = require('express-validator');
const artworkController = require('../controllers/artworkController');
const { authenticate, requireRole, optionalAuth } = require('../middleware/authenticate');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

/**
 * @route   GET /api/artworks
 * @desc    Get all artworks with filters
 * @access  Public
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().isIn(['painting', 'sculpture', 'photography', 'digital', 'mixed_media', 'other']).withMessage('Invalid category'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
    query('sortBy').optional().isIn(['created_at', 'price', 'like_count', 'view_count', 'title']).withMessage('Invalid sort field'),
    query('order').optional().isIn(['ASC', 'DESC']).withMessage('Order must be ASC or DESC'),
  ],
  artworkController.getAllArtworks
);

/**
 * @route   GET /api/artworks/:id
 * @desc    Get single artwork
 * @access  Public (but shows more data if authenticated)
 */
router.get('/:id', optionalAuth, artworkController.getArtworkById);

/**
 * @route   POST /api/artworks
 * @desc    Create new artwork
 * @access  Private (Artists only)
 */
router.post(
  '/',
  authenticate,
  requireRole('artist', 'admin'),
  uploadSingle,
  artworkController.createArtwork
);

/**
 * @route   PUT /api/artworks/:id
 * @desc    Update artwork
 * @access  Private (Owner only)
 */
router.put(
  '/:id',
  authenticate,
  [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Title must not exceed 255 characters'),
    body('description')
      .optional()
      .trim(),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('category')
      .optional()
      .isIn(['painting', 'sculpture', 'photography', 'digital', 'mixed_media', 'other'])
      .withMessage('Invalid category'),
    body('medium')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Medium must not exceed 100 characters'),
    body('dimensions')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Dimensions must not exceed 100 characters'),
    body('yearCreated')
      .optional()
      .isInt({ min: 1000, max: new Date().getFullYear() })
      .withMessage('Year must be valid'),
    body('isOriginal')
      .optional()
      .isBoolean()
      .withMessage('isOriginal must be boolean'),
    body('isForSale')
      .optional()
      .isBoolean()
      .withMessage('isForSale must be boolean'),
    body('stockQuantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock quantity must be a positive integer'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'sold', 'archived'])
      .withMessage('Invalid status'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
  ],
  artworkController.updateArtwork
);

/**
 * @route   DELETE /api/artworks/:id
 * @desc    Delete artwork
 * @access  Private (Owner only)
 */
router.delete('/:id', authenticate, artworkController.deleteArtwork);

/**
 * @route   POST /api/artworks/:id/like
 * @desc    Like artwork
 * @access  Private
 */
router.post('/:id/like', authenticate, artworkController.likeArtwork);

/**
 * @route   DELETE /api/artworks/:id/like
 * @desc    Unlike artwork
 * @access  Private
 */
router.delete('/:id/like', authenticate, artworkController.unlikeArtwork);

/**
 * @route   GET /api/artworks/:id/comments
 * @desc    Get artwork comments
 * @access  Public
 */
router.get(
  '/:id/comments',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  artworkController.getArtworkComments
);

/**
 * @route   POST /api/artworks/:id/comments
 * @desc    Add comment to artwork
 * @access  Private
 */
router.post(
  '/:id/comments',
  authenticate,
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ max: 1000 })
      .withMessage('Comment must not exceed 1000 characters'),
    body('parentId')
      .optional()
      .isInt()
      .withMessage('Parent ID must be an integer'),
  ],
  artworkController.addComment
);

/**
 * @route   DELETE /api/artworks/:artworkId/comments/:commentId
 * @desc    Delete comment
 * @access  Private (Owner only)
 */
router.delete('/:artworkId/comments/:commentId', authenticate, artworkController.deleteComment);

module.exports = router;
