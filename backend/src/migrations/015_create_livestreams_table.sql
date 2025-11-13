-- Migration: Create livestreams table
-- Description: Stores livestream sessions

CREATE TABLE IF NOT EXISTS livestreams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artist_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  stream_key VARCHAR(255) UNIQUE,
  status ENUM('scheduled', 'live', 'ended', 'cancelled') DEFAULT 'scheduled',
  viewer_count INT DEFAULT 0,
  peak_viewer_count INT DEFAULT 0,
  scheduled_start_at DATETIME,
  started_at TIMESTAMP NULL,
  ended_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_artist_id (artist_id),
  INDEX idx_status (status),
  INDEX idx_scheduled_start_at (scheduled_start_at),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
