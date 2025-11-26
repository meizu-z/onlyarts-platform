const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * @route   POST /api/livestreams
 * @desc    Create/Schedule livestream
 * @access  Private (Premium Artists only)
 */
exports.createLivestream = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { title, description, scheduledFor, thumbnailUrl, isAuction, startingBid } = req.body;

  // Check if user can create livestreams (any artist)
  if (req.user.role !== 'artist' && req.user.role !== 'admin') {
    return next(new AppError('Only artists can create livestreams', 403));
  }

  const result = await query(
    `INSERT INTO livestreams (artist_id, title, description, scheduled_start_at, thumbnail_url, status)
     VALUES (?, ?, ?, ?, ?, 'scheduled')`,
    [userId, title, description, scheduledFor || null, thumbnailUrl || null]
  );

  const livestreamId = result.rows.insertId;

  // TODO: Notify followers when notifications table is implemented

  successResponse(res, {
    stream: {
      id: livestreamId,
      title,
      description,
      status: 'scheduled',
      artist_id: userId
    }
  }, 'Livestream created', 201);
});

/**
 * @route   GET /api/livestreams
 * @desc    Get livestreams
 * @access  Public
 */
exports.getLivestreams = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  const status = req.query.status; // 'live', 'scheduled', 'ended'

  let whereClause = '1=1';
  const params = [];

  if (status) {
    whereClause += ' AND l.status = ?';
    params.push(status);
  } else {
    // By default, show live and scheduled streams
    whereClause += ' AND l.status IN (?, ?)';
    params.push('live', 'scheduled');
  }

  const result = await query(
    `SELECT
      l.id, l.title, l.description, l.scheduled_start_at, l.started_at, l.ended_at,
      l.thumbnail_url, l.viewer_count, l.status, l.created_at,
      u.id as host_id, u.username as host_username, u.full_name as host_name,
      u.profile_image as host_image
     FROM livestreams l
     JOIN users u ON l.artist_id = u.id
     WHERE ${whereClause}
     ORDER BY
       CASE WHEN l.status = 'live' THEN 1
            WHEN l.status = 'scheduled' THEN 2
            ELSE 3
       END,
       l.scheduled_start_at ASC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) as total FROM livestreams l WHERE ${whereClause}`,
    params
  );

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);

  successResponse(res, {
    livestreams: result.rows,
    pagination: { page, limit, total, totalPages },
  }, 'Livestreams retrieved');
});

/**
 * @route   GET /api/livestreams/:id
 * @desc    Get livestream details
 * @access  Public
 */
exports.getLivestreamById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await query(
    `SELECT
      l.*,
      u.id as host_id, u.username as host_username, u.full_name as host_name,
      u.profile_image as host_image, u.subscription as subscription_tier
     FROM livestreams l
     JOIN users u ON l.artist_id = u.id
     WHERE l.id = ?`,
    [id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Livestream not found', 404));
  }

  const livestream = result.rows[0];

  // Increment view count if live
  if (livestream.status === 'live') {
    await query('UPDATE livestreams SET viewer_count = viewer_count + 1 WHERE id = ?', [id]);
  }

  successResponse(res, livestream, 'Livestream retrieved');
});

/**
 * @route   PUT /api/livestreams/:id/start
 * @desc    Start livestream
 * @access  Private (Host only)
 */
exports.startLivestream = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check ownership
  const livestreamResult = await query('SELECT artist_id, status FROM livestreams WHERE id = ?', [id]);
  if (livestreamResult.rows.length === 0) {
    return next(new AppError('Livestream not found', 404));
  }

  const livestream = livestreamResult.rows[0];
  if (livestream.artist_id !== userId) {
    return next(new AppError('Access denied', 403));
  }

  if (livestream.status !== 'scheduled') {
    return next(new AppError('Can only start scheduled livestreams', 400));
  }

  await query(
    'UPDATE livestreams SET status = ?, started_at = NOW() WHERE id = ?',
    ['live', id]
  );

  // TODO: Notify followers when notifications table is implemented

  successResponse(res, { status: 'live' }, 'Livestream started');
});

/**
 * @route   PUT /api/livestreams/:id/end
 * @desc    End livestream
 * @access  Private (Host only)
 */
exports.endLivestream = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check ownership
  const livestreamResult = await query('SELECT artist_id, status FROM livestreams WHERE id = ?', [id]);
  if (livestreamResult.rows.length === 0) {
    return next(new AppError('Livestream not found', 404));
  }

  const livestream = livestreamResult.rows[0];
  if (livestream.artist_id !== userId) {
    return next(new AppError('Access denied', 403));
  }

  if (livestream.status !== 'live') {
    return next(new AppError('Can only end live livestreams', 400));
  }

  await query(
    'UPDATE livestreams SET status = ?, ended_at = NOW() WHERE id = ?',
    ['ended', id]
  );

  successResponse(res, { status: 'ended' }, 'Livestream ended');
});

/**
 * @route   DELETE /api/livestreams/:id
 * @desc    Delete/Cancel livestream
 * @access  Private (Host only)
 */
exports.deleteLivestream = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check ownership
  const livestreamResult = await query('SELECT artist_id, status FROM livestreams WHERE id = ?', [id]);
  if (livestreamResult.rows.length === 0) {
    return next(new AppError('Livestream not found', 404));
  }

  const livestream = livestreamResult.rows[0];
  if (livestream.artist_id !== userId && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  // Can't delete live streams
  if (livestream.status === 'live') {
    return next(new AppError('Cannot delete a live livestream. End it first.', 400));
  }

  await query('DELETE FROM livestreams WHERE id = ?', [id]);

  successResponse(res, null, 'Livestream deleted');
});

module.exports = exports;
