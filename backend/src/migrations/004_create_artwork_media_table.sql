-- Migration: Create artwork_media table
-- Description: Stores media files (images, videos) associated with artworks

CREATE TABLE IF NOT EXISTS artwork_media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artwork_id INT NOT NULL,
  media_url VARCHAR(500) NOT NULL,
  media_type ENUM('image', 'video') DEFAULT 'image',
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  cloudinary_public_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  INDEX idx_artwork_id (artwork_id),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
