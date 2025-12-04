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
          'Browse artworks and exhibitions',
          'Follow artists',
          'Like artworks',
          'Basic profile',
        ],
        artist: [
          'Upload up to 10 artworks',
          'Basic analytics (profile views only)',
          'Standard visibility',
          'No livestream access',
          'No exhibition hosting',
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
          'Bidding access in auctions',
          'Early access to exhibitions',
        ],
        artist: [
          'Upload up to 50 artworks',
          'Advanced analytics (engagement metrics, top fans, revenue breakdown)',
          'Host solo exhibitions (up to 20 artworks)',
          'Livestream capabilities',
          'Commission requests',
          'Priority support',
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
          'VIP badge on profile',
          'Priority bidding in auctions with last-call feature',
          'Exclusive VIP exhibitions & showcases',
          'Exclusive collectibles (NFTs, badges)',
          '1-on-1 consultation with selected artists',
        ],
        artist: [
          'Unlimited artworks',
          'Premium analytics (demographics, behavior patterns, sales forecasts, AI insights)',
          'Host solo exhibitions (up to 50 artworks)',
          'Collaborative exhibitions',
          'Premium placement on Explore page',
          'Advanced livestream features',
          '1-on-1 consultation bookings',
          'Event collaborations with Premium creators',
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
  const { plan, paymentMethod, billingCycle } = req.body;

  // Normalize plan name to lowercase first
  const targetPlan = plan?.toLowerCase() || 'free';

  const validPlans = ['free', 'basic', 'premium'];
  if (!validPlans.includes(targetPlan)) {
    return next(new AppError('Invalid subscription plan', 400));
  }

  // Get current subscription and wallet balance
  const userResult = await query('SELECT subscription_tier, wallet_balance FROM users WHERE id = ?', [userId]);
  const currentPlan = userResult.rows[0].subscription_tier?.toLowerCase() || 'free';
  const walletBalance = parseFloat(userResult.rows[0].wallet_balance) || 0;

  // Can't downgrade to free or stay on same plan
  const planHierarchy = { free: 0, basic: 1, premium: 2 };
  if (planHierarchy[targetPlan] < planHierarchy[currentPlan]) {
    return next(new AppError(`Cannot downgrade from ${currentPlan.toUpperCase()} to ${targetPlan.toUpperCase()}`, 400));
  }

  if (targetPlan === currentPlan) {
    return next(new AppError(`You are already on the ${currentPlan.toUpperCase()} plan`, 400));
  }

  // Calculate subscription amount
  const monthlyPrices = { free: 0, basic: 149, premium: 249 };
  const monthlyPrice = monthlyPrices[targetPlan];
  const isYearly = billingCycle === 'yearly';
  const subscriptionAmount = isYearly ? Math.round(monthlyPrice * 12 * 0.8) : monthlyPrice;

  // For paid plans, payment is required
  if (targetPlan !== 'free' && !paymentMethod) {
    return next(new AppError('Payment method required for paid plans', 400));
  }

  // Handle wallet payment
  if (paymentMethod === 'wallet') {
    if (walletBalance < subscriptionAmount) {
      return next(new AppError('Insufficient wallet balance', 400));
    }

    // Deduct from wallet
    await query(
      'UPDATE users SET wallet_balance = wallet_balance - ?, subscription_tier = ?, updated_at = NOW() WHERE id = ?',
      [subscriptionAmount, targetPlan, userId]
    );

    // Get new balance
    const newBalanceResult = await query('SELECT wallet_balance FROM users WHERE id = ?', [userId]);
    const newBalance = parseFloat(newBalanceResult.rows[0].wallet_balance) || 0;

    // Record wallet transaction
    await query(
      `INSERT INTO wallet_transactions (user_id, type, amount, description, payment_method, balance_after)
       VALUES (?, 'subscription', ?, ?, 'wallet', ?)`,
      [
        userId,
        -subscriptionAmount,
        `${targetPlan.toUpperCase()} Subscription (${isYearly ? 'Yearly' : 'Monthly'})`,
        newBalance
      ]
    );
  } else {
    // For card payments, just update tier (mock payment processing)
    await query(
      'UPDATE users SET subscription_tier = ?, updated_at = NOW() WHERE id = ?',
      [targetPlan, userId]
    );
  }

  // Log subscription change
  await query(
    `INSERT INTO subscription_history (user_id, from_tier, to_tier, amount, payment_method_id)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, currentPlan, targetPlan, subscriptionAmount, paymentMethod || 'none']
  );

  // Create notification
  await query(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES (?, 'subscription', 'Subscription Upgraded', ?)`,
    [userId, `Your subscription has been upgraded to ${targetPlan.toUpperCase()}!`]
  );

  successResponse(res, {
    subscription_tier: targetPlan,
    amount_paid: subscriptionAmount,
    billing_cycle: billingCycle || 'monthly',
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
