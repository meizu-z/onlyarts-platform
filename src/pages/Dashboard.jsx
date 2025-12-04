import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Users, Sparkles, TrendingUp, UserPlus, Plus, RefreshCw, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { dashboardService, mockDashboardData, artworkService } from '../services';
import { usePagination } from '../hooks/usePagination';
import { API_CONFIG } from '../config/api.config';
import Pagination from '../components/common/Pagination';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';

// Demo mode flag - set to false when backend is ready
const USE_DEMO_MODE = false;

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('/')) {
    const serverBaseUrl = API_CONFIG.baseURL.replace('/api', '');
    return `${serverBaseUrl}${imagePath}`;
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('foryou');
  const [likedArtworks, setLikedArtworks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // Pagination hook
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 12,
    totalItems: totalItems,
  });

  // Fetch feed data
  const fetchFeedData = async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Use mock data with pagination
      if (USE_DEMO_MODE) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        let allData;
        if (activeTab === 'following') {
          allData = mockDashboardData.following;
        } else if (activeTab === 'trending') {
          allData = mockDashboardData.trending;
        } else {
          allData = mockDashboardData.forYou;
        }

        // Simulate pagination - duplicate data to have more items
        const extendedData = [...allData, ...allData, ...allData, ...allData];
        setTotalItems(extendedData.length);

        // Get current page data
        const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const pageData = extendedData.slice(startIndex, endIndex);

        setArtworks(pageData);
        setLoading(false);
        return;
      }

      // REAL API MODE: Call backend with pagination params
      const params = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
      };

      // Add tab-specific filters
      if (activeTab === 'following') {
        // Only show artworks from users the current user is following
        params.following = true;
      } else if (activeTab === 'trending') {
        // Sort by likes/popularity for trending tab
        params.sortBy = 'like_count';
        params.order = 'DESC';
      }

      const response = await artworkService.getArtworks(params);

      // Transform backend data to match frontend format
      const transformedArtworks = (response.artworks || []).map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artist: `@${artwork.artist_username}`,
        artistName: artwork.artist_name,
        likes: artwork.like_count || 0,
        comments: artwork.comment_count || 0,
        image: artwork.primary_image || '🎨',
        isFollowing: false,
        timeAgo: formatTimeAgo(artwork.created_at),
        price: artwork.price,
        category: artwork.category,
        isLiked: artwork.is_liked > 0,
        exhibitions: artwork.exhibitions || []
      }));

      setArtworks(transformedArtworks);

      // Initialize likedArtworks Set with artworks that are already liked
      const likedIds = new Set(
        transformedArtworks.filter(a => a.isLiked).map(a => a.id)
      );
      setLikedArtworks(likedIds);

      setTotalItems(response.data?.pagination?.total || response.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError(err.message || 'Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load feed on mount and when tab or page changes
  useEffect(() => {
    fetchFeedData();
  }, [activeTab, pagination.currentPage]);

  // Refresh data when page becomes visible again (e.g., navigating back from artwork page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchFeedData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeTab, pagination.currentPage]);

  // Reset to page 1 when changing tabs
  useEffect(() => {
    pagination.firstPage();
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

      // REAL API MODE: Call backend (POST endpoint now supports toggle)
      const response = await artworkService.likeArtwork(id);

      if (response.liked) {
        toast.success('Added to favorites! ❤️');
      } else {
        toast.info('Removed from favorites');
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
          <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-[#f2e9dd] mb-2 flex items-center gap-2">
                <Sparkles size={24} className="text-[#B15FFF]" />
                {user?.subscription === 'premium' ? 'Premium Member' : 'Basic Member'}
              </h3>
              <p className="text-sm md:text-base text-[#f2e9dd]/70">
                Enjoy exclusive features and content
              </p>
            </div>
            <Button variant="secondary" size="sm" className="w-full md:w-auto">
              Manage Subscription
            </Button>
          </div>
        </Card>
      )}

      <div className="flex gap-4 md:gap-8 border-b border-white/10 mb-4 md:mb-6 overflow-x-auto scrollbar-hide">
        {[
          { key: 'foryou', label: 'For You', icon: Sparkles },
          { key: 'following', label: 'Following', icon: Users },
          { key: 'trending', label: 'Trending', icon: TrendingUp }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative pb-3 md:pb-4 text-sm md:text-lg whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.key
                ? 'text-[#f2e9dd]'
                : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-6 md:mb-8">
        {artworks.map((artwork, idx) => (
          <Card
            key={artwork.id}
            noPadding
            className="animate-fadeIn group transform hover:scale-105 md:hover:-translate-y-2 transition-all duration-300 border border-white/10 hover:border-[#7C5FFF]/50 hover:shadow-lg hover:shadow-[#7C5FFF]/20 overflow-hidden"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
              {/* Clickable Area for Navigation */}
              <div onClick={() => handleArtworkClick(artwork)} className="cursor-pointer">
                {activeTab === 'foryou' && artwork.reason && (
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-[#7C5FFF]/90 backdrop-blur-sm text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Sparkles size={12} /> Recommended</div>
                )}
                <div className="relative aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl md:text-8xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 md:pb-4 gap-2 md:gap-4 z-10">
                    <button className="px-3 md:px-4 py-1.5 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs md:text-sm font-medium hover:bg-white/30 transition-all transform translate-y-4 group-hover:translate-y-0" onClick={(e) => { e.stopPropagation(); handleArtworkClick(artwork); }}>View</button>
                    <button className="px-3 md:px-4 py-1.5 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs md:text-sm font-medium hover:bg-white/30 transition-all transform translate-y-4 group-hover:translate-y-0" style={{ transitionDelay: '50ms' }} onClick={(e) => handleShare(e, artwork)}>Share</button>
                  </div>
                  {getImageUrl(artwork.image) ? (
                    <img
                      src={getImageUrl(artwork.image)}
                      alt={artwork.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <span className="transform group-hover:scale-110 transition-transform duration-300">{artwork.image}</span>
                  )}
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

                  {/* Exhibition Badges */}
                  {artwork.exhibitions && artwork.exhibitions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {artwork.exhibitions.slice(0, 2).map((exhibition) => (
                        <button
                          key={exhibition.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/exhibition/${exhibition.id}`);
                          }}
                          className="group/badge px-2 py-0.5 bg-gradient-to-r from-[#7C5FFF]/20 to-[#FF5F9E]/20 hover:from-[#7C5FFF]/30 hover:to-[#FF5F9E]/30 border border-[#7C5FFF]/30 rounded-full text-[10px] font-medium text-[#f2e9dd] transition-all duration-300 hover:scale-105 flex items-center gap-1"
                        >
                          <Star size={10} className="text-yellow-400" fill="currentColor" />
                          <span className="truncate max-w-[80px]">{exhibition.title}</span>
                          {exhibition.artwork_type === 'exclusive' && (
                            <span className="ml-0.5 px-1 bg-yellow-500 text-black text-[8px] rounded-full font-bold">EX</span>
                          )}
                        </button>
                      ))}
                      {artwork.exhibitions.length > 2 && (
                        <span className="px-2 py-0.5 bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-full text-[10px] text-[#f2e9dd]/50">
                          +{artwork.exhibitions.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Non-Clickable Area for Actions */}
              <div className="p-3 md:p-4 pt-0">
                {artwork.reason && (
                  <div className="mb-2 text-xs text-[#B15FFF] bg-[#7C5FFF]/10 px-2 py-1 rounded">{artwork.reason}</div>
                )}
                <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs text-[#f2e9dd]/70">
                  <button onClick={() => toggleLike(artwork.id)} className={`flex items-center gap-1 transition-all duration-200 group/like ${likedArtworks.has(artwork.id) ? 'text-[#FF5F9E]' : 'hover:text-[#FF5F9E]'}`}>
                    <Heart size={12} className={`group-hover/like:scale-125 transition-transform ${likedArtworks.has(artwork.id) ? 'fill-current' : ''}`} />
                    {artwork.likes}
                  </button>
                  <button onClick={() => handleArtworkClick(artwork)} className="flex items-center gap-1 hover:text-[#7C5FFF] transition-colors group/comment">
                    <MessageCircle size={12} className="group-hover/comment:scale-110 transition-transform" />
                    {artwork.comments}
                  </button>
                </div>
              </div>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalItems > pagination.pageSize && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
          canGoNext={pagination.canGoNext}
          canGoPrev={pagination.canGoPrev}
          getPageNumbers={pagination.getPageNumbers}
          range={pagination.range}
          totalItems={totalItems}
          showInfo={true}
        />
      )}
    </div>
  );
};

export { Dashboard };