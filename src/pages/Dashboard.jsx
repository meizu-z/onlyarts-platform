import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Users, Sparkles, TrendingUp, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('foryou');
  const [likedArtworks, setLikedArtworks] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Mock data - Following feed (from artists you follow)
  const followingArtworks = [
    { id: 1, title: 'Sunset Dreams', artist: '@artist1', artistName: 'Sarah Chen', likes: 234, comments: 12, image: '🌅', isFollowing: true, timeAgo: '2h ago' },
    { id: 2, title: 'Digital Abstract', artist: '@artist2', artistName: 'Mike Johnson', likes: 189, comments: 8, image: '🎨', isFollowing: true, timeAgo: '5h ago' },
    { id: 3, title: 'Urban Nights', artist: '@artist3', artistName: 'Emma Davis', likes: 445, comments: 23, image: '🌃', isFollowing: true, timeAgo: '1d ago' },
  ];

  // Mock data - Recommended for you (based on past likes)
  const recommendedArtworks = [
    { id: 4, title: 'Nature Flow', artist: '@artist4', artistName: 'Alex Park', likes: 301, comments: 15, image: '🌿', isFollowing: false, reason: 'Similar to artworks you liked', timeAgo: '3h ago' },
    { id: 5, title: 'Cosmic Dreams', artist: '@artist5', artistName: 'Jordan Lee', likes: 567, comments: 34, image: '🌌', isFollowing: false, reason: 'Trending in your interests', timeAgo: '6h ago' },
    { id: 6, title: 'Portrait Study', artist: '@artist6', artistName: 'Taylor Swift', likes: 423, comments: 19, image: '👤', isFollowing: false, reason: 'Popular with people you follow', timeAgo: '8h ago' },
  ];

  // Mock data - Trending globally
  const trendingArtworks = [
    { id: 7, title: 'Neon City', artist: '@trendartist1', artistName: 'Chris Wong', likes: 1234, comments: 89, image: '🌆', isFollowing: false, timeAgo: '1h ago' },
    { id: 8, title: 'Ocean Waves', artist: '@trendartist2', artistName: 'Maria Garcia', likes: 987, comments: 56, image: '🌊', isFollowing: false, timeAgo: '4h ago' },
    { id: 9, title: 'Mountain Peak', artist: '@trendartist3', artistName: 'David Kim', likes: 756, comments: 34, image: '⛰️', isFollowing: false, timeAgo: '7h ago' },
  ];

  // Get artworks based on active tab
  const getArtworks = () => {
    if (activeTab === 'following') return followingArtworks;
    if (activeTab === 'trending') return trendingArtworks;
    // 'foryou' tab - mix of following and recommended
    return [...followingArtworks.slice(0, 2), ...recommendedArtworks.slice(0, 2), followingArtworks[2], recommendedArtworks[2]];
  };

  const artworks = getArtworks();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleLike = (id) => {
    setLikedArtworks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        toast.info('Removed from favorites');
      } else {
        newSet.add(id);
        toast.success('Added to favorites! ❤️');
      }
      return newSet;
    });
  };

  const handleFollowArtist = (artist) => {
    toast.success(`Now following ${artist}! 🎨`);
  };

  const handleShare = (artwork) => {
    toast.success(`Sharing "${artwork.title}"...`);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <LoadingPaint message="Loading your feed..." />
        <div className="mt-8">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f2e9dd] mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-[#f2e9dd]/70">
          {activeTab === 'following' && 'Latest from artists you follow'}
          {activeTab === 'trending' && 'What\'s trending on OnlyArts'}
          {activeTab === 'foryou' && 'Personalized feed just for you'}
        </p>
      </div>

      {/* Premium Banner */}
      {user?.subscription && user.subscription !== 'free' && (
        <Card className="mb-6 bg-gradient-to-r from-[#7C5FFF]/20 to-[#FF5F9E]/20 border-[#7C5FFF]/30 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="text-[#B15FFF] animate-pulse" size={24} />
              <div>
                <p className="font-bold text-[#f2e9dd] capitalize">{user.subscription} Member</p>
                <p className="text-sm text-[#f2e9dd]/70">Enjoying premium features</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => navigate('/subscriptions')}
              className="transform hover:scale-105 transition-all duration-200"
            >
              Manage Plan
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-8 border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab('foryou')}
          className={`relative pb-4 text-lg transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'foryou' 
              ? 'text-[#f2e9dd]' 
              : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
          }`}
        >
          <Sparkles size={20} />
          For You
          {activeTab === 'foryou' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`relative pb-4 text-lg transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'following' 
              ? 'text-[#f2e9dd]' 
              : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
          }`}
        >
          <Users size={20} />
          Following
          {activeTab === 'following' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`relative pb-4 text-lg transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'trending' 
              ? 'text-[#f2e9dd]' 
              : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
          }`}
        >
          <TrendingUp size={20} />
          Trending
          {activeTab === 'trending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
          )}
        </button>
      </div>

      {/* Artwork Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {artworks.map((artwork, idx) => (
          <Card 
            key={artwork.id} 
            hover 
            noPadding
            className="group cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="border border-white/10 rounded-2xl overflow-hidden hover:border-[#7C5FFF]/50 hover:shadow-lg hover:shadow-[#7C5FFF]/20 transition-all duration-300">
              {/* Recommendation badge for "For You" tab */}
              {activeTab === 'foryou' && artwork.reason && (
                <div className="absolute top-3 left-3 z-10 bg-[#7C5FFF]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles size={12} />
                  Recommended
                </div>
              )}

              <div className="relative aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-8xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-4">
                  <button 
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-white/30 transition-all transform translate-y-4 group-hover:translate-y-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info('Opening artwork...');
                    }}
                  >
                    View
                  </button>
                  <button 
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-white/30 transition-all transform translate-y-4 group-hover:translate-y-0" 
                    style={{ transitionDelay: '50ms' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(artwork);
                    }}
                  >
                    Share
                  </button>
                </div>
                <span className="transform group-hover:scale-110 transition-transform duration-300">
                  {artwork.image}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                      {artwork.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[#f2e9dd]/50">{artwork.artistName}</p>
                      {!artwork.isFollowing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowArtist(artwork.artistName);
                          }}
                          className="text-xs text-[#7C5FFF] hover:text-[#B15FFF] flex items-center gap-1 transition-colors"
                        >
                          <UserPlus size={12} />
                          Follow
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#f2e9dd]/40 mt-1">{artwork.timeAgo}</p>
                  </div>
                </div>

                {/* Reason for recommendation */}
                {artwork.reason && (
                  <div className="mb-2 text-xs text-[#B15FFF] bg-[#7C5FFF]/10 px-2 py-1 rounded">
                    {artwork.reason}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-[#f2e9dd]/70">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(artwork.id);
                    }}
                    className={`flex items-center gap-1 transition-all duration-200 group/like ${
                      likedArtworks.has(artwork.id) 
                        ? 'text-[#FF5F9E]' 
                        : 'hover:text-[#FF5F9E]'
                    }`}
                  >
                    <Heart 
                      size={16} 
                      className={`group-hover/like:scale-125 transition-transform ${
                        likedArtworks.has(artwork.id) ? 'fill-current' : ''
                      }`}
                    /> 
                    {artwork.likes + (likedArtworks.has(artwork.id) ? 1 : 0)}
                  </button>
                  <button 
                    className="flex items-center gap-1 hover:text-[#7C5FFF] transition-colors group/comment"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info('Comments coming soon!');
                    }}
                  >
                    <MessageCircle size={16} className="group-hover/comment:scale-110 transition-transform" /> 
                    {artwork.comments}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Live Stream Card */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#f2e9dd] mb-4">🔴 Live Now:</h2>
        <Card className="bg-gradient-to-r from-red-600/10 to-[#FF5F9E]/10 border-red-500/30 hover:border-red-500/50 transition-all duration-300 cursor-pointer group">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-red-400 font-bold">LIVE</span>
              </div>
              <h3 className="text-xl font-bold text-[#f2e9dd] mb-1 group-hover:text-red-400 transition-colors">
                Creating Digital Landscapes
              </h3>
              <p className="text-[#f2e9dd]/70 mb-2">by @artist_name</p>
              <div className="flex items-center gap-2 text-[#f2e9dd]/50">
                <Users size={16} className="animate-pulse" />
                <span>234 watching</span>
              </div>
            </div>
            <Button 
              onClick={() => {
                toast.success('Joining livestream...');
                setTimeout(() => navigate('/livestreams'), 500);
              }}
              className="bg-gradient-to-r from-red-600 to-[#FF5F9E] shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-300"
            >
              Join Stream
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export { Dashboard };