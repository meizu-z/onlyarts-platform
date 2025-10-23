import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useToast } from '../components/ui/Toast';
import { Upload, Image as ImageIcon, DollarSign, ArrowLeft } from 'lucide-react';

const CreateArtworkPage = () => {
  const navigate = useNavigate();
  const [isForSale, setIsForSale] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [previewImage, setPreviewImage] = useState('🎨');
  const toast = useToast();

  const handlePostArtwork = () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your artwork');
      return;
    }

    if (isForSale && !price) {
      toast.error('Please enter a price');
      return;
    }

    if (isForSale) {
      toast.success(`"${title}" has been posted for sale at ₱${parseInt(price).toLocaleString()}! 🎨`);
    } else {
      toast.success(`"${title}" has been posted successfully! 🎨`);
    }

    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
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
            <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
              {previewImage}
            </span>
            {isForSale && price && (
              <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                ₱{parseInt(price).toLocaleString()}
              </div>
            )}
          </div>
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-[#7C5FFF] transition-all duration-300 cursor-pointer group">
            <Upload className="mx-auto mb-2 text-[#f2e9dd]/50 group-hover:text-[#B15FFF] transform group-hover:scale-110 transition-all duration-300" size={32} />
            <p className="text-[#f2e9dd]/70 group-hover:text-[#f2e9dd] transition-colors">Click to upload artwork</p>
            <p className="text-sm text-[#f2e9dd]/50">PNG, JPG up to 10MB</p>
          </div>
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
                className="w-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
              >
                Post Artwork
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="w-full transform hover:scale-105 transition-all duration-200"
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
