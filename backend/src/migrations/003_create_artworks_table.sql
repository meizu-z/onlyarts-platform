-- Migration: Create artworks table
-- Description: Stores artwork listings created by artists

CREATE TABLE IF NOT EXISTS artworks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artist_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category ENUM('painting', 'sculpture', 'photography', 'digital', 'mixed_media', 'other') NOT NULL,
  medium VARCHAR(100),
  dimensions VARCHAR(100),
  year_created INT,
  is_original BOOLEAN DEFAULT TRUE,
  is_for_sale BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  status ENUM('draft', 'published', 'sold', 'archived') DEFAULT 'draft',
  stock_quantity INT DEFAULT 1,
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_artist_id (artist_id),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_price (price),
  INDEX idx_created_at (created_at),
  INDEX idx_is_for_sale (is_for_sale),
  FULLTEXT idx_title_description (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
