import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Lock, Star, MessageSquare, Share, ShoppingCart, AlertCircle, Plus } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { artworkService, mockArtworkDetail, mockArtworkComments } from '../services/artwork.service';
import { profileService } from '../services/profile.service';

// Demo mode flag - set to false when backend is ready
const USE_DEMO_MODE = true;

const ArtworkPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const { addToCart } = useCart();
  const isFreeUser = !user || user.subscription === 'free';

  // API state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artwork, setArtwork] = useState(null);
  const [comments, setComments] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Comment submission state
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch artwork and comments on mount
  useEffect(() => {
    fetchArtworkData();
  }, [id]);

  const fetchArtworkData = async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Use mock data
      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setArtwork({ ...mockArtworkDetail, id });
        setComments(mockArtworkComments);
        setIsFollowing(mockArtworkDetail.isFollowing);
        setIsLiked(mockArtworkDetail.isLiked);
        setLikesCount(mockArtworkDetail.likes);
        setLoading(false);
        return;
      }

      // REAL API MODE: Parallel fetching
      const [artworkData, commentsData] = await Promise.all([
        artworkService.getArtwork(id),
        artworkService.getComments(id),
      ]);

      setArtwork(artworkData.artwork || artworkData);
      setComments(commentsData.comments || commentsData);
      setIsFollowing(artworkData.artwork?.isFollowing || false);
      setIsLiked(artworkData.artwork?.isLiked || false);
      setLikesCount(artworkData.artwork?.likes || 0);
    } catch (err) {
      console.error('Error fetching artwork:', err);
      setError(err.message || 'Failed to load artwork. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (isFreeUser) {
      toast.info('Upgrade to Plus to comment on artworks.');
      navigate('/subscriptions');
      return;
    }
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
      const response = await artworkService.addComment(id, commentText);

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

  const handleFollowArtist = async () => {
    if (!artwork) return;

    const oldFollowing = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      // DEMO MODE: Just show toast
      if (USE_DEMO_MODE) {
        toast.success(isFollowing ? `Unfollowed ${artwork.artistName}` : `Now following ${artwork.artistName}! 🎨`);
        return;
      }

      // REAL API MODE: Call backend
      if (isFollowing) {
        await profileService.unfollowUser(artwork.artist);
        toast.success(`Unfollowed ${artwork.artistName}`);
      } else {
        await profileService.followUser(artwork.artist);
        toast.success(`Now following ${artwork.artistName}! 🎨`);
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(oldFollowing);
      toast.error('Failed to update follow status');
    }
  };

  const handleLike = async () => {
    if (!artwork) return;

    const oldLiked = isLiked;
    const oldCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      // DEMO MODE: Just update state
      if (USE_DEMO_MODE) {
        return;
      }

      // REAL API MODE: Call backend
      if (isLiked) {
        await artworkService.unlikeArtwork(id);
      } else {
        await artworkService.likeArtwork(id);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(oldLiked);
      setLikesCount(oldCount);
      toast.error('Failed to update like');
    }
  };

  const handleShare = () => {
    if (!artwork) return;
    toast.success(`Sharing "${artwork.title}"...`);
  };

  const handleAddToCart = () => {
    if (!artwork) return;
    addToCart({
      id: artwork.id,
      artwork: artwork,
      title: artwork.title,
      price: artwork.price,
      quantity: 1,
      image: artwork.image,
    });
    toast.success(`"${artwork.title}" added to cart!`);
  };

  const handleBuyNow = async () => {
    if (!artwork) return;

    // Prepare order data for immediate purchase
    const price = artwork.price;
    const tax = Math.round(price * 0.1);
    const shipping = 500; // Standard shipping
    const total = price + tax + shipping;

    const confirmed = window.confirm(
      `Buy "${artwork.title}" for ₱${total.toLocaleString()}?\n\nPrice: ₱${price.toLocaleString()}\nTax: ₱${tax.toLocaleString()}\nShipping: ₱${shipping.toLocaleString()}\n\nThis will use your default payment method.`
    );

    if (confirmed) {
      toast.info('Processing purchase...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Prepare order data with complete artwork information
      const orderData = {
        items: [{
          id: artwork.id,
          artwork: {
            ...artwork,
            artistName: artwork.artistName || artwork.artist,
          },
          title: artwork.title,
          artistName: artwork.artistName || artwork.artist,
          price: artwork.price,
          quantity: 1,
          image: artwork.image,
        }],
        subtotal: price,
        tax: tax,
        shipping: shipping,
        discount: 0,
        total: total,
      };

      console.log('[ArtworkPage] Navigating to order confirmation with data:', orderData);

      // Save to sessionStorage as backup (in case state is lost)
      sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
      console.log('[ArtworkPage] Saved order to sessionStorage');

      // Navigate to order confirmation
      navigate('/order-confirmation', { state: { orderData } });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 px-4 py-4 md:p-6">
        <LoadingPaint message="Loading artwork..." />
        <div className="mt-8">
          <SkeletonGrid count={2} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 px-4 py-4 md:p-6">
        <APIError error={error} retry={fetchArtworkData} />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="flex-1 px-4 py-4 md:p-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-[#f2e9dd] mb-2">Artwork Not Found</h2>
          <p className="text-[#f2e9dd]/70 mb-4">The artwork you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/explore')}>Browse Artworks</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-4 md:p-6">
      <div className="mb-6 md:mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div>
          <Card noPadding>
            <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl md:text-9xl">
              {artwork.imageUrl ? (
                <img src={artwork.imageUrl} alt={artwork.title} className="w-full h-full object-cover" />
              ) : (
                artwork.image
              )}
            </div>
          </Card>
        </div>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-2">{artwork.title}</h1>
            <p className="text-sm md:text-base text-[#f2e9dd]/70 mb-3 md:mb-4">by {artwork.artistName} ({artwork.artist})</p>
            <p className="text-sm md:text-base text-[#f2e9dd]/90 mb-4 md:mb-6">{artwork.description}</p>

            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-base text-[#f2e9dd]/70 mb-4 md:mb-6">
              <span>👁 {artwork.views?.toLocaleString() || '2.3K'} views</span>
              <span>•</span>
              <button
                onClick={handleLike}
                className={`transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                {isLiked ? '❤️' : '🤍'} {likesCount} likes
              </button>
            </div>

            <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-3">
              <Button
                onClick={handleFollowArtist}
                className={`w-full md:w-auto shadow-lg transform hover:scale-105 transition-all duration-300 ${
                  isFollowing
                    ? 'bg-gray-600 hover:bg-gray-700 shadow-gray-600/30 hover:shadow-gray-600/50'
                    : 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50'
                }`}
              >
                <Star size={16} className="mr-2" /> {isFollowing ? 'Following' : 'Follow Artist'}
              </Button>
              <Button variant="secondary" onClick={handleShare} className="w-full md:w-auto transform hover:scale-105 transition-all duration-300">
                <Share size={16} className="mr-2" /> Share
              </Button>
              {artwork.price && (
                <>
                  <Button
                    onClick={handleAddToCart}
                    variant="secondary"
                    className="w-full md:w-auto transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus size={16} className="mr-2" /> Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300"
                  >
                    <ShoppingCart size={16} className="mr-2" /> Buy Now (₱{artwork.price.toLocaleString()})
                  </Button>
                </>
              )}
            </div>
        </div>
      </div>

      <div className="mt-6 md:mt-8">
        <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd] mb-3 md:mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="md:size-24" /> Comments
        </h2>
        <div className="space-y-3 md:space-y-4">
          {comments.map((comment, idx) => (
            <Card key={idx} className="p-3 md:p-4">
              <p className="font-bold text-sm md:text-base text-[#f2e9dd]">{comment.user}</p>
              <p className="text-xs md:text-sm text-[#f2e9dd]/70">{comment.text}</p>
            </Card>
          ))}
        </div>
        <form onSubmit={handleCommentSubmit} className="mt-4 md:mt-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isFreeUser ? "Upgrade to Plus to comment" : "Add a comment..."}
            className="w-full bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg p-3 text-sm md:text-base text-[#f2e9dd] focus:outline-none focus:ring-2 focus:ring-[#7C5FFF]"
            rows="3"
            disabled={isFreeUser || isSubmitting}
          ></textarea>

          <div className="mt-3 md:mt-4">
            <Button type="submit" disabled={isSubmitting || isFreeUser} className="w-full md:w-auto">
              {isSubmitting ? "Submitting..." : "Submit Comment"}
            </Button>
          </div>
        </form>

        {isFreeUser && (
            <Card className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-orange-600/10 to-[#FF5F9E]/10 border border-orange-500/30">
                <p className="text-orange-400 font-bold mb-1 flex items-center gap-2 text-sm md:text-base">
                  <Lock size={16} /> Commenting is a Plus feature
                </p>
                <p className="text-[#f2e9dd]/70 text-xs md:text-sm mb-3">
                  Upgrade your account to share your thoughts on this artwork.
                </p>
                <Button onClick={() => navigate('/subscriptions')} className="w-full md:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E]">Upgrade to Plus</Button>
            </Card>
        )}
      </div>
    </div>
  );
};

export { ArtworkPage };