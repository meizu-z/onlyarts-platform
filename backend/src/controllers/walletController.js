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

  // For now, return empty transactions
  // In production, you would have a transactions table
  const transactions = [];
  const total = 0;

  successResponse(res, {
    transactions,
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
 * @desc    Add funds to wallet
 * @access  Private
 */
exports.addFunds = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  // Update wallet balance
  await query(
    'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
    [amount, req.user.id]
  );

  // Get updated balance
  const result = await query(
    'SELECT wallet_balance FROM users WHERE id = ?',
    [req.user.id]
  );

  successResponse(res, {
    balance: parseFloat(result.rows[0].wallet_balance),
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
