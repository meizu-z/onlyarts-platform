const asyncHandler = require('../utils/asyncHandler');
const { query } = require('../config/database');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/AppError');
const { notifyArtworkLike } = require('../utils/notifications');

/**
 * @route   GET /api/favorites
 * @desc    Get user's favorite artworks and exhibitions
 * @access  Private
 */
exports.getFavorites = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 24;
  const offset = (page - 1) * limit;

  // Get favorited artworks
  const artworksResult = await query(
    `SELECT a.id, a.title, a.description, a.price, a.category, a.created_at,
            a.like_count, a.view_count, 'artwork' as type,
            u.id as artist_id, u.username as artist_username, u.full_name as artist_name,
            (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image,
            l.created_at as favorited_at
     FROM likes l
     JOIN artworks a ON l.artwork_id = a.id
     JOIN users u ON a.artist_id = u.id
     WHERE l.user_id = ?`,
    [req.user.id]
  );

  // Get favorited exhibitions
  const exhibitionsResult = await query(
    `SELECT e.id, e.title, e.description, e.status, e.start_date, e.end_date,
            e.created_at, 'exhibition' as type, e.status as exhibition_type,
            u.id as artist_id, u.username as artist_username, u.full_name as artist_name,
            e.cover_image as primary_image,
            el.created_at as favorited_at,
            (SELECT COUNT(*) FROM exhibition_artworks WHERE exhibition_id = e.id) as artworks_count
     FROM exhibition_likes el
     JOIN exhibitions e ON el.exhibition_id = e.id
     JOIN users u ON e.curator_id = u.id
     WHERE el.user_id = ?`,
    [req.user.id]
  );

  // Combine and sort by favorited_at
  const allFavorites = [...artworksResult.rows, ...exhibitionsResult.rows]
    .sort((a, b) => new Date(b.favorited_at) - new Date(a.favorited_at))
    .slice(offset, offset + limit);

  // Transform image paths to full URLs
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const favorites = allFavorites.map(item => ({
    ...item,
    primary_image: item.primary_image && !item.primary_image.startsWith('http')
      ? `${baseUrl}${item.primary_image}`
      : item.primary_image
  }));

  // Get total count
  const artworkCountResult = await query(
    'SELECT COUNT(*) as total FROM likes WHERE user_id = ?',
    [req.user.id]
  );
  const exhibitionCountResult = await query(
    'SELECT COUNT(*) as total FROM exhibition_likes WHERE user_id = ?',
    [req.user.id]
  );

  const total = artworkCountResult.rows[0].total + exhibitionCountResult.rows[0].total;

  successResponse(res, {
    favorites,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

  // Send notification to artwork owner
  try {
    const artworkInfo = await query(
      'SELECT a.user_id, a.title, u.username FROM artworks a JOIN users u ON a.user_id = u.id WHERE a.id = ?',
      [artworkId]
    );
    if (artworkInfo.rows.length > 0 && artworkInfo.rows[0].user_id !== req.user.id) {
      await notifyArtworkLike(
        artworkInfo.rows[0].user_id,
        req.user.id,
        req.user.username,
        artworkId,
        artworkInfo.rows[0].title
      );
    }
  } catch (error) {
    console.error('Failed to send like notification:', error);
    // Don't fail the request if notification fails
  }

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
