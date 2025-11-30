CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('add_funds', 'subscription', 'purchase', 'withdrawal', 'refund') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255),
  payment_method VARCHAR(50),
  card_last4 VARCHAR(4),
  balance_after DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, created_at DESC)
);
