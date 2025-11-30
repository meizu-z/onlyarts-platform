const express = require('express');
const { body } = require('express-validator');
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

/**
 * @route   GET /api/subscriptions/plans
 * @desc    Get available subscription plans
 * @access  Public
 */
router.get('/plans', subscriptionController.getPlans);

/**
 * @route   POST /api/subscriptions/upgrade
 * @desc    Upgrade subscription
 * @access  Private
 */
router.post(
  '/upgrade',
  authenticate,
  [
    body('plan')
      .notEmpty()
      .withMessage('Plan is required')
      .isIn(['free', 'basic', 'premium'])
      .withMessage('Invalid plan'),
    body('paymentMethodId')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Invalid payment method ID'),
  ],
  subscriptionController.upgradeSubscription
);

/**
 * @route   POST /api/subscriptions/cancel
 * @desc    Cancel subscription
 * @access  Private
 */
router.post('/cancel', authenticate, subscriptionController.cancelSubscription);

/**
 * @route   GET /api/subscriptions/history
 * @desc    Get subscription history
 * @access  Private
 */
router.get('/history', authenticate, subscriptionController.getSubscriptionHistory);

module.exports = router;
