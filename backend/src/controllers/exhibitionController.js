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
  const { title, description, startDate, endDate, artworkIds, isPrivate, coverImage } = req.body;

  // Verify user can create exhibitions (premium or artist)
  if (req.user.subscription_tier === 'free' && req.user.role !== 'artist') {
    return next(new AppError('Upgrade to Premium to create exhibitions', 403));
  }

  const result = await query(
    `INSERT INTO exhibitions (curator_id, title, description, start_date, end_date, is_private, cover_image, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
    [userId, title, description, startDate, endDate, isPrivate || false, coverImage || null]
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
    status: 'draft',
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
      ea.display_order
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

module.exports = exports;
