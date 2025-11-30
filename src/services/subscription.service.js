/**
 * Subscription Service
 * Handles subscription plan management and upgrades
 */

import { api } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export const subscriptionService = {
  /**
   * Get available subscription plans
   */
  getPlans: async () => {
    const response = await api.get(API_ENDPOINTS.subscriptions.plans);
    return response.data;
  },

  /**
   * Get current user's subscription
   */
  getCurrentSubscription: async () => {
    const response = await api.get(API_ENDPOINTS.subscriptions.current);
    return response.data;
  },

  /**
   * Create subscription (upgrade/subscribe)
   * @param {string} planId - Plan ID (basic, premium)
   * @param {string} paymentMethodId - Stripe payment method ID (optional for now)
   */
  createSubscription: async (planId, paymentMethodId = null) => {
    const response = await api.post(API_ENDPOINTS.subscriptions.subscribe, {
      planId,
      paymentMethodId
    });
    return response.data;
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async () => {
    const response = await api.post(API_ENDPOINTS.subscriptions.cancel);
    return response.data;
  },

  /**
   * Update subscription plan
   * @param {string} newPlanId - New plan ID
   */
  updateSubscription: async (newPlanId) => {
    const response = await api.post(API_ENDPOINTS.subscriptions.update, {
      newPlanId
    });
    return response.data;
  }
};
