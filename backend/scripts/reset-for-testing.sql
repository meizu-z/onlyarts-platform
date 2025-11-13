-- =====================================================
-- OnlyArts Platform - Database Reset for Testing
-- =====================================================
-- This script clears all demo data and prepares the database for clean testing
-- Run this BEFORE starting QA testing

USE onlyarts;

-- =====================================================
-- STEP 1: Disable Foreign Key Checks (temporarily)
-- =====================================================
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- STEP 2: Clear All Data (Keep Tables)
-- =====================================================

-- Clear user-related data
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE notifications;
TRUNCATE TABLE user_follows;

-- Clear artwork-related data
TRUNCATE TABLE artwork_likes;
TRUNCATE TABLE artwork_comments;
TRUNCATE TABLE artworks;

-- Clear order-related data
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;

-- Clear commission-related data
TRUNCATE TABLE commission_messages;
TRUNCATE TABLE commissions;

-- Clear exhibition-related data
TRUNCATE TABLE exhibition_artworks;
TRUNCATE TABLE exhibition_follows;
TRUNCATE TABLE exhibitions;

-- Clear livestream-related data
TRUNCATE TABLE livestream_bids;
TRUNCATE TABLE livestream_messages;
TRUNCATE TABLE livestreams;

-- Clear subscription-related data
TRUNCATE TABLE subscription_payments;

-- Clear conversation/chat data
TRUNCATE TABLE messages;
TRUNCATE TABLE conversations;

-- Clear activity logs
TRUNCATE TABLE activity_logs;

-- Clear all users (we'll create fresh test accounts)
TRUNCATE TABLE users;

-- =====================================================
-- STEP 3: Re-enable Foreign Key Checks
-- =====================================================
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- STEP 4: Reset Auto-Increment Counters
-- =====================================================
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE artworks AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE commissions AUTO_INCREMENT = 1;
ALTER TABLE exhibitions AUTO_INCREMENT = 1;
ALTER TABLE livestreams AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE conversations AUTO_INCREMENT = 1;
ALTER TABLE messages AUTO_INCREMENT = 1;

-- =====================================================
-- STEP 5: Create Test Accounts
-- =====================================================
-- Note: Password is "Admin123!" hashed with bcrypt (rounds=10)
-- You should hash these properly in your backend or update after registration

-- Admin Account (Free Tier)
INSERT INTO users (username, email, password, full_name, role, subscription, is_active, created_at, updated_at)
VALUES (
  'testadmin',
  'admin@test.com',
  '$2b$10$YourHashedPasswordHere', -- You'll need to replace this with actual hash
  'Test Admin',
  'admin',
  'free',
  true,
  NOW(),
  NOW()
);

-- Free Tier Artist
INSERT INTO users (username, email, password, full_name, role, subscription, is_active, created_at, updated_at)
VALUES (
  'userfree',
  'free@test.com',
  '$2b$10$YourHashedPasswordHere', -- You'll need to replace this with actual hash
  'Free Tier User',
  'artist',
  'free',
  true,
  NOW(),
  NOW()
);

-- Plus Tier Artist
INSERT INTO users (username, email, password, full_name, role, subscription, is_active, created_at, updated_at)
VALUES (
  'userplus',
  'plus@test.com',
  '$2b$10$YourHashedPasswordHere', -- You'll need to replace this with actual hash
  'Plus Tier User',
  'artist',
  'plus',
  true,
  NOW(),
  NOW()
);

-- Premium Tier Artist
INSERT INTO users (username, email, password, full_name, role, subscription, is_active, created_at, updated_at)
VALUES (
  'userpremium',
  'premium@test.com',
  '$2b$10$YourHashedPasswordHere', -- You'll need to replace this with actual hash
  'Premium Tier User',
  'artist',
  'premium',
  true,
  NOW(),
  NOW()
);

-- =====================================================
-- STEP 6: Verify Reset
-- =====================================================
-- Check that only test accounts exist
SELECT
  id,
  username,
  email,
  role,
  subscription,
  is_active,
  created_at
FROM users
ORDER BY id;

-- Check that all other tables are empty
SELECT 'artworks' as table_name, COUNT(*) as count FROM artworks
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'commissions', COUNT(*) FROM commissions
UNION ALL
SELECT 'exhibitions', COUNT(*) FROM exhibitions
UNION ALL
SELECT 'livestreams', COUNT(*) FROM livestreams
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- =====================================================
-- DONE!
-- =====================================================
-- The database is now clean and ready for testing
-- Note: You still need to:
-- 1. Register the 4 test accounts through the UI (to get proper password hashes)
-- 2. Then run the UPDATE commands to set subscriptions and admin role

SELECT 'Database reset complete! Now register your test accounts through the UI.' as status;
