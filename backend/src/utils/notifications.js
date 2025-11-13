const { query } = require('../config/database');

/**
 * Notification types
 */
const NOTIFICATION_TYPES = {
  ORDER: 'order',
  PAYMENT: 'payment',
  FOLLOW: 'follow',
  LIKE: 'like',
  COMMENT: 'comment',
  MESSAGE: 'message',
  SYSTEM: 'system',
};

/**
 * Create a notification for a user
 * @param {number} userId - User ID to notify
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data (optional)
 * @returns {Promise} Created notification
 */
const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, type, title, message, data ? JSON.stringify(data) : null]
    );

    return {
      id: result.rows.insertId,
      userId,
      type,
      title,
      message,
      data,
    };
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};

/**
 * Create notifications for multiple users
 * @param {Array<number>} userIds - Array of user IDs
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data (optional)
 * @returns {Promise} Number of notifications created
 */
const createBulkNotifications = async (userIds, type, title, message, data = null) => {
  try {
    const promises = userIds.map(userId =>
      createNotification(userId, type, title, message, data)
    );
    await Promise.all(promises);
    return userIds.length;
  } catch (error) {
    console.error('Failed to create bulk notifications:', error);
    throw error;
  }
};

/**
 * Notify user about new order
 */
const notifyNewOrder = async (buyerId, orderId, orderNumber, totalAmount) => {
  return createNotification(
    buyerId,
    NOTIFICATION_TYPES.ORDER,
    'Order Placed Successfully',
    `Your order ${orderNumber} for $${totalAmount} has been placed successfully.`,
    { orderId, orderNumber, totalAmount }
  );
};

/**
 * Notify seller about new sale
 */
const notifyNewSale = async (sellerId, orderId, orderNumber, artworkTitle, quantity, earnings) => {
  return createNotification(
    sellerId,
    NOTIFICATION_TYPES.ORDER,
    'New Sale!',
    `Your artwork "${artworkTitle}" was purchased (Qty: ${quantity}). You earned $${earnings}.`,
    { orderId, orderNumber, artworkTitle, quantity, earnings }
  );
};

/**
 * Notify user about payment success
 */
const notifyPaymentSuccess = async (userId, orderId, orderNumber, amount) => {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.PAYMENT,
    'Payment Successful',
    `Payment of $${amount} for order ${orderNumber} was successful.`,
    { orderId, orderNumber, amount }
  );
};

/**
 * Notify user about payment failure
 */
const notifyPaymentFailed = async (userId, orderId, orderNumber, amount) => {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.PAYMENT,
    'Payment Failed',
    `Payment of $${amount} for order ${orderNumber} failed. Please try again.`,
    { orderId, orderNumber, amount }
  );
};

/**
 * Notify user about order status change
 */
const notifyOrderStatusChange = async (userId, orderId, orderNumber, oldStatus, newStatus) => {
  const statusMessages = {
    processing: 'is being processed',
    shipped: 'has been shipped',
    delivered: 'has been delivered',
    cancelled: 'has been cancelled',
  };

  const message = `Your order ${orderNumber} ${statusMessages[newStatus] || `status changed to ${newStatus}`}.`;

  return createNotification(
    userId,
    NOTIFICATION_TYPES.ORDER,
    'Order Status Update',
    message,
    { orderId, orderNumber, oldStatus, newStatus }
  );
};

/**
 * Notify user about new follower
 */
const notifyNewFollower = async (userId, followerId, followerUsername) => {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.FOLLOW,
    'New Follower',
    `${followerUsername} started following you.`,
    { followerId, followerUsername }
  );
};

/**
 * Notify user about artwork like
 */
const notifyArtworkLike = async (artistId, likerId, likerUsername, artworkId, artworkTitle) => {
  return createNotification(
    artistId,
    NOTIFICATION_TYPES.LIKE,
    'New Like',
    `${likerUsername} liked your artwork "${artworkTitle}".`,
    { likerId, likerUsername, artworkId, artworkTitle }
  );
};

/**
 * Notify user about new comment
 */
const notifyNewComment = async (artistId, commenterId, commenterUsername, artworkId, artworkTitle, commentText) => {
  const truncatedComment = commentText.length > 50
    ? commentText.substring(0, 50) + '...'
    : commentText;

  return createNotification(
    artistId,
    NOTIFICATION_TYPES.COMMENT,
    'New Comment',
    `${commenterUsername} commented on "${artworkTitle}": ${truncatedComment}`,
    { commenterId, commenterUsername, artworkId, artworkTitle }
  );
};

/**
 * Notify user about comment reply
 */
const notifyCommentReply = async (userId, replierId, replierUsername, artworkId, artworkTitle, replyText) => {
  const truncatedReply = replyText.length > 50
    ? replyText.substring(0, 50) + '...'
    : replyText;

  return createNotification(
    userId,
    NOTIFICATION_TYPES.COMMENT,
    'Comment Reply',
    `${replierUsername} replied to your comment: ${truncatedReply}`,
    { replierId, replierUsername, artworkId, artworkTitle }
  );
};

/**
 * Notify user about new message
 */
const notifyNewMessage = async (userId, senderId, senderUsername, messagePreview) => {
  const truncatedMessage = messagePreview.length > 50
    ? messagePreview.substring(0, 50) + '...'
    : messagePreview;

  return createNotification(
    userId,
    NOTIFICATION_TYPES.MESSAGE,
    'New Message',
    `${senderUsername}: ${truncatedMessage}`,
    { senderId, senderUsername }
  );
};

/**
 * Send system notification to user
 */
const notifySystem = async (userId, title, message, data = null) => {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.SYSTEM,
    title,
    message,
    data
  );
};

/**
 * Send system notification to all users
 */
const notifySystemBroadcast = async (title, message, data = null) => {
  try {
    const usersResult = await query('SELECT id FROM users WHERE is_active = TRUE');
    const userIds = usersResult.rows.map(user => user.id);

    return createBulkNotifications(userIds, NOTIFICATION_TYPES.SYSTEM, title, message, data);
  } catch (error) {
    console.error('Failed to send system broadcast:', error);
    throw error;
  }
};

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  createBulkNotifications,
  notifyNewOrder,
  notifyNewSale,
  notifyPaymentSuccess,
  notifyPaymentFailed,
  notifyOrderStatusChange,
  notifyNewFollower,
  notifyArtworkLike,
  notifyNewComment,
  notifyCommentReply,
  notifyNewMessage,
  notifySystem,
  notifySystemBroadcast,
};
