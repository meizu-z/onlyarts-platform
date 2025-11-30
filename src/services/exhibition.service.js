/**
 * Exhibition Service
 * Handles exhibition-related API calls
 */

import { api } from './api.client';

export const exhibitionService = {
  /**
   * Get list of exhibitions
   * @param {Object} params - Query parameters
   * @returns {Promise<{exhibitions}>}
   */
  getExhibitions: async (params = {}) => {
    const response = await api.get('/exhibitions', { params });
    return response.data;
  },

  /**
   * Get exhibition by ID
   * @param {string} id
   * @returns {Promise<{exhibition}>}
   */
  getExhibition: async (id) => {
    const response = await api.get(`/exhibitions/${id}`);
    return response.data;
  },

  /**
   * Get exhibition artworks
   * @param {string} id
   * @returns {Promise<{artworks}>}
   */
  getExhibitionArtworks: async (id) => {
    const response = await api.get(`/exhibitions/${id}/artworks`);
    return response.data;
  },

  /**
   * Get exhibition comments
   * @param {string} id
   * @returns {Promise<{comments}>}
   */
  getExhibitionComments: async (id) => {
    const response = await api.get(`/exhibitions/${id}/comments`);
    return response.data;
  },

  /**
   * Add comment to exhibition
   * @param {string} id
   * @param {string} content
   * @returns {Promise<{comment}>}
   */
  addComment: async (id, content) => {
    const response = await api.post(`/exhibitions/${id}/comments`, { content });
    return response.data;
  },

  /**
   * Favorite exhibition
   * @param {string} id
   * @returns {Promise<{favorites}>}
   */
  favoriteExhibition: async (id) => {
    const response = await api.post(`/exhibitions/${id}/favorite`);
    return response.data;
  },

  /**
   * Unfavorite exhibition
   * @param {string} id
   * @returns {Promise<{favorites}>}
   */
  unfavoriteExhibition: async (id) => {
    const response = await api.delete(`/exhibitions/${id}/favorite`);
    return response.data;
  },

  /**
   * Follow exhibition
   * @param {string} id
   * @returns {Promise<{following}>}
   */
  followExhibition: async (id) => {
    const response = await api.post(`/exhibitions/${id}/follow`);
    return response.data;
  },

  /**
   * Unfollow exhibition
   * @param {string} id
   * @returns {Promise<{following}>}
   */
  unfollowExhibition: async (id) => {
    const response = await api.delete(`/exhibitions/${id}/follow`);
    return response.data;
  },

  /**
   * Create new exhibition
   * @param {Object} exhibitionData - Exhibition details
   * @returns {Promise<{id, status}>}
   */
  createExhibition: async (exhibitionData) => {
    const response = await api.post('/exhibitions', exhibitionData);
    return response.data;
  },

  /**
   * Add exclusive artwork to exhibition
   * @param {string} id - Exhibition ID
   * @param {FormData} formData - Artwork form data with file
   * @returns {Promise<{artworkId}>}
   */
  addExclusiveArtwork: async (id, formData) => {
    const response = await api.post(`/exhibitions/${id}/exclusive-artworks`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default exhibitionService;
