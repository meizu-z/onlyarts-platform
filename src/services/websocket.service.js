/**
 * WebSocket Service
 *
 * Handles real-time communication for:
 * - Chat messages
 * - Livestream updates
 * - Notifications
 * - Activity feeds
 */

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.isConnecting = false;
  }

  /**
   * Connect to WebSocket server
   * @param {string} token - Authentication token
   * @returns {Promise<void>}
   */
  connect(token) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    if (this.isConnecting) {
      console.log('WebSocket connection in progress');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
        this.socket = new WebSocket(`${wsUrl}?token=${token}`);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.emit('connected');
          resolve();
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket disconnected', event.code, event.reason);
          this.isConnecting = false;
          this.emit('disconnected', event);

          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect(token);
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', error);
          reject(error);
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   * @param {string} token - Authentication token
   */
  attemptReconnect(token) {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect(token).catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnecting');
      this.socket = null;
    }
    this.listeners.clear();
  }

  /**
   * Send a message through WebSocket
   * @param {string} type - Message type
   * @param {Object} payload - Message payload
   */
  send(type, payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', type, payload);
    }
  }

  /**
   * Handle incoming WebSocket message
   * @param {Object} data - Parsed message data
   */
  handleMessage(data) {
    const { type, payload } = data;

    // Emit to all listeners for this message type
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach((callback) => {
        callback(payload);
      });
    }

    // Also emit to wildcard listeners
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach((callback) => {
        callback(data);
      });
    }
  }

  /**
   * Subscribe to a message type
   * @param {string} type - Message type to listen for
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);

    // Return unsubscribe function
    return () => this.off(type, callback);
  }

  /**
   * Unsubscribe from a message type
   * @param {string} type - Message type
   * @param {Function} callback - Callback function to remove
   */
  off(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
      if (this.listeners.get(type).size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  /**
   * Emit an event to listeners
   * @param {string} type - Event type
   * @param {*} data - Event data
   */
  emit(type, data) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach((callback) => {
        callback(data);
      });
    }
  }

  /**
   * Check if WebSocket is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  // Specific message type helpers

  /**
   * Send a chat message
   * @param {string} conversationId - Conversation ID
   * @param {string} message - Message content
   */
  sendChatMessage(conversationId, message) {
    this.send('chat:message', { conversationId, message });
  }

  /**
   * Subscribe to chat messages
   * @param {string} conversationId - Conversation ID
   * @param {Function} callback - Message callback
   * @returns {Function} Unsubscribe function
   */
  onChatMessage(conversationId, callback) {
    return this.on('chat:message', (payload) => {
      if (payload.conversationId === conversationId) {
        callback(payload);
      }
    });
  }

  /**
   * Subscribe to livestream updates
   * @param {string} streamId - Stream ID
   * @param {Function} callback - Update callback
   * @returns {Function} Unsubscribe function
   */
  onLivestreamUpdate(streamId, callback) {
    return this.on('livestream:update', (payload) => {
      if (payload.streamId === streamId) {
        callback(payload);
      }
    });
  }

  /**
   * Send a livestream comment
   * @param {string} streamId - Stream ID
   * @param {string} comment - Comment content
   */
  sendLivestreamComment(streamId, comment) {
    this.send('livestream:comment', { streamId, comment });
  }

  /**
   * Subscribe to notifications
   * @param {Function} callback - Notification callback
   * @returns {Function} Unsubscribe function
   */
  onNotification(callback) {
    return this.on('notification', callback);
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

export default websocketService;
