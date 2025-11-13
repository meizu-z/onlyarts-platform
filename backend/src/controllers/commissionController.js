const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * @route   POST /api/commissions
 * @desc    Create commission request
 * @access  Private
 */
exports.createCommission = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { artistId, title, description, budget, deadline, referenceImages } = req.body;

  // Validate artist exists
  const artistResult = await query(
    'SELECT id, role FROM users WHERE id = ? AND is_active = TRUE',
    [artistId]
  );

  if (artistResult.rows.length === 0 || artistResult.rows[0].role !== 'artist') {
    return next(new AppError('Artist not found', 404));
  }

  // Can't commission yourself
  if (artistId === userId) {
    return next(new AppError('You cannot commission yourself', 400));
  }

  const result = await query(
    `INSERT INTO commissions
     (client_id, artist_id, title, description, budget, deadline, reference_images, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [userId, artistId, title, description, budget, deadline, JSON.stringify(referenceImages || [])]
  );

  // Create notification for artist
  await query(
    `INSERT INTO notifications (user_id, type, title, message, link)
     VALUES (?, 'commission', 'New Commission Request', ?, ?)`,
    [
      artistId,
      `You have a new commission request for "${title}"`,
      `/commissions/${result.rows.insertId}`
    ]
  );

  successResponse(res, {
    id: result.rows.insertId,
    status: 'pending',
  }, 'Commission request created', 201);
});

/**
 * @route   GET /api/commissions
 * @desc    Get user's commissions (as client)
 * @access  Private
 */
exports.getMyCommissions = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const status = req.query.status;

  let whereClause = 'c.client_id = ?';
  const params = [userId];

  if (status) {
    whereClause += ' AND c.status = ?';
    params.push(status);
  }

  const result = await query(
    `SELECT
      c.id, c.title, c.description, c.budget, c.deadline, c.status,
      c.created_at, c.updated_at,
      u.id as artist_id, u.username as artist_username, u.full_name as artist_name,
      u.profile_image as artist_image
     FROM commissions c
     JOIN users u ON c.artist_id = u.id
     WHERE ${whereClause}
     ORDER BY c.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) as total FROM commissions c WHERE ${whereClause}`,
    params
  );

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);

  successResponse(res, {
    commissions: result.rows,
    pagination: { page, limit, total, totalPages },
  }, 'Commissions retrieved');
});

/**
 * @route   GET /api/commissions/requests
 * @desc    Get commission requests for artist
 * @access  Private (Artists only)
 */
exports.getCommissionRequests = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const status = req.query.status;

  let whereClause = 'c.artist_id = ?';
  const params = [userId];

  if (status) {
    whereClause += ' AND c.status = ?';
    params.push(status);
  }

  const result = await query(
    `SELECT
      c.id, c.title, c.description, c.budget, c.deadline, c.status,
      c.reference_images, c.created_at, c.updated_at,
      u.id as client_id, u.username as client_username, u.full_name as client_name,
      u.profile_image as client_image, u.email as client_email
     FROM commissions c
     JOIN users u ON c.client_id = u.id
     WHERE ${whereClause}
     ORDER BY c.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  // Parse reference_images JSON
  const commissions = result.rows.map(commission => ({
    ...commission,
    reference_images: commission.reference_images ? JSON.parse(commission.reference_images) : [],
  }));

  const countResult = await query(
    `SELECT COUNT(*) as total FROM commissions c WHERE ${whereClause}`,
    params
  );

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);

  successResponse(res, {
    commissions,
    pagination: { page, limit, total, totalPages },
  }, 'Commission requests retrieved');
});

/**
 * @route   GET /api/commissions/:id
 * @desc    Get commission details
 * @access  Private
 */
exports.getCommissionById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await query(
    `SELECT
      c.*,
      client.id as client_id, client.username as client_username,
      client.full_name as client_name, client.profile_image as client_image,
      client.email as client_email,
      artist.id as artist_id, artist.username as artist_username,
      artist.full_name as artist_name, artist.profile_image as artist_image
     FROM commissions c
     JOIN users client ON c.client_id = client.id
     JOIN users artist ON c.artist_id = artist.id
     WHERE c.id = ?`,
    [id]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Commission not found', 404));
  }

  const commission = result.rows[0];

  // Check if user has access
  if (commission.client_id !== userId && commission.artist_id !== userId && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  // Parse reference_images
  commission.reference_images = commission.reference_images ? JSON.parse(commission.reference_images) : [];

  successResponse(res, commission, 'Commission retrieved');
});

/**
 * @route   PUT /api/commissions/:id/status
 * @desc    Update commission status (accept/reject/complete)
 * @access  Private (Artist or Client)
 */
exports.updateCommissionStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, message } = req.body;
  const userId = req.user.id;

  const validStatuses = ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  // Get commission
  const commissionResult = await query('SELECT * FROM commissions WHERE id = ?', [id]);
  if (commissionResult.rows.length === 0) {
    return next(new AppError('Commission not found', 404));
  }

  const commission = commissionResult.rows[0];

  // Only artist can accept/reject, only client can cancel
  if (status === 'accepted' || status === 'rejected' || status === 'in_progress' || status === 'completed') {
    if (commission.artist_id !== userId) {
      return next(new AppError('Only the artist can update this status', 403));
    }
  } else if (status === 'cancelled') {
    if (commission.client_id !== userId) {
      return next(new AppError('Only the client can cancel', 403));
    }
  }

  await query('UPDATE commissions SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

  // Create notification
  const notifyUserId = status === 'cancelled' ? commission.artist_id : commission.client_id;
  await query(
    `INSERT INTO notifications (user_id, type, title, message, link)
     VALUES (?, 'commission', 'Commission Update', ?, ?)`,
    [
      notifyUserId,
      message || `Commission "${commission.title}" status: ${status}`,
      `/commissions/${id}`
    ]
  );

  successResponse(res, { status }, 'Commission status updated');
});

/**
 * @route   POST /api/commissions/:id/messages
 * @desc    Add message to commission thread
 * @access  Private
 */
exports.addCommissionMessage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.user.id;

  // Verify commission exists and user has access
  const commissionResult = await query('SELECT * FROM commissions WHERE id = ?', [id]);
  if (commissionResult.rows.length === 0) {
    return next(new AppError('Commission not found', 404));
  }

  const commission = commissionResult.rows[0];
  if (commission.client_id !== userId && commission.artist_id !== userId) {
    return next(new AppError('Access denied', 403));
  }

  const result = await query(
    `INSERT INTO commission_messages (commission_id, sender_id, message)
     VALUES (?, ?, ?)`,
    [id, userId, message]
  );

  successResponse(res, {
    id: result.rows.insertId,
    message,
  }, 'Message sent', 201);
});

/**
 * @route   GET /api/commissions/:id/messages
 * @desc    Get commission messages
 * @access  Private
 */
exports.getCommissionMessages = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Verify access
  const commissionResult = await query('SELECT * FROM commissions WHERE id = ?', [id]);
  if (commissionResult.rows.length === 0) {
    return next(new AppError('Commission not found', 404));
  }

  const commission = commissionResult.rows[0];
  if (commission.client_id !== userId && commission.artist_id !== userId && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  const result = await query(
    `SELECT
      cm.id, cm.message, cm.created_at,
      u.id as sender_id, u.username as sender_username,
      u.full_name as sender_name, u.profile_image as sender_image
     FROM commission_messages cm
     JOIN users u ON cm.sender_id = u.id
     WHERE cm.commission_id = ?
     ORDER BY cm.created_at ASC`,
    [id]
  );

  successResponse(res, result.rows, 'Messages retrieved');
});

module.exports = exports;
