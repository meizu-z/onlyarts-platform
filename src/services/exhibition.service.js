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
};

// Mock data for demo mode
export const mockExhibition = {
  id: '1',
  title: 'Digital Dreams Collection',
  curator: '@gallery_master',
  curatorName: 'Gallery Master',
  description: 'A curated collection of stunning digital artworks from emerging artists.',
  bannerImage: '🎨',
  views: 2345,
  artworkCount: 15,
  favorites: 120,
  isFavorited: false,
  isFollowing: false,
  endDate: '2025-11-30',
  status: 'live',
};

export const mockExhibitionArtworks = [
  { id: 1, title: 'Digital Sunset', artist: '@artist1', artistName: 'Sarah Chen', price: 5000, image: '🌅', locked: false },
  { id: 2, title: 'Abstract Flow', artist: '@artist2', artistName: 'John Doe', price: 7500, image: '🎨', locked: false },
  { id: 3, title: 'Neon Dreams', artist: '@artist3', artistName: 'Jane Smith', price: 12000, image: '💫', locked: false },
  { id: 4, title: 'Mountain Vista', artist: '@artist4', artistName: 'Mike Johnson', price: 8000, image: '🏔️', locked: true },
  { id: 5, title: 'Ocean Waves', artist: '@artist5', artistName: 'Emma Davis', price: 9500, image: '🌊', locked: true },
  { id: 6, title: 'City Lights', artist: '@artist6', artistName: 'Alex Lee', price: 11000, image: '🌃', locked: true },
];

export const mockExhibitionComments = [
  {
    id: 1,
    user: '@artlover',
    userName: 'Art Lover',
    text: 'This collection is amazing! 🤩',
    timestamp: '2h ago',
    createdAt: '2025-10-25T10:00:00Z',
  },
  {
    id: 2,
    user: '@critic',
    userName: 'Art Critic',
    text: 'Interesting use of color and texture.',
    timestamp: '1h ago',
    createdAt: '2025-10-25T11:00:00Z',
  },
];

export default exhibitionService;
