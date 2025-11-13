import { api } from './api.client';

/**
 * Checkout Service
 *
 * Handles checkout and payment operations including:
 * - Payment method management
 * - Order creation
 * - Payment processing
 * - Order history
 */

export const checkoutService = {
  /**
   * Get saved payment methods
   * @returns {Promise<Object>} List of payment methods
   */
  getPaymentMethods: async () => {
    const response = await api.get('/payment-methods');
    return response.data;
  },

  /**
   * Add a new payment method
   * @param {Object} paymentData - Payment method details
   * @param {string} paymentData.type - 'card' | 'paypal' | 'crypto'
   * @param {Object} paymentData.details - Payment details
   * @returns {Promise<Object>} New payment method
   */
  addPaymentMethod: async (paymentData) => {
    const response = await api.post('/payment-methods', paymentData);
    return response.data;
  },

  /**
   * Remove payment method
   * @param {string} methodId - Payment method ID
   * @returns {Promise<Object>} Success message
   */
  removePaymentMethod: async (methodId) => {
    const response = await api.delete(`/payment-methods/${methodId}`);
    return response.data;
  },

  /**
   * Set default payment method
   * @param {string} methodId - Payment method ID
   * @returns {Promise<Object>} Updated payment method
   */
  setDefaultPaymentMethod: async (methodId) => {
    const response = await api.patch(`/payment-methods/${methodId}/default`);
    return response.data;
  },

  /**
   * Create order from cart
   * @param {Object} orderData - Order details
   * @param {string} orderData.paymentMethodId - Payment method to use
   * @param {string} orderData.shippingAddress - Shipping address
   * @param {string} orderData.billingAddress - Billing address
   * @returns {Promise<Object>} Created order
   */
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Process payment for order
   * @param {string} orderId - Order ID
   * @param {Object} paymentData - Payment processing data
   * @returns {Promise<Object>} Payment result
   */
  processPayment: async (orderId, paymentData) => {
    const response = await api.post(`/orders/${orderId}/pay`, paymentData);
    return response.data;
  },

  /**
   * Get order details
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get order history
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of orders
   */
  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  /**
   * Cancel order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Cancelled order
   */
  cancelOrder: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/cancel`);
    return response.data;
  },

  /**
   * Apply gift card to order
   * @param {string} orderId - Order ID
   * @param {string} giftCardCode - Gift card code
   * @returns {Promise<Object>} Updated order
   */
  applyGiftCard: async (orderId, giftCardCode) => {
    const response = await api.post(`/orders/${orderId}/gift-card`, { code: giftCardCode });
    return response.data;
  },
};

// Mock payment methods for demo mode (includes card and PayPal options)
export const mockPaymentMethods = [
  {
    id: 'pm_1',
    type: 'card',
    details: {
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
    },
    isDefault: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'pm_2',
    type: 'card',
    details: {
      brand: 'Mastercard',
      last4: '5555',
      expiryMonth: 8,
      expiryYear: 2026,
    },
    isDefault: false,
    createdAt: '2024-02-20',
  },
  {
    id: 'pm_3',
    type: 'paypal',
    details: {
      email: 'user@example.com',
    },
    isDefault: false,
    createdAt: '2024-03-10',
  },
];

// Mock order data
export const mockOrder = {
  id: 'order_123',
  orderNumber: 'OA-2024-0001',
  status: 'pending',
  items: [
    {
      id: 'item_1',
      artworkId: '1',
      title: 'Digital Sunset',
      artist: '@artist1',
      artistName: 'Sarah Chen',
      image: '🌅',
      price: 5000,
      quantity: 1,
    },
  ],
  subtotal: 5000,
  tax: 500,
  shipping: 500,
  discount: 0,
  total: 6000,
  shippingAddress: {
    name: 'John Doe',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
  },
  billingAddress: {
    name: 'John Doe',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
  },
  paymentMethod: mockPaymentMethods[0],
  createdAt: '2024-03-01T10:00:00Z',
  updatedAt: '2024-03-01T10:00:00Z',
};

export default checkoutService;
