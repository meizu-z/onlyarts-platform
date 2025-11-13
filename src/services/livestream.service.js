/**
 * Livestream Service
 * Handles livestream-related API calls
 */

import { api } from './api.client';

export const livestreamService = {
  /**
   * Get live streams
   * @param {Object} params
   * @returns {Promise<{streams}>}
   */
  getLiveStreams: async (params = {}) => {
    const response = await api.get('/livestreams', {
      params: { ...params, status: 'live' }
    });
    return response.data;
  },

  /**
   * Get upcoming streams
   * @param {Object} params
   * @returns {Promise<{streams}>}
   */
  getUpcomingStreams: async (params = {}) => {
    const response = await api.get('/livestreams', {
      params: { ...params, status: 'scheduled' }
    });
    return response.data;
  },

  /**
   * Get stream by ID
   * @param {string} streamId
   * @returns {Promise<{stream}>}
   */
  getStream: async (streamId) => {
    const response = await api.get(`/livestreams/${streamId}`);
    return response.data;
  },

  /**
   * Start a new livestream
   * @param {Object} streamData
   * @returns {Promise<{stream}>}
   */
  startStream: async (streamData) => {
    const response = await api.post('/livestreams', streamData);
    return response.data;
  },

  /**
   * End a livestream
   * @param {string} streamId
   * @returns {Promise<{message}>}
   */
  endStream: async (streamId) => {
    const response = await api.post(`/livestreams/${streamId}/end`);
    return response.data;
  },

  /**
   * Get stream comments
   * @param {string} streamId
   * @returns {Promise<{comments}>}
   */
  getComments: async (streamId) => {
    const response = await api.get(`/livestreams/${streamId}/comments`);
    return response.data;
  },

  /**
   * Post a comment
   * @param {string} streamId
   * @param {Object} commentData
   * @returns {Promise<{comment}>}
   */
  postComment: async (streamId, commentData) => {
    const response = await api.post(`/livestreams/${streamId}/comments`, commentData);
    return response.data;
  },

  /**
   * Place a bid in livestream auction
   * @param {string} streamId
   * @param {Object} bidData
   * @returns {Promise<{bid}>}
   */
  placeBid: async (streamId, bidData) => {
    const response = await api.post(`/livestreams/${streamId}/bids`, bidData);
    return response.data;
  },
};

// Mock data for demo mode
export const mockLiveStreams = [
  {
    id: 1,
    artist: 'meizzuuuuuuu',
    title: 'Digital Painting Process',
    viewers: 987,
    live: true,
    auction: true,
    thumbnail: '💻',
    profilePicture: 'https://randomuser.me/api/portraits/women/8.jpg',
    followers: '2.1M',
    description: 'Join me as I create a new digital masterpiece from scratch!',
    highestBid: {
      amount: 850,
      bidder: 'PremiumCollector_99',
      isPremium: true,
      profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
      timestamp: '2025-10-25T10:35:00',
    },
  },
  {
    id: 2,
    artist: 'jnorman',
    title: 'Sculpting in VR',
    viewers: 654,
    live: true,
    auction: false,
    thumbnail: '🗿',
    profilePicture: 'https://randomuser.me/api/portraits/men/12.jpg',
    followers: '950K',
    description: 'Exploring new forms and textures in virtual reality.',
  },
  {
    id: 3,
    artist: 'paintmaster',
    title: 'Traditional Oil Painting',
    viewers: 432,
    live: true,
    auction: false,
    thumbnail: '🎨',
    profilePicture: 'https://randomuser.me/api/portraits/women/15.jpg',
    followers: '750K',
    description: 'Creating landscape art with traditional techniques.',
  },
];

export const mockUpcomingStreams = [
  {
    id: 4,
    artist: 'digitalart_pro',
    title: 'Character Design Workshop',
    scheduledTime: '2025-10-26T14:00:00',
    thumbnail: '👨‍🎨',
    profilePicture: 'https://randomuser.me/api/portraits/men/20.jpg',
    followers: '1.5M',
    description: 'Learn character design fundamentals in this live workshop.',
  },
  {
    id: 5,
    artist: 'abstractqueen',
    title: 'Abstract Art Session',
    scheduledTime: '2025-10-26T18:00:00',
    thumbnail: '🌈',
    profilePicture: 'https://randomuser.me/api/portraits/women/25.jpg',
    followers: '890K',
    description: 'Creating abstract art with mixed media.',
  },
];

export const mockComments = [
  {
    id: 1,
    user: 'ArtLover_22',
    comment: 'This is breathtaking!',
    profilePicture: 'https://randomuser.me/api/portraits/women/11.jpg',
    timestamp: '2025-10-25T10:30:00',
  },
  {
    id: 2,
    user: 'NFTCollector_1',
    comment: 'bids $500',
    isBid: true,
    profilePicture: 'https://randomuser.me/api/portraits/men/22.jpg',
    timestamp: '2025-10-25T10:31:00',
  },
  {
    id: 3,
    user: 'CreativeMinds',
    comment: 'Amazing technique! How long did this take?',
    profilePicture: 'https://randomuser.me/api/portraits/women/30.jpg',
    timestamp: '2025-10-25T10:32:00',
  },
];

export default livestreamService;
