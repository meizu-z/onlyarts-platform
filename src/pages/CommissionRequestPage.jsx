import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Upload, X, DollarSign, Calendar, MessageSquare, ArrowLeft, Users } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { commissionService } from '../services';
import { consultationService } from '../services/consultation.service';
import { LoadingPaint } from '../components/ui/LoadingStates';
import { API_CONFIG } from '../config/api.config';

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const serverBaseUrl = API_CONFIG.baseURL.replace('/api', '');
  return `${serverBaseUrl}${imagePath}`;
};

const CommissionRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();

  // Get artist info from navigation state
  const [selectedArtist, setSelectedArtist] = useState(location.state?.artist || null);
  const [artists, setArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [showArtistSelection, setShowArtistSelection] = useState(!location.state?.artist);

  const [formData, setFormData] = useState({
    artworkType: '',
    deliveryFormat: 'digital',
    size: '',
    budgetMin: '',
    budgetMax: '',
    description: '',
    deadline: '',
    referenceImages: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch artists if no artist was provided
  useEffect(() => {
    if (showArtistSelection) {
      fetchArtists();
    }
  }, [showArtistSelection]);

  const fetchArtists = async () => {
    try {
      setLoadingArtists(true);
      const response = await consultationService.getAvailableArtists();
      setArtists(response.artists || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast.error('Failed to load artists');
    } finally {
      setLoadingArtists(false);
    }
  };

  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist);
    setShowArtistSelection(false);
  };

  const artworkTypes = [
    'Portrait',
    'Landscape',
    'Abstract',
    'Digital Art',
    'Character Design',
    'Illustration',
    'Concept Art',
    'Pet Portrait',
    'Other'
  ];

  const deliveryFormats = [
    { value: 'digital', label: 'Digital File', icon: '💾' },
    { value: 'nft', label: 'NFT', icon: '🎨' },
    { value: 'physical', label: 'Physical Artwork', icon: '📦' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.referenceImages.length + files.length > 5) {
      toast.error('Maximum 5 reference images allowed');
      return;
    }

    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      file: file // Store the actual File object
    }));

    setFormData(prev => ({
      ...prev,
      referenceImages: [...prev.referenceImages, ...newImages]
    }));
    toast.success(`${files.length} image(s) uploaded`);
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter(img => img.id !== imageId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.artworkType || !formData.description || !formData.budgetMin) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedArtist?.id) {
      toast.error('Artist information is missing');
      return;
    }

    try {
      setIsSubmitting(true);

      // Extract File objects from reference images
      const imageFiles = formData.referenceImages.map(img => img.file).filter(Boolean);

      // Submit commission request to backend
      const commissionData = {
        artistId: selectedArtist.id,
        artworkType: formData.artworkType,
        deliveryFormat: formData.deliveryFormat,
        size: formData.size,
        budgetMin: parseFloat(formData.budgetMin),
        budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
        description: formData.description,
        deadline: formData.deadline || null,
      };

      await commissionService.createCommission(commissionData, imageFiles);

      toast.success('Commission request submitted! 🎨');

      // Navigate back to artist profile
      navigate(`/profile/${selectedArtist?.username || selectedArtist?.id}`);
    } catch (error) {
      console.error('Error submitting commission:', error);
      toast.error(error.message || 'Failed to submit commission request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show artist selection screen if no artist is selected
  if (showArtistSelection) {
    if (loadingArtists) {
      return <LoadingPaint message="Loading artists..." />;
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-purple-400 hover:text-purple-300 mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Users className="text-purple-400" size={32} />
            <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd]">Select an Artist</h1>
          </div>
          <p className="text-sm md:text-base text-[#f2e9dd]/70">
            Choose an artist to request a commission from
          </p>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {artists.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-[#f2e9dd]/70 mb-4">No artists available at the moment</p>
              <Button onClick={() => navigate('/explore')}>Browse Explore Page</Button>
            </div>
          ) : (
            artists.map((artist) => (
              <Card key={artist.id} hover className="p-4 md:p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
                    {getImageUrl(artist.profile_image || artist.profileImage) ? (
                      <img
                        src={getImageUrl(artist.profile_image || artist.profileImage)}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{artist.avatar || '👤'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-[#f2e9dd] mb-1 truncate">{artist.name || artist.username}</h3>
                    <p className="text-sm text-[#f2e9dd]/60 mb-2">@{artist.username}</p>
                    {artist.specialty && (
                      <p className="text-xs font-semibold text-purple-400 mb-2">{artist.specialty}</p>
                    )}
                  </div>
                </div>

                {artist.description && (
                  <p className="text-sm text-[#f2e9dd]/70 mb-4 line-clamp-2">{artist.description}</p>
                )}

                <Button
                  onClick={() => handleArtistSelect(artist)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-sm md:text-base"
                >
                  <Sparkles size={16} className="mr-2" />
                  Request Commission
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-purple-400 hover:text-purple-300 mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl overflow-hidden">
              {getImageUrl(selectedArtist.profileImage || selectedArtist.profile_image) ? (
                <img
                  src={getImageUrl(selectedArtist.profileImage || selectedArtist.profile_image)}
                  alt={selectedArtist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>👤</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#f2e9dd] flex items-center gap-2">
                <Sparkles className="text-purple-400" size={24} />
                Request Commission
              </h1>
              <p className="text-sm md:text-base text-[#f2e9dd]/70 mt-1">
                from <span className="text-purple-400 font-semibold">{selectedArtist.name || selectedArtist.username}</span>
              </p>
              <button
                onClick={() => setShowArtistSelection(true)}
                className="text-xs md:text-sm text-purple-400 hover:text-purple-300 mt-1 flex items-center gap-1"
              >
                Change Artist
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Artwork Type */}
            <div>
              <label className="block text-[#f2e9dd] font-semibold mb-3">
                Artwork Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {artworkTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, artworkType: type }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.artworkType === type
                        ? 'border-purple-500 bg-purple-500/20 text-[#f2e9dd]'
                        : 'border-[#f2e9dd]/20 bg-[#1e1e1e]/50 text-[#f2e9dd]/70 hover:border-[#f2e9dd]/40'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Format */}
            <div>
              <label className="block text-[#f2e9dd] font-semibold mb-3">
                Delivery Format <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {deliveryFormats.map(format => (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, deliveryFormat: format.value }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.deliveryFormat === format.value
                        ? 'border-purple-500 bg-purple-500/20 text-[#f2e9dd]'
                        : 'border-[#f2e9dd]/20 bg-[#1e1e1e]/50 text-[#f2e9dd]/70 hover:border-[#f2e9dd]/40'
                    }`}
                  >
                    <div className="text-2xl mb-1">{format.icon}</div>
                    <div className="font-semibold">{format.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Size/Dimensions */}
            <div>
              <label className="block text-[#f2e9dd] font-semibold mb-2">
                Size/Dimensions
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="e.g., 1920x1080px, 24x36 inches, A4 size"
                className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg text-[#f2e9dd] focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Budget Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#f2e9dd] font-semibold mb-2">
                  <DollarSign className="inline" size={16} /> Min Budget (₱) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="budgetMin"
                  value={formData.budgetMin}
                  onChange={handleChange}
                  placeholder="5000"
                  min="0"
                  className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg text-[#f2e9dd] focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[#f2e9dd] font-semibold mb-2">
                  <DollarSign className="inline" size={16} /> Max Budget (₱)
                </label>
                <input
                  type="number"
                  name="budgetMax"
                  value={formData.budgetMax}
                  onChange={handleChange}
                  placeholder="15000"
                  min="0"
                  className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg text-[#f2e9dd] focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-[#f2e9dd] font-semibold mb-2">
                <Calendar className="inline" size={16} /> Preferred Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg text-[#f2e9dd] focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[#f2e9dd] font-semibold mb-2">
                <MessageSquare className="inline" size={16} /> Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your vision in detail... What style, mood, colors, subjects do you want? Any specific requirements?"
                rows="6"
                className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg text-[#f2e9dd] focus:outline-none focus:border-purple-500 resize-none"
                required
              />
              <p className="text-[#f2e9dd]/50 text-sm mt-2">
                Be as detailed as possible to help the artist understand your vision
              </p>
            </div>

            {/* Reference Images */}
            <div>
              <label className="block text-[#f2e9dd] font-semibold mb-2">
                <Upload className="inline" size={16} /> Reference Images (Optional)
              </label>
              <div className="border-2 border-dashed border-[#f2e9dd]/20 rounded-lg p-6 text-center hover:border-[#f2e9dd]/40 transition-colors">
                <input
                  type="file"
                  id="reference-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="reference-upload" className="cursor-pointer">
                  <Upload className="mx-auto mb-2 text-[#f2e9dd]/50" size={32} />
                  <p className="text-[#f2e9dd]/70">Click to upload reference images</p>
                  <p className="text-[#f2e9dd]/40 text-sm mt-1">(Max 5 images, up to 10MB each)</p>
                </label>
              </div>

              {/* Image Preview */}
              {formData.referenceImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                  {formData.referenceImages.map(image => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 md:gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold text-sm md:text-lg py-2.5 md:py-4"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Sparkles size={18} className="inline mr-2" />
                    <span className="hidden sm:inline">Submit Commission Request</span>
                    <span className="sm:hidden">Submit Request</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => navigate(-1)}
                variant="secondary"
                className="px-4 md:px-8"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Box */}
        <Card className="mt-6 p-6 bg-blue-900/20 border-blue-800/30">
          <h3 className="text-[#f2e9dd] font-semibold mb-3">📋 What happens next?</h3>
          <ul className="space-y-2 text-[#f2e9dd]/70 text-sm">
            <li>• The artist will review your request within 24-48 hours</li>
            <li>• They may accept, decline, or propose a different price/timeline</li>
            <li>• Once accepted, you'll receive a payment link</li>
            <li>• The artist will start working after payment confirmation</li>
            <li>• You'll receive progress updates and the final artwork</li>
          </ul>
        </Card>
    </div>
  );
};

export default CommissionRequestPage;
