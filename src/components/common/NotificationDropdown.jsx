import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Heart, MessageCircle, ShoppingCart, UserPlus, Award, Video, Image } from 'lucide-react';
import { notificationService } from '../../services';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showingAll, setShowingAll] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { socket, notifications: realtimeNotifications } = useSocket();

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 2 minutes as fallback
    // Real-time updates are handled via Socket.io
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time notifications from SocketContext
  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      // Add new real-time notifications to the list
      const latestNotification = realtimeNotifications[realtimeNotifications.length - 1];

      // Check if notification already exists to avoid duplicates
      setNotifications(prev => {
        const exists = prev.some(n => n.id === latestNotification.id);
        if (exists) return prev;

        // Add to the beginning of the list
        return [latestNotification, ...prev];
      });

      // Increment unread count
      setUnreadCount(prev => prev + 1);
    }
  }, [realtimeNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowingAll(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async (limit = 10) => {
    try {
      const response = await notificationService.getNotifications({ limit });
      const notifs = response.data?.notifications || response.notifications || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleViewAllToggle = async () => {
    if (showingAll) {
      // Show less - go back to 10
      setShowingAll(false);
      await fetchNotifications(10);
    } else {
      // Show all - fetch without limit
      setShowingAll(true);
      await fetchNotifications(100); // Fetch up to 100
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);

    // Navigate based on notification type
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { size: 16, className: 'text-purple-400' };

    switch (type) {
      case 'like':
        return <Heart {...iconProps} />;
      case 'comment':
        return <MessageCircle {...iconProps} />;
      case 'post':
        return <Image {...iconProps} />;
      case 'share':
        return <Image {...iconProps} />;
      case 'order':
        return <ShoppingCart {...iconProps} />;
      case 'follow':
        return <UserPlus {...iconProps} />;
      case 'livestream':
        return <Video {...iconProps} />;
      case 'artwork':
        return <Image {...iconProps} />;
      case 'achievement':
        return <Award {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
      >
        <Bell size={20} className="text-[#f2e9dd]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-[#f2e9dd]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#f2e9dd]/50">
                <Bell size={40} className="mx-auto mb-2 opacity-30" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                    !notification.is_read ? 'bg-purple-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.is_read ? 'text-[#f2e9dd] font-medium' : 'text-[#f2e9dd]/70'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-[#f2e9dd]/50 mt-1">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10 text-center">
              <button
                onClick={handleViewAllToggle}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {showingAll ? 'Show less' : 'View all notifications'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
