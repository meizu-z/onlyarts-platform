import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useToast } from '../components/ui/Toast';
import { artworkService } from '../services/artwork.service';
import { Upload, Image as ImageIcon, DollarSign, ArrowLeft, Loader } from 'lucide-react';

// Demo mode flag - set to false when backend is ready
const USE_DEMO_MODE = true;

const CreateArtworkPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Form state
  const [isForSale, setIsForSale] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('🎨');
  const [previewUrl, setPreviewUrl] = useState(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePostArtwork = async () => {
    // Validation
    if (!title.trim()) {
      toast.error('Please enter a title for your artwork');
      return;
    }

    if (isForSale && !price) {
      toast.error('Please enter a price');
      return;
    }

    if (!USE_DEMO_MODE && !imageFile) {
      toast.error('Please upload an image');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const artworkData = {
        title: title.trim(),
        description: description.trim(),
        forSale: isForSale,
        ...(isForSale && { price: parseFloat(price) }),
      };

      // DEMO MODE: Simulate upload
      if (USE_DEMO_MODE) {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(i);
        }

        if (isForSale) {
          toast.success(`"${title}" has been posted for sale at ₱${parseInt(price).toLocaleString()}! 🎨`);
        } else {
          toast.success(`"${title}" has been posted successfully! 🎨`);
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        return;
      }

      // REAL API MODE: Call backend
      const response = await artworkService.createArtwork(
        artworkData,
        imageFile,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      );

      toast.success('Artwork posted successfully! 🎨');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error posting artwork:', error);
      toast.error(error.message || 'Failed to post artwork. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-6 transform hover:scale-105 transition-all duration-200"
      >
        <ArrowLeft size={16} className="mr-2" /> Back
      </Button>

      <h1 className="text-4xl font-bold text-[#f2e9dd] mb-2">Post Artwork</h1>
      <p className="text-[#f2e9dd]/70 mb-8">Share your masterpiece with the OnlyArts community</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Preview Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
            <ImageIcon size={20} /> Preview
          </h2>
          <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 rounded-lg flex items-center justify-center text-9xl mb-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                {previewImage}
              </span>
            )}
            {isForSale && price && (
              <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                ₱{parseInt(price).toLocaleString()}
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col gap-2">
                <Loader className="animate-spin text-[#7C5FFF]" size={48} />
                <p className="text-white font-bold">{uploadProgress}%</p>
              </div>
            )}
          </div>
          <label className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-[#7C5FFF] transition-all duration-300 cursor-pointer group block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <Upload className="mx-auto mb-2 text-[#f2e9dd]/50 group-hover:text-[#B15FFF] transform group-hover:scale-110 transition-all duration-300" size={32} />
            <p className="text-[#f2e9dd]/70 group-hover:text-[#f2e9dd] transition-colors">
              {imageFile ? imageFile.name : 'Click to upload artwork'}
            </p>
            <p className="text-sm text-[#f2e9dd]/50">PNG, JPG up to 10MB</p>
          </label>
        </Card>

        {/* Form Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#f2e9dd] mb-4">Artwork Details</h2>

          <div className="space-y-4">
            <Input
              label="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter artwork title"
            />

            <div>
              <label className="block text-sm text-[#f2e9dd]/70 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 h-32 transition-all duration-200"
                placeholder="Tell us about your artwork..."
              />
            </div>

            <div>
              <label className="block text-sm text-[#f2e9dd]/70 mb-3">Artwork Type *</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-lg border border-white/10 hover:border-[#7C5FFF]/50 transition-all cursor-pointer group">
                  <input
                    type="radio"
                    name="artworkType"
                    value="normal"
                    checked={!isForSale}
                    onChange={() => setIsForSale(false)}
                    className="w-5 h-5 accent-[#7C5FFF]"
                  />
                  <div>
                    <p className="text-[#f2e9dd] font-semibold group-hover:text-[#B15FFF] transition-colors">Normal Artwork</p>
                    <p className="text-sm text-[#f2e9dd]/50">Share your art with the community</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-lg border border-white/10 hover:border-[#7C5FFF]/50 transition-all cursor-pointer group">
                  <input
                    type="radio"
                    name="artworkType"
                    value="forSale"
                    checked={isForSale}
                    onChange={() => setIsForSale(true)}
                    className="w-5 h-5 accent-[#7C5FFF]"
                  />
                  <div>
                    <p className="text-[#f2e9dd] font-semibold group-hover:text-[#B15FFF] transition-colors flex items-center gap-2">
                      <DollarSign size={16} /> For Sale
                    </p>
                    <p className="text-sm text-[#f2e9dd]/50">Make your artwork available for purchase</p>
                  </div>
                </label>
              </div>
            </div>

            {isForSale && (
              <div className="animate-fadeIn">
                <Input
                  type="number"
                  label="Price (PHP) *"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price in Philippine Peso"
                />
              </div>
            )}

            <div className="pt-4 space-y-3">
              <Button
                onClick={handlePostArtwork}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="animate-spin" size={18} />
                    Uploading... {uploadProgress}%
                  </span>
                ) : (
                  'Post Artwork'
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                disabled={uploading}
                className="w-full transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateArtworkPage;
