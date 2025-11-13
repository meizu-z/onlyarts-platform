const express = require('express');
const { body, query } = require('express-validator');
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

/**
 * @route   GET /api/favorites
 * @desc    Get user's favorites
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  favoriteController.getFavorites
);

/**
 * @route   POST /api/favorites
 * @desc    Add to favorites
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  [
    body('artworkId').isInt().withMessage('Artwork ID is required'),
  ],
  favoriteController.addFavorite
);

/**
 * @route   DELETE /api/favorites/:id
 * @desc    Remove from favorites
 * @access  Private
 */
router.delete('/:id', authenticate, favoriteController.removeFavorite);

module.exports = router;
