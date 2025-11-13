const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const unreadOnly = req.query.unreadOnly === 'true';

  // Build query based on filters
  let whereClause = 'WHERE user_id = ?';
  const params = [userId];

  if (unreadOnly) {
    whereClause += ' AND is_read = FALSE';
  }

  // Get notifications
  const notificationsResult = await query(
    `SELECT * FROM notifications
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
    params
  );

  // Parse JSON data
  const notifications = notificationsResult.rows.map(notification => ({
    ...notification,
    data: notification.data ? (typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data) : null,
  }));

  successResponse(res, {
    notifications,
    pagination: {
      total: countResult.rows[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  }, 'Notifications retrieved');
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const result = await query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );

  successResponse(res, {
    count: result.rows[0].count,
  }, 'Unread count retrieved');
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if notification belongs to user
  const notificationResult = await query(
    'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (notificationResult.rows.length === 0) {
    return next(new AppError('Notification not found', 404));
  }

  // Mark as read
  await query(
    'UPDATE notifications SET is_read = TRUE WHERE id = ?',
    [id]
  );

  successResponse(res, null, 'Notification marked as read');
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  await query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );

  successResponse(res, null, 'All notifications marked as read');
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if notification belongs to user
  const notificationResult = await query(
    'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (notificationResult.rows.length === 0) {
    return next(new AppError('Notification not found', 404));
  }

  // Delete notification
  await query('DELETE FROM notifications WHERE id = ?', [id]);

  successResponse(res, null, 'Notification deleted');
});

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all read notifications
 * @access  Private
 */
exports.deleteAllRead = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const result = await query(
    'DELETE FROM notifications WHERE user_id = ? AND is_read = TRUE',
    [userId]
  );

  successResponse(res, {
    deletedCount: result.rows.affectedRows || 0,
  }, 'Read notifications deleted');
});

module.exports = exports;
