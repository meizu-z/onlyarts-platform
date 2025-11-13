-- Migration: Create subscriptions table
-- Description: Stores user subscription history

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tier_id INT NOT NULL,
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  starts_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_method VARCHAR(50),
  amount_paid DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tier_id) REFERENCES subscription_tiers(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_tier_id (tier_id),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
