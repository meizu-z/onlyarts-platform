import api from './api.client';

/**
 * Analytics Service
 * Provides audience insights and artwork analytics for artists
 */

export const analyticsService = {
  /**
   * Get overall profile analytics
   * @returns {Promise} Profile analytics data
   */
  getProfileAnalytics: async () => {
    const response = await api.get('/analytics/profile');
    return response.data;
  },

  /**
   * Get analytics for a specific artwork
   * @param {string} artworkId - Artwork ID
   * @returns {Promise} Artwork analytics data
   */
  getArtworkAnalytics: async (artworkId) => {
    const response = await api.get(`/analytics/artworks/${artworkId}`);
    return response.data;
  },

  /**
   * Get audience demographics
   * @returns {Promise} Demographics data
   */
  getAudienceDemographics: async () => {
    const response = await api.get('/analytics/demographics');
    return response.data;
  },

  /**
   * Get engagement timeline
   * @param {Object} params - Date range params
   * @returns {Promise} Engagement timeline data
   */
  getEngagementTimeline: async (params = {}) => {
    const response = await api.get('/analytics/engagement', { params });
    return response.data;
  },

  /**
   * Get revenue analytics
   * @returns {Promise} Revenue data
   */
  getRevenueAnalytics: async () => {
    const response = await api.get('/analytics/revenue');
    return response.data;
  },
};

// Mock data for demo mode
export const mockProfileAnalytics = {
  overview: {
    totalViews: 45320,
    totalLikes: 8940,
    totalComments: 1230,
    totalFollowers: 2847,
    followerGrowth: '+12.5%',
    engagementRate: '19.7%',
  },
  peakTimes: [
    { day: 'Monday', hour: '2:00 PM - 4:00 PM', engagement: 85 },
    { day: 'Wednesday', hour: '7:00 PM - 9:00 PM', engagement: 92 },
    { day: 'Saturday', hour: '11:00 AM - 1:00 PM', engagement: 78 },
  ],
  topArtworks: [
    {
      id: 1,
      title: 'Digital Dreams',
      views: 8240,
      likes: 1820,
      comments: 340,
      revenue: 2400,
      conversionRate: '22.1%',
    },
    {
      id: 2,
      title: 'Abstract Thoughts',
      views: 6830,
      likes: 1450,
      comments: 280,
      revenue: 1800,
      conversionRate: '21.2%',
    },
    {
      id: 3,
      title: 'Urban Landscape',
      views: 5920,
      likes: 1220,
      comments: 195,
      revenue: 1500,
      conversionRate: '20.6%',
    },
  ],
};

export const mockAudienceDemographics = {
  ageGroups: [
    { range: '18-24', percentage: 15, count: 427 },
    { range: '25-34', percentage: 42, count: 1196 },
    { range: '35-44', percentage: 28, count: 797 },
    { range: '45-54', percentage: 10, count: 285 },
    { range: '55+', percentage: 5, count: 142 },
  ],
  topLocations: [
    { country: 'United States', city: 'New York', percentage: 22, count: 626 },
    { country: 'United Kingdom', city: 'London', percentage: 15, count: 427 },
    { country: 'Canada', city: 'Toronto', percentage: 12, count: 342 },
    { country: 'Australia', city: 'Sydney', percentage: 8, count: 228 },
    { country: 'Germany', city: 'Berlin', percentage: 7, count: 199 },
  ],
  interests: [
    { category: 'Digital Art', percentage: 68 },
    { category: 'NFTs', percentage: 52 },
    { category: 'Abstract Art', percentage: 45 },
    { category: 'Contemporary', percentage: 38 },
    { category: 'Photography', percentage: 25 },
  ],
};

