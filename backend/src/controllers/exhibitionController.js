const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * @route   POST /api/exhibitions
 * @desc    Create exhibition
 * @access  Private (Premium/Artists)
 */
exports.createExhibition = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  let { title, description, startDate, endDate, artworkIds, isPrivate } = req.body;

  // Parse artworkIds if it's a string (from FormData)
  if (typeof artworkIds === 'string') {
    try {
      artworkIds = JSON.parse(artworkIds);
    } catch (e) {
      artworkIds = [];
    }
  }

  // Convert isPrivate string to boolean/integer for FormData compatibility
  const isPrivateValue = isPrivate === 'true' || isPrivate === true ? 1 : 0;

  // Verify user can create exhibitions (premium or artist)
  if (req.user.subscription_tier === 'free' && req.user.role !== 'artist') {
    return next(new AppError('Upgrade to Premium to create exhibitions', 403));
  }

  // Get cover image path from uploaded file
  const coverImage = req.file ? `/uploads/${req.file.filename}` : null;

  const result = await query(
    `INSERT INTO exhibitions (curator_id, title, description, start_date, end_date, is_private, cover_image, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'published')`,
    [userId, title, description, startDate, endDate, isPrivateValue, coverImage]
  );

  const exhibitionId = result.rows.insertId;

  // Add artworks to exhibition
  if (artworkIds && artworkIds.length > 0) {
    const values = artworkIds.map((artworkId, index) =>
      `(${exhibitionId}, ${artworkId}, ${index + 1})`
    ).join(',');

    await query(
      `INSERT INTO exhibition_artworks (exhibition_id, artwork_id, display_order) VALUES ${values}`
    );
  }

  successResponse(res, {
    id: exhibitionId,
    status: 'published',
  }, 'Exhibition created', 201);
});

/**
 * @route   GET /api/exhibitions
 * @desc    Get exhibitions
 * @access  Public
 */
exports.getExhibitions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  const status = req.query.status || 'published';
  const userId = req.query.userId;

  const now = new Date();
  let whereClause = 'e.is_private = FALSE';
  const params = [];

  // Filter by status: upcoming, current, past
  if (status === 'upcoming') {
    whereClause += ' AND e.start_date > ? AND e.status = ?';
    params.push(now, 'published');
  } else if (status === 'current') {
    whereClause += ' AND e.start_date <= ? AND e.end_date >= ? AND e.status = ?';
    params.push(now, now, 'published');
  } else if (status === 'past') {
    whereClause += ' AND e.end_date < ? AND e.status = ?';
    params.push(now, 'published');
  } else if (status === 'published') {
    whereClause += ' AND e.status = ?';
    params.push('published');
  }

  // Filter by user
  if (userId) {
    whereClause += ' AND e.curator_id = ?';
    params.push(userId);
  }

  const result = await query(
    `SELECT
      e.id, e.title, e.description, e.start_date, e.end_date, e.cover_image,
      e.view_count, e.like_count, e.status, e.created_at,
      u.id as curator_id, u.username as curator_username,
      u.full_name as curator_name, u.profile_image as curator_image,
      u.subscription_tier as curator_tier,
      (SELECT COUNT(*) FROM exhibition_artworks WHERE exhibition_id = e.id) as artwork_count
     FROM exhibitions e
     JOIN users u ON e.curator_id = u.id
     WHERE ${whereClause}
     ORDER BY e.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) as total FROM exhibitions e WHERE ${whereClause}`,
    params
  );

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);

  successResponse(res, {
    exhibitions: result.rows,
    pagination: { page, limit, total, totalPages },
  }, 'Exhibitions retrieved');
});

/**
 * @route   GET /api/exhibitions/:id
 * @desc    Get exhibition details
 * @access  Public
 */
exports.getExhibitionById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const result = await query(
    `SELECT
      e.*,
      u.id as curator_id, u.username as curator_username,
      u.full_name as curator_name, u.profile_image as curator_image,
      u.subscription_tier as curator_tier
     FROM exhibitions e
     JOIN users u ON e.curator_id = u.id
     WHERE e.id = ?`,
    [id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Exhibition not found', 404));
  }

  const exhibition = result.rows[0];

  // Check access for private exhibitions
  if (exhibition.is_private && (!userId || (userId !== exhibition.curator_id && req.user.role !== 'admin'))) {
    return next(new AppError('This exhibition is private', 403));
  }

  // Increment view count
  await query('UPDATE exhibitions SET view_count = view_count + 1 WHERE id = ?', [id]);

  // Get artworks in exhibition
  const artworksResult = await query(
    `SELECT
      a.id, a.title, a.price, a.category, a.like_count,
      u.id as artist_id, u.username as artist_username, u.full_name as artist_name,
      (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image,
      ea.display_order,
      ea.artwork_type
     FROM exhibition_artworks ea
     JOIN artworks a ON ea.artwork_id = a.id
     JOIN users u ON a.artist_id = u.id
     WHERE ea.exhibition_id = ?
     ORDER BY ea.display_order ASC`,
    [id]
  );

  exhibition.artworks = artworksResult.rows;

  successResponse(res, exhibition, 'Exhibition retrieved');
});

