import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Users, Sparkles, TrendingUp, UserPlus, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { dashboardService, mockDashboardData, artworkService } from '../services';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';

// Demo mode flag - set to false when backend is ready
const USE_DEMO_MODE = true;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('foryou');
  const [likedArtworks, setLikedArtworks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // Fetch feed data
  const fetchFeedData = async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Use mock data
      if (USE_DEMO_MODE) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        let data;
        if (activeTab === 'following') {
          data = mockDashboardData.following;
        } else if (activeTab === 'trending') {
          data = mockDashboardData.trending;
        } else {
          data = mockDashboardData.forYou;
        }

        setArtworks(data);
        setLoading(false);
        return;
      }

      // REAL API MODE: Call backend
      let response;
      if (activeTab === 'following') {
        response = await dashboardService.getFollowingFeed();
      } else if (activeTab === 'trending') {
        response = await dashboardService.getTrending();
      } else {
        response = await dashboardService.getFeed();
      }

      setArtworks(response.artworks || response);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError(err.message || 'Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load feed on mount and when tab changes
  useEffect(() => {
    fetchFeedData();
  }, [activeTab]);

  const toggleLike = async (id) => {
    const isLiked = likedArtworks.has(id);

    // Optimistic UI update
    setLikedArtworks(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });

    // Update artwork likes count optimistically
    setArtworks(prev => prev.map(artwork =>
      artwork.id === id
        ? { ...artwork, likes: artwork.likes + (isLiked ? -1 : 1) }
        : artwork
    ));

    try {
      // DEMO MODE: Just show toast
      if (USE_DEMO_MODE) {
        if (isLiked) {
          toast.info('Removed from favorites');
        } else {
          toast.success('Added to favorites! ❤️');
        }
        return;
      }

      // REAL API MODE: Call backend
      if (isLiked) {
        await artworkService.unlikeArtwork(id);
        toast.info('Removed from favorites');
      } else {
        await artworkService.likeArtwork(id);
        toast.success('Added to favorites! ❤️');
      }
    } catch (error) {
      // Revert on error
      setLikedArtworks(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });

      setArtworks(prev => prev.map(artwork =>
        artwork.id === id
          ? { ...artwork, likes: artwork.likes + (isLiked ? 1 : -1) }
          : artwork
      ));

      toast.error('Failed to update. Please try again.');
    }
  };

  const handleFollowArtist = (e, artist) => {
    e.stopPropagation();
    toast.success(`Now following ${artist}! 🎨`);
  };

  const handleShare = (e, artwork) => {
    e.stopPropagation();
    toast.success(`Sharing "${artwork.title}"...`);
  };

  const handleArtworkClick = (artwork) => {
    navigate(`/artwork/${artwork.id}`);
  };

  const handleCreatePost = (type) => {
    setCreateModalOpen(false);
    if (type === 'artwork') {
      navigate('/create-artwork');
    } else if (type === 'exhibition') {
      navigate('/host-exhibition');
    } else if (type === 'live') {
      navigate('/start-live');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <LoadingPaint message="Loading your feed..." />
        <div className="mt-8">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <APIError error={error} retry={fetchFeedData} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
        <div className="flex-1">
          <h1 className="text-xl md:text-3xl font-bold text-[#f2e9dd] mb-1 md:mb-2">Welcome back, {user?.username}! 👋</h1>
          <p className="text-sm md:text-base text-[#f2e9dd]/70">{activeTab === 'following' ? 'Latest from artists you follow' : activeTab === 'trending' ? 'What\'s trending on OnlyArts' : 'Personalized feed just for you'}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchFeedData}
            variant="ghost"
            size="sm"
            className="w-auto"
            title="Refresh feed"
          >
            <RefreshCw size={16} />
          </Button>
          {user?.role === 'artist' && (
            <Button onClick={() => setCreateModalOpen(true)} className="w-full sm:w-auto" size="sm">
              <Plus size={16} className="mr-2" />
              Make a Post
          </Button>
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="What would you like to create?">
        <div className="flex flex-col gap-4">
          <Button onClick={() => handleCreatePost('artwork')} variant="secondary">Post an Artwork</Button>
          <Button onClick={() => handleCreatePost('exhibition')} variant="secondary">Host an Exhibition</Button>
          <Button onClick={() => handleCreatePost('live')} variant="secondary">Start a Live</Button>
        </div>
      </Modal>

      {user?.subscription !== 'free' && (
        <Card className="mb-6 bg-gradient-to-r from-[#7C5FFF]/20 to-[#FF5F9E]/20 border-[#7C5FFF]/30 animate-fadeIn">
            {/* ... Premium Banner ... */}
        </Card>
      )}

      <div className="flex gap-4 md:gap-8 border-b border-white/10 mb-4 md:mb-6 overflow-x-auto scrollbar-hide">
        {/* ... Tabs ... */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {artworks.map((artwork, idx) => (
          <Card
            key={artwork.id}
            noPadding
            className="animate-fadeIn group transform hover:scale-105 md:hover:-translate-y-2 transition-all duration-300"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="border border-white/10 rounded-2xl overflow-hidden hover:border-[#7C5FFF]/50 hover:shadow-lg hover:shadow-[#7C5FFF]/20 transition-all duration-300">

              {/* Clickable Area for Navigation */}
              <div onClick={() => handleArtworkClick(artwork)} className="cursor-pointer">
                {activeTab === 'foryou' && artwork.reason && (
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-[#7C5FFF]/90 backdrop-blur-sm text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Sparkles size={12} /> Recommended</div>
                )}
                <div className="relative aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl md:text-8xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 md:pb-4 gap-2 md:gap-4">
                    <button className="px-3 md:px-4 py-1.5 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs md:text-sm font-medium hover:bg-white/30 transition-all transform translate-y-4 group-hover:translate-y-0" onClick={(e) => { e.stopPropagation(); handleArtworkClick(artwork); }}>View</button>
                    <button className="px-3 md:px-4 py-1.5 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs md:text-sm font-medium hover:bg-white/30 transition-all transform translate-y-4 group-hover:translate-y-0" style={{ transitionDelay: '50ms' }} onClick={(e) => handleShare(e, artwork)}>Share</button>
                  </div>
                  <span className="transform group-hover:scale-110 transition-transform duration-300">{artwork.image}</span>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-base md:text-lg text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">{artwork.title}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs md:text-sm text-[#f2e9dd]/50">{artwork.artistName}</p>
                    {!artwork.isFollowing && (
                        <button onClick={(e) => handleFollowArtist(e, artwork.artistName)} className="text-xs text-[#7C5FFF] hover:text-[#B15FFF] flex items-center gap-1 transition-colors"><UserPlus size={12} /> Follow</button>
                    )}
                  </div>
                  <p className="text-xs text-[#f2e9dd]/40 mt-1">{artwork.timeAgo}</p>
                </div>
              </div>

              {/* Non-Clickable Area for Actions */}
              <div className="p-3 md:p-4 pt-0">
                {artwork.reason && (
                  <div className="mb-2 text-xs text-[#B15FFF] bg-[#7C5FFF]/10 px-2 py-1 rounded">{artwork.reason}</div>
                )}
                <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-[#f2e9dd]/70">
                  <button onClick={() => toggleLike(artwork.id)} className={`flex items-center gap-1 transition-all duration-200 group/like ${likedArtworks.has(artwork.id) ? 'text-[#FF5F9E]' : 'hover:text-[#FF5F9E]'}`}>
                    <Heart size={16} className={`group-hover/like:scale-125 transition-transform ${likedArtworks.has(artwork.id) ? 'fill-current' : ''}`} />
                    {artwork.likes + (likedArtworks.has(artwork.id) ? 1 : 0)}
                  </button>
                  <button onClick={() => handleArtworkClick(artwork)} className="flex items-center gap-1 hover:text-[#7C5FFF] transition-colors group/comment">
                    <MessageCircle size={16} className="group-hover/comment:scale-110 transition-transform" />
                    {artwork.comments}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* ... Live Stream Card ... */}
    </div>
  );
};

export { Dashboard };