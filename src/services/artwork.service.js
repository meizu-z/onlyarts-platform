/**
 * Artwork Service
 * Handles artwork-related API calls
 */

import { api, uploadFile } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export const artworkService = {
  /**
   * Get list of artworks with filters
   * @param {Object} params - Query parameters (page, limit, category, etc.)
   * @returns {Promise<{artworks, total, page, limit}>}
   */
  getArtworks: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.artworks.list, { params });
    return response.data;
  },

  /**
   * Get artwork by ID
   * @param {string} id
   * @returns {Promise<{artwork}>}
   */
  getArtwork: async (id) => {
    const response = await api.get(API_ENDPOINTS.artworks.details(id));
    return response.data;
  },

  /**
   * Create new artwork
   * @param {Object} artworkData
   * @param {File} imageFile
   * @param {Function} onProgress
   * @returns {Promise<{artwork}>}
   */
  createArtwork: async (artworkData, imageFile, onProgress) => {
    const formData = new FormData();

    // Append artwork data
    Object.keys(artworkData).forEach(key => {
      if (artworkData[key] !== null && artworkData[key] !== undefined) {
        formData.append(key, artworkData[key]);
      }
    });

    // Append image file
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await api.post(
      API_ENDPOINTS.artworks.create,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress,
      }
    );
    return response.data;
  },

  /**
   * Update artwork
   * @param {string} id
   * @param {Object} artworkData
   * @returns {Promise<{artwork}>}
   */
  updateArtwork: async (id, artworkData) => {
    const response = await api.put(
      API_ENDPOINTS.artworks.update(id),
      artworkData
    );
    return response.data;
  },

  /**
   * Delete artwork
   * @param {string} id
   * @returns {Promise<{message}>}
   */
  deleteArtwork: async (id) => {
    const response = await api.delete(API_ENDPOINTS.artworks.delete(id));
    return response.data;
  },

  /**
   * Like artwork
   * @param {string} id
   * @returns {Promise<{likes}>}
   */
  likeArtwork: async (id) => {
    const response = await api.post(API_ENDPOINTS.artworks.like(id));
    return response.data;
  },

  /**
   * Unlike artwork
   * @param {string} id
   * @returns {Promise<{likes}>}
   */
  unlikeArtwork: async (id) => {
    const response = await api.delete(API_ENDPOINTS.artworks.unlike(id));
    return response.data;
  },

  /**
   * Get artwork comments
   * @param {string} id
   * @param {Object} params
   * @returns {Promise<{comments}>}
   */
  getComments: async (id, params = {}) => {
    const response = await api.get(API_ENDPOINTS.artworks.comments(id), {
      params,
    });
    return response.data;
  },

  /**
   * Add comment to artwork
   * @param {string} id
   * @param {string} content
   * @returns {Promise<{comment}>}
   */
  addComment: async (id, content) => {
    const response = await api.post(API_ENDPOINTS.artworks.addComment(id), {
      content,
    });
    return response.data;
  },
};

export default artworkService;
