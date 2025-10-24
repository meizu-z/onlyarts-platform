import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Lock, Star, MessageSquare, Share, ShoppingCart, AlertCircle } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useCart } from '../context/CartContext'; // Import useCart

const ArtworkPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const { addToCart } = useCart(); // Destructure addToCart
  const isFreeUser = !user || user.subscription === 'free';

  // Mock Data - Adjusted price to be a number
  const artwork = {
    id: id,
    title: 'Digital Sunset',
    artist: '@artist1',
    artistName: 'Sarah Chen',
    price: 5000, // Price as a number
    image: '🌅',
    description: 'A beautiful digital painting of a sunset over the ocean. Created with a custom set of brushes in Procreate.',
    isFollowing: true,
    timeAgo: '2h ago',
    likes: 234,
  };

  // State Management
  const [comments, setComments] = useState([
    { user: '@artlover', text: 'This collection is amazing! 🤩' },
    { user: '@critic', text: 'Interesting use of color and texture.' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  
  // This state is just to simulate a transient error that resolves on retry
  const [submitAttempts, setSubmitAttempts] = useState(0);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (isFreeUser) {
        toast.info('Upgrade to Plus to comment on artworks.');
        navigate('/subscriptions');
        return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmitAttempts(prev => prev + 1);

    // Simulate a network request that fails on the first attempt
    setTimeout(() => {
        if (submitAttempts % 2 === 0) { // Fails on 1st, 3rd, 5th... attempt
            const errorMsg = "Failed to post comment. Please check your connection.";
            setSubmissionError(errorMsg);
            setIsSubmitting(false);
            toast.error("Network Error", "Your comment could not be posted.");
        } else {
            setComments([...comments, { user: '@me', text: newComment }]);
            setNewComment('');
            setIsSubmitting(false);
            setSubmissionError(null);
            toast.success('Comment posted!');
        }
    }, 1200);
  };
  
  const handleShare = () => {
    toast.success(`Sharing "${artwork.title}"...`);
  };

  const handleBuyNow = () => {
    addToCart({ ...artwork, quantity: 1 }); // Add artwork to cart
    toast.success(`"${artwork.title}" added to cart!`);
    navigate('/cart'); // Navigate to the cart page
  };

  const handleFollowArtist = () => {
    toast.success(`Now following ${artwork.artistName}! 🎨`);
  };

  return (
    <div className="flex-1 px-4 py-4 md:p-6">
      <div className="mb-6 md:mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div>
          <Card noPadding>
            <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl md:text-9xl">
              {artwork.image}
            </div>
          </Card>
        </div>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-2">{artwork.title}</h1>
            <p className="text-sm md:text-base text-[#f2e9dd]/70 mb-3 md:mb-4">by {artwork.artistName} ({artwork.artist})</p>
            <p className="text-sm md:text-base text-[#f2e9dd]/90 mb-4 md:mb-6">{artwork.description}</p>

            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-base text-[#f2e9dd]/70 mb-4 md:mb-6">
              <span>👁 2.3K views</span>
              <span>•</span>
              <span>{artwork.likes} likes</span>
            </div>

            <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-3">
              <Button onClick={handleFollowArtist} className="w-full md:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300">
                <Star size={16} className="mr-2" /> Follow Artist
              </Button>
              <Button variant="secondary" onClick={handleShare} className="w-full md:w-auto transform hover:scale-105 transition-all duration-300">
                <Share size={16} className="mr-2" /> Share
              </Button>
              {artwork.price && (
                <Button
                  onClick={handleBuyNow}
                  className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  <ShoppingCart size={16} className="mr-2" /> Buy Now (₱{artwork.price.toLocaleString()})
                </Button>
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

          <div className="mt-3 md:mt-4 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4">
              <Button type="submit" disabled={isSubmitting || isFreeUser} className="w-full md:w-auto">
                {isSubmitting ? "Submitting..." : "Submit Comment"}
              </Button>
              {submissionError && (
                <Button onClick={handleCommentSubmit} variant="secondary" className="w-full md:w-auto">
                  Retry
                </Button>
              )}
          </div>
        </form>
        {submissionError && (
            <div className="mt-3 md:mt-4 flex items-center gap-2 text-red-400 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertCircle size={16} />
                <p className="text-xs md:text-sm">{submissionError}</p>
            </div>
        )}
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