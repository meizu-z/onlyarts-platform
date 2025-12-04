const { query } = require('../config/database');

/**
 * Create a notification and emit real-time event
 * @param {Object} params - Notification parameters
 * @param {number} params.userId - User to notify
 * @param {string} params.type - Notification type (like, comment, follow, post)
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {Object} params.data - Additional data (artwork_id, comment_id, etc.)
 * @param {Object} io - Socket.io instance
 */
const createNotification = async ({ userId, type, title, message, data }, io) => {
  try {
    // Insert notification into database
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, type, title, message, JSON.stringify(data)]
    );

    const notificationId = result.rows.insertId;

    // Get the full notification data to emit
    const notificationResult = await query(
      `SELECT id, user_id, type, title, message, data, is_read, created_at
       FROM notifications WHERE id = ?`,
      [notificationId]
    );

    const notification = notificationResult.rows[0];
    if (notification && notification.data) {
      try {
        notification.data = JSON.parse(notification.data);
      } catch (e) {
        console.error('Failed to parse notification data:', e);
      }
    }

    // Emit real-time notification if socket.io is available
    if (io && io.notificationHelpers) {
      io.notificationHelpers.emitToUser(userId, 'new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create notification for artwork like
 */
const createLikeNotification = async ({ artworkId, likerId, artistId, artworkTitle }, io) => {
  // Don't notify if user likes their own artwork
  if (likerId === artistId) return null;

  // Get liker's name
  const likerResult = await query(
    'SELECT username, full_name FROM users WHERE id = ?',
    [likerId]
  );

  const likerName = likerResult.rows[0]?.full_name || likerResult.rows[0]?.username || 'Someone';

  return createNotification({
    userId: artistId,
    type: 'like',
    title: 'New Like',
    message: `${likerName} liked your artwork "${artworkTitle}"`,
    data: {
      artwork_id: artworkId,
      liker_id: likerId,
      liker_name: likerName,
      link: `/artwork/${artworkId}`
    }
  }, io);
};

/**
 * Create notification for artwork comment
 */
const createCommentNotification = async ({ artworkId, commenterId, artistId, artworkTitle, commentText }, io) => {
  // Don't notify if user comments on their own artwork
  if (commenterId === artistId) return null;

  // Get commenter's name
  const commenterResult = await query(
    'SELECT username, full_name FROM users WHERE id = ?',
    [commenterId]
  );

  const commenterName = commenterResult.rows[0]?.full_name || commenterResult.rows[0]?.username || 'Someone';

  // Truncate comment for preview
  const commentPreview = commentText.length > 50
    ? commentText.substring(0, 50) + '...'
    : commentText;

  return createNotification({
    userId: artistId,
    type: 'comment',
    title: 'New Comment',
    message: `${commenterName} commented on your artwork "${artworkTitle}": "${commentPreview}"`,
    data: {
      artwork_id: artworkId,
      commenter_id: commenterId,
      commenter_name: commenterName,
      link: `/artwork/${artworkId}`
    }
  }, io);
};

/**
 * Create notification for new post from followed artist
 */
const createNewPostNotification = async ({ artworkId, artistId, artworkTitle }, io) => {
  try {
    // Get artist's name
    const artistResult = await query(
      'SELECT username, full_name FROM users WHERE id = ?',
      [artistId]
    );

    const artistName = artistResult.rows[0]?.full_name || artistResult.rows[0]?.username || 'An artist';

    // Get all followers of this artist
    const followersResult = await query(
      `SELECT follower_id FROM follows WHERE following_id = ?`,
      [artistId]
    );

    const followers = followersResult.rows;

    // Create notification for each follower
    const notifications = [];
    for (const follower of followers) {
      const notification = await createNotification({
        userId: follower.follower_id,
        type: 'post',
        title: 'New Post',
        message: `${artistName} just posted a new artwork: "${artworkTitle}"`,
        data: {
          artwork_id: artworkId,
          artist_id: artistId,
          artist_name: artistName,
          link: `/artwork/${artworkId}`
        }
      }, io);
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating new post notifications:', error);
    throw error;
  }
};

/**
 * Create notification for artwork share
 */
const createShareNotification = async ({ artworkId, sharerId, artistId, artworkTitle }, io) => {
  // Don't notify if user shares their own artwork
  if (sharerId === artistId) return null;

  // Get sharer's name
  const sharerResult = await query(
    'SELECT username, full_name FROM users WHERE id = ?',
    [sharerId]
  );

  const sharerName = sharerResult.rows[0]?.full_name || sharerResult.rows[0]?.username || 'Someone';

  return createNotification({
    userId: artistId,
    type: 'share',
    title: 'Artwork Shared',
    message: `${sharerName} shared your artwork "${artworkTitle}" to their profile`,
    data: {
      artwork_id: artworkId,
      sharer_id: sharerId,
      sharer_name: sharerName,
      link: `/artwork/${artworkId}`
    }
  }, io);
};

module.exports = {
  createNotification,
  createLikeNotification,
  createCommentNotification,
  createNewPostNotification,
  createShareNotification
};
