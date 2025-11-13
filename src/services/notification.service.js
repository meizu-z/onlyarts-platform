/**
 * Notification Service
 * Handles user notifications
 */

import { api } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export const notificationService = {
  /**
   * Get all notifications for current user
   * @param {Object} params - Query parameters (unread, limit, offset)
   */
  getNotifications: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.notifications.list, { params });
    return response.data;
  },

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   */
  markAsRead: async (id) => {
    const response = await api.put(API_ENDPOINTS.notifications.markRead(id));
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await api.put(API_ENDPOINTS.notifications.markAllRead);
    return response.data;
  },

  /**
   * Get notification settings
   */
  getSettings: async () => {
    const response = await api.get(API_ENDPOINTS.notifications.settings);
    return response.data;
  },

  /**
   * Update notification settings
   * @param {Object} settings - Notification preferences
   */
  updateSettings: async (settings) => {
    const response = await api.put(API_ENDPOINTS.notifications.settings, settings);
    return response.data;
  },

  /**
   * Delete notification
   * @param {string} id - Notification ID
   */
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};
