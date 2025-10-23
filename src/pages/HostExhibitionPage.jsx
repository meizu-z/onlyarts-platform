import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useToast } from '../components/ui/Toast';
import { Calendar, Users, Image as ImageIcon, ArrowLeft, Sparkles } from 'lucide-react';

const HostExhibitionPage = () => {
  const navigate = useNavigate();
  const [exhibitionType, setExhibitionType] = useState('solo');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [collaborators, setCollaborators] = useState('');
  const toast = useToast();

  const handleHostExhibition = () => {
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

    toast.success(`Your ${exhibitionType} exhibition "${title}" has been scheduled! 🎭`);

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

      <h1 className="text-4xl font-bold text-[#f2e9dd] mb-2">Host an Exhibition</h1>
      <p className="text-[#f2e9dd]/70 mb-8">Showcase your artworks in a curated exhibition</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Preview Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
            <ImageIcon size={20} /> Exhibition Preview
          </h2>
          <div className="aspect-video bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 rounded-lg flex items-center justify-center text-9xl mb-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">🖼️</span>
            {exhibitionType && (
              <div className="absolute top-3 right-3 bg-[#7C5FFF]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                {exhibitionType === 'solo' ? 'Solo' : 'Collaboration'}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-[#f2e9dd]/50 mb-1">Exhibition Title</p>
              <p className="text-[#f2e9dd] font-semibold">{title || 'Untitled Exhibition'}</p>
            </div>

            {startDate && endDate && (
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-[#f2e9dd]/50 mb-1 flex items-center gap-2">
                  <Calendar size={14} /> Duration
                </p>
                <p className="text-[#f2e9dd]">
                  {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Form Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#f2e9dd] mb-4">Exhibition Details</h2>

          <div className="space-y-4">
            <Input
              label="Exhibition Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter exhibition title"
            />

            <div>
              <label className="block text-sm text-[#f2e9dd]/70 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 h-32 transition-all duration-200"
                placeholder="Describe your exhibition theme and vision..."
              />
            </div>

            <div>
              <label className="block text-sm text-[#f2e9dd]/70 mb-3">Exhibition Type *</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-lg border border-white/10 hover:border-[#7C5FFF]/50 transition-all cursor-pointer group">
                  <input
                    type="radio"
                    name="exhibitionType"
                    value="solo"
                    checked={exhibitionType === 'solo'}
                    onChange={() => setExhibitionType('solo')}
                    className="w-5 h-5 accent-[#7C5FFF]"
                  />
                  <div>
                    <p className="text-[#f2e9dd] font-semibold group-hover:text-[#B15FFF] transition-colors flex items-center gap-2">
                      <Sparkles size={16} /> Solo Exhibition
                    </p>
                    <p className="text-sm text-[#f2e9dd]/50">Showcase only your artworks</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-lg border border-white/10 hover:border-[#7C5FFF]/50 transition-all cursor-pointer group">
                  <input
                    type="radio"
                    name="exhibitionType"
                    value="collab"
                    checked={exhibitionType === 'collab'}
                    onChange={() => setExhibitionType('collab')}
                    className="w-5 h-5 accent-[#7C5FFF]"
                  />
                  <div>
                    <p className="text-[#f2e9dd] font-semibold group-hover:text-[#B15FFF] transition-colors flex items-center gap-2">
                      <Users size={16} /> Collaboration
                    </p>
                    <p className="text-sm text-[#f2e9dd]/50">Collaborate with other artists</p>
                  </div>
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
                <p className="text-xs text-[#f2e9dd]/50 mt-1">Separate usernames with commas</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
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

            <div className="pt-4 space-y-3">
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
