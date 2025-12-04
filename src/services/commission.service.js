/**
 * Commission Service
 * Handles commission requests between fans and artists
 */

import { api, uploadFiles } from './api.client';

export const commissionService = {
  /**
   * Create a new commission request
   * @param {Object} commissionData - Commission request data
   * @param {File[]} referenceImages - Reference image files
   */
  createCommission: async (commissionData, referenceImages = []) => {
    // Upload reference images first if any
    let imageUrls = [];
    if (referenceImages.length > 0) {
      const uploadResponse = await uploadFiles(referenceImages);
      imageUrls = uploadResponse.urls || [];
    }

    // Create commission with image URLs
    const response = await api.post('/commissions', {
      ...commissionData,
      referenceImages: imageUrls
    });
    return response.data;
  },

  /**
   * Get all commissions for current user (as client)
   * @param {Object} filters - Filter parameters
   */
  getMyCommissions: async (filters = {}) => {
    const response = await api.get('/commissions', { params: filters });
    return response.data;
  },

  /**
   * Get commission requests for current user (as artist)
   * @param {Object} filters - Filter parameters
   */
  getCommissionRequests: async (filters = {}) => {
    const response = await api.get('/commissions/requests', { params: filters });
    return response.data;
  },

  /**
   * Get commission details by ID
   * @param {string} id - Commission ID
   */
  getCommission: async (id) => {
    const response = await api.get(`/commissions/${id}`);
    return response.data;
  },

  /**
   * Update commission status (for artists)
   * @param {string} id - Commission ID
   * @param {string} status - New status (pending, accepted, in_progress, completed, cancelled)
   */
  updateCommissionStatus: async (id, status) => {
    const response = await api.put(`/commissions/${id}/status`, { status });
    return response.data;
  },

  /**
   * Submit commission work (for artists)
   * @param {string} id - Commission ID
   * @param {File[]} files - Completed work files
   * @param {string} notes - Delivery notes
   */
  submitWork: async (id, files, notes = '') => {
    const uploadResponse = await uploadFiles(files);
    const response = await api.post(`/commissions/${id}/submit`, {
      deliveryFiles: uploadResponse.urls,
      notes
    });
    return response.data;
  },

  /**
   * Accept commission work (for clients)
   * @param {string} id - Commission ID
   */
  acceptWork: async (id) => {
    const response = await api.post(`/commissions/${id}/accept`);
    return response.data;
  },

  /**
   * Request revision (for clients)
   * @param {string} id - Commission ID
   * @param {string} feedback - Revision feedback
   */
  requestRevision: async (id, feedback) => {
    const response = await api.post(`/commissions/${id}/revision`, { feedback });
    return response.data;
  },

  /**
   * Cancel commission
   * @param {string} id - Commission ID
   * @param {string} reason - Cancellation reason
   */
  cancelCommission: async (id, reason = '') => {
    const response = await api.delete(`/commissions/${id}`, { data: { reason } });
    return response.data;
  },

  /**
   * Get commission messages
   * @param {string} id - Commission ID
   */
  getCommissionMessages: async (id) => {
    const response = await api.get(`/commissions/${id}/messages`);
    return response.data;
  },

  /**
   * Add message to commission
   * @param {string} id - Commission ID
   * @param {string} message - Message text
   */
  addCommissionMessage: async (id, message) => {
    const response = await api.post(`/commissions/${id}/messages`, { message });
    return response.data;
  }
};
