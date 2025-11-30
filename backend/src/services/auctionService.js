const { query } = require('../config/database');

// In-memory auction state (in production, use Redis or database)
const auctionStates = new Map();

// Lazy-load io to avoid circular dependency
let io;
const getIO = () => {
  if (!io) {
    io = require('../../server').io;
  }
  return io;
};

// Constants
const SOFT_CLOSE_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds
const LAST_CALL_WINDOW = 10 * 1000; // 10 seconds in milliseconds

/**
 * Initialize an auction
 */
const initializeAuction = async (auctionId, startingPrice, duration) => {
  const endTime = Date.now() + duration;

  auctionStates.set(auctionId, {
    auctionId,
    currentPrice: startingPrice,
    highestBidder: null,
    endTime,
    originalEndTime: endTime,
    isLastCallActive: false,
    lastCallStartTime: null,
    isClosed: false,
    bids: []
  });

  // Store in database
  await query(
    `INSERT INTO auctions (id, starting_price, current_price, end_time, status)
     VALUES (?, ?, ?, FROM_UNIXTIME(?), 'active')
     ON DUPLICATE KEY UPDATE
     starting_price = VALUES(starting_price),
     current_price = VALUES(current_price),
     end_time = VALUES(end_time),
     status = VALUES(status)`,
    [auctionId, startingPrice, startingPrice, Math.floor(endTime / 1000)]
  );

  // Start monitoring for end time
  scheduleAuctionEnd(auctionId);

  return auctionStates.get(auctionId);
};

/**
 * Process incoming bid
 */
const processBid = async (bidData) => {
  const { auctionId, bidAmount, userId, userTier, username } = bidData;

  const auction = auctionStates.get(auctionId);

  if (!auction) {
    throw new Error('Auction not found');
  }

  if (auction.isClosed) {
    throw new Error('Auction has ended');
  }

  const now = Date.now();

  // Check if we're in Last Call period
  if (auction.isLastCallActive) {
    const lastCallElapsed = now - auction.lastCallStartTime;

    // Last Call period expired
    if (lastCallElapsed > LAST_CALL_WINDOW) {
      await closeAuction(auctionId);
      throw new Error('Auction has ended');
    }

    // Only Premium users can bid during Last Call
    if (userTier !== 'premium' && userTier !== 'Premium') {
      throw new Error('Only Premium users can bid during Last Call period');
    }
  }

  // Validate bid amount
  if (bidAmount <= auction.currentPrice) {
    throw new Error(`Bid must be higher than current price of ₱${auction.currentPrice}`);
  }

  // Check if auction time has expired (but not in Last Call)
  if (now >= auction.endTime && !auction.isLastCallActive) {
    // Start Last Call period
    await startLastCall(auctionId);

    // If user is not Premium, reject
    if (userTier !== 'premium' && userTier !== 'Premium') {
      throw new Error('Auction has ended. Only Premium users have Last Call access');
    }
  }

  // Check for soft close extension
  const timeUntilEnd = auction.endTime - now;
  if (timeUntilEnd > 0 && timeUntilEnd < SOFT_CLOSE_WINDOW && !auction.isLastCallActive) {
    // Extend auction by 5 minutes from now
    auction.endTime = now + SOFT_CLOSE_WINDOW;

    // Update database
    await query(
      'UPDATE auctions SET end_time = FROM_UNIXTIME(?) WHERE id = ?',
      [Math.floor(auction.endTime / 1000), auctionId]
    );

    // Emit time extension event
    emitAuctionUpdate(auctionId, {
      type: 'TIME_EXTENDED',
      newEndTime: auction.endTime,
      message: 'Auction extended by 5 minutes due to late bid'
    });
  }

  // Place the bid
  auction.currentPrice = bidAmount;
  auction.highestBidder = { userId, username, userTier };
  auction.bids.push({
    userId,
    username,
    bidAmount,
    userTier,
    timestamp: now,
    duringLastCall: auction.isLastCallActive
  });

  // Save bid to database
  await query(
    `INSERT INTO auction_bids (auction_id, user_id, bid_amount, user_tier, placed_at, during_last_call)
     VALUES (?, ?, ?, ?, FROM_UNIXTIME(?), ?)`,
    [auctionId, userId, bidAmount, userTier, Math.floor(now / 1000), auction.isLastCallActive]
  );

  // Update current price in database
  await query(
    'UPDATE auctions SET current_price = ?, highest_bidder_id = ? WHERE id = ?',
    [bidAmount, userId, auctionId]
  );

  // If bid was placed during Last Call, close auction immediately
  if (auction.isLastCallActive) {
    await closeAuction(auctionId);
  }

  // Emit bid update
  emitAuctionUpdate(auctionId, {
    type: 'NEW_BID',
    currentPrice: auction.currentPrice,
    highestBidder: auction.highestBidder,
    endTime: auction.endTime,
    isLastCallActive: auction.isLastCallActive
  });

  return {
    success: true,
    auction: getAuctionState(auctionId)
  };
};

