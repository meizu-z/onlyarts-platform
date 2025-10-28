import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { LoadingPaint } from '../components/ui/LoadingStates';
import { EmptySearchResults } from '../components/ui/EmptyStates';
import { APIError } from '../components/ui/ErrorStates';
import { exhibitionService } from '../services/exhibition.service';
import { useClientPagination } from '../hooks/usePagination';
import Pagination from '../components/common/Pagination';
import PremiumBadge from '../components/common/PremiumBadge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ChevronDown, Filter, Grid, List, Lock, Crown, Sparkles } from 'lucide-react';

// Demo mode flag - set to false when backend is ready
const USE_DEMO_MODE = true;

const ExplorePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('current');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [exhibitions, setExhibitions] = useState([]);
  const [allExhibitions, setAllExhibitions] = useState([]);

  // Fetch exhibitions on mount
  useEffect(() => {
    fetchExhibitions();
  }, []);

  // Filter exhibitions when tab changes
  useEffect(() => {
    filterExhibitions();
  }, [activeTab, allExhibitions]);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Use mock data
      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockData = [
          { id: 1, title: 'Digital Dreams', curator: '@curator1', curatorTier: 'premium', pieces: 20, status: 'live', image: '🎨', featured: true },
          { id: 2, title: 'Abstract Visions', curator: '@curator2', curatorTier: 'plus', pieces: 15, status: 'upcoming', image: '🖼️' },
          { id: 3, title: 'Modern Masters', curator: '@curator3', curatorTier: 'premium', pieces: 12, status: 'live', image: '🎭', premium: true, featured: true },
          { id: 4, title: 'Urban Landscapes', curator: '@curator4', curatorTier: 'free', pieces: 18, status: 'live', image: '🌆' },
          { id: 5, title: 'Nature & Tech', curator: '@curator5', curatorTier: 'plus', pieces: 25, status: 'upcoming', image: '🌿' },
          { id: 6, title: 'Portraits 2024', curator: '@curator6', curatorTier: 'free', pieces: 10, status: 'past', image: '👤' },
          { id: 7, title: 'Futuristic Visions', curator: '@curator7', curatorTier: 'premium', pieces: 30, status: 'live', image: '🚀', featured: true },
          { id: 8, title: 'Ocean Depths', curator: '@curator8', curatorTier: 'plus', pieces: 22, status: 'live', image: '🌊' },
        ];
        setAllExhibitions(mockData);
        setLoading(false);
        return;
      }

      // REAL API MODE: Call backend
      const response = await exhibitionService.getExhibitions();
      setAllExhibitions(response.exhibitions || response);
    } catch (err) {
      console.error('Error fetching exhibitions:', err);
      setError(err.message || 'Failed to load exhibitions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterExhibitions = () => {
    let filtered = allExhibitions;

    // Filter by tab
    if (activeTab === 'current') {
      filtered = filtered.filter(e => e.status === 'live');
    } else if (activeTab === 'upcoming') {
      filtered = filtered.filter(e => e.status === 'upcoming');
    } else if (activeTab === 'past') {
      filtered = filtered.filter(e => e.status === 'past');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.curator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by premium placement: premium > plus > free
    filtered.sort((a, b) => {
      const tierPriority = { premium: 3, plus: 2, free: 1 };
      const aPriority = tierPriority[a.curatorTier] || 0;
      const bPriority = tierPriority[b.curatorTier] || 0;
      return bPriority - aPriority;
    });

    // Duplicate data to simulate pagination with more items
    const extendedFiltered = [...filtered, ...filtered, ...filtered];
    setExhibitions(extendedFiltered);
  };

  // Client-side pagination for filtered exhibitions
  const pagination = useClientPagination(exhibitions, 9);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterExhibitions();
  };

  const handlePremiumClick = () => {
    toast.info('Upgrade to Premium to view this exhibition');
    setTimeout(() => navigate('/subscriptions'), 1500);
  };

  const handleFollow = () => {
    toast.success('Exhibition followed! You\'ll be notified when it opens 🎨');
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8">
        <LoadingPaint message="Finding amazing exhibitions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 md:p-8">
        <APIError error={error} retry={fetchExhibitions} />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-3 md:mb-4">Explore Exhibitions</h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1 sm:flex-none transform hover:scale-105 transition-all duration-200">
              <Filter size={16} className="mr-2" /> Filters
            </Button>
            <Button variant="secondary" size="sm" className="flex-1 sm:flex-none transform hover:scale-105 transition-all duration-200">
              Sort <ChevronDown size={16} className="ml-1" />
            </Button>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white shadow-lg shadow-[#7C5FFF]/30'
                  : 'text-[#f2e9dd]/50 hover:bg-white/5'
              }`}
            >
              <Grid size={18} className={`md:w-5 md:h-5 ${viewMode === 'grid' ? 'scale-110' : ''}`} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white shadow-lg shadow-[#7C5FFF]/30'
                  : 'text-[#f2e9dd]/50 hover:bg-white/5'
              }`}
            >
              <List size={18} className={`md:w-5 md:h-5 ${viewMode === 'list' ? 'scale-110' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 md:gap-8 border-b border-white/10 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
        {[
          { key: 'current', label: 'Current' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative pb-3 md:pb-4 text-base md:text-lg whitespace-nowrap transition-all duration-300 ${
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
        <Card className="mb-6 md:mb-8 overflow-hidden bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 border border-[#7C5FFF]/30 animate-fadeIn hover:border-[#7C5FFF]/50 transition-all duration-300 group">
          <div className="p-4 md:p-8">
            <div className="text-xs md:text-sm text-[#B15FFF] font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#B15FFF] rounded-full animate-pulse"></span>
              FEATURED EXHIBITION
            </div>
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-8">
              <div className="flex-1 w-full">
                <h2 className="text-xl md:text-3xl font-bold text-[#f2e9dd] mb-2 group-hover:text-[#B15FFF] transition-colors">
                  Masters of Digital Art
                </h2>
                <p className="text-sm md:text-base text-[#f2e9dd]/70 mb-3 md:mb-4">Curated by @gallery_curator</p>
                <p className="text-sm md:text-base text-[#f2e9dd]/90 mb-3 md:mb-4 line-clamp-2 md:line-clamp-none">
                  A stunning collection showcasing the finest digital artworks from renowned artists around the world.
                </p>
                <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-[#f2e9dd]/70 mb-4 md:mb-6">
                  <span>25 pieces</span>
                  <span>•</span>
                  <span>Opens Oct 25</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <Button
                    onClick={() => navigate('/exhibition')}
                    className="w-full sm:w-auto transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50"
                  >
                    Preview Exhibition
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleFollow}
                    className="w-full sm:w-auto transform hover:scale-105 transition-all duration-300"
                  >
                    <Lock size={16} className="mr-2" /> Follow
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-64 h-40 md:h-64 bg-gradient-to-br from-[#7C5FFF]/30 to-[#FF5F9E]/30 rounded-2xl flex items-center justify-center text-6xl md:text-8xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                🎨
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Featured Premium Exhibitions */}
      {activeTab === 'current' && exhibitions.some(e => e.featured) && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Crown size={24} className="text-amber-400" />
            <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd]">Featured Premium</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-500/50 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {exhibitions.filter(e => e.featured).slice(0, 3).map((exhibition, idx) => (
              <Card
                key={`featured-${exhibition.id}`}
                hover
                className="relative cursor-pointer transform hover:scale-105 transition-all duration-300 animate-fadeIn border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent"
                style={{ animationDelay: `${idx * 0.1}s` }}
                onClick={() => {
                  toast.success('Entering exhibition...');
                  setTimeout(() => navigate('/exhibition'), 500);
                }}
              >
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Sparkles size={12} /> FEATURED
                  </div>
                </div>
                <div className="aspect-video bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center text-5xl md:text-6xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <span className="relative z-10">{exhibition.image}</span>
                </div>
                <div className="p-3 md:p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base md:text-lg text-[#f2e9dd] flex-1">
                      {exhibition.title}
                    </h3>
                    <PremiumBadge tier={exhibition.curatorTier} size="sm" showLabel={false} />
                  </div>
                  <p className="text-xs md:text-sm text-[#f2e9dd]/60 mb-2">{exhibition.curator}</p>
                  <p className="text-xs text-[#f2e9dd]/50">{exhibition.pieces} pieces</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Show Empty State if no results */}
      {exhibitions.length === 0 ? (
        <EmptySearchResults searchQuery={searchQuery} />
      ) : (
        <>
          {/* All Exhibitions Grid */}
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4 md:gap-6 mb-6`}>
            {pagination.items.map((exhibition, idx) => (
            <Card
              key={idx}
              hover
              className="relative cursor-pointer transform hover:scale-105 md:hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {exhibition.premium && user?.subscription === 'free' && (
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-[#7C5FFF]/30">
                  <Lock size={12} /> Premium
                </div>
              )}
              <div className="aspect-video bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-5xl md:text-6xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                  {exhibition.image}
                </span>
              </div>
              <div className="p-3 md:p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base md:text-lg text-[#f2e9dd] group-hover:text-[#7C5FFF] transition-colors flex-1">
                    {exhibition.title}
                  </h3>
                  {exhibition.curatorTier && exhibition.curatorTier !== 'free' && (
                    <PremiumBadge tier={exhibition.curatorTier} size="sm" showLabel={false} />
                  )}
                </div>
                <p className="text-xs md:text-sm text-[#f2e9dd]/50 mb-2">{exhibition.curator}</p>
                <p className="text-xs md:text-sm text-[#f2e9dd]/70 mb-3">{exhibition.pieces} pieces</p>
                {exhibition.premium && user?.subscription === 'free' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full transform hover:scale-105 transition-all duration-200 text-xs md:text-sm"
                    onClick={handlePremiumClick}
                  >
                    <Lock size={14} className="mr-2" /> Upgrade to View
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] transform hover:scale-105 transition-all duration-200 shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 text-xs md:text-sm"
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

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.goToPage}
              canGoNext={pagination.canGoNext}
              canGoPrev={pagination.canGoPrev}
              getPageNumbers={pagination.getPageNumbers}
              range={pagination.range}
              totalItems={pagination.totalItems}
              showInfo={true}
            />
          )}
        </>
      )}
    </div>
  );
};

export { ExplorePage };
