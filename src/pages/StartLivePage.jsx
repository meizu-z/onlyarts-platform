import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useToast } from '../components/ui/Toast';
import { Video, Gavel, ArrowLeft, Radio, DollarSign } from 'lucide-react';

const StartLivePage = () => {
  const navigate = useNavigate();
  const [liveType, setLiveType] = useState('normal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const toast = useToast();

  const handleStartLive = () => {
    if (!title.trim()) {
      toast.error('Please enter a live stream title');
      return;
    }

    if (liveType === 'auction' && !startingBid) {
      toast.error('Please set a starting bid for the auction');
      return;
    }

    toast.success(`Your ${liveType === 'normal' ? 'live stream' : 'auction'} "${title}" is starting now! 📺`);

    setTimeout(() => {
      navigate('/livestreams');
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

      <h1 className="text-4xl font-bold text-[#f2e9dd] mb-2">Start a Live Stream</h1>
      <p className="text-[#f2e9dd]/70 mb-8">Connect with your audience in real-time</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Preview Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
            <Video size={20} /> Live Preview
          </h2>
          <div className="aspect-video bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 rounded-lg flex items-center justify-center text-9xl mb-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">📺</span>

            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              LIVE
            </div>

            {liveType === 'auction' && (
              <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Gavel size={14} /> Auction
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-[#f2e9dd]/50 mb-1">Stream Title</p>
              <p className="text-[#f2e9dd] font-semibold">{title || 'Untitled Live Stream'}</p>
            </div>

            {liveType === 'auction' && startingBid && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-400 mb-1 flex items-center gap-2">
                  <DollarSign size={14} /> Starting Bid
                </p>
                <p className="text-yellow-400 font-bold text-xl">₱{parseInt(startingBid).toLocaleString()}</p>
              </div>
            )}

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400 font-semibold flex items-center gap-2">
                <Radio size={14} /> Your camera will be activated when you start
              </p>
            </div>
          </div>
        </Card>

        {/* Form Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#f2e9dd] mb-4">Stream Details</h2>

          <div className="space-y-4">
            <Input
              label="Stream Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter stream title"
            />

            <div>
              <label className="block text-sm text-[#f2e9dd]/70 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 h-32 transition-all duration-200"
                placeholder="Tell viewers what your stream is about..."
              />
            </div>

            <div>
              <label className="block text-sm text-[#f2e9dd]/70 mb-3">Stream Type *</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-lg border border-white/10 hover:border-[#7C5FFF]/50 transition-all cursor-pointer group">
                  <input
                    type="radio"
                    name="liveType"
                    value="normal"
                    checked={liveType === 'normal'}
                    onChange={() => setLiveType('normal')}
                    className="w-5 h-5 accent-[#7C5FFF]"
                  />
                  <div>
                    <p className="text-[#f2e9dd] font-semibold group-hover:text-[#B15FFF] transition-colors flex items-center gap-2">
                      <Video size={16} /> Normal Live Stream
                    </p>
                    <p className="text-sm text-[#f2e9dd]/50">Stream your creative process, tutorials, or casual chats</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-lg border border-white/10 hover:border-[#7C5FFF]/50 transition-all cursor-pointer group">
                  <input
                    type="radio"
                    name="liveType"
                    value="auction"
                    checked={liveType === 'auction'}
                    onChange={() => setLiveType('auction')}
                    className="w-5 h-5 accent-[#7C5FFF]"
                  />
                  <div>
                    <p className="text-[#f2e9dd] font-semibold group-hover:text-[#B15FFF] transition-colors flex items-center gap-2">
                      <Gavel size={16} /> Live Auction
                    </p>
                    <p className="text-sm text-[#f2e9dd]/50">Host a live auction for your artworks</p>
                  </div>
                </label>
              </div>
            </div>

            {liveType === 'auction' && (
              <div className="animate-fadeIn">
                <Input
                  type="number"
                  label="Starting Bid (PHP) *"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                  placeholder="Enter starting bid price"
                />
              </div>
            )}

            <Input
              type="datetime-local"
              label="Schedule (Optional)"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
            <p className="text-xs text-[#f2e9dd]/50 -mt-2">Leave empty to start immediately</p>

            <div className="pt-4 space-y-3">
              <Button
                onClick={handleStartLive}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-300"
              >
                <Radio size={16} className="mr-2" /> Go Live Now
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

export default StartLivePage;
