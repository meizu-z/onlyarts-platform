-- ============================================
-- AUCTION SYSTEM DATABASE MIGRATION
-- ============================================
-- Creates tables for auction bidding system with Premium Last-Call feature
-- Author: OnlyArts Platform
-- Date: 2025-01-26
-- ============================================

-- Drop existing tables if needed (CAUTION: Only for development)
-- DROP TABLE IF EXISTS auction_bids;
-- DROP TABLE IF EXISTS auctions;

-- ============================================
-- TABLE: auctions
-- ============================================
-- Stores auction information and state
CREATE TABLE IF NOT EXISTS auctions (
  id VARCHAR(255) PRIMARY KEY COMMENT 'Unique auction identifier (e.g., AUC-timestamp-random)',
  artwork_id INT COMMENT 'Foreign key to artworks table',
  starting_price DECIMAL(10, 2) NOT NULL COMMENT 'Initial auction price in PHP',
  current_price DECIMAL(10, 2) NOT NULL COMMENT 'Current highest bid amount',
  highest_bidder_id INT COMMENT 'User ID of current highest bidder',
  end_time DATETIME NOT NULL COMMENT 'Scheduled end time (can be extended)',
  status ENUM('active', 'closed') DEFAULT 'active' COMMENT 'Auction status',
  winner_id INT COMMENT 'User ID of final winner (set when closed)',
  final_price DECIMAL(10, 2) COMMENT 'Final winning bid amount',
  closed_at DATETIME COMMENT 'Actual closing timestamp',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (highest_bidder_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,

  -- Indexes for performance
  INDEX idx_status (status),
  INDEX idx_end_time (end_time),
  INDEX idx_artwork (artwork_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: auction_bids
-- ============================================
-- Stores all bid history for auctions
CREATE TABLE IF NOT EXISTS auction_bids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auction_id VARCHAR(255) NOT NULL COMMENT 'Reference to auction',
  user_id INT NOT NULL COMMENT 'User who placed the bid',
  bid_amount DECIMAL(10, 2) NOT NULL COMMENT 'Bid amount in PHP',
  user_tier VARCHAR(50) DEFAULT 'free' COMMENT 'User subscription tier at bid time',
  placed_at DATETIME NOT NULL COMMENT 'Timestamp when bid was placed',
  during_last_call BOOLEAN DEFAULT FALSE COMMENT 'Was bid placed during 10-second Last Call window',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  -- Indexes for performance
  INDEX idx_auction (auction_id),
  INDEX idx_user (user_id),
  INDEX idx_placed_at (placed_at),
  INDEX idx_last_call (during_last_call)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample auction
/*
INSERT INTO auctions (id, artwork_id, starting_price, current_price, end_time, status)
VALUES (
  'AUC-SAMPLE-001',
  1,  -- Replace with actual artwork ID
  5000.00,
  5000.00,
  DATE_ADD(NOW(), INTERVAL 15 MINUTE),
  'active'
);
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created successfully
SELECT
  TABLE_NAME,
  ENGINE,
  TABLE_ROWS,
  CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('auctions', 'auction_bids');

-- View table structures
DESCRIBE auctions;
DESCRIBE auction_bids;

-- ============================================
-- USEFUL QUERIES FOR MONITORING
-- ============================================

-- Get all active auctions
-- SELECT * FROM auctions WHERE status = 'active' ORDER BY end_time ASC;

-- Get bid history for an auction
-- SELECT
--   ab.*,
--   u.username,
--   u.subscription_tier
-- FROM auction_bids ab
-- JOIN users u ON ab.user_id = u.id
-- WHERE ab.auction_id = 'YOUR_AUCTION_ID'
-- ORDER BY ab.placed_at DESC;

-- Get Premium user bid statistics
-- SELECT
--   COUNT(*) as total_premium_bids,
--   COUNT(CASE WHEN during_last_call = TRUE THEN 1 END) as last_call_bids
-- FROM auction_bids
-- WHERE user_tier = 'premium';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
