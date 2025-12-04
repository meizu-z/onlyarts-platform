import api from './api.client';

/**
 * 1v1 Artist Consultation Service
 * Premium-only feature for booking private sessions with artists
 */

export const consultationService = {
  /**
   * Get available artists for consultation
   * @param {Object} params - Filter params (category, availability, etc.)
   * @returns {Promise} List of artists
   */
  getAvailableArtists: async (params = {}) => {
    const response = await api.get('/consultations/artists', { params });
    return response.data;
  },

  /**
   * Get artist's availability slots
   * @param {string} artistId - Artist ID
   * @param {Object} params - Date range params
   * @returns {Promise} Available time slots
   */
  getArtistAvailability: async (artistId, params = {}) => {
    const response = await api.get(`/consultations/artists/${artistId}/availability`, { params });
    return response.data;
  },

  /**
   * Book a consultation session
   * @param {Object} bookingData - Booking details (artistId, slotId, topic, etc.)
   * @returns {Promise} Booking confirmation
   */
  bookConsultation: async (bookingData) => {
    const response = await api.post('/consultations/book', bookingData);
    return response.data;
  },

  /**
   * Request a consultation with an artist (simplified flow)
   * @param {Object} requestData - Request details (artistId, dateTime, topic, notes)
   * @returns {Promise} Request confirmation
   */
  requestConsultation: async (requestData) => {
    const response = await api.post('/consultations/request', requestData);
    return response.data;
  },

  /**
   * Get user's booked consultations
   * @param {Object} params - Filter params (status, upcoming, past)
   * @returns {Promise} List of consultations
   */
  getMyConsultations: async (params = {}) => {
    const response = await api.get('/consultations/my-bookings', { params });
    return response.data;
  },

  /**
   * Cancel a consultation
   * @param {string} consultationId - Consultation ID
   * @returns {Promise} Cancellation confirmation
   */
  cancelConsultation: async (consultationId) => {
    const response = await api.delete(`/consultations/${consultationId}`);
    return response.data;
  },

  /**
   * Rate a completed consultation
   * @param {string} consultationId - Consultation ID
   * @param {Object} ratingData - Rating and review
   * @returns {Promise} Rating confirmation
   */
  rateConsultation: async (consultationId, ratingData) => {
    const response = await api.post(`/consultations/${consultationId}/rate`, ratingData);
    return response.data;
  },

  /**
   * Join a consultation video call
   * @param {string} consultationId - Consultation ID
   * @returns {Promise} Video call token/URL
   */
  joinConsultation: async (consultationId) => {
    const response = await api.post(`/consultations/${consultationId}/join`);
    return response.data;
  },
};

// Mock data for demo mode
export const mockArtists = [
  {
    id: 'artist-1',
    name: 'Sarah Chen',
    username: '@sarahchen',
    avatar: '👩‍🎨',
    specialty: 'Digital Art & NFTs',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 150,
    description: 'Award-winning digital artist specializing in character design and NFT collections. 10+ years experience.',
    availability: 'Next available: Tomorrow, 2:00 PM',
    topics: ['Digital Art', 'NFT Strategy', 'Portfolio Review', 'Career Guidance'],
  },
  {
    id: 'artist-2',
    name: 'Marcus Rivera',
    username: '@marcusart',
    avatar: '👨‍🎨',
    specialty: 'Abstract & Modern Art',
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 120,
    description: 'Contemporary artist known for vibrant abstract works. Featured in major galleries worldwide.',
    availability: 'Next available: Today, 4:00 PM',
    topics: ['Abstract Techniques', 'Gallery Preparation', 'Pricing Strategy', 'Marketing'],
  },
  {
    id: 'artist-3',
    name: 'Yuki Tanaka',
    username: '@yukitanaka',
    avatar: '🎨',
    specialty: 'Traditional & Mixed Media',
    rating: 5.0,
    reviewCount: 64,
    hourlyRate: 180,
    description: 'Master of traditional Japanese art techniques with modern twists. 15+ years teaching experience.',
    availability: 'Next available: Dec 1, 10:00 AM',
    topics: ['Traditional Techniques', 'Mixed Media', 'Artistic Vision', 'Material Selection'],
  },
];

export const mockConsultations = [
  {
    id: 'cons-1',
    artist: mockArtists[0],
    date: '2024-11-15',
    time: '2:00 PM - 3:00 PM',
    topic: 'NFT Strategy & Portfolio Review',
    status: 'upcoming',
    meetingLink: 'https://meet.onlyarts.com/cons-1',
    notes: 'Bring your current portfolio and NFT ideas to discuss',
  },
  {
    id: 'cons-2',
    artist: mockArtists[1],
    date: '2024-11-10',
    time: '4:00 PM - 5:00 PM',
    topic: 'Abstract Painting Techniques',
    status: 'completed',
    rating: 5,
    review: 'Amazing session! Marcus gave me incredible insights into color theory and composition.',
  },
];

export const mockTimeSlots = [
  { id: 'slot-1', date: '2024-11-15', time: '10:00 AM', available: true },
  { id: 'slot-2', date: '2024-11-15', time: '2:00 PM', available: true },
  { id: 'slot-3', date: '2024-11-15', time: '4:00 PM', available: false },
  { id: 'slot-4', date: '2024-11-16', time: '10:00 AM', available: true },
  { id: 'slot-5', date: '2024-11-16', time: '2:00 PM', available: true },
  { id: 'slot-6', date: '2024-11-16', time: '4:00 PM', available: true },
];
