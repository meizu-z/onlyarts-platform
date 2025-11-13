const asyncHandler = require('../utils/asyncHandler');
const { query } = require('../config/database');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/AppError');

/**
 * @route   GET /api/favorites
 * @desc    Get user's favorite artworks
 * @access  Private
 */
exports.getFavorites = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;

  // Get favorited artworks
  const result = await query(
    `SELECT a.id, a.title, a.description, a.price, a.category, a.created_at,
            a.like_count, a.view_count,
            u.id as artist_id, u.username as artist_username, u.full_name as artist_name,
            (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image
     FROM likes l
     JOIN artworks a ON l.artwork_id = a.id
     JOIN users u ON a.artist_id = u.id
     WHERE l.user_id = ?
     ORDER BY l.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [req.user.id]
  );

  // Get total count
  const countResult = await query(
    'SELECT COUNT(*) as total FROM likes WHERE user_id = ?',
    [req.user.id]
  );

  successResponse(res, {
    favorites: result.rows,
    pagination: {
      total: countResult.rows[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  }, 'Favorites retrieved');
});

/**
 * @route   POST /api/favorites
 * @desc    Add artwork to favorites
 * @access  Private
 */
exports.addFavorite = asyncHandler(async (req, res, next) => {
  const { artworkId } = req.body;

  // Check if artwork exists
  const artworkResult = await query(
    'SELECT id FROM artworks WHERE id = ?',
    [artworkId]
  );

  if (artworkResult.rows.length === 0) {
    return next(new AppError('Artwork not found', 404));
  }

  // Check if already favorited
  const existingResult = await query(
    'SELECT id FROM likes WHERE user_id = ? AND artwork_id = ?',
    [req.user.id, artworkId]
  );

  if (existingResult.rows.length > 0) {
    return next(new AppError('Artwork already in favorites', 400));
  }

  // Add to favorites
  await query(
    'INSERT INTO likes (user_id, artwork_id) VALUES (?, ?)',
    [req.user.id, artworkId]
  );

  // Update like count
  await query(
    'UPDATE artworks SET like_count = like_count + 1 WHERE id = ?',
    [artworkId]
  );

  successResponse(res, null, 'Added to favorites', 201);
});

/**
 * @route   DELETE /api/favorites/:id
 * @desc    Remove artwork from favorites
 * @access  Private
 */
exports.removeFavorite = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if favorite exists
  const result = await query(
    'SELECT id FROM likes WHERE user_id = ? AND artwork_id = ?',
    [req.user.id, id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Favorite not found', 404));
  }

  // Remove from favorites
  await query(
    'DELETE FROM likes WHERE user_id = ? AND artwork_id = ?',
    [req.user.id, id]
  );

  // Update like count
  await query(
    'UPDATE artworks SET like_count = like_count - 1 WHERE id = ?',
    [id]
  );

  successResponse(res, null, 'Removed from favorites');
});
