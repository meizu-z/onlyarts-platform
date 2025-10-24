/**
 * Dashboard Service
 * Handles dashboard feed and recommendations API calls
 */

import { api } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export const dashboardService = {
  /**
   * Get personalized feed (For You)
   * @param {Object} params - Query parameters (page, limit)
   * @returns {Promise<{artworks, total, page}>}
   */
  getFeed: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.dashboard.feed, { params });
    return response.data;
  },

  /**
   * Get trending artworks
   * @param {Object} params - Query parameters (page, limit)
   * @returns {Promise<{artworks, total, page}>}
   */
  getTrending: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.dashboard.trending, { params });
    return response.data;
  },

  /**
   * Get recommended artworks
   * @param {Object} params - Query parameters (page, limit)
   * @returns {Promise<{artworks, total, page}>}
   */
  getRecommendations: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.dashboard.recommendations, { params });
    return response.data;
  },

  /**
   * Get artworks from followed artists
   * @param {Object} params - Query parameters (page, limit)
   * @returns {Promise<{artworks, total, page}>}
   */
  getFollowingFeed: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.dashboard.feed, {
      params: { ...params, filter: 'following' }
    });
    return response.data;
  },
};

// Mock data for demo mode
export const mockDashboardData = {
  forYou: [
    { id: 1, title: 'Sunset Dreams', artist: '@artist1', artistName: 'Sarah Chen', likes: 234, comments: 12, image: '🌅', isFollowing: true, timeAgo: '2h ago', reason: 'Similar to artworks you liked' },
    { id: 2, title: 'Digital Abstract', artist: '@artist2', artistName: 'Mike Johnson', likes: 189, comments: 8, image: '🎨', isFollowing: true, timeAgo: '5h ago' },
    { id: 3, title: 'Nature Flow', artist: '@artist4', artistName: 'Alex Park', likes: 301, comments: 15, image: '🌿', isFollowing: false, reason: 'Similar to artworks you liked', timeAgo: '3h ago' },
    { id: 4, title: 'Cosmic Dreams', artist: '@artist5', artistName: 'Jordan Lee', likes: 567, comments: 34, image: '🌌', isFollowing: false, reason: 'Trending in your interests', timeAgo: '6h ago' },
    { id: 5, title: 'Urban Nights', artist: '@artist3', artistName: 'Emma Davis', likes: 445, comments: 23, image: '🌃', isFollowing: true, timeAgo: '1d ago' },
    { id: 6, title: 'Portrait Study', artist: '@artist6', artistName: 'Taylor Swift', likes: 423, comments: 19, image: '👤', isFollowing: false, reason: 'Popular with people you follow', timeAgo: '8h ago' }
  ],

  following: [
    { id: 1, title: 'Sunset Dreams', artist: '@artist1', artistName: 'Sarah Chen', likes: 234, comments: 12, image: '🌅', isFollowing: true, timeAgo: '2h ago' },
    { id: 2, title: 'Digital Abstract', artist: '@artist2', artistName: 'Mike Johnson', likes: 189, comments: 8, image: '🎨', isFollowing: true, timeAgo: '5h ago' },
    { id: 3, title: 'Urban Nights', artist: '@artist3', artistName: 'Emma Davis', likes: 445, comments: 23, image: '🌃', isFollowing: true, timeAgo: '1d ago' }
  ],

  trending: [
    { id: 7, title: 'Neon City', artist: '@trendartist1', artistName: 'Chris Wong', likes: 1234, comments: 89, image: '🌆', isFollowing: false, timeAgo: '1h ago' },
    { id: 8, title: 'Ocean Waves', artist: '@trendartist2', artistName: 'Maria Garcia', likes: 987, comments: 56, image: '🌊', isFollowing: false, timeAgo: '4h ago' },
    { id: 9, title: 'Mountain Peak', artist: '@trendartist3', artistName: 'David Kim', likes: 756, comments: 34, image: '⛰️', isFollowing: false, timeAgo: '7h ago' }
  ]
};

export default dashboardService;
