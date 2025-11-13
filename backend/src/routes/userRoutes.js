const express = require('express');
const { body, query } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/authenticate');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users with search/filter
 * @access  Public
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['user', 'artist', 'admin']).withMessage('Invalid role'),
    query('sortBy').optional().isIn(['created_at', 'username', 'follower_count', 'artwork_count']).withMessage('Invalid sort field'),
    query('order').optional().isIn(['ASC', 'DESC']).withMessage('Order must be ASC or DESC'),
  ],
  userController.getAllUsers
);

/**
 * @route   GET /api/users/search
 * @desc    Search users by username or name
 * @access  Public
 */
router.get(
  '/search',
  [
    query('q').notEmpty().withMessage('Search query is required'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
  userController.searchUsers
);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', authenticate, (req, res, next) => {
  req.params.id = req.user.id;
  userController.getUserById(req, res, next);
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  [
    body('fullName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Full name must not exceed 100 characters'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters'),
    body('profileImage')
      .optional()
      .trim()
      .custom((value) => {
        // Accept both full URLs and relative paths (e.g., /uploads/image.jpg)
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
          return true;
        }
        throw new Error('Profile image must be a valid URL or path');
      }),
    body('coverImage')
      .optional()
      .trim()
      .custom((value) => {
        // Accept both full URLs and relative paths (e.g., /uploads/cover.jpg)
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
          return true;
        }
        throw new Error('Cover image must be a valid URL or path');
      }),
  ],
  (req, res, next) => {
    req.params.id = req.user.id;
    userController.updateUser(req, res, next);
  }
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Public (but shows different data if authenticated)
 */
router.get('/:id', optionalAuth, userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (own profile or admin)
 */
router.put(
  '/:id',
  authenticate,
  [
    body('fullName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Full name must not exceed 100 characters'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters'),
    body('profileImage')
      .optional()
      .trim()
      .custom((value) => {
        // Accept both full URLs and relative paths (e.g., /uploads/image.jpg)
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
          return true;
        }
        throw new Error('Profile image must be a valid URL or path');
      }),
    body('coverImage')
      .optional()
      .trim()
      .custom((value) => {
        // Accept both full URLs and relative paths (e.g., /uploads/cover.jpg)
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
          return true;
        }
        throw new Error('Cover image must be a valid URL or path');
      }),
  ],
  userController.updateUser
);

/**
 * @route   GET /api/users/:id/artworks
 * @desc    Get user's artworks
 * @access  Public
 */
router.get(
  '/:id/artworks',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('status').optional().isIn(['published', 'draft', 'sold']).withMessage('Invalid status'),
  ],
  userController.getUserArtworks
);

/**
 * @route   GET /api/users/:id/followers
 * @desc    Get user's followers
 * @access  Public
 */
router.get(
  '/:id/followers',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  userController.getUserFollowers
);

/**
 * @route   GET /api/users/:id/following
 * @desc    Get users that this user follows
 * @access  Public
 */
router.get(
  '/:id/following',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  userController.getUserFollowing
);

/**
 * @route   POST /api/users/:id/follow
 * @desc    Follow a user
 * @access  Private
 */
router.post('/:id/follow', authenticate, userController.followUser);

/**
 * @route   DELETE /api/users/:id/follow
 * @desc    Unfollow a user
 * @access  Private
 */
router.delete('/:id/follow', authenticate, userController.unfollowUser);

/**
 * @route   GET /api/users/:id/liked-artworks
 * @desc    Get artworks liked by user
 * @access  Public
 */
router.get(
  '/:id/liked-artworks',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
  userController.getUserLikedArtworks
);

/**
 * @route   GET /api/users/:id/shared
 * @desc    Get user's shared posts
 * @access  Public
 */
router.get(
  '/:id/shared',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
  userController.getUserSharedPosts
);

/**
 * @route   POST /api/users/upload/avatar
 * @desc    Upload profile avatar
 * @access  Private
 */
router.post('/upload/avatar', authenticate, uploadSingle, userController.uploadAvatar);

/**
 * @route   POST /api/users/upload/cover
 * @desc    Upload cover image
 * @access  Private
 */
router.post('/upload/cover', authenticate, uploadSingle, userController.uploadCover);

module.exports = router;
