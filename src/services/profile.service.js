/**
 * Profile Service
 * Handles profile-related API calls
 */

import { api } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export const profileService = {
  /**
   * Get user profile by username
   * @param {string} username
   * @returns {Promise<{profile}>}
   */
  getProfile: async (username) => {
    const response = await api.get(API_ENDPOINTS.user.profile(username));
    return response.data;
  },

  /**
   * Get current user's own profile
   * @returns {Promise<{profile}>}
   */
  getOwnProfile: async () => {
    const response = await api.get(API_ENDPOINTS.user.getProfile);
    return response.data;
  },

  /**
   * Update profile
   * @param {Object} profileData
   * @returns {Promise<{profile}>}
   */
  updateProfile: async (profileData) => {
    const response = await api.put(API_ENDPOINTS.user.updateProfile, profileData);
    return response.data;
  },

  /**
   * Get user's artworks
   * @param {string} username
   * @param {Object} params
   * @returns {Promise<{artworks}>}
   */
  getUserArtworks: async (username, params = {}) => {
    const response = await api.get(`/users/${username}/artworks`, { params });
    return response.data;
  },

  /**
   * Get user's exhibitions
   * @param {string} username
   * @param {Object} params
   * @returns {Promise<{exhibitions}>}
   */
  getUserExhibitions: async (username, params = {}) => {
    const response = await api.get(`/users/${username}/exhibitions`, { params });
    return response.data;
  },

  /**
   * Get user's shared posts
   * @param {string} username
   * @param {Object} params
   * @returns {Promise<{posts}>}
   */
  getSharedPosts: async (username, params = {}) => {
    const response = await api.get(`/users/${username}/shared`, { params });
    return response.data;
  },

  /**
   * Get user's saved items (artworks and exhibitions)
   * @param {Object} params
   * @returns {Promise<{items}>}
   */
  getSavedItems: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.user.favorites, { params });
    return response.data;
  },

  /**
   * Get user's followers
   * @param {string} username
   * @param {Object} params
   * @returns {Promise<{followers}>}
   */
  getFollowers: async (username, params = {}) => {
    const response = await api.get(`/users/${username}/followers`, { params });
    return response.data;
  },

  /**
   * Get user's following
   * @param {string} username
   * @param {Object} params
   * @returns {Promise<{following}>}
   */
  getFollowing: async (username, params = {}) => {
    const response = await api.get(`/users/${username}/following`, { params });
    return response.data;
  },

  /**
   * Follow a user
   * @param {string} username
   * @returns {Promise<{message}>}
   */
  followUser: async (username) => {
    const response = await api.post(`/users/${username}/follow`);
    return response.data;
  },

  /**
   * Unfollow a user
   * @param {string} username
   * @returns {Promise<{message}>}
   */
  unfollowUser: async (username) => {
    const response = await api.delete(`/users/${username}/follow`);
    return response.data;
  },
};

// Mock data for demo mode
export const mockProfileData = {
  premium: {
    username: 'premium_user',
    displayName: 'Premium Artist',
    bio: 'Digital artist creating beautiful landscapes and abstract art. Available for commissions!',
    avatar: '🎨',
    coverImage: '🌆',
    isArtist: true,
    followers: 1234,
    following: 567,
    artworks: 89,
    joinedDate: 'October 2024',
  },
  basic: {
    username: 'basic_user',
    displayName: 'Basic User',
    bio: 'Art enthusiast and collector. Love exploring new artworks!',
    avatar: '👤',
    coverImage: '🎨',
    isArtist: false,
    followers: 45,
    following: 123,
    artworks: 0,
    joinedDate: 'November 2024',
  },
  artist: {
    username: 'artist_user',
    displayName: 'Artist Pro',
    bio: 'Professional artist specializing in abstract and contemporary art.',
    avatar: '🎭',
    coverImage: '🖼️',
    isArtist: true,
    followers: 2456,
    following: 234,
    artworks: 156,
    joinedDate: 'September 2024',
  },
};

export const mockArtworks = [
  { id: 1, title: 'Sunset Dreams', image: '🌅', likes: 234, type: 'artwork', forSale: true, price: 5000 },
  { id: 2, title: 'Abstract Flow', image: '🎨', likes: 189, type: 'artwork', forSale: false },
  { id: 3, title: 'Urban Nights', image: '🌃', likes: 445, type: 'artwork', forSale: true, price: 8000 },
  { id: 4, title: 'Nature\'s Palette', image: '🌺', likes: 312, type: 'artwork', forSale: true, price: 4500 },
  { id: 5, title: 'Digital Dreams', image: '🌌', likes: 567, type: 'artwork', forSale: false },
];

export const mockExhibitions = [
  {
    id: 1,
    title: 'Digital Dreams Exhibition',
    image: '🖼️',
    type: 'exhibition',
    exhibitionType: 'Solo',
    startDate: '2024-12-01',
    endDate: '2024-12-15',
    artworksCount: 12
  },
  {
    id: 2,
    title: 'Collaborative Visions',
    image: '🎭',
    type: 'exhibition',
    exhibitionType: 'Collaboration',
    startDate: '2024-11-15',
    endDate: '2024-11-30',
    artworksCount: 24
  },
];

export const mockFollowers = [
  { username: '@user1', name: 'User One', avatar: '👤' },
  { username: '@user2', name: 'User Two', avatar: '👤' },
  { username: '@user3', name: 'User Three', avatar: '👤' },
];

export const mockFollowing = [
  { username: '@artist1', name: 'Artist One', avatar: '🎨', isArtist: true },
  { username: '@artist2', name: 'Artist Two', avatar: '🎭', isArtist: true },
  { username: '@user4', name: 'User Four', avatar: '👤' },
];

export const mockSavedItems = [
  { id: 101, title: 'Ocean Waves', image: '🌊', likes: 567, type: 'artwork', forSale: true, price: 6500 },
  { id: 102, title: 'Mountain Peak', image: '⛰️', likes: 445, type: 'artwork', forSale: false },
  { id: 103, title: 'Abstract Expressions', image: '🎭', type: 'exhibition', exhibitionType: 'Solo', artworksCount: 15 },
];

export default profileService;
