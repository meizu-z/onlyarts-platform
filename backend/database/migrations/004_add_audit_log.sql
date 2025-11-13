-- Activity History / Audit Log Table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action_type ENUM('user_role_change', 'user_ban', 'user_unban', 'artwork_feature', 'artwork_unfeature', 'artwork_delete', 'order_view', 'settings_change', 'login', 'other') NOT NULL,
  target_type ENUM('user', 'artwork', 'order', 'system', 'other') NULL,
  target_id INT NULL,
  description TEXT NOT NULL,
  metadata JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admin (admin_id),
  INDEX idx_action_type (action_type),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
