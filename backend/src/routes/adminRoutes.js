const express = require('express');
const { query, body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/authenticate');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Private (Admin only)
 */
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['user', 'artist', 'admin']).withMessage('Invalid role'),
    query('subscription').optional().isIn(['free', 'plus', 'premium']).withMessage('Invalid subscription'),
    query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  ],
  adminController.getAllUsersAdmin
);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 */
router.put(
  '/users/:id/role',
  [
    body('role')
      .notEmpty()
      .withMessage('Role is required')
      .isIn(['user', 'artist', 'admin'])
      .withMessage('Invalid role'),
  ],
  adminController.updateUserRole
);

/**
 * @route   PUT /api/admin/users/:id/ban
 * @desc    Ban user
 * @access  Private (Admin only)
 */
router.put('/users/:id/ban', adminController.banUser);

/**
 * @route   PUT /api/admin/users/:id/unban
 * @desc    Unban user
 * @access  Private (Admin only)
 */
router.put('/users/:id/unban', adminController.unbanUser);

/**
 * @route   GET /api/admin/artworks
 * @desc    Get all artworks with filters
 * @access  Private (Admin only)
 */
router.get(
  '/artworks',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['draft', 'published', 'sold', 'archived']).withMessage('Invalid status'),
    query('category').optional().isIn(['painting', 'sculpture', 'photography', 'digital', 'mixed_media', 'other']).withMessage('Invalid category'),
  ],
  adminController.getAllArtworksAdmin
);

/**
 * @route   PUT /api/admin/artworks/:id/feature
 * @desc    Feature/unfeature artwork
 * @access  Private (Admin only)
 */
router.put(
  '/artworks/:id/feature',
  [
    body('featured')
      .notEmpty()
      .withMessage('Featured status is required')
      .isBoolean()
      .withMessage('Featured must be boolean'),
  ],
  adminController.featureArtwork
);

/**
 * @route   DELETE /api/admin/artworks/:id
 * @desc    Delete artwork
 * @access  Private (Admin only)
 */
router.delete('/artworks/:id', adminController.deleteArtworkAdmin);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders
 * @access  Private (Admin only)
 */
router.get(
  '/orders',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
    query('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid payment status'),
  ],
  adminController.getAllOrdersAdmin
);

/**
 * @route   GET /api/admin/analytics/revenue
 * @desc    Get revenue analytics
 * @access  Private (Admin only)
 */
router.get(
  '/analytics/revenue',
  [
    query('period').optional().isInt({ min: 1, max: 365 }).withMessage('Period must be between 1 and 365 days'),
  ],
  adminController.getRevenueAnalytics
);

/**
 * @route   GET /api/admin/audit-log
 * @desc    Get activity history / audit log
 * @access  Private (Admin only)
 */
router.get(
  '/audit-log',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('action_type').optional().isString().withMessage('Action type must be a string'),
    query('admin_id').optional().isInt().withMessage('Admin ID must be an integer'),
    query('start_date').optional().isISO8601().withMessage('Start date must be valid ISO 8601 date'),
    query('end_date').optional().isISO8601().withMessage('End date must be valid ISO 8601 date'),
  ],
  adminController.getAuditLog
);

module.exports = router;
