import { api } from './api.client';

/**
 * Search Service
 *
 * Handles advanced search and filtering operations including:
 * - Global search across all content
 * - Artwork filtering
 * - Artist search
 * - Exhibition search
 * - Advanced filters (price, date, category, etc.)
 */

export const searchService = {
  /**
   * Global search across all content types
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Search results
   */
  globalSearch: async (query, params = {}) => {
    const response = await api.get('/search', {
      params: { q: query, ...params },
    });
    return response.data;
  },

  /**
   * Search artworks with advanced filters
   * @param {Object} filters - Filter parameters
   * @param {string} filters.query - Search query
   * @param {string} filters.category - Artwork category
   * @param {number} filters.minPrice - Minimum price
   * @param {number} filters.maxPrice - Maximum price
   * @param {string} filters.sortBy - Sort field (price, date, popularity)
   * @param {string} filters.sortOrder - Sort order (asc, desc)
   * @param {boolean} filters.forSale - Only show items for sale
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @returns {Promise<Object>} Filtered artworks
   */
  searchArtworks: async (filters = {}) => {
    const response = await api.get('/search/artworks', { params: filters });
    return response.data;
  },

  /**
   * Search artists
   * @param {Object} params - Search parameters
   * @param {string} params.query - Search query
   * @param {boolean} params.verified - Only verified artists
   * @param {number} params.minFollowers - Minimum followers
   * @param {string} params.sortBy - Sort field
   * @returns {Promise<Object>} Found artists
   */
  searchArtists: async (params = {}) => {
    const response = await api.get('/search/artists', { params });
    return response.data;
  },

  /**
   * Search exhibitions
   * @param {Object} params - Search parameters
   * @param {string} params.query - Search query
   * @param {string} params.status - Exhibition status (live, upcoming, past)
   * @param {string} params.sortBy - Sort field
   * @returns {Promise<Object>} Found exhibitions
   */
  searchExhibitions: async (params = {}) => {
    const response = await api.get('/search/exhibitions', { params });
    return response.data;
  },

  /**
   * Get search suggestions (autocomplete)
   * @param {string} query - Partial search query
   * @returns {Promise<Object>} Search suggestions
   */
  getSuggestions: async (query) => {
    const response = await api.get('/search/suggestions', {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Get trending searches
   * @returns {Promise<Object>} Trending search terms
   */
  getTrending: async () => {
    const response = await api.get('/search/trending');
    return response.data;
  },

  /**
   * Get available filter options
   * @param {string} type - Content type (artworks, artists, exhibitions)
   * @returns {Promise<Object>} Available filters
   */
  getFilterOptions: async (type = 'artworks') => {
    const response = await api.get(`/search/${type}/filters`);
    return response.data;
  },
};

// Mock search results for demo mode
export const mockSearchResults = {
  artworks: [
    {
      id: '1',
      title: 'Digital Sunset',
      artist: '@artist1',
      artistName: 'Sarah Chen',
      image: '🌅',
      price: 5000,
      category: 'Digital Art',
      forSale: true,
      likes: 234,
      views: 2345,
    },
    {
      id: '2',
      title: 'Urban Dreams',
      artist: '@artist2',
      artistName: 'Mike Johnson',
      image: '🏙️',
      price: 7500,
      category: 'Photography',
      forSale: true,
      likes: 456,
      views: 3456,
    },
    {
      id: '3',
      title: 'Abstract Emotions',
      artist: '@artist3',
      artistName: 'Emma Wilson',
      image: '🎨',
      price: 3500,
      category: 'Abstract',
      forSale: true,
      likes: 123,
      views: 1234,
    },
  ],
  artists: [
    {
      id: '1',
      username: '@artist1',
      name: 'Sarah Chen',
      avatar: '👩‍🎨',
      followers: 15000,
      artworks: 45,
      verified: true,
    },
    {
      id: '2',
      username: '@artist2',
      name: 'Mike Johnson',
      avatar: '👨‍🎨',
      followers: 12000,
      artworks: 38,
      verified: true,
    },
  ],
  exhibitions: [
    {
      id: '1',
      title: 'Digital Dreams',
      curator: '@curator1',
      curatorName: 'Alex Rivera',
      status: 'live',
      pieces: 20,
      image: '🎨',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
    },
    {
      id: '2',
      title: 'Modern Visions',
      curator: '@curator2',
      curatorName: 'Jamie Lee',
      status: 'upcoming',
      pieces: 15,
      image: '🖼️',
      startDate: '2024-04-01',
      endDate: '2024-04-30',
    },
  ],
};

export const mockFilterOptions = {
  categories: [
    { value: 'digital', label: 'Digital Art', count: 450 },
    { value: 'photography', label: 'Photography', count: 380 },
    { value: 'abstract', label: 'Abstract', count: 320 },
    { value: 'painting', label: 'Painting', count: 290 },
    { value: '3d', label: '3D Art', count: 180 },
    { value: 'illustration', label: 'Illustration', count: 250 },
  ],
  priceRanges: [
    { value: '0-1000', label: 'Under $1,000', count: 120 },
    { value: '1000-5000', label: '$1,000 - $5,000', count: 340 },
    { value: '5000-10000', label: '$5,000 - $10,000', count: 180 },
    { value: '10000+', label: '$10,000+', count: 65 },
  ],
  sortOptions: [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'date_desc', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
  ],
};

export const mockTrendingSearches = [
  'abstract art',
  'digital painting',
  'NFT artworks',
  'landscape photography',
  '3D sculptures',
  'portrait art',
];

export default searchService;
