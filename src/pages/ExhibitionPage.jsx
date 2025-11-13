import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { Lock, Star, MessageSquare } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { exhibitionService, mockExhibition, mockExhibitionArtworks, mockExhibitionComments } from '../services/exhibition.service';
import { favoritesService } from '../services/favorites.service';

// Demo mode flag - set to false when backend is ready
const USE_DEMO_MODE = false;

const ExhibitionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const { addToCart } = useCart();
  const isFreeUser = !user || user.subscription === 'free';

  // API state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exhibition, setExhibition] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [comments, setComments] = useState([]);
  const [favorites, setFavorites] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch exhibition data on mount
  useEffect(() => {
    fetchExhibitionData();
  }, [id]);

  const fetchExhibitionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Use mock data
      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setExhibition(mockExhibition);

        // Apply locked state based on user subscription
        const processedArtworks = mockExhibitionArtworks.map((artwork, index) => ({
          ...artwork,
          locked: index >= 3 && isFreeUser, // Lock artworks 4-6 for free users
        }));
        setArtworks(processedArtworks);
        setComments(mockExhibitionComments);
        setFavorites(mockExhibition.favorites);
        setIsFavorited(mockExhibition.isFavorited);
        setIsFollowing(mockExhibition.isFollowing);
        setLoading(false);
        return;
      }

      // REAL API MODE: Parallel fetching
      const [exhibitionData, artworksData, commentsData] = await Promise.all([
        exhibitionService.getExhibition(id),
        exhibitionService.getExhibitionArtworks(id),
        exhibitionService.getExhibitionComments(id),
      ]);

      setExhibition(exhibitionData.exhibition || exhibitionData);
      setArtworks(artworksData.artworks || artworksData);
      setComments(commentsData.comments || commentsData);
      setFavorites(exhibitionData.exhibition?.favorites || 0);
      setIsFavorited(exhibitionData.exhibition?.isFavorited || false);
      setIsFollowing(exhibitionData.exhibition?.isFollowing || false);
    } catch (err) {
      console.error('Error fetching exhibition:', err);
      setError(err.message || 'Failed to load exhibition. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    const oldFavorited = isFavorited;
    const oldCount = favorites;

    setIsFavorited(!isFavorited);
    setFavorites(isFavorited ? favorites - 1 : favorites + 1);

    try {
      // DEMO MODE: Just show toast
      if (USE_DEMO_MODE) {
        toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
        return;
      }

      // REAL API MODE: Call backend
      if (isFavorited) {
        await exhibitionService.unfavoriteExhibition(id);
        toast.success('Removed from favorites');
      } else {
        await exhibitionService.favoriteExhibition(id);
        toast.success('Added to favorites');
      }
    } catch (error) {
      // Revert on error
      setIsFavorited(oldFavorited);
      setFavorites(oldCount);
      toast.error('Failed to update favorite status');
    }
  };

  const handleFollow = async () => {
    const oldFollowing = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      // DEMO MODE: Just show toast
      if (USE_DEMO_MODE) {
        toast.success(isFollowing ? 'Unfollowed exhibition' : 'Following exhibition!');
        return;
      }

      // REAL API MODE: Call backend
      if (isFollowing) {
        await exhibitionService.unfollowExhibition(id);
        toast.success('Unfollowed exhibition');
      } else {
        await exhibitionService.followExhibition(id);
        toast.success('Following exhibition!');
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(oldFollowing);
      toast.error('Failed to update follow status');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const tempComment = {
      id: Date.now(),
      user: user?.username || '@me',
      userName: user?.name || 'You',
      text: newComment,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setComments([...comments, tempComment]);
    const commentText = newComment;
    setNewComment('');
    setIsSubmitting(true);

    try {
      // DEMO MODE: Just show success
      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));
        toast.success('Comment posted!');
        setIsSubmitting(false);
        return;
      }

      // REAL API MODE: Call backend
      const response = await exhibitionService.addComment(id, commentText);

      // Replace temp comment with real comment from API
      setComments(prev => prev.map(c =>
        c.id === tempComment.id ? response.comment : c
      ));

      toast.success('Comment posted!');
    } catch (error) {
      // Revert on error
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
      setNewComment(commentText);
      toast.error('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveForLater = async (artwork) => {
    try {
      // DEMO MODE: Use localStorage
      if (USE_DEMO_MODE) {
        const savedItems = JSON.parse(localStorage.getItem('savedForLater') || '[]');
        const isAlreadySaved = savedItems.some(item => item.id === artwork.id);

        if (isAlreadySaved) {
          toast.info('This artwork is already in your saved list.');
          return;
        }

        savedItems.push(artwork);
        localStorage.setItem('savedForLater', JSON.stringify(savedItems));
        toast.success('Artwork saved for later!');
        setSelectedArtwork(null);
        return;
      }

      // REAL API MODE: Call backend
      await favoritesService.addFavorite(artwork.id);
      toast.success('Artwork saved for later!');
      setSelectedArtwork(null);
    } catch (error) {
      toast.error('Failed to save artwork');
    }
  };

  const handleBuyNow = (artwork) => {
    addToCart({ ...artwork, quantity: 1 });
    toast.success(`"${artwork.title}" added to cart!`);
    setSelectedArtwork(null);
  };

  if (loading) {
    return (
      <div className="flex-1 p-3 sm:p-6 md:p-8">
        <LoadingPaint message="Loading exhibition..." />
        <div className="mt-8">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-3 sm:p-6 md:p-8">
        <APIError error={error} retry={fetchExhibitionData} />
      </div>
    );
  }

  if (!exhibition) {
    return (
      <div className="flex-1 p-3 sm:p-6 md:p-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-[#f2e9dd] mb-2">Exhibition Not Found</h2>
          <p className="text-[#f2e9dd]/70 mb-4">The exhibition you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/explore')}>Browse Exhibitions</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-6 md:p-8">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="aspect-[3/1] bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 rounded-2xl mb-4 sm:mb-6 flex items-center justify-center text-6xl sm:text-8xl md:text-9xl animate-fadeIn group hover:from-[#7C5FFF]/30 hover:to-[#FF5F9E]/30 transition-all duration-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">
            {exhibition.bannerImage}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 md:gap-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#f2e9dd] mb-2">{exhibition.title}</h1>
            <p className="text-[#f2e9dd]/70 mb-4">Curated by {exhibition.curator}</p>
            {isFreeUser && (
              <div className="bg-gradient-to-r from-orange-600/10 to-[#FF5F9E]/10 border border-orange-500/30 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 animate-fadeIn hover:border-orange-500/50 transition-all duration-300">
                <p className="text-orange-400 font-bold mb-1 flex items-center gap-2 text-sm sm:text-base">
                  <Lock size={16} className="animate-pulse" /> PREVIEW MODE
                </p>
                <p className="text-[#f2e9dd]/70 text-xs sm:text-sm">
                  You can view {artworks.filter(a => !a.locked).length} of {exhibition.artworkCount} artworks in preview mode. Upgrade to Plus to unlock full access.
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[#f2e9dd]/70 mb-4 sm:mb-6 text-sm sm:text-base">
              <span>👁 {exhibition.views?.toLocaleString() || '0'} views</span>
              <span>•</span>
              <span>{exhibition.artworkCount} artworks</span>
              <span>•</span>
              <span className="whitespace-nowrap">Live until {new Date(exhibition.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={handleFollow}
                className={`w-full sm:w-auto shadow-lg transform hover:scale-105 transition-all duration-300 ${
                  isFollowing
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50'
                }`}
              >
                <Star size={16} className="mr-2" /> {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button
                variant={isFavorited ? "primary" : "secondary"}
                onClick={handleFavorite}
                className="w-full sm:w-auto transform hover:scale-105 transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <Star size={16} /> {favorites}
              </Button>
              <Button variant="secondary" className="w-full sm:w-auto transform hover:scale-105 transition-all duration-300">
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isFreeUser && (
        <Card className="mb-4 sm:mb-6 md:mb-8 p-4 sm:p-6 bg-gradient-to-r from-[#7C5FFF]/10 to-[#FF5F9E]/10 border border-[#7C5FFF]/30 animate-fadeIn hover:border-[#7C5FFF]/50 transition-all duration-300">
          <h3 className="font-bold text-[#f2e9dd] mb-2 flex items-center gap-2 text-base sm:text-lg">
            <Lock size={20} className="text-[#B15FFF]" />
            Unlock full exhibition access
          </h3>
          <ul className="text-xs sm:text-sm text-[#f2e9dd]/70 mb-4 space-y-1">
            <li>✓ View all {exhibition.artworkCount} artworks</li>
            <li>✓ Participate in auctions</li>
            <li>✓ Engage with artist</li>
          </ul>
          <Button
            onClick={() => navigate('/subscriptions')}
            className="w-full sm:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
          >
            Upgrade to Plus - ₱149/mo
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {artworks.map((artwork, idx) => (
          <div key={artwork.id} onClick={() => !artwork.locked && artwork.price && setSelectedArtwork(artwork)}>
            <Card
              hover={!artwork.locked}
              className={`relative cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group ${
                artwork.locked ? 'cursor-not-allowed' : ''
              }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {artwork.locked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl group-hover:bg-black/70 transition-all duration-300">
                  <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                    <Lock className="mx-auto mb-2 text-[#f2e9dd]/50" size={32} />
                    <p className="text-[#f2e9dd] font-bold">Locked</p>
                    <p className="text-sm text-[#f2e9dd]/70">Upgrade to view</p>
                  </div>
                </div>
              )}
              <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-5xl sm:text-6xl overflow-hidden relative">
                {!artwork.locked && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                <span className={`transform transition-transform duration-300 relative z-10 ${
                  !artwork.locked ? 'group-hover:scale-110' : ''
                }`}>
                  {artwork.image}
                </span>
              </div>
              <div className="p-3 sm:p-4">
                <h3 className={`font-bold text-[#f2e9dd] mb-1 transition-colors ${
                  !artwork.locked ? 'group-hover:text-[#7C5FFF]' : ''
                }`}>
                  {artwork.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#f2e9dd]/50 mb-2">{artwork.artist}</p>
                {!artwork.locked && artwork.price && (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="text-[#B15FFF] font-bold text-sm sm:text-base">₱{artwork.price.toLocaleString()}</p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow(artwork);
                      }}
                      className="w-full sm:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white px-4 py-1 rounded-lg text-sm"
                    >
                      Buy Now
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {selectedArtwork && (
        <Modal isOpen={!!selectedArtwork} onClose={() => setSelectedArtwork(null)} title={selectedArtwork.title}>
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-8xl mb-4 rounded-lg">
              {selectedArtwork.image}
            </div>
            <p className="text-2xl font-bold text-[#f2e9dd] mb-2">₱{selectedArtwork.price.toLocaleString()}</p>
            <p className="text-lg text-[#f2e9dd]/70 mb-6">by {selectedArtwork.artist}</p>
            <div className="flex gap-4 w-full">
              <Button
                onClick={() => handleSaveForLater(selectedArtwork)}
                variant="secondary"
                className="w-full"
              >
                Save for Later
              </Button>
              <Button
                onClick={() => handleBuyNow(selectedArtwork)}
                className="w-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <div className="mt-6 sm:mt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#f2e9dd] mb-3 sm:mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="sm:hidden" />
          <MessageSquare size={24} className="hidden sm:block" />
          Comments
        </h2>
        <div className="space-y-3 sm:space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="p-3 sm:p-4">
              <p className="font-bold text-[#f2e9dd] text-sm sm:text-base">{comment.user}</p>
              <p className="text-[#f2e9dd]/70 text-sm sm:text-base">{comment.text}</p>
            </Card>
          ))}
        </div>
        <form onSubmit={handleCommentSubmit} className="mt-4 sm:mt-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={isSubmitting}
            className="w-full bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg p-3 text-[#f2e9dd] focus:outline-none focus:ring-2 focus:ring-[#7C5FFF] text-sm sm:text-base"
            rows="3"
          ></textarea>
          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full sm:w-auto">
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export { ExhibitionPage };
