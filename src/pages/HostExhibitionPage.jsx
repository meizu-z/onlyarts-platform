import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useToast } from '../components/ui/Toast';
import PremiumBadge from '../components/common/PremiumBadge';
import { Calendar, Users, Image as ImageIcon, ArrowLeft, Sparkles, Lock, Crown } from 'lucide-react';

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
  const toast = useToast();

  // Check subscription tier
  const canHostSolo = user?.subscription === 'plus' || user?.subscription === 'premium';
  const canHostCollab = user?.subscription === 'premium';
  const isPremium = user?.subscription === 'premium';

  // Artwork limits based on tier
  const artworkLimits = {
    free: 0,
    plus: 20,
    premium: 50,
  };

  const maxAllowedArtworks = artworkLimits[user?.subscription] || 0;

  const handleTypeChange = (type) => {
    if (type === 'solo' && !canHostSolo) {
      toast.error('Solo exhibitions require Plus or Premium membership');
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

  const handleHostExhibition = () => {
    if (!canHostSolo) {
      toast.error('You need Plus or Premium membership to host exhibitions');
      setTimeout(() => navigate('/subscriptions'), 1500);
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter an exhibition title');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
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

    toast.success(`Your ${exhibitionType} exhibition "${title}" has been scheduled! 🎭`);

    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="flex-1 p-3 sm:p-6 max-w-5xl mx-auto">
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
              <h3 className="font-bold text-lg text-[#f2e9dd] mb-2">Plus Membership Required</h3>
              <p className="text-sm text-[#f2e9dd]/70 mb-3">
                Solo exhibitions are available for Plus and Premium members. Upgrade to showcase your work!
              </p>
              <Button
                onClick={() => navigate('/subscriptions')}
                className="bg-gradient-to-r from-indigo-500 to-purple-500"
              >
                <Crown size={16} className="mr-2" />
                Upgrade to Plus
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {/* Preview Section */}
        <Card className="p-4 sm:p-6 order-2 md:order-1">
          <h2 className="text-lg sm:text-xl font-bold text-[#f2e9dd] mb-3 sm:mb-4 flex items-center gap-2">
            <ImageIcon size={18} className="sm:hidden" />
            <ImageIcon size={20} className="hidden sm:block" />
            Exhibition Preview
          </h2>
          <div className="aspect-video bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 rounded-lg flex items-center justify-center text-6xl sm:text-8xl md:text-9xl mb-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">🖼️</span>
            {exhibitionType && (
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-[#7C5FFF]/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                {exhibitionType === 'solo' ? 'Solo' : 'Collaboration'}
              </div>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white/5 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-[#f2e9dd]/50 mb-1">Exhibition Title</p>
              <p className="text-[#f2e9dd] font-semibold text-sm sm:text-base">{title || 'Untitled Exhibition'}</p>
            </div>

            {startDate && endDate && (
              <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-[#f2e9dd]/50 mb-1 flex items-center gap-2">
                  <Calendar size={14} /> Duration
                </p>
                <p className="text-[#f2e9dd] text-sm sm:text-base">
                  {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Form Section */}
        <Card className="p-4 sm:p-6 order-1 md:order-2">
          <h2 className="text-lg sm:text-xl font-bold text-[#f2e9dd] mb-3 sm:mb-4">Exhibition Details</h2>

          <div className="space-y-3 sm:space-y-4">
            <Input
              label="Exhibition Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter exhibition title"
            />

            <div>
              <label className="block text-xs sm:text-sm text-[#f2e9dd]/70 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 h-24 sm:h-32 transition-all duration-200 text-sm sm:text-base"
                placeholder="Describe your exhibition theme and vision..."
              />
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
                      {canHostSolo ? 'Showcase only your artworks' : 'Requires Plus or Premium'}
                    </p>
                  </div>
                  {canHostSolo && <PremiumBadge tier="plus" size="sm" showLabel={false} />}
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

            {/* Artwork Limit */}
            {canHostSolo && (
              <div className="animate-fadeIn">
                <label className="block text-xs sm:text-sm text-[#f2e9dd]/70 mb-2">
                  Number of Artworks *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={maxAllowedArtworks}
                    value={maxArtworks}
                    onChange={(e) => setMaxArtworks(Math.min(parseInt(e.target.value) || 1, maxAllowedArtworks))}
                    className="flex-1 bg-[#121212] border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 text-sm sm:text-base"
                  />
                  <span className="text-sm text-[#f2e9dd]/50 whitespace-nowrap">
                    / {maxAllowedArtworks} max
                  </span>
                </div>
                <p className="text-xs text-[#f2e9dd]/50 mt-1">
                  Your {user?.subscription} tier allows up to {maxAllowedArtworks} artworks
                </p>
              </div>
            )}

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

            <div className="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
              <Button
                onClick={handleHostExhibition}
                className="w-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
              >
                Host Exhibition
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

export default HostExhibitionPage;