/**
 * Start Last Call period (10-second Premium-only window)
 */
const startLastCall = async (auctionId) => {
  const auction = auctionStates.get(auctionId);

  if (!auction || auction.isLastCallActive) {
    return;
  }

  auction.isLastCallActive = true;
  auction.lastCallStartTime = Date.now();

  console.log(`🔔 Last Call started for auction ${auctionId}`);

  // Emit Last Call notification
  emitAuctionUpdate(auctionId, {
    type: 'LAST_CALL_STARTED',
    lastCallStartTime: auction.lastCallStartTime,
    message: 'Last Call! Premium users have 10 seconds to place final bids'
  });

  // Schedule automatic close after 10 seconds
  setTimeout(async () => {
    const currentAuction = auctionStates.get(auctionId);
    if (currentAuction && currentAuction.isLastCallActive && !currentAuction.isClosed) {
      await closeAuction(auctionId);
    }
  }, LAST_CALL_WINDOW);
};

/**
 * Close auction and declare winner
 */
const closeAuction = async (auctionId) => {
  const auction = auctionStates.get(auctionId);

  if (!auction || auction.isClosed) {
    return;
  }

  auction.isClosed = true;

  console.log(`✅ Auction ${auctionId} closed. Winner: ${auction.highestBidder?.username || 'No bids'}`);

  // Update database
  await query(
    `UPDATE auctions
     SET status = 'closed',
         winner_id = ?,
         final_price = ?,
         closed_at = NOW()
     WHERE id = ?`,
    [auction.highestBidder?.userId || null, auction.currentPrice, auctionId]
  );

  // Emit close event
  emitAuctionUpdate(auctionId, {
    type: 'AUCTION_CLOSED',
    winner: auction.highestBidder,
    finalPrice: auction.currentPrice,
    totalBids: auction.bids.length
  });

  // Clean up after 1 minute
  setTimeout(() => {
    auctionStates.delete(auctionId);
  }, 60000);
};

/**
 * Schedule auction end monitoring
 */
const scheduleAuctionEnd = (auctionId) => {
  const auction = auctionStates.get(auctionId);

  if (!auction) {
    return;
  }

  const timeUntilEnd = auction.endTime - Date.now();

  if (timeUntilEnd > 0) {
    setTimeout(async () => {
      const currentAuction = auctionStates.get(auctionId);

      if (!currentAuction || currentAuction.isClosed) {
        return;
      }

      // Start Last Call period
      if (!currentAuction.isLastCallActive) {
        await startLastCall(auctionId);
      }
    }, timeUntilEnd);
  }
};

/**
 * Get current auction state
 */
const getAuctionState = (auctionId) => {
  const auction = auctionStates.get(auctionId);

  if (!auction) {
    return null;
  }

  const now = Date.now();
  const timeRemaining = Math.max(0, auction.endTime - now);

  let lastCallTimeRemaining = 0;
  if (auction.isLastCallActive && auction.lastCallStartTime) {
    lastCallTimeRemaining = Math.max(0, LAST_CALL_WINDOW - (now - auction.lastCallStartTime));
  }

  return {
    auctionId: auction.auctionId,
    currentPrice: auction.currentPrice,
    highestBidder: auction.highestBidder,
    endTime: auction.endTime,
    timeRemaining,
    isLastCallActive: auction.isLastCallActive,
    lastCallTimeRemaining,
    isClosed: auction.isClosed,
    bidCount: auction.bids.length
  };
};

/**
 * Emit auction update via WebSocket
 */
const emitAuctionUpdate = (auctionId, data) => {
  try {
    const io = getIO();
    if (io) {
      io.of('/auction').to(`auction-${auctionId}`).emit('auction-update', {
        auctionId,
        timestamp: Date.now(),
        ...data
      });
    }
  } catch (err) {
    console.error('Failed to emit auction update:', err.message);
  }
};

/**
 * Get all active auctions
 */
const getActiveAuctions = async () => {
  const result = await query(
    `SELECT a.*, u.username as winner_username
     FROM auctions a
     LEFT JOIN users u ON a.winner_id = u.id
     WHERE a.status = 'active'
     ORDER BY a.end_time ASC`
  );

  return result.rows;
};

module.exports = {
  initializeAuction,
  processBid,
  startLastCall,
  closeAuction,
  getAuctionState,
  getActiveAuctions,
  SOFT_CLOSE_WINDOW,
  LAST_CALL_WINDOW
};
