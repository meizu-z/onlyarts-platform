import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Lock, Star, MessageSquare, Share } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

const ArtworkPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const isFreeUser = !user || user.subscription === 'free';

  const artwork = {
    id: id,
    title: 'Digital Sunset',
    artist: '@artist1',
    artistName: 'Sarah Chen',
    price: '₱5,000',
    image: '🌅',
    description: 'A beautiful digital painting of a sunset over the ocean. Created with a custom set of brushes in Procreate.',
    isFollowing: true,
    timeAgo: '2h ago',
    likes: 234,
  };

  const [comments, setComments] = useState([
    { user: '@artlover', text: 'This collection is amazing! 🤩' },
    { user: '@critic', text: 'Interesting use of color and texture.' },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (isFreeUser) {
        toast.info('Upgrade to Plus to comment on artworks.');
        navigate('/subscriptions');
        return;
    }
    if (newComment.trim()) {
      setComments([...comments, { user: '@me', text: newComment }]);
      setNewComment('');
      toast.success('Comment posted!');
    }
  };

  const handleShare = () => {
    const sharedPosts = JSON.parse(localStorage.getItem('sharedPosts') || '[]');
    const isAlreadyShared = sharedPosts.some(post => post.id === artwork.id);

    if (isAlreadyShared) {
      toast.info('You have already shared this artwork.');
      return;
    }

    sharedPosts.push(artwork);
    localStorage.setItem('sharedPosts', JSON.stringify(sharedPosts));
    toast.success('Artwork shared to your profile!');
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card noPadding>
            <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-9xl">
              {artwork.image}
            </div>
          </Card>
        </div>
        <div>
            <h1 className="text-4xl font-bold text-[#f2e9dd] mb-2">{artwork.title}</h1>
            <p className="text-[#f2e9dd]/70 mb-4">by {artwork.artistName} ({artwork.artist})</p>
            <p className="text-[#f2e9dd]/90 mb-6">{artwork.description}</p>

            <div className="flex items-center gap-4 text-[#f2e9dd]/70 mb-6">
              <span>👁 2.3K views</span>
              <span>•</span>
              <span>{artwork.likes} likes</span>
            </div>

            <div className="flex gap-3">
              <Button className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300">
                <Star size={16} className="mr-2" /> Follow Artist
              </Button>
              <Button variant="secondary" onClick={handleShare} className="transform hover:scale-105 transition-all duration-300">
                <Share size={16} className="mr-2" /> Share
              </Button>
            </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
          <MessageSquare size={24} /> Comments
        </h2>
        <div className="space-y-4">
          {comments.map((comment, idx) => (
            <Card key={idx} className="p-4">
              <p className="font-bold text-[#f2e9dd]">{comment.user}</p>
              <p className="text-[#f2e9dd]/70">{comment.text}</p>
            </Card>
          ))}
        </div>
        <form onSubmit={handleCommentSubmit} className="mt-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isFreeUser ? "Upgrade to Plus to comment" : "Add a comment..."}
            className="w-full bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg p-3 text-[#f2e9dd] focus:outline-none focus:ring-2 focus:ring-[#7C5FFF]"
            rows="3"
            disabled={isFreeUser}
          ></textarea>
          <Button type="submit" className="mt-2">
            Submit Comment
          </Button>
        </form>
         {isFreeUser && (
            <Card className="mt-4 p-4 bg-gradient-to-r from-orange-600/10 to-[#FF5F9E]/10 border border-orange-500/30">
                <p className="text-orange-400 font-bold mb-1 flex items-center gap-2">
                  <Lock size={16} /> Commenting is a Plus feature
                </p>
                <p className="text-[#f2e9dd]/70 text-sm mb-3">
                  Upgrade your account to share your thoughts on this artwork.
                </p>
                <Button onClick={() => navigate('/subscriptions')} className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E]">Upgrade to Plus</Button>
            </Card>
        )}
      </div>
    </div>
  );
};

export { ArtworkPage };