const express = require('express');
const { body, query } = require('express-validator');
const auctionController = require('../controllers/auctionController');
const { authenticate, requireRole } = require('../middleware/authenticate');

const router = express.Router();

/**
 * @route   GET /api/auctions
 * @desc    Get all active auctions
 * @access  Public
 */
router.get('/', auctionController.getAllAuctions);

/**
 * @route   GET /api/auctions/:id
 * @desc    Get auction details
 * @access  Public
 */
router.get('/:id', auctionController.getAuction);

/**
 * @route   POST /api/auctions
 * @desc    Create a new auction
 * @access  Private (Artists only)
 */
router.post(
  '/',
  authenticate,
  requireRole('artist', 'admin'),
  [
    body('artworkId')
      .notEmpty()
      .withMessage('Artwork ID is required'),
    body('startingPrice')
      .isFloat({ min: 0 })
      .withMessage('Starting price must be a positive number'),
    body('duration')
      .isInt({ min: 60000 }) // Minimum 1 minute
      .withMessage('Duration must be at least 1 minute'),
  ],
  auctionController.createAuction
);

/**
 * @route   POST /api/auctions/:id/bid
 * @desc    Place a bid on an auction
 * @access  Private
 */
router.post(
  '/:id/bid',
  authenticate,
  [
    body('bidAmount')
      .isFloat({ min: 0 })
      .withMessage('Bid amount must be a positive number'),
  ],
  auctionController.placeBid
);

/**
 * @route   GET /api/auctions/:id/bids
 * @desc    Get bid history for an auction
 * @access  Public
 */
router.get('/:id/bids', auctionController.getBidHistory);

module.exports = router;
