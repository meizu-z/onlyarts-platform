const jwt = require('jsonwebtoken');

// Store connected users: userId -> socketId
const connectedUsers = new Map();

module.exports = (io) => {
  const notificationNamespace = io.of('/notifications');

  notificationNamespace.on('connection', (socket) => {
    console.log(`📢 Notification socket connected: ${socket.id}`);

    // Authenticate and register user
    socket.on('register', (token) => {
      try {
        if (!token) {
          socket.emit('error', { message: 'Authentication token required' });
          return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Store the user's socket connection
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;

        console.log(`✅ User ${userId} registered for notifications`);
        socket.emit('registered', { success: true, userId });
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('error', { message: 'Invalid authentication token' });
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`📤 User ${socket.userId} disconnected from notifications`);
      }
    });
  });

  // Helper function to emit notification to specific user
  const emitToUser = (userId, eventName, data) => {
    const socketId = connectedUsers.get(userId);
    if (socketId) {
      notificationNamespace.to(socketId).emit(eventName, data);
      console.log(`📨 Sent ${eventName} to user ${userId}`);
      return true;
    }
    return false;
  };

  // Expose helper functions
  io.notificationHelpers = {
    emitToUser,
    getConnectedUsers: () => Array.from(connectedUsers.keys())
  };
};
