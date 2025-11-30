const auctionService = require('../services/auctionService');

/**
 * Auction WebSocket Handler
 * Manages real-time bidding and auction updates
 */
module.exports = (io) => {
  // Create auction namespace
  const auctionNamespace = io.of('/auction');

  auctionNamespace.on('connection', (socket) => {
    console.log(`🎨 Auction client connected: ${socket.id}`);

    /**
     * Join auction room
     */
    socket.on('join-auction', (auctionId) => {
      const room = `auction-${auctionId}`;
      socket.join(room);

      console.log(`👤 Socket ${socket.id} joined auction: ${auctionId}`);

      // Send current auction state
      const auctionState = auctionService.getAuctionState(auctionId);

      if (auctionState) {
        socket.emit('auction-state', auctionState);
      }

      // Notify room about new participant
      socket.to(room).emit('participant-joined', {
        timestamp: Date.now()
      });
    });

    /**
     * Leave auction room
     */
    socket.on('leave-auction', (auctionId) => {
      const room = `auction-${auctionId}`;
      socket.leave(room);

      console.log(`👋 Socket ${socket.id} left auction: ${auctionId}`);

      // Notify room about participant leaving
      socket.to(room).emit('participant-left', {
        timestamp: Date.now()
      });
    });

    /**
     * Request current auction state
     */
    socket.on('request-auction-state', (auctionId) => {
      const auctionState = auctionService.getAuctionState(auctionId);

      if (auctionState) {
        socket.emit('auction-state', auctionState);
      } else {
        socket.emit('auction-error', {
          message: 'Auction not found or has ended'
        });
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`❌ Auction client disconnected: ${socket.id}`);
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error(`⚠️ Auction socket error from ${socket.id}:`, error);
    });
  });

  // Export for use in auctionService
  return auctionNamespace;
};
