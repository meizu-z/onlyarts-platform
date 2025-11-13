/**
 * Services Index
 * Central export point for all API services
 */

export { default as apiClient, api, uploadFile, uploadFiles } from './api.client';
export { authService } from './auth.service';
export { userService } from './user.service';
export { artworkService, mockArtworkDetail, mockArtworkComments } from './artwork.service';
export { dashboardService, mockDashboardData } from './dashboard.service';
export { profileService, mockProfileData, mockArtworks, mockExhibitions, mockFollowers, mockFollowing, mockSavedItems } from './profile.service';
export { settingsService, mockSettings } from './settings.service';
export { favoritesService, mockFavorites, mockFollowingArtists, mockCollections } from './favorites.service';
export { walletService, mockWallet, mockTransactions, mockPaymentMethods } from './wallet.service';
export { livestreamService, mockLiveStreams, mockUpcomingStreams, mockComments } from './livestream.service';
export { chatService, mockContacts, mockMessages } from './chat.service';
export { exhibitionService, mockExhibition, mockExhibitionArtworks, mockExhibitionComments } from './exhibition.service';
export { cartService, mockCart, mockCartItems } from './cart.service';
export { checkoutService, mockPaymentMethods as mockCheckoutPaymentMethods, mockOrder } from './checkout.service';
export { searchService, mockSearchResults, mockFilterOptions, mockTrendingSearches } from './search.service';
export { websocketService } from './websocket.service';
export { consultationService, mockArtists, mockConsultations, mockTimeSlots } from './consultation.service';
export { analyticsService, mockProfileAnalytics, mockAudienceDemographics, mockEngagementTimeline, mockRevenueAnalytics, mockArtworkAnalytics } from './analytics.service';
export { subscriptionService } from './subscription.service';
export { commissionService } from './commission.service';
export { notificationService } from './notification.service';
export { default as adminService } from './admin.service';

// Export API configuration
export { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
