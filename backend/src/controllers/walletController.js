const asyncHandler = require('../utils/asyncHandler');
const { query } = require('../config/database');
const { successResponse } = require('../utils/response');

/**
 * @route   GET /api/wallet/balance
 * @desc    Get user's wallet balance
 * @access  Private
 */
exports.getBalance = asyncHandler(async (req, res, next) => {
  const result = await query(
    'SELECT wallet_balance, total_earnings FROM users WHERE id = ?',
    [req.user.id]
  );

  const balance = {
    balance: parseFloat(result.rows[0]?.wallet_balance || 0),
    totalEarnings: parseFloat(result.rows[0]?.total_earnings || 0),
  };

  successResponse(res, balance, 'Wallet balance retrieved');
});

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get wallet transaction history
 * @access  Private
 */
exports.getTransactions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Get total count
  const countResult = await query(
    'SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = ?',
    [req.user.id]
  );
  const total = countResult.rows[0].total;

  // Get transactions
  const result = await query(
    `SELECT id, type, amount, description, payment_method, card_last4, balance_after, created_at
     FROM wallet_transactions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [req.user.id]
  );

  successResponse(res, {
    transactions: result.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }, 'Transactions retrieved');
});

/**
 * @route   POST /api/wallet/add-funds
 * @desc    Add funds to wallet (mock payment - accepts any card details)
 * @access  Private
 */
exports.addFunds = asyncHandler(async (req, res, next) => {
  const { amount, cardNumber, cardName, expiryDate, cvv } = req.body;

  // Mock payment processing - no validation, accept any card
  // In production, you would integrate with Stripe/PayPal/PayMongo
  const cardLast4 = cardNumber ? cardNumber.slice(-4) : '****';

  // Update wallet balance
  await query(
    'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
    [amount, req.user.id]
  );

  // Get updated balance
  const balanceResult = await query(
    'SELECT wallet_balance FROM users WHERE id = ?',
    [req.user.id]
  );

  const newBalance = parseFloat(balanceResult.rows[0].wallet_balance);

  // Record transaction
  await query(
    `INSERT INTO wallet_transactions (user_id, type, amount, description, payment_method, card_last4, balance_after)
     VALUES (?, 'add_funds', ?, ?, 'card', ?, ?)`,
    [
      req.user.id,
      amount,
      `Added ₱${amount.toLocaleString()} via Card ending in ${cardLast4}`,
      cardLast4,
      newBalance
    ]
  );

  successResponse(res, {
    balance: newBalance,
    transaction: {
      type: 'add_funds',
      amount,
      cardLast4,
      balanceAfter: newBalance
    }
  }, 'Funds added successfully');
});

/**
 * @route   POST /api/wallet/withdraw
 * @desc    Withdraw funds from wallet
 * @access  Private
 */
exports.withdraw = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  // Update wallet balance
  await query(
    'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
    [amount, req.user.id]
  );

  // Get updated balance
  const result = await query(
    'SELECT wallet_balance FROM users WHERE id = ?',
    [req.user.id]
  );

  successResponse(res, {
    balance: parseFloat(result.rows[0].wallet_balance),
  }, 'Withdrawal successful');
});