/**
 * @route   PUT /api/exhibitions/:id
 * @desc    Update exhibition
 * @access  Private (Owner only)
 */
exports.updateExhibition = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, description, startDate, endDate, isPrivate, coverImage, status } = req.body;

  // Check ownership
  const exhibitionResult = await query('SELECT curator_id FROM exhibitions WHERE id = ?', [id]);
  if (exhibitionResult.rows.length === 0) {
    return next(new AppError('Exhibition not found', 404));
  }

  if (exhibitionResult.rows[0].curator_id !== userId && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  const updates = [];
  const params = [];

  if (title !== undefined) {
    updates.push('title = ?');
    params.push(title);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description);
  }
  if (startDate !== undefined) {
    updates.push('start_date = ?');
    params.push(startDate);
  }
  if (endDate !== undefined) {
    updates.push('end_date = ?');
    params.push(endDate);
  }
  if (isPrivate !== undefined) {
    updates.push('is_private = ?');
    params.push(isPrivate);
  }
  if (coverImage !== undefined) {
    updates.push('cover_image = ?');
    params.push(coverImage);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }

  if (updates.length > 0) {
    updates.push('updated_at = NOW()');
    params.push(id);
    await query(
      `UPDATE exhibitions SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  successResponse(res, null, 'Exhibition updated');
});

/**
 * @route   DELETE /api/exhibitions/:id
 * @desc    Delete exhibition
 * @access  Private (Owner only)
 */
exports.deleteExhibition = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check ownership
  const exhibitionResult = await query('SELECT curator_id FROM exhibitions WHERE id = ?', [id]);
  if (exhibitionResult.rows.length === 0) {
    return next(new AppError('Exhibition not found', 404));
  }

  if (exhibitionResult.rows[0].curator_id !== userId && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  await query('DELETE FROM exhibitions WHERE id = ?', [id]);

  successResponse(res, null, 'Exhibition deleted');
});

/**
 * @route   POST /api/exhibitions/:id/like
 * @desc    Like exhibition
 * @access  Private
 */
exports.likeExhibition = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if already liked
  const likeResult = await query(
    'SELECT id FROM exhibition_likes WHERE user_id = ? AND exhibition_id = ?',
    [userId, id]
  );

  if (likeResult.rows.length > 0) {
    return next(new AppError('Already liked this exhibition', 400));
  }

  await query('INSERT INTO exhibition_likes (user_id, exhibition_id) VALUES (?, ?)', [userId, id]);
  await query('UPDATE exhibitions SET like_count = like_count + 1 WHERE id = ?', [id]);

  successResponse(res, null, 'Exhibition liked');
});

/**
 * @route   DELETE /api/exhibitions/:id/like
 * @desc    Unlike exhibition
 * @access  Private
 */
exports.unlikeExhibition = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await query(
    'DELETE FROM exhibition_likes WHERE user_id = ? AND exhibition_id = ?',
    [userId, id]
  );

  if (result.rows.affectedRows === 0) {
    return next(new AppError('Like not found', 404));
  }

  await query('UPDATE exhibitions SET like_count = like_count - 1 WHERE id = ? AND like_count > 0', [id]);

  successResponse(res, null, 'Exhibition unliked');
});

/**
 * @route   GET /api/exhibitions/:id/artworks
 * @desc    Get exhibition artworks
 * @access  Public
 */
exports.getArtworksByExhibitionId = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Verify exhibition exists
  const exhibitionResult = await query('SELECT id FROM exhibitions WHERE id = ?', [id]);
  if (exhibitionResult.rows.length === 0) {
    return next(new AppError('Exhibition not found', 404));
  }

  // Get artworks in exhibition
  const artworksResult = await query(
    `SELECT
      a.id, a.title, a.price, a.category, a.like_count,
      u.id as artist_id, u.username as artist_username, u.full_name as artist_name,
      (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image,
      ea.display_order,
      ea.artwork_type
     FROM exhibition_artworks ea
     JOIN artworks a ON ea.artwork_id = a.id
     JOIN users u ON a.artist_id = u.id
     WHERE ea.exhibition_id = ?
     ORDER BY ea.display_order ASC`,
    [id]
  );

  successResponse(res, { artworks: artworksResult.rows }, 'Artworks retrieved');
});

/**
 * @route   GET /api/exhibitions/:id/comments
 * @desc    Get exhibition comments
 * @access  Public
 */
exports.getCommentsByExhibitionId = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Verify exhibition exists
  const exhibitionResult = await query('SELECT id FROM exhibitions WHERE id = ?', [id]);
  if (exhibitionResult.rows.length === 0) {
    return next(new AppError('Exhibition not found', 404));
  }

  // TODO: Implement exhibition_comments table
  // For now, return empty array
  successResponse(res, { comments: [] }, 'Comments retrieved');
});

/**
 * @route   POST /api/exhibitions/:id/exclusive-artworks
 * @desc    Add exclusive artwork to exhibition
 * @access  Private (Curator only)
 */
exports.addExclusiveArtwork = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, description, price, category } = req.body;

  // Verify exhibition exists and user is curator
  const exhibitionResult = await query(
    'SELECT curator_id FROM exhibitions WHERE id = ?',
    [id]
  );

  if (exhibitionResult.rows.length === 0) {
    return next(new AppError('Exhibition not found', 404));
  }

  if (exhibitionResult.rows[0].curator_id !== userId && req.user.role !== 'admin') {
    return next(new AppError('Only the curator can add exclusive artworks', 403));
  }

  if (!req.file) {
    return next(new AppError('Artwork image is required', 400));
  }

  // Create artwork
  const artworkResult = await query(
    `INSERT INTO artworks (artist_id, title, description, price, category, status)
     VALUES (?, ?, ?, ?, ?, 'published')`,
    [userId, title, description || '', price || 0, category || 'digital']
  );

  const artworkId = artworkResult.rows.insertId;

  // Add artwork media
  const mediaUrl = `/uploads/${req.file.filename}`;
  await query(
    'INSERT INTO artwork_media (artwork_id, media_url, media_type, is_primary) VALUES (?, ?, ?, ?)',
    [artworkId, mediaUrl, 'image', true]
  );

  // Link artwork to exhibition with exclusive type
  const displayOrder = await query(
    'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM exhibition_artworks WHERE exhibition_id = ?',
    [id]
  );

  await query(
    `INSERT INTO exhibition_artworks (exhibition_id, artwork_id, artwork_type, display_order)
     VALUES (?, ?, 'exclusive', ?)`,
    [id, artworkId, displayOrder.rows[0].next_order]
  );

  successResponse(res, {
    artworkId,
    message: 'Exclusive artwork added successfully',
  }, 'Exclusive artwork added', 201);
});

/**
 * Add comment to exhibition
 */
exports.addCommentToExhibition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  // Verify exhibition exists
  const exhibition = await query('SELECT id FROM exhibitions WHERE id = ?', [id]);
  if (exhibition.length === 0) {
    throw new NotFoundError('Exhibition not found');
  }

  // Insert comment
  const result = await query(
    'INSERT INTO exhibition_comments (exhibition_id, user_id, content) VALUES (?, ?, ?)',
    [id, userId, content]
  );

  // Get the created comment with user info
  const comment = await query(
    `SELECT ec.*, u.username, u.full_name
     FROM exhibition_comments ec
     JOIN users u ON ec.user_id = u.id
     WHERE ec.id = ?`,
    [result.insertId]
  );

  successResponse(res, {
    comment: comment[0],
  }, 'Comment added successfully', 201);
});

/**
 * Favorite exhibition
 */
exports.favoriteExhibition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if already favorited
  const existing = await query(
    'SELECT * FROM exhibition_favorites WHERE exhibition_id = ? AND user_id = ?',
    [id, userId]
  );

  if (existing.length === 0) {
    await query(
      'INSERT INTO exhibition_favorites (exhibition_id, user_id) VALUES (?, ?)',
      [id, userId]
    );
  }

  successResponse(res, {
    favorited: true,
  }, 'Exhibition favorited');
});

/**
 * Unfavorite exhibition
 */
exports.unfavoriteExhibition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  await query(
    'DELETE FROM exhibition_favorites WHERE exhibition_id = ? AND user_id = ?',
    [id, userId]
  );

  successResponse(res, {
    favorited: false,
  }, 'Exhibition unfavorited');
});

/**
 * Follow exhibition
 */
exports.followExhibition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if already following
  const existing = await query(
    'SELECT * FROM exhibition_follows WHERE exhibition_id = ? AND user_id = ?',
    [id, userId]
  );

  if (existing.length === 0) {
    await query(
      'INSERT INTO exhibition_follows (exhibition_id, user_id) VALUES (?, ?)',
      [id, userId]
    );
  }

  successResponse(res, {
    following: true,
  }, 'Following exhibition');
});

/**
 * Unfollow exhibition
 */
exports.unfollowExhibition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  await query(
    'DELETE FROM exhibition_follows WHERE exhibition_id = ? AND user_id = ?',
    [id, userId]
  );

  successResponse(res, {
    following: false,
  }, 'Unfollowed exhibition');
});

module.exports = exports;
