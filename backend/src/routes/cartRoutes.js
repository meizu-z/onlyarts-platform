const express = require('express');
const { body } = require('express-validator');
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', cartController.getCart);

/**
 * @route   POST /api/cart
 * @desc    Add item to cart
 * @access  Private
 */
router.post(
  '/',
  [
    body('artworkId')
      .notEmpty()
      .withMessage('Artwork ID is required')
      .isInt()
      .withMessage('Artwork ID must be an integer'),
    body('quantity')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Quantity must be between 1 and 10'),
  ],
  cartController.addToCart
);

/**
 * @route   PUT /api/cart/:id
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put(
  '/:id',
  [
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 1, max: 10 })
      .withMessage('Quantity must be between 1 and 10'),
  ],
  cartController.updateCartItem
);

/**
 * @route   DELETE /api/cart/:id
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/:id', cartController.removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete('/', cartController.clearCart);

module.exports = router;
