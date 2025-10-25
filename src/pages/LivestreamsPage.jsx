import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wifi, Users, Clock, ArrowLeft } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { livestreamService, mockLiveStreams, mockUpcomingStreams, mockComments } from '../services/livestream.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

// Demo mode flag - set to false when backend is ready
const USE_DEMO_MODE = true;

const LivestreamsPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('live');
  const [selectedStream, setSelectedStream] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState('');

  // API state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streams, setStreams] = useState([]);
  const [upcomingStreams, setUpcomingStreams] = useState([]);
  const [comments, setComments] = useState([]);

  // Fetch streams based on active tab
  useEffect(() => {
    fetchStreams();
  }, [activeTab]);

  // Fetch comments when a stream is selected
  useEffect(() => {
    if (selectedStream) {
      fetchComments(selectedStream.id);
    }
  }, [selectedStream]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Use mock data
      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (activeTab === 'live') {
          setStreams(mockLiveStreams);
        } else {
          setUpcomingStreams(mockUpcomingStreams);
        }

        setLoading(false);
        return;
      }

      // REAL API MODE: Call backend
      if (activeTab === 'live') {
        const response = await livestreamService.getLiveStreams();
        setStreams(response.streams || []);
      } else {
        const response = await livestreamService.getUpcomingStreams();
        setUpcomingStreams(response.streams || []);
      }
    } catch (err) {
      console.error('Error fetching streams:', err);
      setError(err.message || 'Failed to load streams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (streamId) => {
    try {
      // DEMO MODE: Use mock data
      if (USE_DEMO_MODE) {
        setComments(mockComments);
        return;
      }

      // REAL API MODE: Call backend
      const response = await livestreamService.getComments(streamId);
      setComments(response.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      toast.error('Failed to load comments');
    }
  };

  const displayStreams = activeTab === 'live' ? streams : upcomingStreams;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const tempComment = {
      id: Date.now(),
      user: 'You',
      comment: newComment,
      profilePicture: 'https://randomuser.me/api/portraits/lego/1.jpg',
      timestamp: new Date().toISOString(),
    };

    // Optimistic update
    setComments([...comments, tempComment]);
    setNewComment('');

    try {
      // DEMO MODE: Just show in UI
      if (USE_DEMO_MODE) {
        return;
      }

      // REAL API MODE: Call backend
      await livestreamService.postComment(selectedStream.id, { comment: newComment });
    } catch (error) {
      // Revert on error
      setComments(comments.filter(c => c.id !== tempComment.id));
      toast.error('Failed to post comment');
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!bidAmount.trim() || isNaN(bidAmount)) return;

    const tempBid = {
      id: Date.now(),
      user: 'You',
      comment: `bids $${bidAmount}`,
      isBid: true,
      profilePicture: 'https://randomuser.me/api/portraits/lego/1.jpg',
      timestamp: new Date().toISOString(),
    };

    // Optimistic update
    setComments([...comments, tempBid]);
    const amount = bidAmount;
    setBidAmount('');
    setIsBidding(false);

    try {
      // DEMO MODE: Just show in UI
      if (USE_DEMO_MODE) {
        toast.success(`Bid placed: $${amount}`);
        return;
      }

      // REAL API MODE: Call backend
      await livestreamService.placeBid(selectedStream.id, { amount: parseFloat(amount) });
      toast.success(`Bid placed: $${amount}`);
    } catch (error) {
      // Revert on error
      setComments(comments.filter(c => c.id !== tempBid.id));
      setBidAmount(amount);
      setIsBidding(true);
      toast.error('Failed to place bid');
    }
  };

  if (selectedStream) {
    return (
      <div className="flex-1 animate-fadeIn">
        <Button onClick={() => setSelectedStream(null)} className="mb-4 md:mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Livestreams
        </Button>
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          <div className="lg:w-2/3">
            <div className="aspect-video bg-black rounded-2xl flex items-center justify-center text-6xl md:text-8xl text-white mb-3 md:mb-4">
              {selectedStream.thumbnail}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-3 md:mb-4">
              <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd]">
                {selectedStream.title}
              </h1>
              {selectedStream.auction && (
                <Button
                  onClick={() => setIsBidding(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg hover:scale-105"
                >
                  Place Bid
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <img
                src={selectedStream.profilePicture}
                alt={selectedStream.artist}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full"
              />
              <div>
                <p className="font-semibold text-base md:text-lg text-[#f2e9dd]">
                  {selectedStream.artist}
                </p>
                <p className="text-xs md:text-sm text-[#f2e9dd]/60">
                  {selectedStream.followers} Followers
                </p>
              </div>
            </div>
            <p className="text-sm md:text-base text-[#f2e9dd]/70 mt-3 md:mt-4">
              {selectedStream.description}
            </p>
          </div>

          <div className="lg:w-1/3">
            <Card className="h-full flex flex-col p-3 md:p-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd] mb-3 md:mb-4 border-b border-white/10 pb-2 md:pb-3">
                Live Chat & Bids
              </h2>
              <div className="flex-1 space-y-3 md:space-y-4 overflow-y-auto pr-2">
                {comments.map((comment, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 md:gap-3 p-2 rounded-lg ${comment.isBid ? 'bg-yellow-500/10' : ''
                      }`}
                  >
                    <img
                      src={comment.profilePicture}
                      alt={comment.user}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-xs md:text-sm text-[#f2e9dd]">
                        {comment.user}
                        {comment.isBid && (
                          <span className="ml-2 text-xs font-bold text-yellow-400 bg-yellow-900/50 px-2 py-0.5 rounded-md">
                            BIDDER
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-xs md:text-sm ${
                          comment.isBid
                            ? 'text-yellow-300 font-bold'
                            : 'text-[#f2e9dd]/80'
                          }`}
                      >
                        {comment.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleCommentSubmit} className="mt-3 md:mt-4 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Say something..."
                  className="w-full px-3 py-2 text-sm md:text-base bg-[#1e1e1e] border border-white/20 rounded-md text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF]"
                />
                <Button type="submit" size="sm">
                  Send
                </Button>
              </form>
            </Card>
          </div>
        </div>
        {selectedStream.auction && isBidding && (
          <Modal
            isOpen={isBidding}
            onClose={() => setIsBidding(false)}
            title="Place Your Bid"
          >
            <form onSubmit={handleBidSubmit}>
              <input
                type="number"
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
                className="w-full px-4 py-2 bg-[#1e1e1e] border border-white/20 rounded-md text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF]"
              />
              <Button type="submit" className="mt-4 w-full">
                Submit Bid
              </Button>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1">
        <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-6 md:mb-8">Livestreams</h1>
        <LoadingPaint message="Loading streams..." />
        <div className="mt-8">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1">
        <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-6 md:mb-8">Livestreams</h1>
        <APIError error={error} retry={fetchStreams} />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-6 md:mb-8">Livestreams</h1>

      <div className="flex gap-4 md:gap-8 border-b border-white/10 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
        <button
          className={`px-6 py-3 text-base md:text-lg font-medium whitespace-nowrap transition-colors duration-300 ${
            activeTab === 'live'
              ? 'text-[#f2e9dd] border-b-2 border-[#7C5FFF]'
              : 'text-[#f2e9dd]/60 hover:text-[#f2e9dd]'
            }`}
          onClick={() => setActiveTab('live')}
        >
          Live
        </button>
        <button
          className={`px-6 py-3 text-base md:text-lg font-medium whitespace-nowrap transition-colors duration-300 ${
            activeTab === 'scheduled'
              ? 'text-[#f2e9dd] border-b-2 border-[#7C5FFF]'
              : 'text-[#f2e9dd]/60 hover:text-[#f2e9dd]'
            }`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {displayStreams.map((stream, idx) => (
          <Card
            key={idx}
            hover
            noPadding
            className="group cursor-pointer transform hover:scale-105 md:hover:-translate-y-2 transition-all duration-300"
            onClick={() => setSelectedStream(stream)}
          >
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-teal-600/20 flex items-center justify-center text-5xl md:text-6xl">
                {stream.thumbnail}
              </div>
              <div className="absolute top-2 left-2 flex gap-2">
                {stream.live ? (
                  <>
                    <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-xs font-bold flex items-center gap-1">
                      <Wifi size={12} />
                      LIVE
                    </span>
                    <span className="px-2 py-0.5 bg-black/50 text-white rounded-md text-xs font-bold flex items-center gap-1">
                      <Users size={12} />
                      {stream.viewers}
                    </span>
                  </>
                ) : (
                  <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-xs font-bold flex items-center gap-1">
                    <Clock size={12} />
                    {stream.scheduled}
                  </span>
                )}
              </div>
              {stream.auction && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#7C5FFF] text-white rounded-md text-xs font-bold">
                  AUCTION
                </span>
              )}
            </div>
            <div className="p-3 md:p-4">
              <h3 className="font-bold text-base md:text-lg text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                {stream.title}
              </h3>
              <div className="flex items-center gap-3">
                <img
                  src={stream.profilePicture}
                  alt={stream.artist}
                  className="w-8 h-8 rounded-full"
                />
                <p className="text-xs md:text-sm text-[#f2e9dd]/80">{stream.artist}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { LivestreamsPage };