/**
 * Wallet Service
 * Handles wallet and transaction-related API calls
 */

import { api } from './api.client';

export const walletService = {
  /**
   * Get wallet balance
   * @returns {Promise<{balance}>}
   */
  getBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },

  /**
   * Get transaction history
   * @param {Object} params
   * @returns {Promise<{transactions}>}
   */
  getTransactions: async (params = {}) => {
    const response = await api.get('/wallet/transactions', { params });
    return response.data;
  },

  /**
   * Add funds to wallet
   * @param {Object} data
   * @returns {Promise<{transaction}>}
   */
  addFunds: async (data) => {
    const response = await api.post('/wallet/add-funds', data);
    return response.data;
  },

  /**
   * Withdraw funds from wallet
   * @param {Object} data
   * @returns {Promise<{transaction}>}
   */
  withdraw: async (data) => {
    const response = await api.post('/wallet/withdraw', data);
    return response.data;
  },

  /**
   * Send gift to another user
   * @param {Object} data
   * @returns {Promise<{transaction}>}
   */
  sendGift: async (data) => {
    const response = await api.post('/wallet/send-gift', data);
    return response.data;
  },

  /**
   * Get payment methods
   * @returns {Promise<{paymentMethods}>}
   */
  getPaymentMethods: async () => {
    const response = await api.get('/wallet/payment-methods');
    return response.data;
  },

  /**
   * Add payment method
   * @param {Object} paymentMethod
   * @returns {Promise<{paymentMethod}>}
   */
  addPaymentMethod: async (paymentMethod) => {
    const response = await api.post('/wallet/payment-methods', paymentMethod);
    return response.data;
  },
};

// Mock data for demo mode
export const mockWallet = {
  balance: 2500.00,
  currency: 'PHP',
};

export const mockTransactions = [
  {
    id: 1,
    date: '2025-10-19',
    description: 'Premium Subscription',
    amount: -249,
    status: 'completed',
    type: 'subscription'
  },
  {
    id: 2,
    date: '2025-10-15',
    description: 'NFT Purchase',
    amount: -5000,
    status: 'completed',
    type: 'purchase'
  },
  {
    id: 3,
    date: '2025-10-10',
    description: 'Wallet Top-up',
    amount: 10000,
    status: 'completed',
    type: 'deposit'
  },
  {
    id: 4,
    date: '2025-10-05',
    description: 'Artwork Sale',
    amount: 3500,
    status: 'completed',
    type: 'sale'
  },
  {
    id: 5,
    date: '2025-10-01',
    description: 'Commission Payment',
    amount: -1200,
    status: 'completed',
    type: 'payment'
  },
];

export const mockPaymentMethods = [
  {
    id: 'pm_1',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
  },
];

export default walletService;
