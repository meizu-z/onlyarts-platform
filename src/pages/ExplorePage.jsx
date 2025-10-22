import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast'; // 🆕
import { LoadingPaint } from '../components/ui/LoadingStates'; // 🆕
import { EmptySearchResults } from '../components/ui/EmptyStates'; // 🆕
import { APIError } from '../components/ui/ErrorStates'; // 🆕
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ChevronDown, Filter, Grid, List, Lock } from 'lucide-react';

const ExplorePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast(); // 🆕
  const [activeTab, setActiveTab] = useState('current');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false); // 🆕
  const [error, setError] = useState(null); // 🆕
  const [searchQuery, setSearchQuery] = useState(''); // 🆕

  const exhibitions = [
    { title: 'Digital Dreams', curator: '@curator1', pieces: 20, status: 'live', image: '🎨' },
    { title: 'Abstract Visions', curator: '@curator2', pieces: 15, status: 'upcoming', image: '🖼️' },
    { title: 'Modern Masters', curator: '@curator3', pieces: 12, status: 'live', image: '🎭', premium: true },
    { title: 'Urban Landscapes', curator: '@curator4', pieces: 18, status: 'live', image: '🌆' },
    { title: 'Nature & Tech', curator: '@curator5', pieces: 25, status: 'upcoming', image: '🌿' },
    { title: 'Portraits 2024', curator: '@curator6', pieces: 10, status: 'past', image: '👤' },
  ];

  const filteredExhibitions = exhibitions.filter(e => {
    if (activeTab === 'current') return e.status === 'live';
    if (activeTab === 'upcoming') return e.status === 'upcoming';
    if (activeTab === 'past') return e.status === 'past';
    return true;
  });

  // 🆕 Simulate search
  const handleSearch = (query) => {
    setSearchQuery(query);
    // Add your actual search logic here
  };

  // 🆕 Handle premium content click
  const handlePremiumClick = () => {
    toast.info('Upgrade to Premium to view this exhibition');
    setTimeout(() => navigate('/subscriptions'), 1500);
  };

  // 🆕 Handle follow exhibition
  const handleFollow = () => {
    toast.success('Exhibition followed! You\'ll be notified when it opens 🎨');
  };

  // 🆕 Show loading state (for demo)
  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8">
        <LoadingPaint message="Finding amazing exhibitions..." />
      </div>
    );
  }

  // 🆕 Show error state (for demo)
  if (error) {
    return (
      <div className="flex-1 p-6 md:p-8">
        <APIError error={error} retry={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#f2e9dd] mb-4">Explore Exhibitions</h1>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="transform hover:scale-105 transition-all duration-200">
              <Filter size={16} className="mr-2" /> Filters
            </Button>
            <Button variant="secondary" size="sm" className="transform hover:scale-105 transition-all duration-200">
              Sort <ChevronDown size={16} className="ml-1" />
            </Button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white shadow-lg shadow-[#7C5FFF]/30' 
                  : 'text-[#f2e9dd]/50 hover:bg-white/5'
              }`}
            >
              <Grid size={20} className={viewMode === 'grid' ? 'scale-110' : ''} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white shadow-lg shadow-[#7C5FFF]/30' 
                  : 'text-[#f2e9dd]/50 hover:bg-white/5'
              }`}
            >
              <List size={20} className={viewMode === 'list' ? 'scale-110' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-white/10 mb-8">
        {[
          { key: 'current', label: 'Current' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative pb-4 text-lg transition-all duration-300 ${
              activeTab === tab.key 
                ? 'text-[#f2e9dd]' 
                : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
            )}
          </button>
        ))}
      </div>

      {/* Featured Exhibition */}
      {activeTab === 'current' && (
        <Card className="mb-8 overflow-hidden bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 border border-[#7C5FFF]/30 animate-fadeIn hover:border-[#7C5FFF]/50 transition-all duration-300 group">
          <div className="p-8">
            <div className="text-sm text-[#B15FFF] font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#B15FFF] rounded-full animate-pulse"></span>
              FEATURED EXHIBITION
            </div>
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-[#f2e9dd] mb-2 group-hover:text-[#B15FFF] transition-colors">
                  Masters of Digital Art
                </h2>
                <p className="text-[#f2e9dd]/70 mb-4">Curated by @gallery_curator</p>
                <p className="text-[#f2e9dd]/90 mb-4">
                  A stunning collection showcasing the finest digital artworks from renowned artists around the world.
                </p>
                <div className="flex items-center gap-4 text-sm text-[#f2e9dd]/70 mb-6">
                  <span>25 pieces</span>
                  <span>•</span>
                  <span>Opens Oct 25</span>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate('/exhibition')}
                    className="transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50"
                  >
                    Preview Exhibition
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={handleFollow}
                    className="transform hover:scale-105 transition-all duration-300"
                  >
                    <Lock size={16} className="mr-2" /> Follow
                  </Button>
                </div>
              </div>
              <div className="w-64 h-64 bg-gradient-to-br from-[#7C5FFF]/30 to-[#FF5F9E]/30 rounded-2xl flex items-center justify-center text-8xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                🎨
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 🆕 Show Empty State if no results */}
      {filteredExhibitions.length === 0 ? (
        <EmptySearchResults searchQuery={searchQuery} />
      ) : (
        /* Exhibitions Grid */
        <div className={`grid ${viewMode === 'grid' ? 'md:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {filteredExhibitions.map((exhibition, idx) => (
            <Card 
              key={idx} 
              hover 
              className="relative cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {exhibition.premium && user?.subscription === 'free' && (
                <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-[#7C5FFF]/30">
                  <Lock size={12} /> Premium
                </div>
              )}
              <div className="aspect-video bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                  {exhibition.image}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                  {exhibition.title}
                </h3>
                <p className="text-sm text-[#f2e9dd]/50 mb-2">{exhibition.curator}</p>
                <p className="text-sm text-[#f2e9dd]/70 mb-3">{exhibition.pieces} pieces</p>
                {exhibition.premium && user?.subscription === 'free' ? (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full transform hover:scale-105 transition-all duration-200" 
                    onClick={handlePremiumClick}
                  >
                    <Lock size={14} className="mr-2" /> Upgrade to View
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] transform hover:scale-105 transition-all duration-200 shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50" 
                    onClick={() => {
                      toast.success('Entering exhibition...');
                      setTimeout(() => navigate('/exhibition'), 500);
                    }}
                  >
                    Enter Exhibition
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export { ExplorePage };
