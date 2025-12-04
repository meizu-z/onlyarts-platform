const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const auctionService = require('../services/auctionService');
const { query } = require('../config/database');

/**
 * @route   POST /api/auctions/:id/bid
 * @desc    Place a bid on an auction
 * @access  Private
 */
exports.placeBid = asyncHandler(async (req, res, next) => {
  const { id: auctionId } = req.params;
  const { bidAmount } = req.body;
  const userId = req.user.id;
  const username = req.user.username;
  const userTier = req.user.subscription_tier || 'free';

  // Check subscription tier - only Basic and Premium can bid in auctions
  if (userTier === 'free') {
    return next(new AppError('Upgrade to BASIC or PREMIUM plan to bid in auctions', 403));
  }

  // Validate bid amount
  if (!bidAmount || bidAmount <= 0) {
    return next(new AppError('Invalid bid amount', 400));
  }

  try {
    const result = await auctionService.processBid({
      auctionId,
      bidAmount,
      userId,
      username,
      userTier
    });

    successResponse(res, result.auction, 'Bid placed successfully');
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

/**
 * @route   GET /api/auctions/:id
 * @desc    Get auction details
 * @access  Public
 */
exports.getAuction = asyncHandler(async (req, res, next) => {
  const { id: auctionId } = req.params;

  // Get from service (in-memory state)
  let auctionState = auctionService.getAuctionState(auctionId);

  // If not in memory, fetch from database
  if (!auctionState) {
    const result = await query(
      `SELECT a.*,
              u.username as highest_bidder_username,
              aw.title as artwork_title,
              aw.image_url as artwork_image
       FROM auctions a
       LEFT JOIN users u ON a.highest_bidder_id = u.id
       LEFT JOIN artworks aw ON a.artwork_id = aw.id
       WHERE a.id = ?`,
      [auctionId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Auction not found', 404));
    }

    const auction = result.rows[0];
    auctionState = {
      auctionId: auction.id,
      currentPrice: auction.current_price,
      highestBidder: auction.highest_bidder_id ? {
        userId: auction.highest_bidder_id,
        username: auction.highest_bidder_username
      } : null,
      endTime: new Date(auction.end_time).getTime(),
      timeRemaining: Math.max(0, new Date(auction.end_time).getTime() - Date.now()),
      isLastCallActive: false,
      lastCallTimeRemaining: 0,
      isClosed: auction.status === 'closed',
      artworkTitle: auction.artwork_title,
      artworkImage: auction.artwork_image,
      startingPrice: auction.starting_price
    };
  }

  successResponse(res, auctionState, 'Auction details retrieved');
});

/**
 * @route   GET /api/auctions
 * @desc    Get all active auctions
 * @access  Public
 */
exports.getAllAuctions = asyncHandler(async (req, res, next) => {
  const result = await query(
    `SELECT a.*,
            u.username as highest_bidder_username,
            aw.title as artwork_title,
            aw.image_url as artwork_image,
            ar.username as artist_username
     FROM auctions a
     LEFT JOIN users u ON a.highest_bidder_id = u.id
     LEFT JOIN artworks aw ON a.artwork_id = aw.id
     LEFT JOIN users ar ON aw.user_id = ar.id
     WHERE a.status = 'active'
     ORDER BY a.end_time ASC`
  );

  const auctions = result.rows.map(auction => {
    // Check if auction is in memory (active)
    const liveState = auctionService.getAuctionState(auction.id);

    if (liveState) {
      return {
        ...liveState,
        artworkTitle: auction.artwork_title,
        artworkImage: auction.artwork_image,
        artistUsername: auction.artist_username,
        startingPrice: auction.starting_price
      };
    }

    // Return database state
    return {
      auctionId: auction.id,
      currentPrice: auction.current_price,
      highestBidder: auction.highest_bidder_id ? {
        userId: auction.highest_bidder_id,
        username: auction.highest_bidder_username
      } : null,
      endTime: new Date(auction.end_time).getTime(),
      timeRemaining: Math.max(0, new Date(auction.end_time).getTime() - Date.now()),
      isLastCallActive: false,
      isClosed: false,
      artworkTitle: auction.artwork_title,
      artworkImage: auction.artwork_image,
      artistUsername: auction.artist_username,
      startingPrice: auction.starting_price
    };
  });

  successResponse(res, auctions, 'Active auctions retrieved');
});

/**
 * @route   POST /api/auctions
 * @desc    Create a new auction
 * @access  Private (Artists only)
 */
exports.createAuction = asyncHandler(async (req, res, next) => {
  const { artworkId, startingPrice, duration } = req.body;
  const userId = req.user.id;

  // Validate artwork ownership
  const artworkResult = await query(
    'SELECT * FROM artworks WHERE id = ? AND artist_id = ?',
    [artworkId, userId]
  );

  if (artworkResult.rows.length === 0) {
    return next(new AppError('Artwork not found or you do not have permission', 404));
  }

  // Generate auction ID
  const auctionId = `AUC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Initialize auction in service
  const auction = await auctionService.initializeAuction(
    auctionId,
    startingPrice,
    duration
  );

  // Update with artwork ID
  await query(
    'UPDATE auctions SET artwork_id = ? WHERE id = ?',
    [artworkId, auctionId]
  );

  successResponse(res, { auctionId, ...auction }, 'Auction created successfully', 201);
});

/**
 * @route   GET /api/auctions/:id/bids
 * @desc    Get bid history for an auction
 * @access  Public
 */
exports.getBidHistory = asyncHandler(async (req, res, next) => {
  const { id: auctionId } = req.params;

  const result = await query(
    `SELECT ab.*, u.username, u.profile_image
     FROM auction_bids ab
     JOIN users u ON ab.user_id = u.id
     WHERE ab.auction_id = ?
     ORDER BY ab.placed_at DESC
     LIMIT 50`,
    [auctionId]
  );

  successResponse(res, result.rows, 'Bid history retrieved');
});

module.exports = exports;
