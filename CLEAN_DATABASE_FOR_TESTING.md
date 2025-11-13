# Clean Database for Testing

## ⚠️ WARNING: This will DELETE ALL DATA!

This guide will help you reset the database to a clean state for testing.

---

## 🎯 Why Clean the Database?

**Benefits:**
- ✅ No demo/fake data cluttering results
- ✅ Accurate counts (0 artworks, 0 orders at start)
- ✅ Easier to track what YOU created
- ✅ Admin stats show real numbers
- ✅ Cleaner testing experience

---

## 📋 Option 1: Quick Clean (Recommended)

Run this SQL script to clear everything:

```sql
USE onlyarts;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all data (keeps table structure)
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE notifications;
TRUNCATE TABLE user_follows;
TRUNCATE TABLE artwork_likes;
TRUNCATE TABLE artwork_comments;
TRUNCATE TABLE artworks;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE commission_messages;
TRUNCATE TABLE commissions;
TRUNCATE TABLE exhibition_artworks;
TRUNCATE TABLE exhibition_follows;
TRUNCATE TABLE exhibitions;
TRUNCATE TABLE livestream_bids;
TRUNCATE TABLE livestream_messages;
TRUNCATE TABLE livestreams;
TRUNCATE TABLE subscription_payments;
TRUNCATE TABLE messages;
TRUNCATE TABLE conversations;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify it's clean
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'artworks', COUNT(*) FROM artworks
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- Should show 0 for everything
```

---

## 📋 Option 2: Selective Clean (Keep Some Data)

If you want to keep certain data:

### Keep users, delete everything else:
```sql
USE onlyarts;

SET FOREIGN_KEY_CHECKS = 0;

-- Clear artwork-related data
TRUNCATE TABLE artwork_likes;
TRUNCATE TABLE artwork_comments;
TRUNCATE TABLE artworks;

-- Clear orders
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;

-- Clear commissions
TRUNCATE TABLE commission_messages;
TRUNCATE TABLE commissions;

-- Clear notifications
TRUNCATE TABLE notifications;

SET FOREIGN_KEY_CHECKS = 1;
```

### Delete specific users (demo accounts):
```sql
USE onlyarts;

-- Delete demo users and all their related data will cascade
DELETE FROM users WHERE username LIKE 'demo%';
DELETE FROM users WHERE username LIKE 'test%';
DELETE FROM users WHERE email LIKE '%@example.com';

-- Verify
SELECT username, email, role FROM users;
```

---

## 📋 Option 3: Complete Database Reset

If you want to completely rebuild the database:

```sql
-- Drop and recreate database
DROP DATABASE IF EXISTS onlyarts;
CREATE DATABASE onlyarts CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE onlyarts;

-- Then run your database schema file:
-- SOURCE path/to/your/schema.sql;
```

---

## ✅ After Cleaning - Create Test Accounts

Once the database is clean, create your 4 test accounts:

### Step 1: Register through the UI

Go to http://localhost:5173/register and create:

1. **testadmin** (admin@test.com / Admin123!)
2. **userfree** (free@test.com / Free123!)
3. **userplus** (plus@test.com / Plus123!)
4. **userpremium** (premium@test.com / Premium123!)

### Step 2: Update in database

```sql
USE onlyarts;

-- Make testadmin an admin
UPDATE users
SET role = 'admin'
WHERE username = 'testadmin';

-- Set subscription tiers
UPDATE users
SET subscription = 'plus'
WHERE username = 'userplus';

UPDATE users
SET subscription = 'premium'
WHERE username = 'userpremium';

-- Verify
SELECT id, username, email, role, subscription, is_active
FROM users
ORDER BY id;
```

Expected result:
```
+----+-------------+-------------------+--------+--------------+-----------+
| id | username    | email             | role   | subscription | is_active |
+----+-------------+-------------------+--------+--------------+-----------+
|  1 | testadmin   | admin@test.com    | admin  | free         |         1 |
|  2 | userfree    | free@test.com     | artist | free         |         1 |
|  3 | userplus    | plus@test.com     | artist | plus         |         1 |
|  4 | userpremium | premium@test.com  | artist | premium      |         1 |
+----+-------------+-------------------+--------+--------------+-----------+
```