export const mockEngagementTimeline = {
  last30Days: [
    { date: '2024-10-28', views: 1240, likes: 280, comments: 45 },
    { date: '2024-10-29', views: 1580, likes: 320, comments: 52 },
    { date: '2024-10-30', views: 1420, likes: 295, comments: 38 },
    { date: '2024-10-31', views: 1680, likes: 350, comments: 61 },
    { date: '2024-11-01', views: 1520, likes: 310, comments: 48 },
    { date: '2024-11-02', views: 1780, likes: 380, comments: 65 },
    { date: '2024-11-03', views: 1640, likes: 340, comments: 55 },
    { date: '2024-11-04', views: 1450, likes: 305, comments: 42 },
    { date: '2024-11-05', views: 1820, likes: 395, comments: 70 },
    { date: '2024-11-06', views: 1590, likes: 330, comments: 58 },
    { date: '2024-11-07', views: 1720, likes: 360, comments: 62 },
    { date: '2024-11-08', views: 1480, likes: 315, comments: 50 },
    { date: '2024-11-09', views: 1650, likes: 345, comments: 56 },
    { date: '2024-11-10', views: 1920, likes: 410, comments: 75 },
    { date: '2024-11-11', views: 1570, likes: 325, comments: 53 },
    { date: '2024-11-12', views: 1690, likes: 355, comments: 60 },
    { date: '2024-11-13', views: 1530, likes: 320, comments: 47 },
    { date: '2024-11-14', views: 1780, likes: 375, counts: 68 },
    { date: '2024-11-15', views: 1640, likes: 340, comments: 57 },
    { date: '2024-11-16', views: 1850, likes: 390, comments: 72 },
    { date: '2024-11-17', views: 1620, likes: 335, comments: 54 },
    { date: '2024-11-18', views: 1750, likes: 365, comments: 63 },
    { date: '2024-11-19', views: 1580, likes: 330, comments: 51 },
    { date: '2024-11-20', views: 1890, likes: 400, comments: 76 },
    { date: '2024-11-21', views: 1670, likes: 350, comments: 59 },
    { date: '2024-11-22', views: 1790, likes: 370, comments: 66 },
    { date: '2024-11-23', views: 1610, likes: 335, comments: 55 },
    { date: '2024-11-24', views: 1840, likes: 385, comments: 71 },
    { date: '2024-11-25', views: 1720, likes: 360, comments: 64 },
    { date: '2024-11-26', views: 1950, likes: 415, comments: 78 },
  ],
  followerGrowth: [
    { date: '2024-10-28', followers: 2620 },
    { date: '2024-11-02', followers: 2650 },
    { date: '2024-11-07', followers: 2695 },
    { date: '2024-11-12', followers: 2730 },
    { date: '2024-11-17', followers: 2780 },
    { date: '2024-11-22', followers: 2820 },
    { date: '2024-11-26', followers: 2847 },
  ],
};

export const mockRevenueAnalytics = {
  totalRevenue: 12450,
  thisMonth: 3240,
  lastMonth: 2980,
  growth: '+8.7%',
  topEarningArtworks: [
    { id: 1, title: 'Digital Dreams', revenue: 2400, sales: 12 },
    { id: 2, title: 'Abstract Thoughts', revenue: 1800, sales: 9 },
    { id: 3, title: 'Urban Landscape', revenue: 1500, sales: 10 },
    { id: 4, title: 'Neon Nights', revenue: 1200, sales: 6 },
    { id: 5, title: 'Cosmic Journey', revenue: 950, sales: 5 },
  ],
  revenueByMonth: [
    { month: 'Jun', revenue: 1850 },
    { month: 'Jul', revenue: 2120 },
    { month: 'Aug', revenue: 2340 },
    { month: 'Sep', revenue: 2780 },
    { month: 'Oct', revenue: 2980 },
    { month: 'Nov', revenue: 3240 },
  ],
};

export const mockArtworkAnalytics = {
  1: {
    artworkId: 1,
    title: 'Digital Dreams',
    stats: {
      totalViews: 8240,
      uniqueVisitors: 6890,
      totalLikes: 1820,
      totalComments: 340,
      shares: 145,
      saves: 520,
    },
    engagement: {
      viewToLikeRate: '22.1%',
      likeToCommentRate: '18.7%',
      averageTimeViewed: '2m 35s',
      bounceRate: '32%',
    },
    revenue: {
      totalSales: 12,
      totalRevenue: 2400,
      averagePrice: 200,
      conversionRate: '0.17%',
    },
    viewerDemographics: {
      topAgeGroup: '25-34 (45%)',
      topLocation: 'New York, US (28%)',
      topSource: 'Explore Page (42%)',
    },
    timeline: [
      { date: '2024-11-01', views: 420, likes: 95 },
      { date: '2024-11-08', views: 580, likes: 128 },
      { date: '2024-11-15', views: 640, likes: 142 },
      { date: '2024-11-22', views: 720, likes: 165 },
      { date: '2024-11-26', views: 480, likes: 108 },
    ],
  },
  // Can add more artwork-specific analytics as needed
};
