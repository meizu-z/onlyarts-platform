-- Migration: Create conversations table
-- Description: Stores chat conversations between users

CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participant_one_id INT NOT NULL,
  participant_two_id INT NOT NULL,
  last_message_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (participant_one_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_two_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_conversation (participant_one_id, participant_two_id),
  INDEX idx_participant_one (participant_one_id),
  INDEX idx_participant_two (participant_two_id),
  INDEX idx_last_message_at (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
