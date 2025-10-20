import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Lock, Star } from 'lucide-react';

const ExhibitionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFreeUser = !user || user.subscription === 'free';

  const artworks = [
    { title: 'Digital Sunset', artist: '@artist1', price: '₱5,000', image: '🌅', locked: false },
    { title: 'Abstract Flow', artist: '@artist2', price: '₱7,500', image: '🎨', locked: false },
    { title: 'Neon Dreams', artist: '@artist3', price: '₱12,000', image: '💫', locked: false },
    { title: 'Mountain Vista', artist: '@artist4', locked: isFreeUser, image: '🏔️' },
    { title: 'Ocean Waves', artist: '@artist5', locked: isFreeUser, image: '🌊' },
    { title: 'City Lights', artist: '@artist6', locked: isFreeUser, image: '🌃' },
  ];

  return (
    <div className="flex-1">
      {/* Exhibition Header */}
      <div className="mb-8">
        <div className="aspect-[3/1] bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 rounded-2xl mb-6 flex items-center justify-center text-9xl animate-fadeIn group hover:from-[#7C5FFF]/30 hover:to-[#FF5F9E]/30 transition-all duration-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">
            🎨
          </span>
        </div>
        
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#f2e9dd] mb-2">Digital Dreams Collection</h1>
            <p className="text-[#f2e9dd]/70 mb-4">Curated by @gallery_master</p>
            {isFreeUser && (
              <div className="bg-gradient-to-r from-orange-600/10 to-[#FF5F9E]/10 border border-orange-500/30 rounded-lg p-4 mb-4 animate-fadeIn hover:border-orange-500/50 transition-all duration-300">
                <p className="text-orange-400 font-bold mb-1 flex items-center gap-2">
                  <Lock size={16} className="animate-pulse" /> PREVIEW MODE
                </p>
                <p className="text-[#f2e9dd]/70 text-sm">
                  You can view 3 of 15 artworks in preview mode. Upgrade to Plus to unlock full access.
                </p>
              </div>
            )}
            <div className="flex items-center gap-4 text-[#f2e9dd]/70 mb-6">
              <span>👁 2.3K views</span>
              <span>•</span>
              <span>15 artworks</span>
              <span>•</span>
              <span>Live until Nov 30</span>
            </div>
            <div className="flex gap-3">
              <Button className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300">
                <Star size={16} className="mr-2" /> Follow
              </Button>
              <Button variant="secondary" className="transform hover:scale-105 transition-all duration-300">
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isFreeUser && (
        <Card className="mb-8 p-6 bg-gradient-to-r from-[#7C5FFF]/10 to-[#FF5F9E]/10 border border-[#7C5FFF]/30 animate-fadeIn hover:border-[#7C5FFF]/50 transition-all duration-300">
          <h3 className="font-bold text-[#f2e9dd] mb-2 flex items-center gap-2">
            <Lock size={20} className="text-[#B15FFF]" />
            Unlock full exhibition access
          </h3>
          <ul className="text-sm text-[#f2e9dd]/70 mb-4 space-y-1">
            <li>✓ View all 15 artworks</li>
            <li>✓ Participate in auctions</li>
            <li>✓ Engage with artist</li>
          </ul>
          <Button 
            onClick={() => navigate('/subscriptions')}
            className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
          >
            Upgrade to Plus - ₱149/mo
          </Button>
        </Card>
      )}

      {/* Artworks Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {artworks.map((artwork, idx) => (
          <Card 
            key={idx} 
            hover={!artwork.locked} 
            className={`relative cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group ${
              artwork.locked ? 'cursor-not-allowed' : ''
            }`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {artwork.locked && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl group-hover:bg-black/70 transition-all duration-300">
                <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                  <Lock className="mx-auto mb-2 text-[#f2e9dd]/50" size={32} />
                  <p className="text-[#f2e9dd] font-bold">Locked</p>
                  <p className="text-sm text-[#f2e9dd]/70">Upgrade to view</p>
                </div>
              </div>
            )}
            <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl overflow-hidden relative">
              {!artwork.locked && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
              <span className={`transform transition-transform duration-300 relative z-10 ${
                !artwork.locked ? 'group-hover:scale-110' : ''
              }`}>
                {artwork.image}
              </span>
            </div>
            <div className="p-4">
              <h3 className={`font-bold text-[#f2e9dd] mb-1 transition-colors ${
                !artwork.locked ? 'group-hover:text-[#7C5FFF]' : ''
              }`}>
                {artwork.title}
              </h3>
              <p className="text-sm text-[#f2e9dd]/50 mb-2">{artwork.artist}</p>
              {!artwork.locked && artwork.price && (
                <p className="text-[#B15FFF] font-bold">{artwork.price}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { ExhibitionPage };