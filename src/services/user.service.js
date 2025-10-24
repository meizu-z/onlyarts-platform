/**
 * User Service
 * Handles user profile and settings API calls
 */

import { api, uploadFile } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export const userService = {
  /**
   * Get current user profile
   * @returns {Promise<{user}>}
   */
  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.users.profile);
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} profileData
   * @returns {Promise<{user}>}
   */
  updateProfile: async (profileData) => {
    const response = await api.put(API_ENDPOINTS.users.updateProfile, profileData);
    return response.data;
  },

  /**
   * Upload profile avatar
   * @param {File} file
   * @param {Function} onProgress
   * @returns {Promise<{url}>}
   */
  uploadAvatar: async (file, onProgress) => {
    const response = await uploadFile(
      API_ENDPOINTS.users.uploadAvatar,
      file,
      onProgress
    );
    return response.data;
  },

  /**
   * Upload cover image
   * @param {File} file
   * @param {Function} onProgress
   * @returns {Promise<{url}>}
   */
  uploadCover: async (file, onProgress) => {
    const response = await uploadFile(
      API_ENDPOINTS.users.uploadCover,
      file,
      onProgress
    );
    return response.data;
  },

  /**
   * Update user settings
   * @param {Object} settings
   * @returns {Promise<{settings}>}
   */
  updateSettings: async (settings) => {
    const response = await api.put(API_ENDPOINTS.users.settings, settings);
    return response.data;
  },

  /**
   * Change password
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<{message}>}
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post(API_ENDPOINTS.users.changePassword, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Deactivate account
   * @param {string} password
   * @returns {Promise<{message}>}
   */
  deactivateAccount: async (password) => {
    const response = await api.post(API_ENDPOINTS.users.deactivate, {
      password,
    });
    return response.data;
  },
};

export default userService;
