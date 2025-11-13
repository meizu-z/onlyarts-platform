const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { authenticate, requireRole } = require('../middleware/authenticate');

const router = express.Router();

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create payment intent for an order
 * @access  Private
 */
router.post(
  '/create-intent',
  authenticate,
  [
    body('orderId')
      .notEmpty()
      .withMessage('Order ID is required')
      .isInt()
      .withMessage('Order ID must be an integer'),
  ],
  paymentController.createPaymentIntentForOrder
);

/**
 * @route   GET /api/payments/intent/:paymentIntentId
 * @desc    Get payment intent status
 * @access  Private
 */
router.get(
  '/intent/:paymentIntentId',
  authenticate,
  paymentController.getPaymentIntentStatus
);

/**
 * @route   POST /api/payments/refund
 * @desc    Process refund for an order
 * @access  Private
 */
router.post(
  '/refund',
  authenticate,
  [
    body('orderId')
      .notEmpty()
      .withMessage('Order ID is required')
      .isInt()
      .withMessage('Order ID must be an integer'),
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
  ],
  paymentController.refundPayment
);

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (verified by Stripe signature)
 * @note    This route should use raw body parser, not JSON
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

module.exports = router;
