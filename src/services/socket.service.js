import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/api.config';

/**
 * Socket.io Service for Real-Time Communication
 * Manages chat and livestream WebSocket connections
 */

class SocketService {
  constructor() {
    this.chatSocket = null;
    this.livestreamSocket = null;
    this.isConnected = false;
  }

  /**
   * Connect to chat namespace
   */
  connectChat(token) {
    if (this.chatSocket?.connected) {
      console.log('Chat socket already connected');
      return this.chatSocket;
    }

    const socketUrl = API_CONFIG.baseURL.replace('/api', '');

    this.chatSocket = io(`${socketUrl}/chat`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.chatSocket.on('connect', () => {
      console.log('💬 Connected to chat socket');
      this.isConnected = true;
    });

    this.chatSocket.on('disconnect', (reason) => {
      console.log('💬 Disconnected from chat:', reason);
      this.isConnected = false;
    });

    this.chatSocket.on('connect_error', (error) => {
      console.error('Chat socket connection error:', error);
    });

    return this.chatSocket;
  }

  /**
   * Connect to livestream namespace
   */
  connectLivestream(token = null) {
    if (this.livestreamSocket?.connected) {
      console.log('Livestream socket already connected');
      return this.livestreamSocket;
    }

    const socketUrl = API_CONFIG.baseURL.replace('/api', '');

    this.livestreamSocket = io(`${socketUrl}/livestream`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.livestreamSocket.on('connect', () => {
      console.log('📺 Connected to livestream socket');
    });

    this.livestreamSocket.on('disconnect', (reason) => {
      console.log('📺 Disconnected from livestream:', reason);
    });

    this.livestreamSocket.on('connect_error', (error) => {
      console.error('Livestream socket connection error:', error);
    });

    return this.livestreamSocket;
  }

  /**
   * Disconnect from chat
   */
  disconnectChat() {
    if (this.chatSocket) {
      this.chatSocket.disconnect();
      this.chatSocket = null;
      this.isConnected = false;
    }
  }

  /**
   * Disconnect from livestream
   */
  disconnectLivestream() {
    if (this.livestreamSocket) {
      this.livestreamSocket.disconnect();
      this.livestreamSocket = null;
    }
  }

  /**
   * Disconnect all sockets
   */
  disconnectAll() {
    this.disconnectChat();
    this.disconnectLivestream();
  }

  // ============================================
  // CHAT METHODS
  // ============================================

  /**
   * Join a conversation room
   */
  joinConversation(conversationId) {
    if (!this.chatSocket?.connected) {
      console.error('Chat socket not connected');
      return;
    }
    this.chatSocket.emit('join_conversation', conversationId);
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId) {
    if (!this.chatSocket?.connected) return;
    this.chatSocket.emit('leave_conversation', conversationId);
  }

  /**
   * Send a message
   */
  sendMessage(conversationId, content) {
    if (!this.chatSocket?.connected) {
      console.error('Chat socket not connected');
      return;
    }
    this.chatSocket.emit('send_message', { conversationId, content });
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId) {
    if (!this.chatSocket?.connected) return;
    this.chatSocket.emit('typing', { conversationId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(conversationId) {
    if (!this.chatSocket?.connected) return;
    this.chatSocket.emit('stop_typing', { conversationId });
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId) {
    if (!this.chatSocket?.connected) return;
    this.chatSocket.emit('mark_as_read', { conversationId });
  }

  /**
   * Listen for new messages
   */
  onNewMessage(callback) {
    if (!this.chatSocket) return;
    this.chatSocket.on('new_message', callback);
  }

  /**
   * Listen for typing indicator
   */
  onUserTyping(callback) {
    if (!this.chatSocket) return;
    this.chatSocket.on('user_typing', callback);
  }

  /**
   * Listen for stop typing
   */
  onUserStopTyping(callback) {
    if (!this.chatSocket) return;
    this.chatSocket.on('user_stop_typing', callback);
  }

  /**
   * Listen for message notifications
   */
  onMessageNotification(callback) {
    if (!this.chatSocket) return;
    this.chatSocket.on('message_notification', callback);
  }

  /**
   * Remove all chat listeners
   */
  removeAllChatListeners() {
    if (!this.chatSocket) return;
    this.chatSocket.removeAllListeners();
  }

  // ============================================
  // LIVESTREAM METHODS
  // ============================================

  /**
   * Join a livestream
   */
  joinStream(livestreamId) {
    if (!this.livestreamSocket?.connected) {
      console.error('Livestream socket not connected');
      return;
    }
    this.livestreamSocket.emit('join_stream', livestreamId);
  }

  /**
   * Leave a livestream
   */
  leaveStream(livestreamId) {
    if (!this.livestreamSocket?.connected) return;
    this.livestreamSocket.emit('leave_stream', livestreamId);
  }

  /**
   * Send chat message in livestream
   */
  sendStreamChatMessage(livestreamId, message) {
    if (!this.livestreamSocket?.connected) {
      console.error('Livestream socket not connected');
      return;
    }
    this.livestreamSocket.emit('stream_chat_message', { livestreamId, message });
  }

  /**
   * Start livestream (artist only)
   */
  startStream(livestreamId) {
    if (!this.livestreamSocket?.connected) {
      console.error('❌ Livestream socket not connected, cannot start stream');
      return;
    }
    console.log('✅ Emitting start_stream event for livestream ID:', livestreamId);
    this.livestreamSocket.emit('start_stream', livestreamId);
  }

  /**
   * End livestream (artist only)
   */
  endStream(livestreamId) {
    if (!this.livestreamSocket?.connected) {
      console.error('Livestream socket not connected');
      return;
    }
    this.livestreamSocket.emit('end_stream', livestreamId);
  }

  /**
   * Listen for viewer count updates
   */
  onViewerCountUpdate(callback) {
    if (!this.livestreamSocket) return;
    this.livestreamSocket.on('viewer_count_update', callback);
  }

  /**
   * Listen for stream chat messages
   */
  onStreamChatMessage(callback) {
    if (!this.livestreamSocket) return;
    this.livestreamSocket.on('stream_chat_message', callback);
  }

  /**
   * Listen for stream ended
   */
  onStreamEnded(callback) {
    if (!this.livestreamSocket) return;
    this.livestreamSocket.on('stream_ended', callback);
  }

  /**
   * Listen for joined stream confirmation
   */
  onJoinedStream(callback) {
    if (!this.livestreamSocket) return;
    this.livestreamSocket.on('joined_stream', callback);
  }

  /**
   * Remove all livestream listeners
   */
  removeAllLivestreamListeners() {
    if (!this.livestreamSocket) return;
    this.livestreamSocket.removeAllListeners();
  }

  // ============================================
  // WEBRTC SIGNALING METHODS
  // ============================================

  /**
   * Request stream from broadcaster (viewer initiates)
   */
  requestStream(livestreamId) {
    if (!this.livestreamSocket?.connected) {
      console.error('Livestream socket not connected');
      return;
    }
    this.livestreamSocket.emit('request_stream', livestreamId);
  }

  /**
   * Send WebRTC offer
   */
  sendWebRTCOffer(livestreamId, viewerId, offer) {
    if (!this.livestreamSocket?.connected) return;
    this.livestreamSocket.emit('webrtc_offer', { livestreamId, viewerId, offer });
  }

  /**
   * Send WebRTC answer
   */
  sendWebRTCAnswer(livestreamId, answer) {
    if (!this.livestreamSocket?.connected) return;
    this.livestreamSocket.emit('webrtc_answer', { livestreamId, answer });
  }

  /**
   * Send ICE candidate
   */
  sendICECandidate(livestreamId, viewerId, candidate) {
    if (!this.livestreamSocket?.connected) return;
    this.livestreamSocket.emit('webrtc_ice_candidate', { livestreamId, viewerId, candidate });
  }

  /**
   * Listen for new viewers (broadcaster)
   */
  onNewViewer(callback) {
    if (!this.livestreamSocket) return;
    this.livestreamSocket.on('new_viewer', callback);
  }

  /**
   * Listen for WebRTC offer (viewer)
   */
  onWebRTCOffer(callback) {
    if (!this.livestreamSocket) return;
    this.livestreamSocket.on('webrtc_offer', callback);
  }

  /**
   * Listen for WebRTC answer (broadcaster)
   */
  onWebRTCAnswer(callback) {
    if (!this.livestreamSocket) return;
    this.livestreamSocket.on('webrtc_answer', callback);
  }

  /**
   * Listen for ICE candidates
   */
  onICECandidate(callback) {
    if (!this.livestreamSocket) return;
    this.livestreamSocket.on('webrtc_ice_candidate', callback);
  }

  /**
   * Listen for viewer disconnected (broadcaster)
   */
  onViewerDisconnected(callback) {
    if (!this.livestreamSocket) return;
    this.livestreamSocket.on('viewer_disconnected', callback);
  }

  /**
   * Listen for new streams going live
   */
  onNewStreamLive(callback) {
    if (!this.livestreamSocket) return;
    this.livestreamSocket.on('new_stream_live', callback);
  }

  /**
   * Get livestream socket instance
   */
  getLivestreamSocket() {
    return this.livestreamSocket;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
