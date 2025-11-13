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
const USE_DEMO_MODE = false;

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

  // Fetch exhibitions on mount
  useEffect(() => {
    fetchExhibitions();
  }, [activeTab]);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_DEMO_MODE) {
        // DEMO MODE: Use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockExhibitions = {
          current: [
            { id: 1, title: 'Modern Masters', curator: '@curator1', curatorTier: 'premium', pieces: 42, image: '🎨', premium: false },
            { id: 2, title: 'Digital Renaissance', curator: '@curator2', curatorTier: 'pro', pieces: 35, image: '💎', premium: false, featured: true },
            { id: 3, title: 'Abstract Minds', curator: '@curator3', curatorTier: 'free', pieces: 28, image: '🌈', premium: false },
            { id: 4, title: 'Street Art Revolution', curator: '@curator4', curatorTier: 'premium', pieces: 51, image: '🎪', premium: true, featured: true },
            { id: 5, title: 'Nature\'s Canvas', curator: '@curator5', curatorTier: 'pro', pieces: 38, image: '🌺', premium: false },
            { id: 6, title: 'Urban Expressions', curator: '@curator6', curatorTier: 'free', pieces: 22, image: '🏙️', premium: false },
            { id: 7, title: 'Vintage Vibes', curator: '@curator7', curatorTier: 'premium', pieces: 45, image: '📻', premium: true, featured: true },
            { id: 8, title: 'Pop Art Paradise', curator: '@curator8', curatorTier: 'pro', pieces: 33, image: '🎭', premium: false },
          ],
          upcoming: [
            { id: 9, title: 'Future Visions', curator: '@curator9', curatorTier: 'premium', pieces: 40, image: '🚀', premium: false },
            { id: 10, title: 'Cyber Aesthetics', curator: '@curator10', curatorTier: 'pro', pieces: 31, image: '🤖', premium: true },
          ],
          past: [
            { id: 11, title: 'Classic Collections', curator: '@curator11', curatorTier: 'free', pieces: 25, image: '🏛️', premium: false },
            { id: 12, title: 'Minimalist Movement', curator: '@curator12', curatorTier: 'premium', pieces: 18, image: '⬜', premium: false },
          ],
        };
        setExhibitions(mockExhibitions[activeTab] || []);
      } else {
        // REAL API MODE: Call backend
        const response = await exhibitionService.getExhibitions({ status: activeTab });
        setExhibitions(response.data?.exhibitions || response.exhibitions || []);
      }
    } catch (err) {
      console.error('Error fetching exhibitions:', err);
      setError(err.message || 'Failed to load exhibitions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterExhibitions = () => {
    if (!searchQuery.trim()) return exhibitions;
    return exhibitions.filter(e =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.curator.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Client-side pagination for filtered exhibitions
  const filteredExhibitions = filterExhibitions();
  const pagination = useClientPagination(filteredExhibitions, 12);

  const handleSearch = (query) => {
    setSearchQuery(query);
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

      {/* Show Empty State if no results */}
      {filteredExhibitions.length === 0 ? (
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
