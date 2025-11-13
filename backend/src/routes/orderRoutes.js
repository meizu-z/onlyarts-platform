const express = require('express');
const { body, query } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticate, requireRole } = require('../middleware/authenticate');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/orders
 * @desc    Create order from cart
 * @access  Private
 */
router.post(
  '/',
  [
    body('paymentMethod')
      .notEmpty()
      .withMessage('Payment method is required')
      .isIn(['card', 'wallet', 'bank_transfer'])
      .withMessage('Invalid payment method'),
    body('shippingAddress')
      .optional()
      .isObject()
      .withMessage('Shipping address must be an object'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must not exceed 500 characters'),
  ],
  orderController.createOrder
);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
  orderController.getUserOrders
);

/**
 * @route   GET /api/orders/seller/sales
 * @desc    Get artist's sales
 * @access  Private (Artists only)
 */
router.get(
  '/seller/sales',
  requireRole('artist', 'admin'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
  orderController.getArtistSales
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details
 * @access  Private
 */
router.get('/:id', orderController.getOrderById);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;
