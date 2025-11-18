const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Public
 */
exports.getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if param is numeric (ID) or string (username)
  const isNumeric = /^\d+$/.test(id);
  const whereClause = isNumeric ? 'id = ?' : 'username = ?';

  const result = await query(
    `SELECT id, username, email, full_name, bio, profile_image, cover_image,
            role, subscription_tier, follower_count, following_count, artwork_count,
            created_at
     FROM users WHERE ${whereClause} AND is_active = TRUE`,
    [id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  const user = result.rows[0];

  // Check if current user follows this user (if authenticated)
  if (req.user) {
    const followResult = await query(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.user.id, user.id]
    );
    user.is_following = followResult.rows.length > 0;
  }

  successResponse(res, user, 'User profile retrieved');
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (own profile or admin)
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if user can update this profile
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own profile', 403));
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { fullName, bio, profileImage, coverImage, becomeArtist } = req.body;

  // Build update query dynamically
  const updates = [];
  const values = [];

  if (fullName !== undefined) {
    updates.push('full_name = ?');
    values.push(fullName);
  }
  if (bio !== undefined) {
    updates.push('bio = ?');
    values.push(bio);
  }
  if (profileImage !== undefined) {
    updates.push('profile_image = ?');
    values.push(profileImage);
  }
  if (coverImage !== undefined) {
    updates.push('cover_image = ?');
    values.push(coverImage);
  }
  // Allow user to become an artist (one-way transition)
  if (becomeArtist === true) {
    updates.push('role = ?');
    values.push('artist');
  }

  if (updates.length === 0) {
    return next(new AppError('No fields to update', 400));
  }

  values.push(id);

  await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Get updated user
  const result = await query(
    `SELECT id, username, email, full_name, bio, profile_image, cover_image,
            role, subscription_tier, wallet_balance, follower_count, following_count,
            artwork_count, created_at
     FROM users WHERE id = ?`,
    [id]
  );

  successResponse(res, result.rows[0], 'Profile updated successfully');
});

/**
 * @route   GET /api/users/:id/artworks
 * @desc    Get user's artworks
 * @access  Public
 */
