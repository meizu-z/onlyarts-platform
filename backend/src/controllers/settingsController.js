const asyncHandler = require('../utils/asyncHandler');
const { query } = require('../config/database');
const { successResponse } = require('../utils/response');

/**
 * @route   GET /api/settings
 * @desc    Get user settings
 * @access  Private
 */
exports.getSettings = asyncHandler(async (req, res, next) => {
  // Return default settings for now
  const settings = {
    notifications: {
      email: true,
      push: true,
      likes: true,
      comments: true,
      follows: true,
      messages: true,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showActivity: true,
    },
    preferences: {
      language: 'en',
      theme: 'dark',
      currency: 'PHP',
    },
  };

  successResponse(res, settings, 'Settings retrieved');
});

/**
 * @route   PUT /api/settings
 * @desc    Update user settings
 * @access  Private
 */
exports.updateSettings = asyncHandler(async (req, res, next) => {
  const settings = req.body;

  // For now, just return the settings back
  // In production, you would save to database
  successResponse(res, settings, 'Settings updated successfully');
});

/**
 * @route   GET /api/settings/billing
 * @desc    Get billing settings
 * @access  Private
 */
exports.getBilling = asyncHandler(async (req, res, next) => {
  const billing = {
    paymentMethods: [],
    billingAddress: null,
    invoices: [],
  };

  successResponse(res, billing, 'Billing information retrieved');
});

/**
 * @route   PUT /api/settings/billing
 * @desc    Update billing settings
 * @access  Private
 */
exports.updateBilling = asyncHandler(async (req, res, next) => {
  const billing = req.body;

  successResponse(res, billing, 'Billing information updated');
});
