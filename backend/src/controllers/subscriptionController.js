const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * @route   GET /api/subscriptions/plans
 * @desc    Get available subscription plans
 * @access  Public
 */
exports.getPlans = asyncHandler(async (req, res, next) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: {
        fan: [
          'Browse artworks',
          'Follow artists',
          'Like artworks',
          'Basic profile',
        ],
        artist: [
          'Upload up to 10 artworks',
          'Basic analytics',
          'Standard visibility',
        ],
      },
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 149,
      interval: 'month',
      features: {
        fan: [
          'Everything in Free',
          'Comment on artworks',
          'Save favorites',
          'Early access to exhibitions',
        ],
        artist: [
          'Upload up to 50 artworks',
          'Advanced analytics',
          'Priority support',
          'Commission requests',
        ],
      },
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 249,
      interval: 'month',
      features: {
        fan: [
          'Everything in Basic',
          'Exclusive content access',
          'VIP badge',
          'Premium exhibitions',
        ],
        artist: [
          'Unlimited artworks',
          'Premium analytics',
          'Livestream capabilities',
          'Priority placement',
        ],
      },
    },
  ];

  successResponse(res, plans, 'Subscription plans retrieved');
});

/**
 * @route   POST /api/subscriptions/upgrade
 * @desc    Upgrade subscription tier
 * @access  Private
 */
exports.upgradeSubscription = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { plan, paymentMethodId } = req.body;

  const validPlans = ['free', 'plus', 'premium'];
  if (!validPlans.includes(plan)) {
    return next(new AppError('Invalid subscription plan', 400));
  }

  // Get current subscription
  const userResult = await query('SELECT subscription_tier FROM users WHERE id = ?', [userId]);
  const currentPlan = userResult.rows[0].subscription_tier;

  // Can't downgrade to free or same plan
  const planHierarchy = { free: 0, plus: 1, premium: 2 };
  if (planHierarchy[plan] <= planHierarchy[currentPlan]) {
    return next(new AppError('Invalid subscription change', 400));
  }

  // For paid plans, payment method is required
  if (plan !== 'free' && !paymentMethodId) {
    return next(new AppError('Payment method required for paid plans', 400));
  }

  // TODO: Process payment with Stripe
  // For now, just update the tier

  await query(
    'UPDATE users SET subscription_tier = ?, updated_at = NOW() WHERE id = ?',
    [plan, userId]
  );

  // Log subscription change
  await query(
    `INSERT INTO subscription_history (user_id, from_tier, to_tier, amount, payment_method_id)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, currentPlan, plan, plan === 'plus' ? 499 : 999, paymentMethodId || null]
  );

  // Create notification
  await query(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES (?, 'subscription', 'Subscription Upgraded', ?)`,
    [userId, `Your subscription has been upgraded to ${plan.toUpperCase()}!`]
  );

  successResponse(res, {
    subscription_tier: plan,
  }, 'Subscription upgraded successfully');
});

/**
 * @route   POST /api/subscriptions/cancel
 * @desc    Cancel subscription (downgrade to free)
 * @access  Private
 */
exports.cancelSubscription = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Get current subscription
  const userResult = await query('SELECT subscription_tier FROM users WHERE id = ?', [userId]);
  const currentPlan = userResult.rows[0].subscription_tier;

  if (currentPlan === 'free') {
    return next(new AppError('Already on free plan', 400));
  }

  await query(
    'UPDATE users SET subscription_tier = ?, updated_at = NOW() WHERE id = ?',
    ['free', userId]
  );

  // Log subscription change
  await query(
    `INSERT INTO subscription_history (user_id, from_tier, to_tier, amount)
     VALUES (?, ?, 'free', 0)`,
    [userId, currentPlan]
  );

  // Create notification
  await query(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES (?, 'subscription', 'Subscription Cancelled', 'Your subscription has been cancelled.')`,
    [userId]
  );

  successResponse(res, {
    subscription_tier: 'free',
  }, 'Subscription cancelled successfully');
});

/**
 * @route   GET /api/subscriptions/history
 * @desc    Get subscription history
 * @access  Private
 */
exports.getSubscriptionHistory = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT id, from_tier, to_tier, amount, payment_method_id, created_at
     FROM subscription_history
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  successResponse(res, result.rows, 'Subscription history retrieved');
});

module.exports = exports;
