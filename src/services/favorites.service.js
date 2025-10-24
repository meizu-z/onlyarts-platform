/**
 * Favorites Service
 * Handles favorites and following-related API calls
 */

import { api } from './api.client';

export const favoritesService = {
  /**
   * Get user's favorited artworks
   * @param {Object} params
   * @returns {Promise<{favorites}>}
   */
  getFavorites: async (params = {}) => {
    const response = await api.get('/favorites', { params });
    return response.data;
  },

  /**
   * Add artwork to favorites
   * @param {string} artworkId
   * @returns {Promise<{message}>}
   */
  addFavorite: async (artworkId) => {
    const response = await api.post('/favorites', { artworkId });
    return response.data;
  },

  /**
   * Remove artwork from favorites
   * @param {string} artworkId
   * @returns {Promise<{message}>}
   */
  removeFavorite: async (artworkId) => {
    const response = await api.delete(`/favorites/${artworkId}`);
    return response.data;
  },

  /**
   * Get user's collections
   * @returns {Promise<{collections}>}
   */
  getCollections: async () => {
    const response = await api.get('/collections');
    return response.data;
  },

  /**
   * Create a new collection
   * @param {Object} collectionData
   * @returns {Promise<{collection}>}
   */
  createCollection: async (collectionData) => {
    const response = await api.post('/collections', collectionData);
    return response.data;
  },

  /**
   * Get following list
   * @returns {Promise<{following}>}
   */
  getFollowing: async () => {
    const response = await api.get('/following');
    return response.data;
  },
};

// Mock data for demo mode
export const mockFavorites = [
  { id: 1, title: 'Sunset Dreams', artist: '@artist1', artistName: 'Artist One', image: '🌅', likes: 234 },
  { id: 2, title: 'Digital Abstract', artist: '@artist2', artistName: 'Artist Two', image: '🎨', likes: 189 },
  { id: 3, title: 'Urban Nights', artist: '@artist3', artistName: 'Artist Three', image: '🌃', likes: 445 },
  { id: 4, title: 'Nature Flow', artist: '@artist4', artistName: 'Artist Four', image: '🌿', likes: 312 },
];

export const mockFollowingArtists = [
  { id: 1, name: 'Artist One', username: '@artist1', artworks: 234, isLive: false, avatar: 'A' },
  { id: 2, name: 'Artist Two', username: '@artist2', artworks: 89, isLive: true, avatar: 'A' },
  { id: 3, name: 'Artist Three', username: '@artist3', artworks: 456, isLive: false, avatar: 'A' },
];

export const mockCollections = [
  { id: 1, name: 'Abstract', itemCount: 23, coverImage: '🎨' },
  { id: 2, name: 'Portraits', itemCount: 15, coverImage: '👤' },
  { id: 3, name: 'Landscapes', itemCount: 31, coverImage: '🌄' },
];

export default favoritesService;
