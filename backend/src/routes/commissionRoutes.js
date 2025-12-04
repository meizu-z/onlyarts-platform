const express = require('express');
const { body, query } = require('express-validator');
const commissionController = require('../controllers/commissionController');
const { authenticate, requireRole } = require('../middleware/authenticate');

const router = express.Router();

// All commission routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/commissions
 * @desc    Create commission request
 * @access  Private
 */
router.post(
  '/',
  [
    body('artistId').notEmpty().withMessage('Artist ID is required').isInt().withMessage('Artist ID must be an integer'),
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title too long'),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }).withMessage('Description too long'),
    body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
    body('deadline').optional().isISO8601().withMessage('Invalid deadline date'),
    body('referenceImages').optional().isArray().withMessage('Reference images must be an array'),
  ],
  commissionController.createCommission
);

/**
 * @route   GET /api/commissions
 * @desc    Get user's commissions (as client)
 * @access  Private
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
    query('status').optional().isIn(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  ],
  commissionController.getMyCommissions
);

/**
 * @route   GET /api/commissions/requests
 * @desc    Get commission requests for artist
 * @access  Private (Artists)
 */
router.get(
  '/requests',
  requireRole('artist', 'admin'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
    query('status').optional().isIn(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  ],
  commissionController.getCommissionRequests
);

/**
 * @route   GET /api/commissions/:id
 * @desc    Get commission details
 * @access  Private
 */
router.get('/:id', commissionController.getCommissionById);

/**
 * @route   PUT /api/commissions/:id/status
 * @desc    Update commission status
 * @access  Private
 */
router.put(
  '/:id/status',
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    body('message').optional().trim().isLength({ max: 500 }).withMessage('Message too long'),
  ],
  commissionController.updateCommissionStatus
);

/**
 * @route   POST /api/commissions/:id/messages
 * @desc    Add message to commission
 * @access  Private
 */
router.post(
  '/:id/messages',
  [
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 1000 }).withMessage('Message too long'),
  ],
  commissionController.addCommissionMessage
);

/**
 * @route   GET /api/commissions/:id/messages
 * @desc    Get commission messages
 * @access  Private
 */
router.get('/:id/messages', commissionController.getCommissionMessages);

/**
 * @route   DELETE /api/commissions/:id
 * @desc    Delete/cancel commission request
 * @access  Private
 */
router.delete('/:id', commissionController.deleteCommission);

module.exports = router;
