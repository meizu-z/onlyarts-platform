import { api } from './api.client';

/**
 * Cart Service
 *
 * Handles shopping cart operations including:
 * - Getting cart items
 * - Adding/removing items
 * - Updating quantities
 * - Applying promo codes
 * - Calculating totals
 */

export const cartService = {
  /**
   * Get current user's cart
   * @returns {Promise<Object>} Cart data with items and totals
   */
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  /**
   * Add item to cart
   * @param {Object} itemData - Item details
   * @param {string} itemData.artworkId - Artwork ID
   * @param {number} itemData.quantity - Quantity (default: 1)
   * @param {string} itemData.type - Item type ('artwork' | 'subscription')
   * @returns {Promise<Object>} Updated cart
   */
  addItem: async (itemData) => {
    const response = await api.post('/cart/items', itemData);
    return response.data;
  },

  /**
   * Remove item from cart
   * @param {string} itemId - Cart item ID
   * @returns {Promise<Object>} Updated cart
   */
  removeItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  /**
   * Update item quantity
   * @param {string} itemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart
   */
  updateQuantity: async (itemId, quantity) => {
    const response = await api.patch(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  /**
   * Clear entire cart
   * @returns {Promise<Object>} Empty cart
   */
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },

  /**
   * Apply promo code
   * @param {string} code - Promo code
   * @returns {Promise<Object>} Updated cart with discount
   */
  applyPromoCode: async (code) => {
    const response = await api.post('/cart/promo', { code });
    return response.data;
  },

  /**
   * Remove promo code
   * @returns {Promise<Object>} Updated cart without discount
   */
  removePromoCode: async () => {
    const response = await api.delete('/cart/promo');
    return response.data;
  },

  /**
   * Get cart summary (totals)
   * @returns {Promise<Object>} Cart totals
   */
  getSummary: async () => {
    const response = await api.get('/cart/summary');
    return response.data;
  },
};

// Mock cart data for demo mode
export const mockCartItems = [
  {
    id: 'cart_1',
    artworkId: '1',
    artwork: {
      id: '1',
      title: 'Digital Sunset',
      artist: '@artist1',
      artistName: 'Sarah Chen',
      image: '🌅',
      price: 5000,
    },
    quantity: 1,
    price: 5000,
    type: 'artwork',
  },
  {
    id: 'cart_2',
    artworkId: '3',
    artwork: {
      id: '3',
      title: 'Abstract Thoughts',
      artist: '@artist2',
      artistName: 'Mike Johnson',
      image: '🎨',
      price: 3500,
    },
    quantity: 1,
    price: 3500,
    type: 'artwork',
  },
  {
    id: 'cart_3',
    artworkId: '5',
    artwork: {
      id: '5',
      title: 'Neon Dreams',
      artist: '@artist3',
      artistName: 'Emma Wilson',
      image: '✨',
      price: 4200,
    },
    quantity: 1,
    price: 4200,
    type: 'artwork',
  },
];

export const mockCart = {
  items: mockCartItems,
  subtotal: 12700,
  tax: 1270,
  shipping: 500,
  discount: 0,
  total: 14470,
  promoCode: null,
  itemCount: 3,
};

export default cartService;
