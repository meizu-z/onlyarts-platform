const express = require('express');
const { body, query } = require('express-validator');
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

/**
 * @route   GET /api/wallet/balance
 * @desc    Get wallet balance
 * @access  Private
 */
router.get('/balance', authenticate, walletController.getBalance);

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get transaction history
 * @access  Private
 */
router.get(
  '/transactions',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  walletController.getTransactions
);

/**
 * @route   POST /api/wallet/add-funds
 * @desc    Add funds to wallet
 * @access  Private
 */
router.post(
  '/add-funds',
  authenticate,
  [
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  ],
  walletController.addFunds
);

/**
 * @route   POST /api/wallet/withdraw
 * @desc    Withdraw funds from wallet
 * @access  Private
 */
router.post(
  '/withdraw',
  authenticate,
  [
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  ],
  walletController.withdraw
);

module.exports = router;