---

## 🔍 Verification Queries

After cleaning and setting up test accounts, verify everything is ready:

```sql
USE onlyarts;

-- Should show exactly 4 users
SELECT COUNT(*) as total_users FROM users;

-- Should show 0 artworks
SELECT COUNT(*) as total_artworks FROM artworks;

-- Should show 0 orders
SELECT COUNT(*) as total_orders FROM orders;

-- Should show 0 notifications
SELECT COUNT(*) as total_notifications FROM notifications;

-- Check subscription distribution
SELECT
  subscription,
  COUNT(*) as user_count
FROM users
GROUP BY subscription
ORDER BY
  CASE subscription
    WHEN 'free' THEN 1
    WHEN 'plus' THEN 2
    WHEN 'premium' THEN 3
  END;

-- Expected:
-- free: 2 (testadmin, userfree)
-- plus: 1 (userplus)
-- premium: 1 (userpremium)
```

---

## 🚀 Quick Copy-Paste Commands

### Complete Clean + Test Account Setup

```sql
USE onlyarts;

-- Step 1: Clean everything
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE notifications;
TRUNCATE TABLE user_follows;
TRUNCATE TABLE artwork_likes;
TRUNCATE TABLE artwork_comments;
TRUNCATE TABLE artworks;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE commission_messages;
TRUNCATE TABLE commissions;
TRUNCATE TABLE exhibition_artworks;
TRUNCATE TABLE exhibition_follows;
TRUNCATE TABLE exhibitions;
TRUNCATE TABLE livestream_bids;
TRUNCATE TABLE livestream_messages;
TRUNCATE TABLE livestreams;
TRUNCATE TABLE subscription_payments;
TRUNCATE TABLE messages;
TRUNCATE TABLE conversations;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Step 2: Now register 4 accounts through the UI
-- Go to http://localhost:5173/register and create the accounts

-- Step 3: After registration, run these updates:
-- (Run this AFTER you've registered all 4 accounts)

UPDATE users SET role = 'admin' WHERE username = 'testadmin';
UPDATE users SET subscription = 'plus' WHERE username = 'userplus';
UPDATE users SET subscription = 'premium' WHERE username = 'userpremium';

-- Step 4: Verify
SELECT id, username, email, role, subscription, is_active FROM users ORDER BY id;
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'artworks', COUNT(*) FROM artworks
UNION ALL SELECT 'orders', COUNT(*) FROM orders;
```

---

## ⚠️ Important Notes

1. **Backup first** (if you have important data):
   ```sql
   -- Create a backup
   mysqldump -u root -p onlyarts > backup_before_testing.sql

   -- Restore if needed
   mysql -u root -p onlyarts < backup_before_testing.sql
   ```

2. **Stop the backend** before running TRUNCATE commands (optional but safer)

3. **Clear browser storage** after cleaning database:
   - Open DevTools (F12)
   - Application → Storage → Clear site data
   - This prevents old tokens from causing issues

4. **Restart backend** after database changes to clear any cached data

---

## 🎯 Ready to Test!

Once you've cleaned the database and created the 4 test accounts, you should have:

- ✅ Exactly 4 users in the database
- ✅ 0 artworks
- ✅ 0 orders
- ✅ 0 notifications
- ✅ Clean slate for accurate testing

Now you can follow [QUICK_START_TESTING.md](QUICK_START_TESTING.md) and track progress in [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)!

---

## 💡 Pro Tips

- After cleaning, the **Admin Dashboard stats will show 0s** - this is correct!
- As you test, you'll see numbers increase in real-time
- Makes it easy to verify each action worked (e.g., upload 1 artwork → count becomes 1)
- Much easier to spot bugs when starting from zero
