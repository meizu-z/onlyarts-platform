import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { Lock, Star, MessageSquare, Plus, Upload, X } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { exhibitionService } from '../services/exhibition.service';
import { favoritesService } from '../services/favorites.service';
import { API_CONFIG } from '../config/api.config';

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

  const [newComment, setNewComment] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exclusive artwork upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'digital',
    file: null,
    preview: null,
  });

  // Fetch exhibition data on mount
  useEffect(() => {
    fetchExhibitionData();
  }, [id]);

  const fetchExhibitionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel fetching
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
    } catch (err) {
      console.error('Error fetching exhibition:', err);
      // Check if it's a premium access error
      if (err.message && (err.message.includes('PREMIUM') || err.message.includes('exclusive'))) {
        setError({ type: 'premium', message: err.message });
      } else {
        setError({ type: 'generic', message: err.message || 'Failed to load exhibition. Please try again.' });
      }
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
      if (isFavorited) {
        await exhibitionService.unfavoriteExhibition(id);
        toast.success('Removed from favorites');
      } else {
        await exhibitionService.favoriteExhibition(id);
        toast.success('Added to favorites');
      }
    } catch (error) {
      setIsFavorited(oldFavorited);
      setFavorites(oldCount);
      toast.error('Failed to update favorite status');
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

    setComments([...comments, tempComment]);
    const commentText = newComment;
    setNewComment('');
    setIsSubmitting(true);

    try {
      const response = await exhibitionService.addComment(id, commentText);
      setComments(prev => prev.map(c =>
        c.id === tempComment.id ? response.comment : c
      ));
      toast.success('Comment posted!');
    } catch (error) {
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
      setNewComment(commentText);
      toast.error('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveForLater = async (artwork) => {
    try {
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

  // File upload handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadForm({
      ...uploadForm,
      file,
      preview: URL.createObjectURL(file),
    });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!uploadForm.title || !uploadForm.file) {
      toast.error('Please provide a title and image');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('price', uploadForm.price || 0);
      formData.append('category', uploadForm.category);
      formData.append('image', uploadForm.file);

      await exhibitionService.addExclusiveArtwork(id, formData);

      toast.success('Exclusive artwork uploaded!');
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        price: '',
        category: 'digital',
        file: null,
        preview: null,
      });

      // Refresh exhibition data
      await fetchExhibitionData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload artwork');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurator = user && exhibition && (user.id === exhibition.curator_id || user.id === exhibition.curator_id);

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
    // Show premium upgrade prompt for exclusive exhibitions
    if (error.type === 'premium') {
      return (
        <div className="flex-1 p-3 sm:p-6 md:p-8">
          <Card className="max-w-2xl mx-auto p-8 text-center bg-gradient-to-br from-[#7C5FFF]/10 to-[#FF5F9E]/10 border-2 border-[#7C5FFF]/30">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center">
                <Lock size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#f2e9dd] mb-4">Exclusive Exhibition</h2>
              <p className="text-[#f2e9dd]/90 text-lg mb-2">
                This exhibition contains exclusive content reserved for Premium members.
              </p>
              <p className="text-[#f2e9dd]/70 mb-6">
                Upgrade to Premium to unlock exclusive exhibitions, artworks, and features!
              </p>
            </div>

            <div className="bg-[#0a0a0a]/50 rounded-xl p-6 mb-6 border border-[#7C5FFF]/20">
              <h3 className="text-xl font-semibold text-[#f2e9dd] mb-4">Premium Benefits:</h3>
              <ul className="text-left text-[#f2e9dd]/80 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#7C5FFF]">✓</span>
                  <span>Access exclusive VIP exhibitions & showcases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7C5FFF]">✓</span>
                  <span>Priority bidding in auctions with last-call feature</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7C5FFF]">✓</span>
                  <span>Exclusive collectibles (NFTs, badges)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7C5FFF]">✓</span>
                  <span>VIP badge on your profile</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate('/subscriptions')}
                className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] hover:opacity-90 transform hover:scale-105 transition-all duration-300"
              >
                <Star size={18} className="mr-2" />
                Upgrade to Premium
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/exhibitions')}
              >
                Browse Other Exhibitions
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    // Show generic error for other errors
    return (
      <div className="flex-1 p-3 sm:p-6 md:p-8">
        <APIError error={error.message || error} retry={fetchExhibitionData} />
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
    <div className="flex-1 p-3 sm:p-6 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="aspect-[3/1] bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 rounded-2xl mb-4 sm:mb-6 flex items-center justify-center text-6xl sm:text-8xl md:text-9xl animate-fadeIn group hover:from-[#7C5FFF]/30 hover:to-[#FF5F9E]/30 transition-all duration-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          {getImageUrl(exhibition.cover_image) ? (
            <img
              src={getImageUrl(exhibition.cover_image)}
              alt={exhibition.title}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <span className="transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">
              {exhibition.bannerImage || '🎨'}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 md:gap-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#f2e9dd] mb-2">{exhibition.title}</h1>
            <p className="text-[#f2e9dd]/70 mb-4">Curated by @{exhibition.curator_username || exhibition.curator}</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[#f2e9dd]/70 mb-4 sm:mb-6 text-sm sm:text-base">
              <span>👁 {exhibition.view_count?.toLocaleString() || '0'} views</span>
              <span>•</span>
              <span>{artworks.length} artworks</span>
              <span>•</span>
              <span className="whitespace-nowrap">Live until {new Date(exhibition.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant={isFavorited ? "primary" : "secondary"}
                onClick={handleFavorite}
                className="w-full sm:w-auto transform hover:scale-105 transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <Star size={16} fill={isFavorited ? "currentColor" : "none"} /> {isFavorited ? 'Favorited' : 'Add to Favorites'} ({favorites})
              </Button>
              <Button variant="secondary" className="w-full sm:w-auto transform hover:scale-105 transition-all duration-300">
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Exclusive Artworks Section */}
      {(artworks.filter(a => a.artwork_type === 'exclusive').length > 0 || isCurator) && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-[#f2e9dd] flex items-center gap-2">
                <Star className="text-yellow-400" size={24} />
                Exclusive Artworks
              </h2>
            </div>
            {isCurator && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
              >
                <Plus size={16} className="sm:hidden" />
                <Plus size={18} className="hidden sm:block" />
                <span className="hidden sm:inline">Add Exclusive Artwork</span>
                <span className="sm:hidden">Add Artwork</span>
              </Button>
            )}
          </div>
          <p className="text-[#f2e9dd]/70 mb-6 text-sm">Unique pieces available only in this exhibition</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {artworks.filter(a => a.artwork_type === 'exclusive').map((artwork, idx) => (
              <div key={artwork.id} onClick={() => artwork.price && setSelectedArtwork(artwork)} className="h-full">
                <Card
                  noPadding
                  hover={true}
                  className="relative cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group border-2 border-yellow-500/30 h-full flex flex-col"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star size={12} fill="currentColor" />
                    EXCLUSIVE
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-5xl sm:text-6xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {getImageUrl(artwork.primary_image) ? (
                      <img src={getImageUrl(artwork.primary_image)} alt={artwork.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">🎨</span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[#f2e9dd] mb-1 group-hover:text-yellow-400 transition-colors">
                      {artwork.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#f2e9dd]/50 mb-2">by @{artwork.artist_username}</p>
                    {artwork.price && artwork.price > 0 ? (
                      <div className="flex flex-col gap-1 mt-auto">
                        <p className="text-yellow-400 font-bold text-sm">₱{artwork.price.toLocaleString()}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyNow(artwork);
                          }}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded text-[10px] font-medium hover:from-yellow-600 hover:to-orange-600 transition-colors"
                        >
                          Buy Now
                        </button>
                      </div>
                    ) : (
                      <p className="text-green-400 font-bold text-sm mt-auto">Free Artwork</p>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* For Sale Artworks Section */}
      {artworks.filter(a => a.artwork_type === 'for_sale').length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#f2e9dd] mb-4">For Sale</h2>
          <p className="text-[#f2e9dd]/70 mb-6 text-sm">Available artworks for purchase</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {artworks.filter(a => a.artwork_type === 'for_sale').map((artwork, idx) => (
              <div key={artwork.id} onClick={() => artwork.price && setSelectedArtwork(artwork)} className="h-full">
                <Card
                  noPadding
                  hover={true}
                  className="relative cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group h-full flex flex-col"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-5xl sm:text-6xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {getImageUrl(artwork.primary_image) ? (
                      <img src={getImageUrl(artwork.primary_image)} alt={artwork.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">🎨</span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                      {artwork.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#f2e9dd]/50 mb-2">by @{artwork.artist_username}</p>
                    {artwork.price && artwork.price > 0 ? (
                      <div className="flex flex-col gap-1 mt-auto">
                        <p className="text-[#B15FFF] font-bold text-sm">₱{artwork.price.toLocaleString()}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyNow(artwork);
                          }}
                          className="w-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white px-2 py-1 rounded text-[10px] font-medium hover:from-[#7C5FFF]/80 hover:to-[#FF5F9E]/80 transition-colors"
                        >
                          Buy Now
                        </button>
                      </div>
                    ) : (
                      <p className="text-green-400 font-bold text-sm mt-auto">Free Artwork</p>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display Only Artworks Section */}
      {artworks.filter(a => a.artwork_type === 'display_only').length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
            <Lock className="text-gray-400" size={24} />
            Display Only
          </h2>
          <p className="text-[#f2e9dd]/70 mb-6 text-sm">Exhibition pieces for viewing only</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {artworks.filter(a => a.artwork_type === 'display_only').map((artwork, idx) => (
              <div key={artwork.id} onClick={() => setSelectedArtwork(artwork)} className="h-full">
                <Card
                  noPadding
                  hover={true}
                  className="relative cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group border-2 border-gray-500/30 h-full flex flex-col"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="absolute top-3 right-3 z-20 bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Lock size={12} />
                    VIEW ONLY
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-gray-500/20 to-gray-700/20 flex items-center justify-center text-5xl sm:text-6xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {getImageUrl(artwork.primary_image) ? (
                      <img src={getImageUrl(artwork.primary_image)} alt={artwork.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">🎨</span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[#f2e9dd] mb-1 group-hover:text-gray-400 transition-colors">
                      {artwork.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#f2e9dd]/50 mb-2">by @{artwork.artist_username}</p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArtwork(artwork);
                      }}
                      variant="secondary"
                      className="w-full text-sm mt-auto"
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {artworks.length === 0 && (
        <Card className="p-8 text-center">
          <h3 className="text-xl font-bold text-[#f2e9dd] mb-2">No Artworks Yet</h3>
          <p className="text-[#f2e9dd]/70">This exhibition doesn't have any artworks yet.</p>
        </Card>
      )}

      {selectedArtwork && (
        <Modal isOpen={!!selectedArtwork} onClose={() => setSelectedArtwork(null)} title={selectedArtwork.title}>
          <div className="flex flex-col items-center">
            <div className="w-full max-h-[70vh] bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-8xl mb-4 rounded-lg overflow-hidden">
              {getImageUrl(selectedArtwork.primary_image) ? (
                <img src={getImageUrl(selectedArtwork.primary_image)} alt={selectedArtwork.title} className="w-full h-auto max-h-[70vh] object-contain" />
              ) : (
                <span>🎨</span>
              )}
            </div>
            {selectedArtwork.price && selectedArtwork.price > 0 ? (
              <p className="text-2xl font-bold text-[#f2e9dd] mb-2">₱{selectedArtwork.price.toLocaleString()}</p>
            ) : (
              <p className="text-2xl font-bold text-green-400 mb-2">Free Artwork</p>
            )}
            <p className="text-lg text-[#f2e9dd]/70 mb-6">by @{selectedArtwork.artist_username || selectedArtwork.artist}</p>
            <div className="flex gap-4 w-full">
              <Button
                onClick={() => handleSaveForLater(selectedArtwork)}
                variant="secondary"
                className="w-full"
              >
                Save for Later
              </Button>
              {selectedArtwork.price && selectedArtwork.price > 0 && (
                <Button
                  onClick={() => handleBuyNow(selectedArtwork)}
                  className="w-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50"
                >
                  Buy Now
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Exclusive Artwork Modal */}
      {showUploadModal && (
        <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Add Exclusive Artwork">
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#f2e9dd]">Artwork Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="exclusive-artwork-upload"
                />
                <label
                  htmlFor="exclusive-artwork-upload"
                  className="flex items-center justify-center w-full h-40 border-2 border-dashed border-[#f2e9dd]/20 rounded-lg cursor-pointer hover:border-yellow-500/50 transition-colors bg-[#1e1e1e]"
                >
                  {uploadForm.preview ? (
                    <div className="relative w-full h-full">
                      <img src={uploadForm.preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setUploadForm({ ...uploadForm, file: null, preview: null });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#f2e9dd]/50">
                      <Upload size={32} />
                      <span>Click to browse files</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#f2e9dd]">Title</label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="Enter artwork title"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#f2e9dd]">Description</label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Enter artwork description"
                className="w-full bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg p-3 text-[#f2e9dd] focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows="3"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#f2e9dd]">Price (₱)</label>
              <Input
                type="number"
                value={uploadForm.price}
                onChange={(e) => setUploadForm({ ...uploadForm, price: e.target.value })}
                placeholder="0 for display only"
                min="0"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#f2e9dd]">Category</label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg p-3 text-[#f2e9dd] focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="digital">Digital Art</option>
                <option value="painting">Painting</option>
                <option value="photography">Photography</option>
                <option value="sculpture">Sculpture</option>
                <option value="mixed_media">Mixed Media</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowUploadModal(false)}
                className="w-full"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Uploading...' : 'Upload Artwork'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-6 sm:mt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#f2e9dd] mb-3 sm:mb-4 flex items-center gap-2">
          <MessageSquare size={16} className="sm:hidden" />
          <MessageSquare size={18} className="hidden sm:block" />
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
    </div>
  );
};

export { ExhibitionPage };
