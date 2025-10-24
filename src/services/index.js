/**
 * Services Index
 * Central export point for all API services
 */

export { default as apiClient, api, uploadFile, uploadFiles } from './api.client';
export { authService } from './auth.service';
export { userService } from './user.service';
export { artworkService } from './artwork.service';
export { dashboardService, mockDashboardData } from './dashboard.service';
export { profileService, mockProfileData, mockArtworks, mockExhibitions, mockFollowers, mockFollowing, mockSavedItems } from './profile.service';
export { settingsService, mockSettings } from './settings.service';
export { favoritesService, mockFavorites, mockFollowingArtists, mockCollections } from './favorites.service';

// Export API configuration
export { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
