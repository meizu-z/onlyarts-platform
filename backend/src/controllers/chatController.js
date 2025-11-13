const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * @route   GET /api/chat/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
exports.getConversations = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT
      c.id, c.created_at, c.updated_at,
      other.id as other_user_id, other.username as other_user_username,
      other.full_name as other_user_name, other.profile_image as other_user_image,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = FALSE) as unread_count
     FROM conversations c
     JOIN users other ON (c.participant_one_id = other.id AND c.participant_two_id = ?) OR (c.participant_two_id = other.id AND c.participant_one_id = ?)
     WHERE c.participant_one_id = ? OR c.participant_two_id = ?
     ORDER BY c.updated_at DESC`,
    [userId, userId, userId, userId, userId]
  );

  successResponse(res, result.rows, 'Conversations retrieved');
});

/**
 * @route   POST /api/chat/conversations
 * @desc    Create or get conversation
 * @access  Private
 */
exports.createConversation = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { recipientId } = req.body;

  if (userId === parseInt(recipientId)) {
    return next(new AppError('Cannot message yourself', 400));
  }

  // Check if recipient exists
  const userResult = await query('SELECT id FROM users WHERE id = ? AND is_active = TRUE', [recipientId]);
  if (userResult.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  // Check if conversation already exists
  const existingConv = await query(
    `SELECT id FROM conversations
     WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
    [userId, recipientId, recipientId, userId]
  );

  if (existingConv.rows.length > 0) {
    return successResponse(res, { id: existingConv.rows[0].id }, 'Conversation exists');
  }

  // Create new conversation
  const result = await query(
    'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
    [userId, recipientId]
  );

  successResponse(res, {
    id: result.rows.insertId,
  }, 'Conversation created', 201);
});

/**
 * @route   GET /api/chat/conversations/:id/messages
 * @desc    Get conversation messages
 * @access  Private
 */
exports.getMessages = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  // Verify user is part of conversation
  const convResult = await query(
    'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
    [id, userId, userId]
  );

  if (convResult.rows.length === 0) {
    return next(new AppError('Conversation not found or access denied', 404));
  }

  // Get messages
  const result = await query(
    `SELECT
      m.id, m.message, m.is_read, m.created_at,
      u.id as sender_id, u.username as sender_username,
      u.full_name as sender_name, u.profile_image as sender_image
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.conversation_id = ?
     ORDER BY m.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [id]
  );

  // Mark messages as read
  await query(
    'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE',
    [id, userId]
  );

  // Update conversation timestamp
  await query('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [id]);

  const countResult = await query(
    'SELECT COUNT(*) as total FROM messages WHERE conversation_id = ?',
    [id]
  );

  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / limit);

  successResponse(res, {
    messages: result.rows.reverse(), // Reverse to show oldest first
    pagination: { page, limit, total, totalPages },
  }, 'Messages retrieved');
});

/**
 * @route   POST /api/chat/conversations/:id/messages
 * @desc    Send message
 * @access  Private
 */
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { message } = req.body;

  // Verify user is part of conversation
  const convResult = await query(
    'SELECT user1_id, user2_id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
    [id, userId, userId]
  );

  if (convResult.rows.length === 0) {
    return next(new AppError('Conversation not found or access denied', 404));
  }

  const conversation = convResult.rows[0];
  const recipientId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id;

  // Insert message
  const result = await query(
    'INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)',
    [id, userId, message]
  );

  // Update conversation timestamp
  await query('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [id]);

  // Create notification for recipient
  await query(
    `INSERT INTO notifications (user_id, type, title, message, link)
     VALUES (?, 'message', 'New Message', ?, ?)`,
    [recipientId, `You have a new message from @${req.user.username}`, `/chat/${id}`]
  );

  successResponse(res, {
    id: result.rows.insertId,
    message,
    created_at: new Date(),
  }, 'Message sent', 201);
});

/**
 * @route   PUT /api/chat/messages/:id/read
 * @desc    Mark message as read
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Verify message exists and user is recipient
  const messageResult = await query(
    `SELECT m.id, m.conversation_id
     FROM messages m
     JOIN conversations c ON m.conversation_id = c.id
     WHERE m.id = ? AND m.sender_id != ? AND (c.user1_id = ? OR c.user2_id = ?)`,
    [id, userId, userId, userId]
  );

  if (messageResult.rows.length === 0) {
    return next(new AppError('Message not found or access denied', 404));
  }

  await query('UPDATE messages SET is_read = TRUE WHERE id = ?', [id]);

  successResponse(res, null, 'Message marked as read');
});

/**
 * @route   GET /api/chat/unread-count
 * @desc    Get total unread message count
 * @access  Private
 */
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT COUNT(*) as count
     FROM messages m
     JOIN conversations c ON m.conversation_id = c.id
     WHERE (c.user1_id = ? OR c.user2_id = ?)
       AND m.sender_id != ?
       AND m.is_read = FALSE`,
    [userId, userId, userId]
  );

  successResponse(res, {
    unread_count: result.rows[0].count,
  }, 'Unread count retrieved');
});

/**
 * @route   DELETE /api/chat/conversations/:id
 * @desc    Delete conversation
 * @access  Private
 */
exports.deleteConversation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Verify user is part of conversation
  const convResult = await query(
    'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
    [id, userId, userId]
  );

  if (convResult.rows.length === 0) {
    return next(new AppError('Conversation not found or access denied', 404));
  }

  await query('DELETE FROM conversations WHERE id = ?', [id]);

  successResponse(res, null, 'Conversation deleted');
});

module.exports = exports;
