-- Migration: Add is_admin column to users table
-- Date: 2025-01-03
-- Description: Separate admin permissions from user role, allowing admins to also be artists or fans

-- Step 1: Add is_admin column with default FALSE
ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Step 2: Mark existing admin users as admin
-- This updates users who currently have role='admin' to have is_admin=TRUE
UPDATE users SET is_admin = TRUE WHERE role = 'admin';

-- Step 3: Update existing admin users' role to 'artist' (or 'fan' based on their activity)
-- By default, we'll set admins to 'artist' since they likely need artist capabilities
-- You may need to manually adjust specific users if they should be 'fan' instead
UPDATE users SET role = 'artist' WHERE role = 'admin';

-- Step 4: Add index for performance on is_admin lookups
CREATE INDEX idx_users_is_admin ON users(is_admin);

-- Step 5: Add comment to document the column
ALTER TABLE users MODIFY COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE
  COMMENT 'TRUE if user has admin permissions, independent of their role (artist/fan)';

-- Verification queries (run these after migration to verify)
-- SELECT id, username, role, is_admin FROM users WHERE is_admin = TRUE;
-- SELECT COUNT(*) as admin_count FROM users WHERE is_admin = TRUE;

-- Rollback (if needed - uncomment and run to undo this migration)
-- ALTER TABLE users DROP COLUMN is_admin;
-- DROP INDEX idx_users_is_admin ON users;
