const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { notifyLivestreamStarted } = require('../utils/notifications');

/**
 * Livestream Socket Handler
 * Manages real-time livestreaming functionality
 */
module.exports = (io) => {
  // Namespace for livestreams
  const livestreamNamespace = io.of('/livestream');

  // Middleware to authenticate socket connections (optional for viewers)
  livestreamNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        socket.userId = decoded.userId;
        socket.isAuthenticated = true;
      } catch (error) {
        console.error('Livestream socket authentication error:', error.message);
        socket.isAuthenticated = false;
      }
    } else {
      socket.isAuthenticated = false;
    }

    next();
  });

  livestreamNamespace.on('connection', (socket) => {
    console.log(`📺 User ${socket.userId || 'anonymous'} connected to livestream`);

    // Join a livestream room
    socket.on('join_stream', async (livestreamId) => {
      try {
        // Check if livestream exists and is live
        const result = await query(
          `SELECT * FROM livestreams WHERE id = ? AND status = 'live'`,
          [livestreamId]
        );

        if (result.rows.length === 0) {
          socket.emit('error', { message: 'Livestream not found or not live' });
          return;
        }

        const livestream = result.rows[0];

        // Join the livestream room
        socket.join(`stream:${livestreamId}`);
        socket.currentStream = livestreamId;

        // Increment viewer count
        await query(
          `UPDATE livestreams
           SET viewer_count = viewer_count + 1,
               peak_viewer_count = GREATEST(peak_viewer_count, viewer_count + 1)
           WHERE id = ?`,
          [livestreamId]
        );

        // Get updated viewer count
        const updatedResult = await query(
          `SELECT viewer_count FROM livestreams WHERE id = ?`,
          [livestreamId]
        );

        const viewerCount = updatedResult.rows[0].viewer_count;

        // Notify all viewers in the room about new viewer count
        livestreamNamespace.to(`stream:${livestreamId}`).emit('viewer_count_update', {
          livestreamId,
          viewerCount
        });

        socket.emit('joined_stream', {
          livestreamId,
          viewerCount,
          title: livestream.title,
          artistId: livestream.artist_id
        });

        console.log(`User joined livestream ${livestreamId}, viewers: ${viewerCount}`);
      } catch (error) {
        console.error('Error joining livestream:', error);
        socket.emit('error', { message: 'Failed to join livestream' });
      }
    });

    // Leave a livestream
    socket.on('leave_stream', async (livestreamId) => {
      try {
        if (socket.currentStream === livestreamId) {
          socket.leave(`stream:${livestreamId}`);

          // Decrement viewer count
          await query(
            `UPDATE livestreams
             SET viewer_count = GREATEST(0, viewer_count - 1)
             WHERE id = ?`,
            [livestreamId]
          );

          // Get updated viewer count
          const result = await query(
            `SELECT viewer_count FROM livestreams WHERE id = ?`,
            [livestreamId]
          );

          const viewerCount = result.rows[0].viewer_count;

          // Notify remaining viewers
          livestreamNamespace.to(`stream:${livestreamId}`).emit('viewer_count_update', {
            livestreamId,
            viewerCount
          });

          socket.currentStream = null;
          console.log(`User left livestream ${livestreamId}, viewers: ${viewerCount}`);
        }
      } catch (error) {
        console.error('Error leaving livestream:', error);
      }
    });

    // Send a chat message in livestream
    socket.on('stream_chat_message', async (data) => {
      try {
        if (!socket.isAuthenticated) {
          socket.emit('error', { message: 'Must be logged in to chat' });
          return;
        }

        const { livestreamId, message } = data;

        if (!socket.currentStream || socket.currentStream !== livestreamId) {
          socket.emit('error', { message: 'Not in this livestream' });
          return;
        }

        // Get user info
        const userResult = await query(
          `SELECT id, username, avatar_url FROM users WHERE id = ?`,
          [socket.userId]
        );

        if (userResult.rows.length === 0) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        const user = userResult.rows[0];

        // Broadcast message to all viewers in the stream
        livestreamNamespace.to(`stream:${livestreamId}`).emit('stream_chat_message', {
          id: Date.now(), // Temporary ID
          livestreamId,
          userId: user.id,
          username: user.username,
          avatarUrl: user.avatar_url,
          message,
          timestamp: new Date()
        });

        console.log(`Chat message in livestream ${livestreamId} from ${user.username}`);
      } catch (error) {
        console.error('Error sending stream chat message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Artist starts livestream
    socket.on('start_stream', async (livestreamId) => {
      try {
        if (!socket.isAuthenticated) {
          socket.emit('error', { message: 'Must be logged in' });
          return;
        }

        // Verify user is the artist for this livestream
        const result = await query(
          `SELECT * FROM livestreams WHERE id = ? AND artist_id = ?`,
          [livestreamId, socket.userId]
        );

        if (result.rows.length === 0) {
          socket.emit('error', { message: 'Not authorized to start this livestream' });
          return;
        }

        // Update livestream status to live
        await query(
          `UPDATE livestreams
           SET status = 'live', started_at = NOW()
           WHERE id = ?`,
          [livestreamId]
        );

        // Get stream details to broadcast
        const streamDetails = await query(
          `SELECT
            l.id, l.title, l.description, l.thumbnail_url,
            u.id as host_id, u.username as host_username, u.full_name as host_name,
            u.profile_image as host_image
           FROM livestreams l
           JOIN users u ON l.artist_id = u.id
           WHERE l.id = ?`,
          [livestreamId]
        );

        socket.emit('stream_started', { livestreamId });

        // Broadcast to ALL users that a new stream is live
        livestreamNamespace.emit('new_stream_live', {
          stream: streamDetails.rows[0]
        });

        // Send notifications to followers
        try {
          const stream = streamDetails.rows[0];
          await notifyLivestreamStarted(
            stream.host_id,
            stream.host_username,
            livestreamId,
            stream.title
          );
        } catch (error) {
          console.error('Failed to send livestream notifications:', error);
        }

        console.log(`Livestream ${livestreamId} started by user ${socket.userId}`);
      } catch (error) {
        console.error('Error starting livestream:', error);
        socket.emit('error', { message: 'Failed to start livestream' });
      }
    });

    // Artist ends livestream
    socket.on('end_stream', async (livestreamId) => {
      try {
        if (!socket.isAuthenticated) {
          socket.emit('error', { message: 'Must be logged in' });
          return;
        }

        // Verify user is the artist for this livestream
        const result = await query(
          `SELECT * FROM livestreams WHERE id = ? AND artist_id = ?`,
          [livestreamId, socket.userId]
        );

        if (result.rows.length === 0) {
          socket.emit('error', { message: 'Not authorized to end this livestream' });
          return;
        }

        // Update livestream status to ended
        await query(
          `UPDATE livestreams
           SET status = 'ended', ended_at = NOW(), viewer_count = 0
           WHERE id = ?`,
          [livestreamId]
        );

        // Notify all viewers that stream has ended
        livestreamNamespace.to(`stream:${livestreamId}`).emit('stream_ended', {
          livestreamId
        });

        socket.emit('stream_ended_confirm', { livestreamId });
        console.log(`Livestream ${livestreamId} ended by user ${socket.userId}`);
      } catch (error) {
        console.error('Error ending livestream:', error);
        socket.emit('error', { message: 'Failed to end livestream' });
      }
    });

    // WebRTC Signaling: Broadcaster sends offer to viewer
    socket.on('webrtc_offer', (data) => {
      const { livestreamId, viewerId, offer } = data;
      console.log(`📡 WebRTC offer from broadcaster to viewer ${viewerId} in stream ${livestreamId}`);

      // Forward offer to specific viewer
      livestreamNamespace.to(viewerId).emit('webrtc_offer', {
        livestreamId,
        offer
      });
    });

    // WebRTC Signaling: Viewer sends answer to broadcaster
    socket.on('webrtc_answer', (data) => {
      const { livestreamId, answer } = data;
      console.log(`📡 WebRTC answer from viewer ${socket.id} in stream ${livestreamId}`);

      // Forward answer to broadcaster (all artists in the stream room)
      socket.to(`stream:${livestreamId}`).emit('webrtc_answer', {
        viewerId: socket.id,
        answer
      });
    });

    // WebRTC Signaling: Exchange ICE candidates
    socket.on('webrtc_ice_candidate', (data) => {
      const { livestreamId, viewerId, candidate } = data;
      console.log(`📡 ICE candidate in stream ${livestreamId}`);

      if (viewerId) {
        // Broadcaster sending ICE candidate to specific viewer
        livestreamNamespace.to(viewerId).emit('webrtc_ice_candidate', {
          candidate
        });
      } else {
        // Viewer sending ICE candidate to broadcaster
        socket.to(`stream:${livestreamId}`).emit('webrtc_ice_candidate', {
          viewerId: socket.id,
          candidate
        });
      }
    });

    // Viewer requests to receive stream (triggers broadcaster to send offer)
    socket.on('request_stream', (livestreamId) => {
      console.log(`📺 Viewer ${socket.id} requesting stream ${livestreamId}`);

      // Notify broadcaster that a new viewer wants to connect
      socket.to(`stream:${livestreamId}`).emit('new_viewer', {
        viewerId: socket.id
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        // If user was watching a stream, decrement viewer count
        if (socket.currentStream) {
          await query(
            `UPDATE livestreams
             SET viewer_count = GREATEST(0, viewer_count - 1)
             WHERE id = ?`,
            [socket.currentStream]
          );

          // Get updated viewer count
          const result = await query(
            `SELECT viewer_count FROM livestreams WHERE id = ?`,
            [socket.currentStream]
          );

          if (result.rows.length > 0) {
            const viewerCount = result.rows[0].viewer_count;

            livestreamNamespace.to(`stream:${socket.currentStream}`).emit('viewer_count_update', {
              livestreamId: socket.currentStream,
              viewerCount
            });
          }

          // Notify broadcaster that viewer disconnected
          socket.to(`stream:${socket.currentStream}`).emit('viewer_disconnected', {
            viewerId: socket.id
          });
        }

        console.log(`📺 User ${socket.userId || 'anonymous'} disconnected from livestream`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
};
