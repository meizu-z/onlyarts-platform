const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * Chat Socket Handler
 * Manages real-time chat functionality
 */
module.exports = (io) => {
  // Namespace for chat
  const chatNamespace = io.of('/chat');

  // Middleware to authenticate socket connections
  chatNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  chatNamespace.on('connection', (socket) => {
    console.log(`💬 User ${socket.userId} connected to chat`);

    // Join user's personal room for direct messages
    socket.join(`user:${socket.userId}`);

    // Join a conversation room
    socket.on('join_conversation', async (conversationId) => {
      try {
        // Verify user is part of this conversation
        const result = await query(
          `SELECT * FROM conversations
           WHERE id = ? AND (participant_one_id = ? OR participant_two_id = ?)`,
          [conversationId, socket.userId, socket.userId]
        );

        if (result.rows.length === 0) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        socket.emit('joined_conversation', { conversationId });
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Send a message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content } = data;

        // Verify user is part of conversation
        const conversationResult = await query(
          `SELECT * FROM conversations
           WHERE id = ? AND (participant_one_id = ? OR participant_two_id = ?)`,
          [conversationId, socket.userId, socket.userId]
        );

        if (conversationResult.rows.length === 0) {
          socket.emit('error', { message: 'Not authorized to send messages in this conversation' });
          return;
        }

        const conversation = conversationResult.rows[0];

        // Insert message into database
        const messageResult = await query(
          `INSERT INTO messages (conversation_id, sender_id, content, created_at)
           VALUES (?, ?, ?, NOW())`,
          [conversationId, socket.userId, content]
        );

        const messageId = messageResult.result.insertId;

        // Update conversation's last_message_at
        await query(
          `UPDATE conversations SET last_message_at = NOW() WHERE id = ?`,
          [conversationId]
        );

        // Get the full message data
        const messageData = await query(
          `SELECT m.*, u.username, u.avatar_url
           FROM messages m
           JOIN users u ON m.sender_id = u.id
           WHERE m.id = ?`,
          [messageId]
        );

        const message = messageData.rows[0];

        // Emit to all users in the conversation room
        chatNamespace.to(`conversation:${conversationId}`).emit('new_message', message);

        // Send notification to the other participant
        const recipientId = conversation.participant_one_id === socket.userId
          ? conversation.participant_two_id
          : conversation.participant_one_id;

        chatNamespace.to(`user:${recipientId}`).emit('message_notification', {
          conversationId,
          message
        });

        console.log(`Message sent in conversation ${conversationId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        conversationId
      });
    });

    // Stop typing indicator
    socket.on('stop_typing', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        userId: socket.userId,
        conversationId
      });
    });

    // Mark messages as read
    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId } = data;

        await query(
          `UPDATE messages
           SET is_read = TRUE
           WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE`,
          [conversationId, socket.userId]
        );

        socket.to(`conversation:${conversationId}`).emit('messages_read', {
          conversationId,
          readBy: socket.userId
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`💬 User ${socket.userId} disconnected from chat`);
    });
  });
};
