/**
 * API Configuration
 * Central configuration for all API-related settings
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  tokenKey: import.meta.env.VITE_TOKEN_KEY || 'onlyarts_token',
  refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'onlyarts_refresh_token',
};

// Debug: Log API configuration
console.log('[API Config] Base URL:', API_CONFIG.baseURL);
console.log('[API Config] Environment:', import.meta.env.VITE_API_BASE_URL);

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },

  // Users
  users: {
    profile: '/users/profile', // Get current user's own profile
    byId: (id) => `/users/${id}`, // Get user by ID
    byUsername: (username) => `/users/${username}`, // Get user by username or ID
    updateProfile: '/users/profile',
    uploadAvatar: '/users/upload/avatar',
    uploadCover: '/users/upload/cover',
    settings: '/users/settings',
    changePassword: '/users/change-password',
    deactivate: '/users/deactivate',
  },

  // Artworks
  artworks: {
    list: '/artworks',
    create: '/artworks',
    details: (id) => `/artworks/${id}`,
    update: (id) => `/artworks/${id}`,
    delete: (id) => `/artworks/${id}`,
    like: (id) => `/artworks/${id}/like`,
    unlike: (id) => `/artworks/${id}/like`, // DELETE request to same endpoint as like
    comments: (id) => `/artworks/${id}/comments`,
    addComment: (id) => `/artworks/${id}/comments`,
  },

  // Exhibitions
  exhibitions: {
    list: '/exhibitions',
    create: '/exhibitions',
    details: (id) => `/exhibitions/${id}`,
    update: (id) => `/exhibitions/${id}`,
    delete: (id) => `/exhibitions/${id}`,
    follow: (id) => `/exhibitions/${id}/follow`,
    unfollow: (id) => `/exhibitions/${id}/unfollow`,
  },

  // Livestreams
  livestreams: {
    list: '/livestreams',
    create: '/livestreams',
    details: (id) => `/livestreams/${id}`,
    end: (id) => `/livestreams/${id}/end`,
    bid: (id) => `/livestreams/${id}/bid`,
    comments: (id) => `/livestreams/${id}/comments`,
  },

  // Artists
  artists: {
    list: '/artists',
    create: '/artists',
    profile: (username) => `/artists/${username}`,
    follow: (username) => `/artists/${username}/follow`,
    unfollow: (username) => `/artists/${username}/unfollow`,
    commissions: (username) => `/artists/${username}/commissions`,
  },

  // Collections
  collections: {
    list: '/collections',
    create: '/collections',
    details: (id) => `/collections/${id}`,
    update: (id) => `/collections/${id}`,
    delete: (id) => `/collections/${id}`,
    addItem: (id) => `/collections/${id}/items`,
    removeItem: (id, itemId) => `/collections/${id}/items/${itemId}`,
  },

  // Favorites
  favorites: {
    list: '/favorites',
    add: '/favorites',
    remove: (id) => `/favorites/${id}`,
  },

  // Cart & Orders
  cart: {
    get: '/cart',
    add: '/cart/items',
    update: (itemId) => `/cart/items/${itemId}`,
    remove: (itemId) => `/cart/items/${itemId}`,
    clear: '/cart/clear',
  },

  orders: {
    create: '/orders',
    list: '/orders',
    details: (id) => `/orders/${id}`,
  },

  // Payments
  payments: {
    methods: '/payments/methods',
    addMethod: '/payments/methods',
    removeMethod: (id) => `/payments/methods/${id}`,
    processPayment: '/payments/process',
    createIntent: '/payments/create-intent',
  },

  // Subscriptions
  subscriptions: {
    plans: '/subscriptions/plans',
    current: '/subscriptions/current',
    subscribe: '/subscriptions/upgrade',
    cancel: '/subscriptions/cancel',
    update: '/subscriptions/upgrade',
  },

  // Wallet
  wallet: {
    balance: '/wallet/balance',
    transactions: '/wallet/transactions',
    addFunds: '/wallet/add-funds',
    withdraw: '/wallet/withdraw',
  },

  // Chat
  chat: {
    conversations: '/chat/conversations',
    messages: (conversationId) => `/chat/conversations/${conversationId}/messages`,
    send: (conversationId) => `/chat/conversations/${conversationId}/messages`,
    markRead: (conversationId) => `/chat/conversations/${conversationId}/read`,
  },

  // Search
  search: {
    all: '/search',
    artworks: '/search/artworks',
    artists: '/search/artists',
    exhibitions: '/search/exhibitions',
  },

  // Notifications
  notifications: {
    list: '/notifications',
    markRead: (id) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    settings: '/notifications/settings',
  },

  // Dashboard
  dashboard: {
    feed: '/dashboard/feed',
    trending: '/dashboard/trending',
    recommendations: '/dashboard/recommendations',
  },
};

export default API_CONFIG;
