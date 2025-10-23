import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Users, Sparkles, TrendingUp, UserPlus, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('foryou');
  const [likedArtworks, setLikedArtworks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // Mock data
  const followingArtworks = [{ id: 1, title: 'Sunset Dreams', artist: '@artist1', artistName: 'Sarah Chen', likes: 234, comments: 12, image: '🌅', isFollowing: true, timeAgo: '2h ago' }, { id: 2, title: 'Digital Abstract', artist: '@artist2', artistName: 'Mike Johnson', likes: 189, comments: 8, image: '🎨', isFollowing: true, timeAgo: '5h ago' }, { id: 3, title: 'Urban Nights', artist: '@artist3', artistName: 'Emma Davis', likes: 445, comments: 23, image: '🌃', isFollowing: true, timeAgo: '1d ago' }];
  const recommendedArtworks = [{ id: 4, title: 'Nature Flow', artist: '@artist4', artistName: 'Alex Park', likes: 301, comments: 15, image: '🌿', isFollowing: false, reason: 'Similar to artworks you liked', timeAgo: '3h ago' }, { id: 5, title: 'Cosmic Dreams', artist: '@artist5', artistName: 'Jordan Lee', likes: 567, comments: 34, image: '🌌', isFollowing: false, reason: 'Trending in your interests', timeAgo: '6h ago' }, { id: 6, title: 'Portrait Study', artist: '@artist6', artistName: 'Taylor Swift', likes: 423, comments: 19, image: '👤', isFollowing: false, reason: 'Popular with people you follow', timeAgo: '8h ago' }];
  const trendingArtworks = [{ id: 7, title: 'Neon City', artist: '@trendartist1', artistName: 'Chris Wong', likes: 1234, comments: 89, image: '🌆', isFollowing: false, timeAgo: '1h ago' }, { id: 8, title: 'Ocean Waves', artist: '@trendartist2', artistName: 'Maria Garcia', likes: 987, comments: 56, image: '🌊', isFollowing: false, timeAgo: '4h ago' }, { id: 9, title: 'Mountain Peak', artist: '@trendartist3', artistName: 'David Kim', likes: 756, comments: 34, image: '⛰️', isFollowing: false, timeAgo: '7h ago' }];

  const getArtworks = () => {
    if (activeTab === 'following') return followingArtworks;
    if (activeTab === 'trending') return trendingArtworks;
    return [...followingArtworks.slice(0, 2), ...recommendedArtworks.slice(0, 2), followingArtworks[2], recommendedArtworks[2]];
  };

  const artworks = getArtworks();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#f2e9dd] mb-2">Welcome back, {user?.username}! 👋</h1>
          <p className="text-[#f2e9dd]/70">{activeTab === 'following' ? 'Latest from artists you follow' : activeTab === 'trending' ? 'What\'s trending on OnlyArts' : 'Personalized feed just for you'}</p>
        </div>
        {user?.role === 'artist' && (
          <Button onClick={() => setCreateModalOpen(true)}>
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

      <div className="flex gap-8 border-b border-white/10 mb-6">
        {/* ... Tabs ... */}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {artworks.map((artwork, idx) => (
          <Card 
            key={artwork.id} 
            noPadding
            className="animate-fadeIn group transform hover:scale-105 hover:-translate-y-2 transition-all duration-300"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="border border-white/10 rounded-2xl overflow-hidden hover:border-[#7C5FFF]/50 hover:shadow-lg hover:shadow-[#7C5FFF]/20 transition-all duration-300">
              
              {/* Clickable Area for Navigation */}
              <div onClick={() => handleArtworkClick(artwork)} className="cursor-pointer">
                {activeTab === 'foryou' && artwork.reason && (
                    <div className="absolute top-3 left-3 z-10 bg-[#7C5FFF]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Sparkles size={12} /> Recommended</div>
                )}
                <div className="relative aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-8xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-4">
                    <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-white/30 transition-all transform translate-y-4 group-hover:translate-y-0" onClick={(e) => { e.stopPropagation(); handleArtworkClick(artwork); }}>View</button>
                    <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-white/30 transition-all transform translate-y-4 group-hover:translate-y-0" style={{ transitionDelay: '50ms' }} onClick={(e) => handleShare(e, artwork)}>Share</button>
                  </div>
                  <span className="transform group-hover:scale-110 transition-transform duration-300">{artwork.image}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">{artwork.title}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-[#f2e9dd]/50">{artwork.artistName}</p>
                    {!artwork.isFollowing && (
                        <button onClick={(e) => handleFollowArtist(e, artwork.artistName)} className="text-xs text-[#7C5FFF] hover:text-[#B15FFF] flex items-center gap-1 transition-colors"><UserPlus size={12} /> Follow</button>
                    )}
                  </div>
                  <p className="text-xs text-[#f2e9dd]/40 mt-1">{artwork.timeAgo}</p>
                </div>
              </div>

              {/* Non-Clickable Area for Actions */}
              <div className="p-4 pt-0">
                {artwork.reason && (
                  <div className="mb-2 text-xs text-[#B15FFF] bg-[#7C5FFF]/10 px-2 py-1 rounded">{artwork.reason}</div>
                )}
                <div className="flex items-center gap-4 text-sm text-[#f2e9dd]/70">
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