import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useToast } from '../components/ui/Toast';
import PremiumBadge from '../components/common/PremiumBadge';
import { Calendar, Users, Image as ImageIcon, ArrowLeft, Sparkles, Lock, Crown, Upload, X, Plus } from 'lucide-react';
import { exhibitionService } from '../services/exhibition.service';
import { artworkService } from '../services/artwork.service';

const HostExhibitionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exhibitionType, setExhibitionType] = useState('solo');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [collaborators, setCollaborators] = useState('');
  const [maxArtworks, setMaxArtworks] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Artwork upload state
  const [uploadedArtworks, setUploadedArtworks] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // Cover photo state
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);

  // Check subscription tier
  const canHostSolo = user?.subscription === 'basic' || user?.subscription === 'premium';
  const canHostCollab = user?.subscription === 'premium';
  const isPremium = user?.subscription === 'premium';

  // Artwork limits based on tier
  const artworkLimits = {
    free: 0,
    basic: 20,
    premium: 50,
  };

  const maxAllowedArtworks = artworkLimits[user?.subscription] || 0;

  const handleTypeChange = (type) => {
    if (type === 'solo' && !canHostSolo) {
      toast.error('Solo exhibitions require Basic or Premium membership');
      setTimeout(() => navigate('/subscriptions'), 1500);
      return;
    }

    if (type === 'collab' && !canHostCollab) {
      toast.error('Collaborative exhibitions require Premium membership');
      setTimeout(() => navigate('/subscriptions'), 1500);
      return;
    }

    setExhibitionType(type);
  };

  // Handle file selection
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('Please select image files only');
      return;
    }

    if (uploadedArtworks.length + imageFiles.length > maxAllowedArtworks) {
      toast.error(`You can only upload up to ${maxAllowedArtworks} artworks`);
      return;
    }

    const newArtworks = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      description: '',
      price: 0,
      category: 'digital',
    }));

    setUploadedArtworks([...uploadedArtworks, ...newArtworks]);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Remove artwork
  const removeArtwork = (id) => {
    const artwork = uploadedArtworks.find(a => a.id === id);
    if (artwork) {
      URL.revokeObjectURL(artwork.preview);
    }
    setUploadedArtworks(uploadedArtworks.filter(a => a.id !== id));
  };

  // Update artwork metadata
  const updateArtwork = (id, field, value) => {
    setUploadedArtworks(uploadedArtworks.map(artwork =>
      artwork.id === id ? { ...artwork, [field]: value } : artwork
    ));
  };

  // Handle cover photo selection
  const handleCoverPhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setCoverPhoto(file);
    setCoverPhotoPreview(URL.createObjectURL(file));
  };

  // Remove cover photo
  const removeCoverPhoto = () => {
    if (coverPhotoPreview) {
      URL.revokeObjectURL(coverPhotoPreview);
    }
    setCoverPhoto(null);
    setCoverPhotoPreview(null);
  };

  const handleHostExhibition = async () => {
    if (!canHostSolo) {
      toast.error('You need Basic or Premium membership to host exhibitions');
      setTimeout(() => navigate('/subscriptions'), 1500);
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter an exhibition title');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter an exhibition description');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    if (exhibitionType === 'collab' && !collaborators.trim()) {
      toast.error('Please add collaborator usernames');
      return;
    }

    if (maxArtworks > maxAllowedArtworks) {
      toast.error(`Your tier allows up to ${maxAllowedArtworks} artworks`);
      return;
    }

    // Validate uploaded artworks
    if (uploadedArtworks.length > 0) {
      for (const artwork of uploadedArtworks) {
        if (!artwork.title.trim()) {
          toast.error('Please provide a title for all artworks');
          return;
        }
        if (!artwork.description.trim()) {
          toast.error('Please provide a description for all artworks');
          return;
        }
        if (artwork.price < 0) {
          toast.error('Artwork price must be 0 or greater');
          return;
        }
      }
    }

    try {
      setIsLoading(true);

      let artworkIds = [];

      // Step 1: Upload artworks if any
      if (uploadedArtworks.length > 0) {
        toast.info(`Uploading ${uploadedArtworks.length} artwork(s)...`);

        const uploadPromises = uploadedArtworks.map(async (artwork) => {
          const artworkData = {
            title: artwork.title.trim(),
            description: artwork.description.trim(),
            price: parseFloat(artwork.price) || 0,
            category: artwork.category,
            status: 'published',
          };

          const response = await artworkService.createArtwork(
            artworkData,
            artwork.file,
            null // No progress callback for simplicity
          );

          return response.id;
        });

        artworkIds = await Promise.all(uploadPromises);
        toast.success(`${artworkIds.length} artwork(s) uploaded successfully!`);
      }

      // Step 2: Create exhibition with artwork IDs
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('isPrivate', 'false');

      if (artworkIds.length > 0) {
        formData.append('artworkIds', JSON.stringify(artworkIds));
      }

      if (coverPhoto) {
        formData.append('image', coverPhoto);
      }

      const result = await exhibitionService.createExhibition(formData);

      toast.success(`Your ${exhibitionType} exhibition "${title}" has been created! 🎭`);

      // Clean up preview URLs
      uploadedArtworks.forEach(artwork => URL.revokeObjectURL(artwork.preview));
      if (coverPhotoPreview) {
        URL.revokeObjectURL(coverPhotoPreview);
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Failed to create exhibition:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to create exhibition');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-4 sm:mb-6 transform hover:scale-105 transition-all duration-200"
      >
        <ArrowLeft size={16} className="mr-2" /> Back
      </Button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#f2e9dd] mb-2">Host an Exhibition</h1>
          <p className="text-[#f2e9dd]/70 text-sm sm:text-base">Showcase your artworks in a curated exhibition</p>
        </div>
        {canHostSolo && <PremiumBadge tier={user?.subscription} size="md" />}
      </div>

      {/* Tier Info Banner */}
      {!canHostSolo && (
        <Card className="mb-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
          <div className="p-4 flex items-start gap-4">
            <Lock size={24} className="text-indigo-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-[#f2e9dd] mb-2">Basic Membership Required</h3>
              <p className="text-sm text-[#f2e9dd]/70 mb-3">
                Solo exhibitions are available for Basic and Premium members. Upgrade to showcase your work!
              </p>
              <Button
                onClick={() => navigate('/subscriptions')}
                className="bg-gradient-to-r from-indigo-500 to-purple-500"
              >
                <Crown size={16} className="mr-2" />
                Upgrade to Basic
              </Button>
            </div>
          </div>
        </Card>
      )}

      {canHostSolo && (
        <Card className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <div className="p-4">
            <h3 className="font-semibold text-[#f2e9dd] mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-green-400" />
              Your Exhibition Benefits
            </h3>
            <ul className="text-sm text-[#f2e9dd]/80 space-y-1">
              <li>• Up to {maxAllowedArtworks} artworks per exhibition</li>
              <li>• Upload new artworks directly to exhibitions</li>
              <li>• Custom exhibition URL</li>
              <li>• Advanced analytics and insights</li>
              {isPremium && (
                <>
                  <li>• Premium placement in Explore</li>
                  <li>• Collaborative exhibitions</li>
                  <li>• Event collaboration features</li>
                </>
              )}
            </ul>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Form Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Exhibition Details Card */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#f2e9dd] mb-3 sm:mb-4">Exhibition Details</h2>

            <div className="space-y-3 sm:space-y-4">
              <Input
                label="Exhibition Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter exhibition title"
              />

              <div>
                <label className="block text-xs sm:text-sm text-[#f2e9dd]/70 mb-2">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 h-24 sm:h-32 transition-all duration-200 text-sm sm:text-base"
                  placeholder="Describe your exhibition theme and vision..."
                />
              </div>

              {/* Cover Photo Upload */}
              <div>
                <label className="block text-xs sm:text-sm text-[#f2e9dd]/70 mb-2">Cover Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoSelect}
                  className="hidden"
                  id="cover-photo-upload"
                />
                <label
                  htmlFor="cover-photo-upload"
                  className="flex items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-[#f2e9dd]/20 rounded-lg cursor-pointer hover:border-[#7C5FFF]/50 transition-colors bg-[#121212] group"
                >
                  {coverPhotoPreview ? (
                    <div className="relative w-full h-full">
                      <img src={coverPhotoPreview} alt="Cover preview" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeCoverPhoto();
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#f2e9dd]/50 group-hover:text-[#7C5FFF]/70 transition-colors">
                      <Upload size={24} className="sm:hidden" />
                      <Upload size={32} className="hidden sm:block" />
                      <span className="text-xs sm:text-sm">Click to upload cover photo</span>
                      <span className="text-[10px] sm:text-xs text-[#f2e9dd]/30">Recommended: 1200x400px</span>
                    </div>
                  )}
                </label>
                <p className="text-[10px] sm:text-xs text-[#f2e9dd]/50 mt-1">Optional: Add a cover photo for your exhibition (shown in explore page)</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-[#f2e9dd]/70 mb-2 sm:mb-3">Exhibition Type *</label>
                <div className="space-y-2 sm:space-y-3">
                  <label className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border transition-all ${
                    canHostSolo
                      ? 'border-white/10 hover:border-[#7C5FFF]/50 cursor-pointer'
                      : 'border-white/5 bg-gray-800/20 cursor-not-allowed opacity-50'
                  } group`}>
                    <input
                      type="radio"
                      name="exhibitionType"
                      value="solo"
                      checked={exhibitionType === 'solo'}
                      onChange={() => handleTypeChange('solo')}
                      disabled={!canHostSolo}
                      className="w-4 h-4 sm:w-5 sm:h-5 accent-[#7C5FFF]"
                    />
                    <div className="flex-1">
                      <p className="text-[#f2e9dd] font-semibold group-hover:text-[#B15FFF] transition-colors flex items-center gap-2 text-sm sm:text-base">
                        <Sparkles size={14} className="sm:hidden" />
                        <Sparkles size={16} className="hidden sm:block" />
                        Solo Exhibition
                        {!canHostSolo && <Lock size={14} className="text-[#f2e9dd]/40" />}
                      </p>
                      <p className="text-xs sm:text-sm text-[#f2e9dd]/50">
                        {canHostSolo ? 'Showcase only your artworks' : 'Requires Basic or Premium'}
                      </p>
                    </div>
                    {canHostSolo && <PremiumBadge tier="basic" size="sm" showLabel={false} />}
                  </label>

                  <label className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border transition-all ${
                    canHostCollab
                      ? 'border-white/10 hover:border-[#7C5FFF]/50 cursor-pointer'
                      : 'border-white/5 bg-gray-800/20 cursor-not-allowed opacity-50'
                  } group`}>
                    <input
                      type="radio"
                      name="exhibitionType"
                      value="collab"
                      checked={exhibitionType === 'collab'}
                      onChange={() => handleTypeChange('collab')}
                      disabled={!canHostCollab}
                      className="w-4 h-4 sm:w-5 sm:h-5 accent-[#7C5FFF]"
                    />
                    <div className="flex-1">
                      <p className="text-[#f2e9dd] font-semibold group-hover:text-[#B15FFF] transition-colors flex items-center gap-2 text-sm sm:text-base">
                        <Users size={14} className="sm:hidden" />
                        <Users size={16} className="hidden sm:block" />
                        Collaboration
                        {!canHostCollab && <Lock size={14} className="text-[#f2e9dd]/40" />}
                      </p>
                      <p className="text-xs sm:text-sm text-[#f2e9dd]/50">
                        {canHostCollab ? 'Collaborate with other artists' : 'Requires Premium'}
                      </p>
                    </div>
                    {canHostCollab && <PremiumBadge tier="premium" size="sm" showLabel={false} />}
                  </label>
                </div>
              </div>

              {exhibitionType === 'collab' && (
                <div className="animate-fadeIn">
                  <Input
                    label="Collaborators *"
                    value={collaborators}
                    onChange={(e) => setCollaborators(e.target.value)}
                    placeholder="@artist1, @artist2, @artist3"
                  />
                  <p className="text-xs sm:text-sm text-[#f2e9dd]/50 mt-1">Separate usernames with commas</p>
                </div>
              )}

              {/* Quick Date Selection */}
              <div className="animate-fadeIn">
                <label className="block text-xs sm:text-sm text-[#f2e9dd]/70 mb-2">Quick Start Options</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      const nextMonth = new Date();
                      nextMonth.setMonth(nextMonth.getMonth() + 1);
                      setStartDate(today);
                      setEndDate(nextMonth.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs sm:text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#7C5FFF] rounded-lg transition-all text-[#f2e9dd] hover:text-[#7C5FFF]"
                  >
                    <Calendar size={14} className="inline mr-1" />
                    Start Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      const nextMonth = new Date();
                      nextMonth.setMonth(nextMonth.getMonth() + 1);
                      setStartDate(nextWeek.toISOString().split('T')[0]);
                      setEndDate(nextMonth.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs sm:text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#7C5FFF] rounded-lg transition-all text-[#f2e9dd] hover:text-[#7C5FFF]"
                  >
                    <Calendar size={14} className="inline mr-1" />
                    Start Next Week
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMonth = new Date();
                      nextMonth.setMonth(nextMonth.getMonth() + 1);
                      const twoMonths = new Date();
                      twoMonths.setMonth(twoMonths.getMonth() + 2);
                      setStartDate(nextMonth.toISOString().split('T')[0]);
                      setEndDate(twoMonths.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 text-xs sm:text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#7C5FFF] rounded-lg transition-all text-[#f2e9dd] hover:text-[#7C5FFF]"
                  >
                    <Calendar size={14} className="inline mr-1" />
                    Start Next Month
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  type="date"
                  label="Start Date *"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  type="date"
                  label="End Date *"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Artwork Upload Card */}
          {canHostSolo && (
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#f2e9dd] mb-3 sm:mb-4 flex items-center gap-2">
                <Upload size={20} />
                Upload Exclusive Artworks (Optional)
              </h2>
              <p className="text-sm text-[#f2e9dd]/60 mb-4">
                Upload new artworks directly to this exhibition. From raw files to launch-ready in seconds!
              </p>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging
                    ? 'border-[#7C5FFF] bg-[#7C5FFF]/10'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <Upload size={48} className="mx-auto text-[#f2e9dd]/40 mb-4" />
                <p className="text-[#f2e9dd]/70 mb-2">Drag and drop images here, or</p>
                <input
                  type="file"
                  id="artwork-upload"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  disabled={uploadedArtworks.length >= maxAllowedArtworks}
                />
                <label
                  htmlFor="artwork-upload"
                  className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    uploadedArtworks.length >= maxAllowedArtworks
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-[#2a2a2a] text-[#f2e9dd] hover:bg-[#3a3a3a] cursor-pointer border border-white/10'
                  }`}
                >
                  <Plus size={16} className="mr-2" />
                  Browse Files
                </label>
                <p className="text-xs text-[#f2e9dd]/50 mt-3">
                  {uploadedArtworks.length} / {maxAllowedArtworks} artworks uploaded
                </p>
              </div>

              {/* Uploaded Artworks List */}
              {uploadedArtworks.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-[#f2e9dd]">Uploaded Artworks ({uploadedArtworks.length})</h3>
                  {uploadedArtworks.map((artwork) => (
                    <Card key={artwork.id} className="p-4 bg-white/5">
                      <div className="flex gap-4">
                        {/* Preview Image */}
                        <div className="w-24 h-24 flex-shrink-0">
                          <img
                            src={artwork.preview}
                            alt={artwork.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Artwork Details Form */}
                        <div className="flex-1 space-y-3">
                          <Input
                            label="Title *"
                            value={artwork.title}
                            onChange={(e) => updateArtwork(artwork.id, 'title', e.target.value)}
                            placeholder="Artwork title"
                            size="sm"
                          />
                          <div>
                            <label className="block text-xs text-[#f2e9dd]/70 mb-1">Description *</label>
                            <textarea
                              value={artwork.description}
                              onChange={(e) => updateArtwork(artwork.id, 'description', e.target.value)}
                              placeholder="Artwork description"
                              className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-[#f2e9dd] text-sm focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 h-20"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              label="Price (₱)"
                              type="number"
                              value={artwork.price}
                              onChange={(e) => updateArtwork(artwork.id, 'price', e.target.value)}
                              placeholder="0"
                              size="sm"
                            />
                            <div>
                              <label className="block text-xs text-[#f2e9dd]/70 mb-1">Category</label>
                              <select
                                value={artwork.category}
                                onChange={(e) => updateArtwork(artwork.id, 'category', e.target.value)}
                                className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-[#f2e9dd] text-sm focus:outline-none focus:border-[#7C5FFF]"
                              >
                                <option value="digital">Digital</option>
                                <option value="painting">Painting</option>
                                <option value="photography">Photography</option>
                                <option value="sculpture">Sculpture</option>
                                <option value="illustration">Illustration</option>
                                <option value="mixed_media">Mixed Media</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeArtwork(artwork.id)}
                          className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <Button
              onClick={handleHostExhibition}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Creating Exhibition...' : 'Host Exhibition'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              disabled={isLoading}
              className="w-full transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Preview Section - Takes 1 column */}
        <div className="lg:col-span-1">
          <Card className="p-4 sm:p-6 sticky top-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#f2e9dd] mb-3 sm:mb-4 flex items-center gap-2">
              <ImageIcon size={20} />
              Preview
            </h2>
            <div className="aspect-video bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 rounded-lg flex items-center justify-center text-6xl mb-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">🖼️</span>
              {exhibitionType && (
                <div className="absolute top-2 right-2 bg-[#7C5FFF]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                  {exhibitionType === 'solo' ? 'Solo' : 'Collaboration'}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-[#f2e9dd]/50 mb-1">Exhibition Title</p>
                <p className="text-[#f2e9dd] font-semibold text-sm">{title || 'Untitled Exhibition'}</p>
              </div>

              {startDate && endDate && (
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-[#f2e9dd]/50 mb-1 flex items-center gap-2">
                    <Calendar size={14} /> Duration
                  </p>
                  <p className="text-[#f2e9dd] text-sm">
                    {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {uploadedArtworks.length > 0 && (
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-[#f2e9dd]/50 mb-1">Artworks</p>
                  <p className="text-[#f2e9dd] font-semibold text-sm">{uploadedArtworks.length} pieces</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HostExhibitionPage;
