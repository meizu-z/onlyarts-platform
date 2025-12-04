/**
 * Chat Service
 * Handles messaging and chat-related API calls
 */

import { api } from './api.client';

export const chatService = {
  /**
   * Get chat conversations/contacts
   * @returns {Promise<{conversations}>}
   */
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  /**
   * Get messages for a specific conversation
   * @param {string} conversationId
   * @param {Object} params
   * @returns {Promise<{messages}>}
   */
  getMessages: async (conversationId, params = {}) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  /**
   * Send a message
   * @param {string} conversationId
   * @param {Object} messageData
   * @returns {Promise<{message}>}
   */
  sendMessage: async (conversationId, messageData) => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, messageData);
    return response.data;
  },

  /**
   * Start a new conversation
   * @param {Object} conversationData
   * @returns {Promise<{conversation}>}
   */
  startConversation: async (conversationData) => {
    const response = await api.post('/chat/conversations', conversationData);
    return response.data;
  },

  /**
   * Mark conversation as read
   * @param {string} conversationId
   * @returns {Promise<{success}>}
   */
  markAsRead: async (conversationId) => {
    const response = await api.post(`/chat/conversations/${conversationId}/read`);
    return response.data;
  },

  /**
   * Search conversations
   * @param {string} query
   * @returns {Promise<{conversations}>}
   */
  searchConversations: async (query) => {
    const response = await api.get('/chat/search', { params: { q: query } });
    return response.data;
  },

  /**
   * Delete a message
   * @param {string} messageId
   * @returns {Promise<{success}>}
   */
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chat/messages/${messageId}`);
    return response.data;
  },
};

// Mock data for demo mode
export const mockContacts = [
  {
    id: 1,
    name: 'meizzuuuuuuu',
    avatarUrl: 'https://i.pravatar.cc/150?u=meizzuuuuuuu',
    online: true,
    lastMessage: 'Right? By the way, are you going...',
    unread: 2,
    lastMessageTime: '2025-10-25T10:02:00',
    isArtist: false,
    isPremium: false
  },
  {
    id: 2,
    name: 'jnorman',
    avatarUrl: 'https://i.pravatar.cc/150?u=jnorman',
    online: false,
    lastMessage: 'Definitely! I wouldn\'t miss it...',
    lastMessageTime: '2025-10-25T09:45:00',
    isArtist: false,
    isPremium: false
  },
  {
    id: 3,
    name: 'artist1',
    avatarUrl: 'https://i.pravatar.cc/150?u=artist1',
    online: true,
    lastMessage: 'Thanks for the support!',
    lastMessageTime: '2025-10-25T08:30:00',
    isArtist: true,
    isPremium: true
  },
  {
    id: 4,
    name: 'SarahChen',
    avatarUrl: 'https://i.pravatar.cc/150?u=SarahChen',
    online: false,
    lastMessage: 'See you there.',
    lastMessageTime: '2025-10-24T18:20:00',
    isArtist: true,
    isPremium: true
  },
  {
    id: 5,
    name: 'MikeJ',
    avatarUrl: 'https://i.pravatar.cc/150?u=MikeJ',
    online: true,
    lastMessage: 'Sounds good.',
    lastMessageTime: '2025-10-24T16:15:00',
    isArtist: false,
    isPremium: false
  },
];

export const mockMessages = {
  1: [
    {
      id: 1,
      senderId: 1,
      user: 'meizzuuuuuuu',
      text: 'Hey, did you see that new digital art piece by @artist1? It\'s amazing!',
      timestamp: '10:00 AM',
      isYou: false
    },
    {
      id: 2,
      senderId: 'current_user',
      user: 'jnorman',
      text: 'Yeah, I saw it! The colors are incredible. I wish I could afford it.',
      timestamp: '10:01 AM',
      isYou: true
    },
    {
      id: 3,
      senderId: 1,
      user: 'meizzuuuuuuu',
      text: 'Right? By the way, are you going to the virtual exhibition next week?',
      timestamp: '10:02 AM',
      isYou: false
    },
    {
      id: 4,
      senderId: 'current_user',
      user: 'jnorman',
      text: 'Definitely! I wouldn\'t miss it for the world. Maybe we can catch up there.',
      timestamp: '10:03 AM',
      isYou: true
    },
  ],
  2: [
    {
      id: 1,
      senderId: 2,
      user: 'jnorman',
      text: 'Hi! How are you?',
      timestamp: '9:30 AM',
      isYou: false
    },
    {
      id: 2,
      senderId: 'current_user',
      user: 'You',
      text: 'I\'m good, thanks! How about you?',
      timestamp: '9:45 AM',
      isYou: true
    },
  ],
  3: [
    {
      id: 1,
      senderId: 'current_user',
      user: 'You',
      text: 'Love your latest artwork!',
      timestamp: '8:15 AM',
      isYou: true
    },
    {
      id: 2,
      senderId: 3,
      user: 'artist1',
      text: 'Thanks for the support!',
      timestamp: '8:30 AM',
      isYou: false
    },
  ],
  4: [
    {
      id: 1,
      senderId: 4,
      user: 'SarahChen',
      text: 'Are you attending the event tomorrow?',
      timestamp: '6:10 PM',
      isYou: false
    },
    {
      id: 2,
      senderId: 'current_user',
      user: 'You',
      text: 'See you there.',
      timestamp: '6:20 PM',
      isYou: true
    },
  ],
  5: [
    {
      id: 1,
      senderId: 'current_user',
      user: 'You',
      text: 'Want to collaborate on a project?',
      timestamp: '4:00 PM',
      isYou: true
    },
    {
      id: 2,
      senderId: 5,
      user: 'MikeJ',
      text: 'Sounds good.',
      timestamp: '4:15 PM',
      isYou: false
    },
  ],
};

export default chatService;
