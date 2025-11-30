import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Clock, Gavel, TrendingUp, Zap, Crown, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { API_CONFIG } from '../../config/api.config';
import axios from 'axios';

const AuctionBiddingPanel = ({ auctionId, artwork }) => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Auction state
  const [auctionState, setAuctionState] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [lastCallTimeRemaining, setLastCallTimeRemaining] = useState(0);

  // Premium user check
  const isPremiumUser = user?.subscription_tier === 'premium' || user?.subscription_tier === 'Premium';

  // Connect to WebSocket
  useEffect(() => {
    if (!auctionId) return;

    // Initialize socket connection
    const socket = io(`${API_CONFIG.baseURL.replace('/api', '')}/auction`, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to auction server');
      setIsConnected(true);
      socket.emit('join-auction', auctionId);
      socket.emit('request-auction-state', auctionId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from auction server');
      setIsConnected(false);
    });

    socket.on('auction-state', (state) => {
      setAuctionState(state);
      setTimeRemaining(state.timeRemaining);
      setLastCallTimeRemaining(state.lastCallTimeRemaining || 0);

      // Set initial bid suggestion
      if (!bidAmount) {
        setBidAmount(Math.ceil(state.currentPrice * 1.05).toString());
      }
    });

    socket.on('auction-update', (update) => {
      console.log('📢 Auction update:', update);

      if (update.type === 'NEW_BID') {
        setAuctionState(prev => ({
          ...prev,
          currentPrice: update.currentPrice,
          highestBidder: update.highestBidder,
          endTime: update.endTime,
          isLastCallActive: update.isLastCallActive
        }));

        toast.success(`New bid: ₱${update.currentPrice.toLocaleString()}`);
      }

      if (update.type === 'TIME_EXTENDED') {
        setAuctionState(prev => ({
          ...prev,
          endTime: update.newEndTime
        }));

        toast.info(update.message);
      }

      if (update.type === 'LAST_CALL_STARTED') {
        setAuctionState(prev => ({
          ...prev,
          isLastCallActive: true
        }));

        setLastCallTimeRemaining(10000);

        if (isPremiumUser) {
          toast.info('🔔 LAST CALL! Premium access: 10 seconds to bid!');
        } else {
          toast.warning('⏰ Auction ended! Only Premium users can bid during Last Call.');
        }
      }

      if (update.type === 'AUCTION_CLOSED') {
        setAuctionState(prev => ({
          ...prev,
          isClosed: true
        }));

        const isWinner = update.winner?.userId === user?.id;

        if (isWinner) {
          toast.success(`🎉 Congratulations! You won with ₱${update.finalPrice.toLocaleString()}!`);
        } else {
          toast.info(`Auction closed. Winner: ${update.winner?.username || 'No winner'}`);
        }
      }
    });

    socket.on('auction-error', (error) => {
      toast.error(error.message);
    });

    return () => {
      if (socket) {
        socket.emit('leave-auction', auctionId);
        socket.disconnect();
      }
    };
  }, [auctionId]);

  // Timer countdown
  useEffect(() => {
    if (!auctionState) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1000));

      if (auctionState.isLastCallActive) {
        setLastCallTimeRemaining(prev => Math.max(0, prev - 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auctionState]);

  // Format time
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle bid placement
  const handlePlaceBid = async () => {
    if (!user) {
      toast.error('Please login to place a bid');
      navigate('/login');
      return;
    }

    if (auctionState?.isClosed) {
      toast.error('Auction has ended');
      return;
    }

    if (auctionState?.isLastCallActive && !isPremiumUser) {
      toast.error('Only Premium users can bid during Last Call');
      return;
    }

    const bid = parseFloat(bidAmount);

    if (isNaN(bid) || bid <= auctionState.currentPrice) {
      toast.error(`Bid must be higher than ₱${auctionState.currentPrice.toLocaleString()}`);
      return;
    }

    setIsPlacingBid(true);

    try {
      const response = await axios.post(
        `${API_CONFIG.baseURL}/auctions/${auctionId}/bid`,
        { bidAmount: bid },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          withCredentials: true
        }
      );

      toast.success('Bid placed successfully!');
      setBidAmount(Math.ceil(bid * 1.05).toString());
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to place bid';
      toast.error(message);
    } finally {
      setIsPlacingBid(false);
    }
  };

  // Load bid history
  useEffect(() => {
    if (!auctionId) return;

    const fetchBidHistory = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.baseURL}/auctions/${auctionId}/bids`);
        setBidHistory(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch bid history:', error);
      }
    };

    fetchBidHistory();
  }, [auctionId, auctionState?.currentPrice]);

  // Loading state
  if (!auctionState) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-8 bg-white/10 rounded mb-4"></div>
        <div className="h-24 bg-white/10 rounded mb-4"></div>
        <div className="h-12 bg-white/10 rounded"></div>
      </Card>
    );
  }

  // Check if auction is in Last Call
  const isLastCall = auctionState.isLastCallActive && lastCallTimeRemaining > 0;
  const isAuctionEnded = auctionState.isClosed || (timeRemaining === 0 && lastCallTimeRemaining === 0);

  // Determine if user can bid
  const canBid = !isAuctionEnded && (!isLastCall || isPremiumUser);

  return (
    <div className="space-y-4">
      {/* Main Bidding Card */}
      <Card
        className={`p-4 md:p-6 transition-all duration-300 ${
          isLastCall
            ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-2 border-red-500/50 animate-pulse'
            : 'bg-gradient-to-br from-[#7C5FFF]/10 to-[#FF5F9E]/10 border border-[#7C5FFF]/30'
        }`}
      >
        {/* Connection Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs text-[#f2e9dd]/70 light:text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {isPremiumUser && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-1 rounded-full">
              <Crown size={12} className="text-white" />
              <span className="text-xs font-bold text-white">Premium</span>
            </div>
          )}
        </div>

        {/* Timer Display */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-[#f2e9dd]/70 light:text-gray-600 mb-1">Time Remaining</p>
            <div className="flex items-center gap-2">
              <Clock size={24} className={isLastCall ? 'text-red-500 animate-pulse' : 'text-[#7C5FFF] light:text-[#7952cc]'} />
              <span className={`text-2xl font-bold ${isLastCall ? 'text-red-500' : 'text-[#f2e9dd] light:text-gray-900'}`}>
                {isLastCall ? formatTime(lastCallTimeRemaining) : formatTime(timeRemaining)}
              </span>
            </div>
            {isLastCall && (
              <p className="text-xs font-bold text-red-500 mt-1 animate-pulse">
                ⚡ LAST CALL - PREMIUM ONLY
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-sm text-[#f2e9dd]/70 light:text-gray-600 mb-1">Total Bids</p>
            <p className="text-2xl font-bold text-[#f2e9dd] light:text-gray-900">{auctionState.bidCount || 0}</p>
          </div>
        </div>

        {/* Current Price */}
        <div className="mb-6 p-4 bg-black/20 light:bg-white/50 rounded-lg">
          <p className="text-sm text-[#f2e9dd]/70 light:text-gray-600 mb-2">Current Bid</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              <span className="text-3xl font-bold text-[#7C5FFF] light:text-[#7952cc]">
                ₱{auctionState.currentPrice.toLocaleString()}
              </span>
            </div>
            {auctionState.highestBidder && (
              <div className="text-right">
                <p className="text-xs text-[#f2e9dd]/70 light:text-gray-600">Highest Bidder</p>
                <p className="text-sm font-semibold text-[#f2e9dd] light:text-gray-900">
                  {auctionState.highestBidder.username}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bid Input and Button */}
        {!isAuctionEnded && (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#f2e9dd]/70 light:text-gray-600 mb-2 block">
                Your Bid Amount (₱)
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={!canBid}
                placeholder={`Minimum: ₱${Math.ceil(auctionState.currentPrice * 1.05).toLocaleString()}`}
                className="w-full px-4 py-3 bg-black/30 light:bg-white border border-[#7C5FFF]/30 light:border-gray-300 rounded-lg text-[#f2e9dd] light:text-gray-900 placeholder:text-[#f2e9dd]/50 light:placeholder:text-gray-400 focus:outline-none focus:border-[#7C5FFF] disabled:opacity-50"
              />
            </div>

            <Button
              onClick={handlePlaceBid}
              disabled={!canBid || isPlacingBid}
              fullWidth
              className={`flex items-center justify-center gap-2 ${
                isLastCall && isPremiumUser
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 animate-pulse'
                  : ''
              }`}
            >
              {isPlacingBid ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Placing Bid...</span>
                </>
              ) : isLastCall && isPremiumUser ? (
                <>
                  <Zap size={18} />
                  <span className="font-bold">LAST CALL: {Math.ceil(lastCallTimeRemaining / 1000)}s!</span>
                </>
              ) : canBid ? (
                <>
                  <Gavel size={18} />
                  <span>Place Bid</span>
                </>
              ) : (
                <>
                  <AlertCircle size={18} />
                  <span>Auction Closed</span>
                </>
              )}
            </Button>

            {!isPremiumUser && isLastCall && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <Crown size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-300">Premium Last-Call Advantage</p>
                  <p className="text-xs text-[#f2e9dd]/70 light:text-gray-600 mt-1">
                    Upgrade to Premium to bid during the final 10 seconds of any auction!
                  </p>
                  <Button
                    size="sm"
                    onClick={() => navigate('/subscriptions')}
                    className="mt-2 bg-gradient-to-r from-yellow-500 to-orange-500"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {isAuctionEnded && (
          <div className="text-center p-4 bg-black/20 light:bg-white/50 rounded-lg">
            <p className="text-lg font-bold text-[#f2e9dd] light:text-gray-900 mb-2">Auction Ended</p>
            {auctionState.highestBidder ? (
              <p className="text-sm text-[#f2e9dd]/70 light:text-gray-600">
                Winner: <span className="font-semibold text-[#7C5FFF] light:text-[#7952cc]">{auctionState.highestBidder.username}</span>
                <br />
                Final Price: <span className="font-bold text-green-500">₱{auctionState.currentPrice.toLocaleString()}</span>
              </p>
            ) : (
              <p className="text-sm text-[#f2e9dd]/70 light:text-gray-600">No bids were placed</p>
            )}
          </div>
        )}
      </Card>

      {/* Bid History */}
      <Card className="p-4">
        <h3 className="text-lg font-bold text-[#f2e9dd] light:text-gray-900 mb-4">Recent Bids</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {bidHistory.length > 0 ? (
            bidHistory.map((bid, index) => (
              <div
                key={bid.id}
                className="flex items-center justify-between p-3 bg-white/5 light:bg-gray-50 rounded-lg hover:bg-white/10 light:hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#7C5FFF]/50 light:text-gray-400">#{bidHistory.length - index}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#f2e9dd] light:text-gray-900">{bid.username}</p>
                    <p className="text-xs text-[#f2e9dd]/70 light:text-gray-600">
                      {new Date(bid.placed_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-500">₱{parseFloat(bid.bid_amount).toLocaleString()}</p>
                  {bid.during_last_call && (
                    <p className="text-xs text-yellow-500 flex items-center gap-1">
                      <Crown size={10} />
                      Premium
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-center text-[#f2e9dd]/70 light:text-gray-600 py-4">
              No bids yet. Be the first to bid!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AuctionBiddingPanel;
