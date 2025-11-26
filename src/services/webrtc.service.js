/**
 * WebRTC Service
 * Handles peer-to-peer video streaming connections
 */

// Free STUN servers for NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

class WebRTCService {
  constructor() {
    this.peerConnections = new Map();
    this.localStream = null;
    this.socket = null;
  }

  /**
   * Initialize WebRTC service with socket connection
   */
  initialize(socket) {
    this.socket = socket;
  }

  /**
   * Start capturing local media (camera/microphone)
   * @param {Object} constraints - Media constraints
   * @returns {Promise<MediaStream>}
   */
  async startLocalStream(constraints = { video: true, audio: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera/microphone. Please check permissions.');
    }
  }

  /**
   * Stop local media stream
   */
  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  /**
   * Create a peer connection for a viewer
   * @param {string} viewerId - Unique viewer ID
   * @param {string} livestreamId - Livestream ID
   */
  async createPeerConnection(viewerId, livestreamId) {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('webrtc_ice_candidate', {
          livestreamId,
          viewerId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Peer connection state for ${viewerId}:`, peerConnection.connectionState);

      if (peerConnection.connectionState === 'disconnected' ||
          peerConnection.connectionState === 'failed' ||
          peerConnection.connectionState === 'closed') {
        this.closePeerConnection(viewerId);
      }
    };

    this.peerConnections.set(viewerId, peerConnection);
    return peerConnection;
  }

  /**
   * Create an offer for a viewer (broadcaster side)
   * @param {string} viewerId - Viewer ID
   * @param {string} livestreamId - Livestream ID
   */
  async createOffer(viewerId, livestreamId) {
    try {
      const peerConnection = await this.createPeerConnection(viewerId, livestreamId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (this.socket) {
        this.socket.emit('webrtc_offer', {
          livestreamId,
          viewerId,
          offer: peerConnection.localDescription
        });
      }

      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  /**
   * Handle incoming answer from viewer (broadcaster side)
   * @param {string} viewerId - Viewer ID
   * @param {RTCSessionDescriptionInit} answer - Answer from viewer
   */
  async handleAnswer(viewerId, answer) {
    try {
      const peerConnection = this.peerConnections.get(viewerId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  /**
   * Create a peer connection to receive stream (viewer side)
   * @param {string} livestreamId - Livestream ID
   * @param {Function} onTrack - Callback when remote track is received
   */
  async createViewerConnection(livestreamId, onTrack) {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Handle incoming tracks (video/audio)
    peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      if (onTrack && event.streams[0]) {
        onTrack(event.streams[0]);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('webrtc_ice_candidate', {
          livestreamId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
    };

    this.peerConnections.set('broadcaster', peerConnection);
    return peerConnection;
  }

  /**
   * Handle incoming offer from broadcaster (viewer side)
   * @param {string} livestreamId - Livestream ID
   * @param {RTCSessionDescriptionInit} offer - Offer from broadcaster
   * @param {Function} onTrack - Callback for remote stream
   */
  async handleOffer(livestreamId, offer, onTrack) {
    try {
      let peerConnection = this.peerConnections.get('broadcaster');

      if (!peerConnection) {
        peerConnection = await this.createViewerConnection(livestreamId, onTrack);
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (this.socket) {
        this.socket.emit('webrtc_answer', {
          livestreamId,
          answer: peerConnection.localDescription
        });
      }

      return answer;
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  /**
   * Add ICE candidate to peer connection
   * @param {string} peerId - Peer ID (viewerId or 'broadcaster')
   * @param {RTCIceCandidateInit} candidate - ICE candidate
   */
  async addIceCandidate(peerId, candidate) {
    try {
      const peerConnection = this.peerConnections.get(peerId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  /**
   * Close a specific peer connection
   * @param {string} peerId - Peer ID
   */
  closePeerConnection(peerId) {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(peerId);
    }
  }

  /**
   * Close all peer connections and stop local stream
   */
  cleanup() {
    this.peerConnections.forEach((pc, peerId) => {
      pc.close();
    });
    this.peerConnections.clear();
    this.stopLocalStream();
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
export default webrtcService;
