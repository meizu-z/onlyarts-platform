import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { Video, Gavel, ArrowLeft, Radio, DollarSign, VideoOff, Mic, MicOff, Send } from 'lucide-react';
import socketService from '../services/socket.service';
import webrtcService from '../services/webrtc.service';
import { livestreamService } from '../services/livestream.service';

const StartLivePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liveType, setLiveType] = useState('normal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [currentLivestreamId, setCurrentLivestreamId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const toast = useToast();
  const videoRef = useRef(null);
  const viewersRef = useRef(new Set());
  const chatEndRef = useRef(null);

  // Initialize WebRTC and socket
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isLive) {
        handleEndStream();
      }
    };
  }, [isLive]);

  // Ensure video plays when live view is shown
  useEffect(() => {
    if (isLive && videoRef.current && webrtcService.localStream) {
      videoRef.current.srcObject = webrtcService.localStream;
      videoRef.current.play().catch(err => {
        console.error('Error playing video in live view:', err);
      });
    }
  }, [isLive]);

  // Setup socket listeners
  useEffect(() => {
    if (!isLive || !currentLivestreamId) return;

    const token = localStorage.getItem('token');
    if (!socketService.getLivestreamSocket()) {
      socketService.connectLivestream(token);
    }

    // Initialize WebRTC service
    webrtcService.initialize(socketService.getLivestreamSocket());

    // Listen for new viewers (exclude host)
    socketService.onNewViewer(async ({ viewerId }) => {
      console.log('New viewer connected:', viewerId);
      // Don't count the host as a viewer
      if (viewerId !== user?.id) {
        viewersRef.current.add(viewerId);
        setViewerCount(viewersRef.current.size);
      }

      try {
        // Create WebRTC offer for new viewer
        await webrtcService.createOffer(viewerId, currentLivestreamId);
      } catch (error) {
        console.error('Error creating offer for viewer:', error);
      }
    });

    // Listen for WebRTC answers from viewers
    socketService.onWebRTCAnswer(async ({ viewerId, answer }) => {
      console.log('Received answer from viewer:', viewerId);
      try {
        await webrtcService.handleAnswer(viewerId, answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    // Listen for ICE candidates from viewers
    socketService.onICECandidate(async ({ viewerId, candidate }) => {
      console.log('Received ICE candidate from viewer:', viewerId);
      try {
        await webrtcService.addIceCandidate(viewerId, candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    // Listen for viewer disconnects
    socketService.onViewerDisconnected(({ viewerId }) => {
      console.log('Viewer disconnected:', viewerId);
      viewersRef.current.delete(viewerId);
      setViewerCount(viewersRef.current.size);
      webrtcService.closePeerConnection(viewerId);
    });

    // Listen for viewer count updates (exclude host)
    socketService.onViewerCountUpdate(({ viewerCount }) => {
      // Subtract 1 if host is counted
      setViewerCount(Math.max(0, viewerCount - 1));
    });

    // Listen for chat messages
    const handleChatMessage = ({ user: messageUser, message, timestamp }) => {
      setComments(prev => [...prev, {
        id: Date.now() + Math.random(),
        user: messageUser,
        comment: message,
        timestamp: timestamp || new Date().toISOString()
      }]);
    };

    socketService.getLivestreamSocket()?.on('chat_message', handleChatMessage);

    return () => {
      socketService.removeAllLivestreamListeners();
      socketService.getLivestreamSocket()?.off('chat_message', handleChatMessage);
    };
  }, [isLive, currentLivestreamId, user]);

  const handleStartLive = async () => {
    if (!title.trim()) {
      toast.error('Please enter a live stream title');
      return;
    }

    if (liveType === 'auction' && !startingBid) {
      toast.error('Please set a starting bid for the auction');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Get user media (camera and microphone)
      const stream = await webrtcService.startLocalStream({
        video: isCameraOn,
        audio: isMicOn
      });

      // Display local video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Explicitly play the video
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }

      // 2. Create livestream via API (status: scheduled)
      const streamData = {
        title: title.trim(),
        description: description.trim(),
        isAuction: liveType === 'auction',
        startingBid: liveType === 'auction' ? parseInt(startingBid) : null,
        scheduledFor: scheduledTime || null
      };

      const response = await livestreamService.startStream(streamData);
      const livestreamId = response.stream.id;
      setCurrentLivestreamId(livestreamId);

      // 3. Transition livestream to live status in database
      await livestreamService.goLive(livestreamId);

      // 4. Connect to socket and join stream room
      const token = localStorage.getItem('token');
      console.log('Token for socket:', token ? 'exists' : 'missing');

      // Disconnect existing socket first
      if (socketService.getLivestreamSocket()) {
        console.log('Disconnecting existing socket...');
        socketService.disconnectLivestream();
        // Wait a bit for disconnect to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Connect with fresh token
      console.log('Connecting socket with token...');
      socketService.connectLivestream(token);

      // Wait for socket connection with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Socket connection timeout'));
        }, 5000);

        const checkConnection = () => {
          if (socketService.getLivestreamSocket()?.connected) {
            clearTimeout(timeout);
            console.log('✅ Socket connected successfully');
            resolve();
          }
        };

        // Check immediately if already connected
        checkConnection();

        // Otherwise wait for connect event
        socketService.getLivestreamSocket()?.once('connect', () => {
          clearTimeout(timeout);
          console.log('✅ Socket connected via event');
          resolve();
        });
      });

      console.log('Socket connected, starting stream:', livestreamId);

      // 5. Start the stream via socket
      socketService.startStream(livestreamId);
      socketService.joinStream(livestreamId);

      setIsLive(true);
      toast.success(`Your ${liveType === 'normal' ? 'live stream' : 'auction'} is now live! 🎉`);
    } catch (error) {
      console.error('Error starting livestream:', error);
      toast.error(error.message || 'Failed to start livestream. Please check camera permissions.');
      webrtcService.stopLocalStream();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndStream = async () => {
    // Prevent double calls
    if (!isLive || !currentLivestreamId) {
      return;
    }

    // Immediately set isLive to false to prevent double calls
    setIsLive(false);

    try {
      // End stream via socket first
      socketService.endStream(currentLivestreamId);
      socketService.leaveStream(currentLivestreamId);

      // Then end via API (with better error handling)
      try {
        await livestreamService.endStream(currentLivestreamId);
      } catch (apiError) {
        // Silently handle error - stream might already be ended
        console.log('Stream already ended or error:', apiError.response?.data?.message || apiError.message);
      }

      // Cleanup WebRTC
      webrtcService.cleanup();

      // Stop video preview
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      viewersRef.current.clear();
      setViewerCount(0);
      setCurrentLivestreamId(null);
      setComments([]);

      toast.success('Livestream ended successfully');

      // Navigate back after short delay
      setTimeout(() => {
        navigate('/livestreams');
      }, 1500);
    } catch (error) {
      console.error('Error ending livestream:', error);
      toast.error('Failed to end livestream properly');
      // Reset state even on error
      setIsLive(false);
      setCurrentLivestreamId(null);
    }
  };

  const handleSendComment = () => {
    if (!newComment.trim() || !currentLivestreamId) return;

    const comment = {
      user: user?.username || 'Host',
      message: newComment.trim(),
      timestamp: new Date().toISOString()
    };

    // Send via socket
    socketService.getLivestreamSocket()?.emit('chat_message', {
      streamId: currentLivestreamId,
      ...comment
    });

    // Add to local state immediately
    setComments(prev => [...prev, {
      id: Date.now(),
      ...comment,
      comment: comment.message,
      isHost: true
    }]);

    setNewComment('');

    // Scroll to bottom
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const toggleCamera = () => {
    if (webrtcService.localStream) {
      const videoTrack = webrtcService.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (webrtcService.localStream) {
      const audioTrack = webrtcService.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  if (isLive) {
    return (
      <div className="flex-1 p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
              <span className="w-3 h-3 bg-white rounded-full"></span>
              LIVE
            </div>
            <div className="text-[#f2e9dd] font-semibold">
              {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
            </div>
          </div>
          <Button
            onClick={handleEndStream}
            variant="ghost"
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
          >
            End Stream
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              <h2 className="text-xl font-bold text-[#f2e9dd] mb-4">Your Stream</h2>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!isCameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <VideoOff size={64} className="text-gray-500" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                <Button
                  onClick={toggleCamera}
                  variant={isCameraOn ? 'secondary' : 'ghost'}
                  className={!isCameraOn ? 'bg-red-500/20 text-red-400 border-red-500/50' : ''}
                >
                  {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                  <span className="ml-2">{isCameraOn ? 'Camera On' : 'Camera Off'}</span>
                </Button>
                <Button
                  onClick={toggleMic}
                  variant={isMicOn ? 'secondary' : 'ghost'}
                  className={!isMicOn ? 'bg-red-500/20 text-red-400 border-red-500/50' : ''}
                >
                  {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                  <span className="ml-2">{isMicOn ? 'Mic On' : 'Mic Off'}</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Stream Info */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-bold text-[#f2e9dd] mb-3">Stream Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[#f2e9dd]/50 mb-1">Title</p>
                  <p className="text-[#f2e9dd] font-semibold">{title}</p>
                </div>
                {description && (
                  <div>
                    <p className="text-sm text-[#f2e9dd]/50 mb-1">Description</p>
                    <p className="text-[#f2e9dd] text-sm">{description}</p>
                  </div>
                )}
                {liveType === 'auction' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-sm text-yellow-400 mb-1 flex items-center gap-2">
                      <Gavel size={14} /> Starting Bid
                    </p>
                    <p className="text-yellow-400 font-bold text-xl">₱{parseInt(startingBid).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-bold text-[#f2e9dd] mb-3">Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#f2e9dd]/70">Current Viewers</span>
                  <span className="text-[#f2e9dd] font-bold">{viewerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#f2e9dd]/70">Stream Type</span>
                  <span className="text-[#f2e9dd] font-semibold capitalize">{liveType}</span>
                </div>
              </div>
            </Card>

            {/* Live Chat */}
            <Card className="p-4">
              <h3 className="text-lg font-bold text-[#f2e9dd] mb-3">Live Chat</h3>

              {/* Comments List */}
              <div className="h-64 overflow-y-auto mb-3 space-y-2 border border-[#f2e9dd]/10 rounded-lg p-2 bg-black/20">
                {comments.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-[#f2e9dd]/50 text-sm">No comments yet. Start the conversation!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-2 rounded-lg ${
                        comment.isHost ? 'bg-[#7C5FFF]/20 border border-[#7C5FFF]/30' : 'bg-[#f2e9dd]/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold ${
                          comment.isHost ? 'text-[#7C5FFF]' : 'text-[#f2e9dd]'
                        }`}>
                          {comment.user}
                        </span>
                        {comment.isHost && (
                          <span className="text-[10px] bg-[#7C5FFF] text-white px-1.5 py-0.5 rounded">
                            HOST
                          </span>
                        )}
                        <span className="text-[10px] text-[#f2e9dd]/40 ml-auto">
                          {new Date(comment.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-[#f2e9dd]/90">{comment.comment}</p>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Comment Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                  placeholder="Send a message..."
                  className="flex-1 bg-[#1a1625] border border-[#f2e9dd]/20 rounded-lg px-3 py-2 text-sm text-[#f2e9dd] placeholder:text-[#f2e9dd]/40 focus:outline-none focus:border-[#7C5FFF] transition-colors"
                />
                <Button
                  onClick={handleSendComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="bg-[#7C5FFF] hover:bg-[#7C5FFF]/80 disabled:opacity-50"
                >
                  <Send size={16} />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-6 transform hover:scale-105 transition-all duration-200"
      >
        <ArrowLeft size={16} className="mr-2" /> Back
      </Button>

      <h1 className="text-4xl font-bold text-[#f2e9dd] mb-2">Start a Live Stream</h1>
      <p className="text-[#f2e9dd]/70 mb-8">Connect with your audience in real-time</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Preview Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
            <Video size={20} /> Live Preview
          </h2>
          <div className="aspect-video bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 rounded-lg flex items-center justify-center text-9xl mb-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">📺</span>

            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              LIVE
            </div>

            {liveType === 'auction' && (
              <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Gavel size={14} /> Auction
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-[#f2e9dd]/50 mb-1">Stream Title</p>
              <p className="text-[#f2e9dd] font-semibold">{title || 'Untitled Live Stream'}</p>
            </div>

            {liveType === 'auction' && startingBid && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-400 mb-1 flex items-center gap-2">
                  <DollarSign size={14} /> Starting Bid
                </p>
                <p className="text-yellow-400 font-bold text-xl">₱{parseInt(startingBid).toLocaleString()}</p>
              </div>
            )}

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400 font-semibold flex items-center gap-2">
                <Radio size={14} /> Your camera will be activated when you start
              </p>
            </div>
          </div>
        </Card>

        {/* Form Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#f2e9dd] mb-4">Stream Details</h2>

          <div className="space-y-4">
            <Input
              label="Stream Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter stream title"
            />

            <div>
              <label className="block text-sm text-[#f2e9dd]/70 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 h-32 transition-all duration-200"
                placeholder="Tell viewers what your stream is about..."
              />
            </div>

            <div>
              <label className="block text-sm text-[#f2e9dd]/70 mb-3">Stream Type *</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-lg border border-white/10 hover:border-[#7C5FFF]/50 transition-all cursor-pointer group">
                  <input
                    type="radio"
                    name="liveType"
                    value="normal"
                    checked={liveType === 'normal'}
                    onChange={() => setLiveType('normal')}
                    className="w-5 h-5 accent-[#7C5FFF]"
                  />
                  <div>
                    <p className="text-[#f2e9dd] font-semibold group-hover:text-[#B15FFF] transition-colors flex items-center gap-2">
                      <Video size={16} /> Normal Live Stream
                    </p>
                    <p className="text-sm text-[#f2e9dd]/50">Stream your creative process, tutorials, or casual chats</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-lg border border-white/10 hover:border-[#7C5FFF]/50 transition-all cursor-pointer group">
                  <input
                    type="radio"
                    name="liveType"
                    value="auction"
                    checked={liveType === 'auction'}
                    onChange={() => setLiveType('auction')}
                    className="w-5 h-5 accent-[#7C5FFF]"
                  />
                  <div>
                    <p className="text-[#f2e9dd] font-semibold group-hover:text-[#B15FFF] transition-colors flex items-center gap-2">
                      <Gavel size={16} /> Live Auction
                    </p>
                    <p className="text-sm text-[#f2e9dd]/50">Host a live auction for your artworks</p>
                  </div>
                </label>
              </div>
            </div>

            {liveType === 'auction' && (
              <div className="animate-fadeIn">
                <Input
                  type="number"
                  label="Starting Bid (PHP) *"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                  placeholder="Enter starting bid price"
                />
              </div>
            )}

            <Input
              type="datetime-local"
              label="Schedule (Optional)"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
            <p className="text-xs text-[#f2e9dd]/50 -mt-2">Leave empty to start immediately</p>

            <div className="pt-4 space-y-3">
              <Button
                onClick={handleStartLive}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-300"
              >
                <Radio size={16} className="mr-2" />
                {isLoading ? 'Starting...' : 'Go Live Now'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                disabled={isLoading}
                className="w-full transform hover:scale-105 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StartLivePage;
