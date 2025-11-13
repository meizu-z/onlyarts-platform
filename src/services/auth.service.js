/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { api } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export const authService = {
  /**
   * Login user with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user, token, refreshToken}>}
   */
  login: async (email, password) => {
    const response = await api.post(API_ENDPOINTS.auth.login, {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<{user, token, refreshToken}>}
   */
  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.auth.register, userData);
    return response.data;
  },

  /**
   * Logout user
   * @param {string} refreshToken - Optional refresh token to revoke
   * @returns {Promise<void>}
   */
  logout: async (refreshToken = null) => {
    const response = await api.post(API_ENDPOINTS.auth.logout, {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Refresh access token
   * @param {string} refreshToken
   * @returns {Promise<{token, refreshToken}>}
   */
  refreshToken: async (refreshToken) => {
    const response = await api.post(API_ENDPOINTS.auth.refresh, {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Request password reset
   * @param {string} email
   * @returns {Promise<{message}>}
   */
  forgotPassword: async (email) => {
    const response = await api.post(API_ENDPOINTS.auth.forgotPassword, {
      email,
    });
    return response.data;
  },

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise<{message}>}
   */
  resetPassword: async (token, newPassword) => {
    const response = await api.post(API_ENDPOINTS.auth.resetPassword, {
      token,
      newPassword,
    });
    return response.data;
  },

  /**
   * Verify email with token
   * @param {string} token
   * @returns {Promise<{message}>}
   */
  verifyEmail: async (token) => {
    const response = await api.post(API_ENDPOINTS.auth.verifyEmail, {
      token,
    });
    return response.data;
  },
};

export default authService;
