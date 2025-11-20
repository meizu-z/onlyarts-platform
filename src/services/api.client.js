/**
 * API Client
 * Axios instance with request/response interceptors for authentication and error handling
 */

import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Field mapping configuration: backend (snake_case) -> frontend (camelCase)
// Comprehensive mappings based on backend audit - Updated 2025
const FIELD_MAPPINGS = {
  // ==========================================
  // USER FIELDS
  // ==========================================
  full_name: 'fullName',
  profile_image: 'profileImage',
  cover_image: 'coverImage',
  subscription_tier: 'subscription',
  follower_count: 'followers',
  following_count: 'following',
  artwork_count: 'artworks',
  wallet_balance: 'walletBalance',
  total_earnings: 'totalEarnings',
  is_active: 'isActive',
  is_following: 'isFollowing',
  last_login_at: 'lastLoginAt',

  // Other user fields (chat, commissions, etc.)
  other_user_id: 'otherUserId',
  other_user_name: 'name',
  other_user_username: 'username',
  other_user_image: 'avatarUrl',

  // ==========================================
  // ARTWORK FIELDS
  // ==========================================
  artist_id: 'artistId',
  artist_username: 'artistUsername',
  artist_name: 'artistName',
  artist_image: 'artistImage',
  artist_bio: 'artistBio',
  primary_image: 'primaryImage',
  like_count: 'likes',
  view_count: 'views',
  comment_count: 'comments',
  is_for_sale: 'isForSale',
  is_liked: 'isLiked',
  is_original: 'isOriginal',
  is_edited: 'isEdited',
  year_created: 'year',
  stock_quantity: 'stock',
  parent_id: 'parentId',

  // Media fields
  media_url: 'mediaUrl',
  media_type: 'mediaType',
  display_order: 'displayOrder',
  is_primary: 'isPrimary',
  cloudinary_public_id: 'cloudinaryPublicId',

  // ==========================================
  // ORDER FIELDS
  // ==========================================
  order_number: 'orderNumber',
  total_amount: 'totalAmount',
  payment_method: 'paymentMethod',
  payment_status: 'paymentStatus',
  payment_intent_id: 'paymentIntentId',
  shipping_address: 'shippingAddress',
  seller_id: 'sellerId',
  seller_username: 'sellerUsername',
  seller_name: 'sellerName',
  seller_earnings: 'sellerEarnings',
  buyer_username: 'buyerUsername',
  buyer_name: 'buyerName',
  commission_rate: 'commissionRate',
  commission_amount: 'commissionAmount',
  total_orders: 'totalOrders',
  artwork_title: 'artworkTitle',

  // ==========================================
  // COMMISSION FIELDS
  // ==========================================
  client_id: 'clientId',
  client_username: 'clientUsername',
  client_name: 'clientName',
  client_image: 'clientImage',
  client_email: 'clientEmail',
  reference_images: 'referenceImages',

  // ==========================================
  // EXHIBITION FIELDS
  // ==========================================
  start_date: 'startDate',
  end_date: 'endDate',
  curator_id: 'curatorId',
  curator_username: 'curatorUsername',
  curator_name: 'curatorName',
  curator_image: 'curatorImage',
  curator_tier: 'curatorTier',
  is_private: 'isPrivate',

  // ==========================================
  // LIVESTREAM FIELDS
  // ==========================================
  host_id: 'hostId',
  host_username: 'hostUsername',
  host_name: 'hostName',
  host_image: 'hostImage',
  scheduled_start_at: 'scheduledStartAt',
  started_at: 'startedAt',
  ended_at: 'endedAt',
  thumbnail_url: 'thumbnailUrl',
  viewer_count: 'viewerCount',

  // ==========================================
  // CHAT/MESSAGE FIELDS
  // ==========================================
  participant_one_id: 'participantOneId',
  participant_two_id: 'participantTwoId',
  last_message: 'lastMessage',
  last_message_at: 'lastMessageTime',
  unread_count: 'unread',
  sender_id: 'senderId',
  sender_username: 'senderUsername',
  sender_name: 'senderName',
  sender_image: 'senderImage',
  is_read: 'isRead',
  read_at: 'readAt',
  conversation_id: 'conversationId',
  user1_id: 'user1Id',
  user2_id: 'user2Id',

  // ==========================================
  // SUBSCRIPTION FIELDS
  // ==========================================
  from_tier: 'fromTier',
  to_tier: 'toTier',
  payment_method_id: 'paymentMethodId',

  // ==========================================
  // SHARE/FAVORITE FIELDS
  // ==========================================
  artwork_id: 'artworkId',
  user_id: 'userId',
  already_shared: 'alreadyShared',
  share_id: 'shareId',
  shared_at: 'sharedAt',
  liked_at: 'likedAt',

  // ==========================================
  // COMMENT FIELDS
  // ==========================================
  commenter_id: 'commenterId',
  commenter_username: 'commenterUsername',
  commenter_name: 'commenterName',
  commenter_image: 'commenterImage',

  // ==========================================
  // COMMON TIMESTAMP FIELDS
  // ==========================================
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

/**
 * Recursively normalize object keys from snake_case to camelCase
 * Keeps both versions for backward compatibility
 */
function normalizeKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(normalizeKeys);
  }

  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      const normalizedKey = FIELD_MAPPINGS[key] || key;
      const value = normalizeKeys(obj[key]);

      // Add normalized key
      acc[normalizedKey] = value;

      // Keep original key for backward compatibility
      if (FIELD_MAPPINGS[key] && normalizedKey !== key) {
        acc[key] = value;
      }

      return acc;
    }, {});
  }

  return obj;
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(API_CONFIG.tokenKey);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    // Unwrap standardized API responses automatically
    // Backend sends: { success: true, message: "...", data: {...} }
    // We return just the data portion to keep frontend code simple
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      // Normalize field names from snake_case to camelCase
      const normalizedData = normalizeKeys(response.data.data);
      return { ...response, data: normalizedData };
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    // Handle 401 Unauthorized - Try to refresh token
    // BUT: Don't try to refresh for login, register, or logout endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/logout') ||
                          originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(API_CONFIG.refreshTokenKey);

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post(
          `${API_CONFIG.baseURL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Save new tokens
        localStorage.setItem(API_CONFIG.tokenKey, accessToken);
        if (newRefreshToken) {
          localStorage.setItem(API_CONFIG.refreshTokenKey, newRefreshToken);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - dispatch a global event to trigger logout
        // This is better than a hard redirect, as it allows the AuthContext
        // to handle the logout gracefully and clean up state.
        window.dispatchEvent(new Event('auth-error'));

        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        type: 'NETWORK_ERROR',
        originalError: error,
      });
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timeout. Please try again.',
        type: 'TIMEOUT_ERROR',
        originalError: error,
      });
    }

    // Return standardized error object
    return Promise.reject({
      status: error.response?.status,
      message: error.response?.data?.message || error.message || 'An error occurred',
      errors: error.response?.data?.errors,
      type: 'API_ERROR',
      originalError: error,
    });
  }
);

// Helper methods for common request types
export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
};

// Helper for file uploads
export const uploadFile = async (url, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

// Helper for multiple file uploads
export const uploadFiles = async (url, files, onUploadProgress) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });

  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

export default apiClient;
