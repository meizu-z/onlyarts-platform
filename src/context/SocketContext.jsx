import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_CONFIG } from '../config/api.config';
import { useToast } from '../components/ui/Toast';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const toast = useToast();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Get base URL for socket connection
    const serverBaseUrl = API_CONFIG.baseURL.replace('/api', '');

    // Create socket connection to /notifications namespace
    const notificationSocket = io(`${serverBaseUrl}/notifications`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    notificationSocket.on('connect', () => {
      console.log('✅ Connected to notification server');
      setConnected(true);

      // Register user with JWT token
      notificationSocket.emit('register', token);
    });

    notificationSocket.on('registered', (data) => {
      console.log('✅ Registered for notifications:', data);
    });

    notificationSocket.on('disconnect', () => {
      console.log('📤 Disconnected from notification server');
      setConnected(false);
    });

    notificationSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setConnected(false);
    });

    notificationSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      toast.error(error.message || 'Notification connection error');
    });

    // Listen for new notifications
    notificationSocket.on('new_notification', (notification) => {
      console.log('📨 Received new notification:', notification);

      // Add to notifications state
      setNotifications((prev) => [notification, ...prev]);

      // Show toast notification
      const notificationMessages = {
        like: '❤️ Someone liked your artwork!',
        comment: '💬 New comment on your artwork!',
        post: '🎨 An artist you follow posted new artwork!',
        share: '🔄 Someone shared your artwork!',
        system: '🔔 New notification',
      };

      const message = notificationMessages[notification.type] || notification.title;

      // Show toast with custom styling
      toast.success(message, {
        duration: 5000,
        onClick: () => {
          // Navigate to notification link if available
          if (notification.data?.link) {
            window.location.href = notification.data.link;
          }
        },
      });

      // Play notification sound (optional)
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Silently fail if audio can't play
        });
      } catch (error) {
        // Ignore audio errors
      }
    });

    setSocket(notificationSocket);

    // Cleanup on unmount
    return () => {
      if (notificationSocket) {
        notificationSocket.disconnect();
      }
    };
  }, [user, token]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove specific notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const value = {
    socket,
    connected,
    notifications,
    clearNotifications,
    removeNotification,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
