import apiClient from './api.client';

const adminService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  // User Management
  getAllUsers: async (params = {}) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  banUser: async (userId) => {
    const response = await apiClient.put(`/admin/users/${userId}/ban`);
    return response.data;
  },

  unbanUser: async (userId) => {
    const response = await apiClient.put(`/admin/users/${userId}/unban`);
    return response.data;
  },

  // Artwork Management
  getAllArtworks: async (params = {}) => {
    const response = await apiClient.get('/admin/artworks', { params });
    return response.data;
  },

  featureArtwork: async (artworkId) => {
    const response = await apiClient.put(`/admin/artworks/${artworkId}/feature`, { featured: true });
    return response.data;
  },

  unfeatureArtwork: async (artworkId) => {
    const response = await apiClient.put(`/admin/artworks/${artworkId}/feature`, { featured: false });
    return response.data;
  },

  deleteArtwork: async (artworkId) => {
    const response = await apiClient.delete(`/admin/artworks/${artworkId}`);
    return response.data;
  },

  // Order Management
  getAllOrders: async (params = {}) => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },

  // Analytics
  getRevenueAnalytics: async (params = {}) => {
    const response = await apiClient.get('/admin/analytics/revenue', { params });
    return response.data;
  },

  // Audit Log / Activity History
  getAuditLog: async (params = {}) => {
    const response = await apiClient.get('/admin/audit-log', { params });
    return response.data;
  }
};

export default adminService;
