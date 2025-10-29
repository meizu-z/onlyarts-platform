# Day 4: User Management Endpoints

**Goal:** Complete user profile, update, follow/unfollow, and search functionality

**Time Estimate:** 4-5 hours

---

## Overview

Today you'll implement all user-related endpoints matching your frontend's [user.service.js](src/services/user.service.js).

**Features to Implement:**
- Get user profile by username
- Update user profile (with image upload)
- Follow/unfollow users
- Get followers/following lists
- User search
- Get user's artworks

---

## Step 1: Extend User Model (30 min)

Update `backend/src/models/user.model.js` with additional functions:

```javascript
const { query } = require('../config/database');
const { hashPassword } = require('../utils/password');

// ... (keep existing functions from Day 3)

/**
 * Update user profile
 */
const updateProfile = async (userId, updates) => {
  const allowedFields = [
    'full_name',
    'bio',
    'profile_picture',
    'cover_image',
    'hourly_rate',
  ];

  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const result = await query(
    `UPDATE users
     SET ${fields.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, username, email, full_name, role, subscription_tier,
               is_premium, profile_picture, cover_image, bio, balance, total_earnings,
               followers_count, following_count, artworks_count, hourly_rate,
               is_verified, created_at, updated_at`,
    values
  );

  return result.rows[0];
};

/**
 * Follow a user
 */
const followUser = async (followerId, followingId) => {
  const client = await query.pool.connect();

  try {
    await client.query('BEGIN');

    // Insert follow relationship
    await client.query(
      `INSERT INTO follows (follower_id, following_id)
       VALUES ($1, $2)
       ON CONFLICT (follower_id, following_id) DO NOTHING`,
      [followerId, followingId]
    );

    // Increment follower's following_count
    await client.query(
      `UPDATE users SET following_count = following_count + 1 WHERE id = $1`,
      [followerId]
    );

    // Increment following's followers_count
    await client.query(
      `UPDATE users SET followers_count = followers_count + 1 WHERE id = $1`,
      [followingId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Unfollow a user
 */
const unfollowUser = async (followerId, followingId) => {
  const client = await query.pool.connect();

  try {
    await client.query('BEGIN');

    // Delete follow relationship
    const deleteResult = await client.query(
      `DELETE FROM follows
       WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    // Only decrement if a row was actually deleted
    if (deleteResult.rowCount > 0) {
      // Decrement follower's following_count
      await client.query(
        `UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = $1`,
        [followerId]
      );

      // Decrement following's followers_count
      await client.query(
        `UPDATE users SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = $1`,
        [followingId]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Check if user is following another user
 */
const isFollowing = async (followerId, followingId) => {
  const result = await query(
    `SELECT EXISTS(
       SELECT 1 FROM follows
       WHERE follower_id = $1 AND following_id = $2
     )`,
    [followerId, followingId]
  );
  return result.rows[0].exists;
};

/**
 * Get user's followers
 */
const getFollowers = async (userId, limit = 50, offset = 0) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name, u.profile_picture, u.bio,
            u.is_verified, u.is_premium, u.followers_count, u.following_count
     FROM users u
     INNER JOIN follows f ON u.id = f.follower_id
     WHERE f.following_id = $1
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Get user's following
 */
const getFollowing = async (userId, limit = 50, offset = 0) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name, u.profile_picture, u.bio,
            u.is_verified, u.is_premium, u.followers_count, u.following_count
     FROM users u
     INNER JOIN follows f ON u.id = f.following_id
     WHERE f.follower_id = $1
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Search users by username or full name
 */
const searchUsers = async (searchQuery, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT id, username, full_name, profile_picture, bio,
            is_verified, is_premium, followers_count, artworks_count
     FROM users
     WHERE username ILIKE $1 OR full_name ILIKE $1
     ORDER BY followers_count DESC, username ASC
     LIMIT $2 OFFSET $3`,
    [`%${searchQuery}%`, limit, offset]
  );

  return result.rows;
};

/**
 * Get user statistics
 */
const getUserStats = async (userId) => {
  const result = await query(
    `SELECT
       (SELECT COUNT(*) FROM artworks WHERE user_id = $1 AND status = 'published') as artworks_count,
       (SELECT COUNT(*) FROM follows WHERE following_id = $1) as followers_count,
       (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following_count,
       (SELECT COALESCE(SUM(seller_earnings), 0) FROM order_items WHERE seller_id = $1) as total_earnings
     FROM users WHERE id = $1`,
    [userId]
  );

  return result.rows[0];
};

module.exports = {
  // Day 3 functions
  createUser,
  findByEmail,
  findByUsername,
  findById,
  updateLastLogin,
  emailExists,
  usernameExists,

  // Day 4 functions
  updateProfile,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
  searchUsers,
  getUserStats,
};
```

---

## Step 2: Create User Controller (45 min)

Create `backend/src/controllers/user.controller.js`:

```javascript
const { body, param, query: queryValidator, validationResult } = require('express-validator');
const UserModel = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get user profile by username
 * GET /api/users/:username
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await UserModel.findByUsername(username);

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Check if current user is following this user
  let isFollowing = false;
  if (req.user?.userId) {
    isFollowing = await UserModel.isFollowing(req.user.userId, user.id);
  }

  // Get user stats
  const stats = await UserModel.getUserStats(user.id);

  // Remove sensitive data
  delete user.password_hash;

  successResponse(res, {
    user: {
      ...user,
      ...stats,
      isFollowing,
    },
  });
});

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }

  const userId = req.user.userId;
  const updates = req.body;

  const updatedUser = await UserModel.updateProfile(userId, updates);

  successResponse(res, { user: updatedUser }, 'Profile updated successfully');
});

/**
 * Follow a user
 * POST /api/users/:userId/follow
 */
const followUser = asyncHandler(async (req, res) => {
  const followerId = req.user.userId;
  const { userId: followingId } = req.params;

  // Validate UUID
  if (!followingId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return errorResponse(res, 'Invalid user ID', 400);
  }

  // Can't follow yourself
  if (followerId === followingId) {
    return errorResponse(res, 'You cannot follow yourself', 400);
  }

  // Check if user exists
  const userToFollow = await UserModel.findById(followingId);
  if (!userToFollow) {
    return errorResponse(res, 'User not found', 404);
  }

  // Check if already following
  const alreadyFollowing = await UserModel.isFollowing(followerId, followingId);
  if (alreadyFollowing) {
    return errorResponse(res, 'Already following this user', 400);
  }

  await UserModel.followUser(followerId, followingId);

  successResponse(res, null, 'User followed successfully');
});

/**
 * Unfollow a user
 * DELETE /api/users/:userId/follow
 */
const unfollowUser = asyncHandler(async (req, res) => {
  const followerId = req.user.userId;
  const { userId: followingId } = req.params;

  // Validate UUID
  if (!followingId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return errorResponse(res, 'Invalid user ID', 400);
  }

  // Check if currently following
  const currentlyFollowing = await UserModel.isFollowing(followerId, followingId);
  if (!currentlyFollowing) {
    return errorResponse(res, 'Not following this user', 400);
  }

  await UserModel.unfollowUser(followerId, followingId);

  successResponse(res, null, 'User unfollowed successfully');
});

/**
 * Get user's followers
 * GET /api/users/:userId/followers
 */
const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  // Validate UUID
  if (!userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return errorResponse(res, 'Invalid user ID', 400);
  }

  const followers = await UserModel.getFollowers(userId, limit, offset);

  successResponse(res, {
    followers,
    pagination: {
      limit,
      offset,
      count: followers.length,
    },
  });
});

/**
 * Get user's following
 * GET /api/users/:userId/following
 */
const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  // Validate UUID
  if (!userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return errorResponse(res, 'Invalid user ID', 400);
  }

  const following = await UserModel.getFollowing(userId, limit, offset);

  successResponse(res, {
    following,
    pagination: {
      limit,
      offset,
      count: following.length,
    },
  });
});

/**
 * Search users
 * GET /api/users/search?q=username
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q: searchQuery } = req.query;

  if (!searchQuery || searchQuery.trim().length < 2) {
    return errorResponse(res, 'Search query must be at least 2 characters', 400);
  }

  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const users = await UserModel.searchUsers(searchQuery, limit, offset);

  successResponse(res, {
    users,
    pagination: {
      limit,
      offset,
      count: users.length,
    },
  });
});

// Validation rules
const updateProfileValidation = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name must be max 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be max 500 characters'),
  body('profile_picture')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL'),
  body('cover_image')
    .optional()
    .isURL()
    .withMessage('Cover image must be a valid URL'),
  body('hourly_rate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
];

module.exports = {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
  updateProfileValidation,
};
```

---

## Step 3: Create User Routes (20 min)

Create `backend/src/routes/user.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/users/search
 * @desc    Search users by username or name
 * @access  Public
 */
router.get('/search', userController.searchUsers);

/**
 * @route   GET /api/users/:username
 * @desc    Get user profile by username
 * @access  Public (optionalAuth for isFollowing check)
 */
router.get('/:username', optionalAuth, userController.getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update own profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  userController.updateProfileValidation,
  userController.updateProfile
);

/**
 * @route   POST /api/users/:userId/follow
 * @desc    Follow a user
 * @access  Private
 */
router.post('/:userId/follow', authenticate, userController.followUser);

/**
 * @route   DELETE /api/users/:userId/follow
 * @desc    Unfollow a user
 * @access  Private
 */
router.delete('/:userId/follow', authenticate, userController.unfollowUser);

/**
 * @route   GET /api/users/:userId/followers
 * @desc    Get user's followers list
 * @access  Public
 */
router.get('/:userId/followers', userController.getFollowers);

/**
 * @route   GET /api/users/:userId/following
 * @desc    Get user's following list
 * @access  Public
 */
router.get('/:userId/following', userController.getFollowing);

module.exports = router;
```

---

## Step 4: Connect User Routes to Server (5 min)

Update `backend/server.js`:

```javascript
// ... existing code ...

// API ROUTES
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes')); // Add this line

// ... rest of code ...
```

---

## Step 5: Fix Query Pool Access (10 min)

Update `backend/src/models/user.model.js` to properly access pool:

```javascript
const { query, pool } = require('../config/database');

// In followUser function, change:
// const client = await query.pool.connect();
// To:
const client = await pool.connect();

// Same fix in unfollowUser function
```

---

## Step 6: Test User Endpoints (40 min)

Create `backend/user-tests.http`:

```http
### Variables
@baseUrl = http://localhost:5000/api
@accessToken = your-access-token-here
@userId = user-id-here

### 1. Get user profile by username
GET {{baseUrl}}/users/meizzuuuuuuu

### 2. Get user profile (authenticated - shows isFollowing)
GET {{baseUrl}}/users/meizzuuuuuuu
Authorization: Bearer {{accessToken}}

### 3. Update own profile
PUT {{baseUrl}}/users/profile
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "full_name": "Updated Name",
  "bio": "New bio text here",
  "hourly_rate": 150.00
}

### 4. Follow a user
POST {{baseUrl}}/users/{{userId}}/follow
Authorization: Bearer {{accessToken}}

### 5. Unfollow a user
DELETE {{baseUrl}}/users/{{userId}}/follow
Authorization: Bearer {{accessToken}}

### 6. Get user's followers
GET {{baseUrl}}/users/{{userId}}/followers?limit=20&offset=0

### 7. Get user's following
GET {{baseUrl}}/users/{{userId}}/following?limit=20&offset=0

### 8. Search users
GET {{baseUrl}}/users/search?q=mei

### 9. Search users with pagination
GET {{baseUrl}}/users/search?q=artist&limit=10&offset=0

### 10. Test validation - invalid hourly rate
PUT {{baseUrl}}/users/profile
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "hourly_rate": -50
}

### 11. Test follow yourself (should fail)
POST {{baseUrl}}/users/YOUR-OWN-USER-ID/follow
Authorization: Bearer {{accessToken}}
```

---

## Step 7: Seed More Test Users (15 min)

Create `backend/seeds/more-users.sql`:

```sql
-- Insert more test users
INSERT INTO users (username, email, password_hash, full_name, bio, role, subscription_tier, is_premium, profile_picture, hourly_rate)
VALUES
  ('artist_mike', 'mike@example.com', '$2b$10$test', 'Mike Artist', 'Portrait artist', 'artist', 'premium', true, 'https://i.pravatar.cc/150?img=12', 120.00),
  ('painter_lisa', 'lisa@example.com', '$2b$10$test', 'Lisa Painter', 'Abstract and modern art', 'artist', 'free', false, 'https://i.pravatar.cc/150?img=5', NULL),
  ('collector_bob', 'bob@example.com', '$2b$10$test', 'Bob Collector', 'Art enthusiast', 'user', 'free', false, 'https://i.pravatar.cc/150?img=33', NULL),
  ('designer_emma', 'emma@example.com', '$2b$10$test', 'Emma Designer', 'UI/UX and digital art', 'artist', 'pro', true, 'https://i.pravatar.cc/150?img=9', 200.00),
  ('sculptor_james', 'james@example.com', '$2b$10$test', 'James Sculptor', '3D and sculpture', 'artist', 'premium', true, 'https://i.pravatar.cc/150?img=14', 180.00);

-- Create some follow relationships
DO $$
DECLARE
  user1 UUID;
  user2 UUID;
  user3 UUID;
BEGIN
  -- Get some user IDs
  SELECT id INTO user1 FROM users WHERE username = 'meizzuuuuuuu' LIMIT 1;
  SELECT id INTO user2 FROM users WHERE username = 'artist_mike' LIMIT 1;
  SELECT id INTO user3 FROM users WHERE username = 'painter_lisa' LIMIT 1;

  -- Create follows
  IF user1 IS NOT NULL AND user2 IS NOT NULL THEN
    INSERT INTO follows (follower_id, following_id) VALUES (user1, user2);
    UPDATE users SET following_count = following_count + 1 WHERE id = user1;
    UPDATE users SET followers_count = followers_count + 1 WHERE id = user2;
  END IF;

  IF user2 IS NOT NULL AND user3 IS NOT NULL THEN
    INSERT INTO follows (follower_id, following_id) VALUES (user2, user3);
    UPDATE users SET following_count = following_count + 1 WHERE id = user2;
    UPDATE users SET followers_count = followers_count + 1 WHERE id = user3;
  END IF;
END $$;
```

Run the seed:

```bash
psql -U your_username -d onlyarts < backend/seeds/more-users.sql
```

---

## Step 8: Update Frontend Connection (20 min)

Update [src/services/user.service.js](src/services/user.service.js):

Change `USE_DEMO_MODE` to `false`:

```javascript
const USE_DEMO_MODE = false; // Changed from true
```

The service will now use real API calls. Test in your React app:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Login to your app
4. Navigate to a user profile
5. Try following/unfollowing
6. Try updating your profile in settings
7. Search for users

---

## Step 9: Add User Profile Image Upload Support (30 min)

We'll prepare for image uploads (full implementation in Day 6).

Create `backend/src/middleware/upload.js`:

```javascript
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Multer upload config
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter,
});

module.exports = upload;
```

Install multer:

```bash
npm install multer
```

---

## ✅ Day 4 Completion Checklist

- [ ] User model extended with new functions
- [ ] Follow/unfollow logic implemented with transactions
- [ ] isFollowing check function created
- [ ] Get followers/following lists implemented
- [ ] User search functionality created
- [ ] User stats calculation added
- [ ] User controller created with all endpoints
- [ ] Input validation added
- [ ] User routes defined
- [ ] Routes connected to server
- [ ] Query pool access fixed
- [ ] All endpoints tested manually
- [ ] Test data seeded (multiple users)
- [ ] Follow relationships created in database
- [ ] Frontend user.service.js connected
- [ ] Follow/unfollow tested in UI
- [ ] Profile update tested in UI
- [ ] User search tested
- [ ] Multer middleware prepared for Day 6

---

## 🎯 Expected Outcome

By end of Day 4, you should have:

1. ✅ Complete user profile management
2. ✅ Follow/unfollow system working
3. ✅ Followers/following lists displayed
4. ✅ User search functionality
5. ✅ Profile updates saving to database
6. ✅ Frontend fully connected to user APIs
7. ✅ Transactions ensuring data consistency

---

## 🐛 Troubleshooting

### "Cannot follow yourself" error when it shouldn't
- Check that userId comparison is correct (both are UUIDs)
- Verify req.user.userId is set by auth middleware

### Follow counts not updating
- Check that transactions are committing properly
- Verify UPDATE queries are running
- Check for database constraints preventing updates

### "User not found" for valid username
- Check case sensitivity in username comparison
- Verify user exists in database: `SELECT * FROM users WHERE username = 'username'`

### Search returns no results
- Check ILIKE syntax (should be case-insensitive)
- Verify search query has % wildcards: `%query%`
- Test directly in psql to debug

---

## 📝 Git Commit

```bash
git add backend/src/models/user.model.js backend/src/controllers/user.controller.js backend/src/routes/user.routes.js backend/src/middleware/upload.js backend/server.js backend/user-tests.http backend/seeds/more-users.sql backend/package.json src/services/user.service.js
git commit -m "feat: Day 4 - Complete user management endpoints

- Implement get user profile by username
- Add profile update functionality
- Create follow/unfollow system with transactions
- Add followers/following lists
- Implement user search with pagination
- Add user statistics calculation
- Create test data with multiple users and follows
- Connect frontend to real user APIs

Endpoints:
- GET /api/users/:username - Get profile
- PUT /api/users/profile - Update profile
- POST /api/users/:userId/follow - Follow user
- DELETE /api/users/:userId/follow - Unfollow user
- GET /api/users/:userId/followers - Get followers
- GET /api/users/:userId/following - Get following
- GET /api/users/search - Search users

🤖 Generated with Claude Code"
```

---

## 🚀 Next: Day 5

Tomorrow you'll implement artwork management:
- List artworks with filters and pagination
- Get single artwork details
- Create new artwork
- Update artwork
- Delete artwork
- Favorite/unfavorite system
- View counter
