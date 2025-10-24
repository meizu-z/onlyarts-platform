/**
 * Settings Service
 * Handles settings-related API calls
 */

import { api } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export const settingsService = {
  /**
   * Get user settings
   * @returns {Promise<{settings}>}
   */
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  /**
   * Update account settings
   * @param {Object} accountData
   * @returns {Promise<{settings}>}
   */
  updateAccount: async (accountData) => {
    const response = await api.put('/settings/account', accountData);
    return response.data;
  },

  /**
   * Change password
   * @param {Object} passwordData
   * @returns {Promise<{message}>}
   */
  changePassword: async (passwordData) => {
    const response = await api.put('/settings/password', passwordData);
    return response.data;
  },

  /**
   * Update privacy settings
   * @param {Object} privacyData
   * @returns {Promise<{settings}>}
   */
  updatePrivacy: async (privacyData) => {
    const response = await api.put('/settings/privacy', privacyData);
    return response.data;
  },

  /**
   * Update notification settings
   * @param {Object} notificationData
   * @returns {Promise<{settings}>}
   */
  updateNotifications: async (notificationData) => {
    const response = await api.put('/settings/notifications', notificationData);
    return response.data;
  },

  /**
   * Update appearance settings
   * @param {Object} appearanceData
   * @returns {Promise<{settings}>}
   */
  updateAppearance: async (appearanceData) => {
    const response = await api.put('/settings/appearance', appearanceData);
    return response.data;
  },

  /**
   * Get billing information
   * @returns {Promise<{billing}>}
   */
  getBilling: async () => {
    const response = await api.get('/settings/billing');
    return response.data;
  },

  /**
   * Update subscription plan
   * @param {string} planId
   * @returns {Promise<{subscription}>}
   */
  updateSubscription: async (planId) => {
    const response = await api.put('/settings/billing/subscription', { planId });
    return response.data;
  },

  /**
   * Cancel subscription
   * @returns {Promise<{message}>}
   */
  cancelSubscription: async () => {
    const response = await api.post('/settings/billing/cancel');
    return response.data;
  },

  /**
   * Add payment method
   * @param {Object} paymentMethod
   * @returns {Promise<{paymentMethod}>}
   */
  addPaymentMethod: async (paymentMethod) => {
    const response = await api.post('/settings/billing/payment-methods', paymentMethod);
    return response.data;
  },

  /**
   * Remove payment method
   * @param {string} paymentMethodId
   * @returns {Promise<{message}>}
   */
  removePaymentMethod: async (paymentMethodId) => {
    const response = await api.delete(`/settings/billing/payment-methods/${paymentMethodId}`);
    return response.data;
  },

  /**
   * Deactivate account
   * @returns {Promise<{message}>}
   */
  deactivateAccount: async () => {
    const response = await api.post('/settings/account/deactivate');
    return response.data;
  },

  /**
   * Delete account
   * @param {string} password
   * @returns {Promise<{message}>}
   */
  deleteAccount: async (password) => {
    const response = await api.delete('/settings/account', { data: { password } });
    return response.data;
  },
};

// Mock data for demo mode
export const mockSettings = {
  account: {
    email: 'user@example.com',
    username: 'demo_user',
  },
  privacy: {
    showProfile: true,
    allowMessages: true,
    showActivityStatus: true,
    showInSearch: true,
  },
  notifications: {
    email: true,
    push: true,
    newFollowers: true,
    commentsOnArtwork: true,
    auctionUpdates: false,
    marketingEmails: false,
  },
  appearance: {
    theme: 'dark', // light, dark, auto
  },
  billing: {
    currentPlan: 'premium',
    price: 249,
    nextBilling: '2025-11-19',
    paymentMethods: [
      {
        id: 'pm_1',
        type: 'card',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2026,
        brand: 'visa',
      },
    ],
  },
};

export default settingsService;
