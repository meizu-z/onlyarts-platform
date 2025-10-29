import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Upload, X, DollarSign, Calendar, MessageSquare, ArrowLeft } from 'lucide-react';
import MainLayout from '../components/layouts/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

const CommissionRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();

  // Get artist info from navigation state
  const artist = location.state?.artist;

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

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Save to localStorage
    const newRequest = {
      id: `COM-${Date.now()}`,
      artistId: artist?.id || 'artist-1',
      artistName: artist?.name || 'Unknown Artist',
      artistImage: artist?.profileImage || 'https://via.placeholder.com/150',
      userId: user?.id,
      userName: user?.name || user?.username || 'Anonymous',
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const existingRequests = JSON.parse(localStorage.getItem('commissionRequests') || '[]');
    localStorage.setItem('commissionRequests', JSON.stringify([newRequest, ...existingRequests]));

    toast.success('Commission request submitted! 🎨');
    setIsSubmitting(false);

    // Navigate back to artist profile
    navigate(`/profile/${artist?.username}`);
  };

  if (!artist) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-[#f2e9dd] mb-4">Artist Not Found</h2>
          <p className="text-[#f2e9dd]/70 mb-6">Please select an artist to request a commission.</p>
          <Button onClick={() => navigate('/explore')}>Browse Artists</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
              {artist.profileImage || '👤'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#f2e9dd] flex items-center gap-2">
                <Sparkles className="text-purple-400" size={28} />
                Request Commission
              </h1>
              <p className="text-[#f2e9dd]/70 mt-1">
                from <span className="text-purple-400 font-semibold">{artist.name}</span>
              </p>
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
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold text-lg py-4"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Sparkles size={20} className="inline mr-2" />
                    Submit Commission Request
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => navigate(-1)}
                variant="secondary"
                className="px-8"
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
    </MainLayout>
  );
};

export default CommissionRequestPage;