exports.getUserArtworks = asyncHandler(async (req, res, next) => {
  const { id: idOrUsername } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const status = req.query.status || 'published';

  const offset = (page - 1) * limit;

  // Get user ID from username or ID
  const userId = await getUserId(idOrUsername);
  if (!userId) {
    return next(new AppError('User not found', 404));
  }

  // Get artworks
  const artworksResult = await query(
    `SELECT a.id, a.title, a.description, a.price, a.category, a.status,
            a.like_count, a.comment_count, a.view_count, a.created_at,
            (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image
     FROM artworks a
     WHERE a.artist_id = ? AND a.status = ?
     ORDER BY a.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [userId, status]
  );

  // Get total count
  const countResult = await query(
    'SELECT COUNT(*) as total FROM artworks WHERE artist_id = ? AND status = ?',
    [userId, status]
  );

  successResponse(res, {
    artworks: artworksResult.rows,
    pagination: {
      total: countResult.rows[0].total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  }, 'Artworks retrieved');
});

/**
 * @route   GET /api/users/:id/followers
 * @desc    Get user's followers
 * @access  Public
 */
exports.getUserFollowers = asyncHandler(async (req, res, next) => {
  const { id: idOrUsername } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const offset = (page - 1) * limit;

  const userId = await getUserId(idOrUsername);
  if (!userId) {
    return next(new AppError('User not found', 404));
  }

  const result = await query(
    `SELECT u.id, u.username, u.full_name, u.profile_image, u.bio,
            u.role, u.follower_count, u.artwork_count
     FROM follows f
     JOIN users u ON f.follower_id = u.id
     WHERE f.following_id = ? AND u.is_active = TRUE
     ORDER BY f.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [userId]
  );

  // Get total count
  const countResult = await query(
    'SELECT COUNT(*) as total FROM follows WHERE following_id = ?',
    [userId]
  );

  successResponse(res, {
    followers: result.rows,
    pagination: {
      total: countResult.rows[0].total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  }, 'Followers retrieved');
});

/**
 * @route   GET /api/users/:id/following
 * @desc    Get users that this user follows
 * @access  Public
 */
exports.getUserFollowing = asyncHandler(async (req, res, next) => {
  const { id: idOrUsername } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const offset = (page - 1) * limit;

  const userId = await getUserId(idOrUsername);
  if (!userId) {
    return next(new AppError('User not found', 404));
  }

  const result = await query(
    `SELECT u.id, u.username, u.full_name, u.profile_image, u.bio,
            u.role, u.follower_count, u.artwork_count
     FROM follows f
     JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = ? AND u.is_active = TRUE
     ORDER BY f.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [userId]
  );

  // Get total count
  const countResult = await query(
    'SELECT COUNT(*) as total FROM follows WHERE follower_id = ?',
    [userId]
  );

  successResponse(res, {
    following: result.rows,
    pagination: {
      total: countResult.rows[0].total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  }, 'Following retrieved');
});

/**
 * @route   POST /api/users/:id/follow
 * @desc    Follow a user
 * @access  Private
 */
exports.followUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const followerId = req.user.id;

  // Can't follow yourself
  if (parseInt(id) === followerId) {
    return next(new AppError('You cannot follow yourself', 400));
  }

  // Check if target user exists
  const userResult = await query(
    'SELECT id FROM users WHERE id = ? AND is_active = TRUE',
    [id]
  );

  if (userResult.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  // Check if already following
  const existingFollow = await query(
    'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, id]
  );

  if (existingFollow.rows.length > 0) {
    return next(new AppError('You are already following this user', 400));
  }

  // Create follow relationship
  await query(
    'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
    [followerId, id]
  );

  // Update follower/following counts
  await query(
    'UPDATE users SET following_count = following_count + 1 WHERE id = ?',
    [followerId]
  );
  await query(
    'UPDATE users SET follower_count = follower_count + 1 WHERE id = ?',
    [id]
  );

  successResponse(res, null, 'User followed successfully');
});

/**
 * @route   DELETE /api/users/:id/follow
 * @desc    Unfollow a user
 * @access  Private
 */
exports.unfollowUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const followerId = req.user.id;

  // Check if following
  const followResult = await query(
    'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, id]
  );

  if (followResult.rows.length === 0) {
    return next(new AppError('You are not following this user', 400));
  }

  // Delete follow relationship
  await query(
    'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, id]
  );

  // Update follower/following counts
  await query(
    'UPDATE users SET following_count = following_count - 1 WHERE id = ?',
    [followerId]
  );
  await query(
    'UPDATE users SET follower_count = follower_count - 1 WHERE id = ?',
    [id]
  );

  successResponse(res, null, 'User unfollowed successfully');
});

/**
 * @route   GET /api/users
 * @desc    Get all users (with search/filter)
 * @access  Public
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  const role = req.query.role || '';
  const sortBy = req.query.sortBy || 'created_at';
  const order = req.query.order || 'DESC';

  const offset = (page - 1) * limit;

  // Build WHERE clause
  const conditions = ['is_active = TRUE'];
  const values = [];

  if (search) {
    conditions.push('(username LIKE ? OR full_name LIKE ? OR email LIKE ?)');
    const searchTerm = `%${search}%`;
    values.push(searchTerm, searchTerm, searchTerm);
  }

  if (role) {
    conditions.push('role = ?');
    values.push(role);
  }

  const whereClause = conditions.join(' AND ');

  // Validate sortBy and order
  const allowedSortFields = ['created_at', 'username', 'follower_count', 'artwork_count'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Get users
  const usersResult = await query(
    `SELECT id, username, email, full_name, bio, profile_image, role,
            subscription_tier, follower_count, following_count, artwork_count,
            created_at
     FROM users
     WHERE ${whereClause}
     ORDER BY ${sortField} ${sortOrder}
     LIMIT ${limit} OFFSET ${offset}`,
    values
  );

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
    values
  );

  successResponse(res, {
    users: usersResult.rows,
    pagination: {
      total: countResult.rows[0].total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  }, 'Users retrieved');
});

/**
 * @route   GET /api/users/search
 * @desc    Search users by username or name
 * @access  Public
 */
exports.searchUsers = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  const limit = parseInt(req.query.limit) || 10;

  if (!q || q.trim().length < 2) {
    return next(new AppError('Search query must be at least 2 characters', 400));
  }

  const searchTerm = `%${q.trim()}%`;

  const result = await query(
    `SELECT id, username, full_name, profile_image, role, follower_count
     FROM users
     WHERE is_active = TRUE
       AND (username LIKE ? OR full_name LIKE ?)
     ORDER BY follower_count DESC
     LIMIT ${limit}`,
    [searchTerm, searchTerm]
  );

  successResponse(res, result.rows, 'Search results retrieved');
});

/**
 * @route   GET /api/users/:id/liked-artworks
 * @desc    Get artworks liked by user
 * @access  Public
 */
exports.getUserLikedArtworks = asyncHandler(async (req, res, next) => {
  const { id: idOrUsername } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;

  // Verify user exists
  const userId = await getUserId(idOrUsername);
  if (!userId) {
    return next(new AppError('User not found', 404));
  }

  // Get liked artworks
  const artworksResult = await query(
    `SELECT
      a.id, a.title, a.description, a.price, a.category, a.medium,
      a.status, a.stock_quantity, a.is_for_sale, a.like_count, a.view_count,
      a.created_at,
      u.id as artist_id, u.username as artist_username, u.full_name as artist_name,
      u.profile_image as artist_image,
      (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image,
      l.created_at as liked_at
     FROM artwork_likes l
     JOIN artworks a ON l.artwork_id = a.id
     JOIN users u ON a.artist_id = u.id
     WHERE l.user_id = ? AND a.status = 'published'
     ORDER BY l.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [userId]
  );

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM artwork_likes l
     JOIN artworks a ON l.artwork_id = a.id
     WHERE l.user_id = ? AND a.status = 'published'`,
    [userId]
  );

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);

  successResponse(res, {
    artworks: artworksResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }, 'Liked artworks retrieved');
});

/**
 * @route   GET /api/users/:id/shared
 * @desc    Get user's shared posts
 * @access  Public
 */
exports.getUserSharedPosts = asyncHandler(async (req, res, next) => {
  const { id: idOrUsername } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;

  // Verify user exists
  const userId = await getUserId(idOrUsername);
  if (!userId) {
    return next(new AppError('User not found', 404));
  }

  // Get shared posts with artwork details
  const postsResult = await query(
    `SELECT s.id as share_id, s.created_at as shared_at,
            a.id, a.title, a.description, a.price, a.category, a.like_count, a.comment_count,
            a.view_count, a.is_for_sale, a.created_at,
            u.id as artist_id, u.username as artist_username, u.full_name as artist_name,
            u.profile_image as artist_image,
            (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image
     FROM shares s
     JOIN artworks a ON s.artwork_id = a.id
     JOIN users u ON a.artist_id = u.id
     WHERE s.user_id = ? AND a.status = 'published'
     ORDER BY s.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [userId]
  );

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM shares s
     JOIN artworks a ON s.artwork_id = a.id
     WHERE s.user_id = ? AND a.status = 'published'`,
    [userId]
  );

  successResponse(res, {
    posts: postsResult.rows,
    pagination: {
      page,
      limit,
      total: countResult.rows[0].total,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  }, 'Shared posts retrieved');
});

/**
 * @route   POST /api/users/upload/avatar
 * @desc    Upload profile avatar
 * @access  Private
 */
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  try {
    // Use local file URL (for testing without Cloudinary)
    const imageUrl = `/uploads/${req.file.filename}`;

    // Update user's profile image in database
    await query(
      'UPDATE users SET profile_image = ? WHERE id = ?',
      [imageUrl, req.user.id]
    );

    successResponse(res, {
      url: imageUrl,
      publicId: req.file.filename,
    }, 'Avatar uploaded successfully', 201);
  } catch (error) {
    // Clean up local file if database update failed
    const fs = require('fs').promises;
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    throw error;
  }
});

/**
 * @route   POST /api/users/upload/cover
 * @desc    Upload cover image
 * @access  Private
 */
exports.uploadCover = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  try {
    // Use local file URL (for testing without Cloudinary)
    const imageUrl = `/uploads/${req.file.filename}`;

    // Update user's cover image in database
    await query(
      'UPDATE users SET cover_image = ? WHERE id = ?',
      [imageUrl, req.user.id]
    );

    successResponse(res, {
      url: imageUrl,
      publicId: req.file.filename,
    }, 'Cover image uploaded successfully', 201);
  } catch (error) {
    // Clean up local file if database update failed
    const fs = require('fs').promises;
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    throw error;
  }
});

// Helper function to get user ID from either ID or username
const getUserId = async (idOrUsername) => {
  const isNumeric = /^\d+$/.test(idOrUsername);
  const column = isNumeric ? 'id' : 'username';
  const result = await query(`SELECT id FROM users WHERE ${column} = ? AND is_active = TRUE`, [idOrUsername]);
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0].id;
};
