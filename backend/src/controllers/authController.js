const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * Generate access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

/**
 * Store refresh token in database
 */
const storeRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { username, email, password, fullName, role } = req.body;

  // Check if user already exists
  const existingUser = await query(
    'SELECT id FROM users WHERE email = ? OR username = ?',
    [email, username]
  );

  if (existingUser.rows.length > 0) {
    return next(new AppError('User with this email or username already exists', 409));
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, role)
     VALUES (?, ?, ?, ?, ?)`,
    [username, email, passwordHash, fullName || null, role || 'user']
  );

  const userId = result.rows.insertId;

  // Generate tokens
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  // Store refresh token
  await storeRefreshToken(userId, refreshToken);

  // Get created user
  const userResult = await query(
    'SELECT id, username, email, full_name, role, subscription_tier, created_at FROM users WHERE id = ?',
    [userId]
  );

  const user = userResult.rows[0];

  successResponse(res, {
    user,
    accessToken,
    refreshToken,
  }, 'Registration successful', 201);
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const { email, password } = req.body;

  // Get user by email
  const result = await query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Invalid email or password', 401));
  }

  const user = result.rows[0];

  // Check if account is active
  if (!user.is_active) {
    return next(new AppError('Account has been deactivated', 403));
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Update last login
  await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token
  await storeRefreshToken(user.id, refreshToken);

  // Remove password from response
  delete user.password_hash;

  successResponse(res, {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      profile_image: user.profile_image,
      role: user.role,
      subscription_tier: user.subscription_tier,
      wallet_balance: user.wallet_balance,
      follower_count: user.follower_count,
      following_count: user.following_count,
      artwork_count: user.artwork_count,
    },
    accessToken,
    refreshToken,
  }, 'Login successful');
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }

  // Check if refresh token exists in database and is not revoked
  const tokenResult = await query(
    'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND revoked_at IS NULL',
    [refreshToken, decoded.userId]
  );

  if (tokenResult.rows.length === 0) {
    return next(new AppError('Invalid or revoked refresh token', 401));
  }

  const tokenRecord = tokenResult.rows[0];

  // Check if token is expired
  if (new Date(tokenRecord.expires_at) < new Date()) {
    return next(new AppError('Refresh token has expired', 401));
  }

  // Get user
  const userResult = await query(
    'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
    [decoded.userId]
  );

  if (userResult.rows.length === 0) {
    return next(new AppError('User not found', 401));
  }

  const user = userResult.rows[0];

  if (!user.is_active) {
    return next(new AppError('Account has been deactivated', 403));
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user.id);

  successResponse(res, {
    accessToken: newAccessToken,
  }, 'Token refreshed successfully');
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (revoke refresh token)
 * @access  Public (no auth required - logout should always work)
 */
exports.logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  // If refresh token is provided, try to revoke it
  if (refreshToken) {
    try {
      // Try to decode the token to get user ID (no verification needed for logout)
      const decoded = jwt.decode(refreshToken);

      if (decoded && decoded.userId) {
        // Revoke refresh token in database
        await query(
          'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ? AND user_id = ?',
          [refreshToken, decoded.userId]
        );
      }
    } catch (error) {
      // If token is invalid or revocation fails, still proceed with logout
      console.log('Token revocation failed, but logout will proceed:', error.message);
    }
  }

  // Always return success - logout should be idempotent
  successResponse(res, null, 'Logout successful');
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  const result = await query(
    `SELECT id, username, email, full_name, bio, profile_image, cover_image,
            role, subscription_tier, wallet_balance, total_earnings,
            follower_count, following_count, artwork_count, created_at
     FROM users WHERE id = ?`,
    [req.user.id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  successResponse(res, result.rows[0], 'User profile retrieved');
});
