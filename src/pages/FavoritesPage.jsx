import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { EmptyFavorites } from '../components/ui/EmptyStates';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { favoritesService, mockFavorites } from '../services/favorites.service';
import { api } from '../services/api.client';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Heart, Filter, ChevronDown, Users, Calendar, ImageIcon } from 'lucide-react';

// Demo mode flag - set to false when backend is ready
const USE_DEMO_MODE = false;

const FavoritesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('favorites');

  // API state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [purchasedArtworks, setPurchasedArtworks] = useState([]);

  // Filter and Sort state
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, artwork, exhibition
  const [sortBy, setSortBy] = useState('recent'); // recent, title_asc, title_desc, artist

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Use mock data
      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (activeTab === 'favorites') {
          setFavorites(mockFavorites);
        }

        setLoading(false);
        return;
      }

      // REAL API MODE: Call backend
      if (activeTab === 'favorites') {
        const response = await favoritesService.getFavorites();
        setFavorites(response.favorites || []);
      } else if (activeTab === 'collections') {
        // Get purchased artworks from real orders API
        const response = await api.get('/orders');

        // After unwrapping by api.client.js, response.data contains { orders: [...], pagination: {...} }
        const ordersData = response.data?.orders || response.data || [];
        const orders = Array.isArray(ordersData) ? ordersData : [];

        console.log('Collections - Orders fetched:', orders);

        // Extract artworks from completed orders only
        const artworks = orders
          .filter(order => order.status === 'completed' || order.paymentStatus === 'paid' || order.payment_status === 'paid')
          .flatMap(order => {
            const items = order.items || [];
            return items.map(item => ({
              id: item.artworkId || item.artwork_id,
              title: item.title,
              primary_image: item.primaryImage || item.primary_image,
              price: item.price,
              orderId: order.id,
              orderNumber: order.orderNumber || order.order_number,
              purchaseDate: order.createdAt || order.created_at,
            }));
          });

        console.log('Collections - Artworks extracted:', artworks);
        setPurchasedArtworks(artworks);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle remove from favorites with optimistic update
  const handleRemoveFavorite = async (item) => {
    const oldFavorites = [...favorites];

    // Optimistic update
    setFavorites(favorites.filter(f => f.id !== item.id));
    toast.info(`Removed "${item.title}" from favorites`);

    try {
      // DEMO MODE: Just show toast
      if (USE_DEMO_MODE) {
        return;
      }

      // REAL API MODE: Call backend
      await favoritesService.removeFavorite(item.id);
    } catch (error) {
      // Revert on error
      setFavorites(oldFavorites);
      toast.error('Failed to remove from favorites. Please try again.');
    }
  };

  // Filter and sort favorites
  const getFilteredAndSortedFavorites = () => {
    let filtered = [...favorites];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(f => f.type === filterType);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        // Assuming newer items have higher IDs
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'title_asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'artist':
        filtered.sort((a, b) => {
          const artistA = a.artist_name || a.artistName || '';
          const artistB = b.artist_name || b.artistName || '';
          return artistA.localeCompare(artistB);
        });
        break;
      default:
        break;
    }

    return filtered;
  };

  // Helper to get item counts
  const getItemCounts = () => {
    const artworkCount = favorites.filter(f => f.type === 'artwork').length;
    const exhibitionCount = favorites.filter(f => f.type === 'exhibition').length;
    return { artworkCount, exhibitionCount };
  };

  if (loading) {
    return (
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-4 md:p-6 lg:p-8">
          <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-8">Favorites & Collections</h1>
          <LoadingPaint message="Loading..." />
          <div className="mt-8">
            <SkeletonGrid count={6} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-4 md:p-6 lg:p-8">
          <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-8">Favorites & Collections</h1>
          <APIError error={error} retry={fetchData} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-8">Favorites & Collections</h1>

      {/* Tabs */}
      <div className="flex gap-4 md:gap-8 border-b border-white/10 mb-8">
        {[
          { key: 'favorites', label: 'Favorites' },
          { key: 'collections', label: 'Collections' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative pb-4 text-base md:text-lg transition-all duration-300 ${
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

      {activeTab === 'favorites' && (
        <>
          {favorites.length === 0 ? (
            /* 🆕 Empty State */
            <EmptyFavorites />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                {(() => {
                  const { artworkCount, exhibitionCount } = getItemCounts();
                  const filteredFavorites = getFilteredAndSortedFavorites();
                  return (
                    <p className="text-sm md:text-base text-[#f2e9dd]/70">
                      {filteredFavorites.length} of {favorites.length} items
                      {artworkCount > 0 && ` (${artworkCount} artwork${artworkCount !== 1 ? 's' : ''})`}
                      {exhibitionCount > 0 && ` (${exhibitionCount} exhibition${exhibitionCount !== 1 ? 's' : ''})`}
                    </p>
                  );
                })()}
                <div className="flex gap-2 relative">
                  {/* Filter Dropdown */}
                  <div className="relative">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="transform hover:scale-105 transition-all duration-200"
                      onClick={() => {
                        setShowFilters(!showFilters);
                        setShowSort(false);
                      }}
                    >
                      <Filter size={16} className="mr-2" /> Filter
                      {filterType !== 'all' && (
                        <span className="ml-2 w-2 h-2 bg-[#FF5F9E] rounded-full"></span>
                      )}
                    </Button>

                    {showFilters && (
                      <div className="absolute top-full mt-2 right-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl p-2 z-50 min-w-[180px]">
                        <button
                          onClick={() => { setFilterType('all'); setShowFilters(false); }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            filterType === 'all' ? 'bg-[#7C5FFF]/20 text-[#7C5FFF]' : 'text-[#f2e9dd] hover:bg-white/5'
                          }`}
                        >
                          All Items
                        </button>
                        <button
                          onClick={() => { setFilterType('artwork'); setShowFilters(false); }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            filterType === 'artwork' ? 'bg-[#7C5FFF]/20 text-[#7C5FFF]' : 'text-[#f2e9dd] hover:bg-white/5'
                          }`}
                        >
                          Artworks Only
                        </button>
                        <button
                          onClick={() => { setFilterType('exhibition'); setShowFilters(false); }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            filterType === 'exhibition' ? 'bg-[#7C5FFF]/20 text-[#7C5FFF]' : 'text-[#f2e9dd] hover:bg-white/5'
                          }`}
                        >
                          Exhibitions Only
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="transform hover:scale-105 transition-all duration-200"
                      onClick={() => {
                        setShowSort(!showSort);
                        setShowFilters(false);
                      }}
                    >
                      Sort <ChevronDown size={16} className="ml-1" />
                    </Button>

                    {showSort && (
                      <div className="absolute top-full mt-2 right-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl p-2 z-50 min-w-[180px]">
                        <button
                          onClick={() => { setSortBy('recent'); setShowSort(false); }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            sortBy === 'recent' ? 'bg-[#7C5FFF]/20 text-[#7C5FFF]' : 'text-[#f2e9dd] hover:bg-white/5'
                          }`}
                        >
                          Recently Added
                        </button>
                        <button
                          onClick={() => { setSortBy('title_asc'); setShowSort(false); }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            sortBy === 'title_asc' ? 'bg-[#7C5FFF]/20 text-[#7C5FFF]' : 'text-[#f2e9dd] hover:bg-white/5'
                          }`}
                        >
                          Title A-Z
                        </button>
                        <button
                          onClick={() => { setSortBy('title_desc'); setShowSort(false); }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            sortBy === 'title_desc' ? 'bg-[#7C5FFF]/20 text-[#7C5FFF]' : 'text-[#f2e9dd] hover:bg-white/5'
                          }`}
                        >
                          Title Z-A
                        </button>
                        <button
                          onClick={() => { setSortBy('artist'); setShowSort(false); }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            sortBy === 'artist' ? 'bg-[#7C5FFF]/20 text-[#7C5FFF]' : 'text-[#f2e9dd] hover:bg-white/5'
                          }`}
                        >
                          Artist Name
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {getFilteredAndSortedFavorites().map((item, idx) => {
                  const isExhibition = item.type === 'exhibition';
                  const imageUrl = item.primary_image || item.primaryImage;

                  return (
                    <Card
                      key={`${item.type}-${item.id}-${idx}`}
                      hover
                      className="cursor-pointer transform hover:scale-105 md:hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                      onClick={() => {
                        if (isExhibition) {
                          navigate(`/exhibition/${item.id}`);
                        } else {
                          navigate(`/artwork/${item.id}`);
                        }
                      }}
                    >
                      <div className={`${isExhibition ? 'aspect-video' : 'aspect-square'} bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl overflow-hidden relative`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Exhibition Badge */}
                        {isExhibition && (
                          <div className="absolute top-2 left-2 z-10">
                            <span className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                              {item.exhibition_type || 'Exhibition'}
                            </span>
                          </div>
                        )}

                        {/* Artwork Count Badge for Exhibitions */}
                        {isExhibition && item.artworks_count > 0 && (
                          <div className="absolute top-2 right-2 z-10">
                            <span className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <ImageIcon size={12} />
                              {item.artworks_count}
                            </span>
                          </div>
                        )}

                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                            {isExhibition ? '🖼️' : '🎨'}
                          </span>
                        )}
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="font-bold text-base md:text-lg text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                          {item.title}
                        </h3>
                        <p
                          className="text-sm text-[#f2e9dd]/50 mb-3 hover:text-[#7C5FFF] cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            const username = item.artist_username || item.artistUsername;
                            if (username) {
                              navigate(`/portfolio/${username}`);
                            }
                          }}
                        >
                          {item.artist_name || item.artistName || item.artist_username || item.artistUsername || 'Unknown Artist'}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-[#FF5F9E] hover:bg-[#FF5F9E]/10 transform hover:scale-105 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(item);
                          }}
                        >
                          <Heart size={16} className="mr-2" fill="currentColor" /> Remove
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {activeTab === 'collections' && (
        <>
          {purchasedArtworks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-bold text-[#f2e9dd] mb-2">No Purchased Artworks</h3>
              <p className="text-[#f2e9dd]/50 mb-6">Your purchased artworks will appear here</p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg"
              >
                Explore Artworks
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm md:text-base text-[#f2e9dd]/70 mb-6">
                {purchasedArtworks.length} purchased artwork{purchasedArtworks.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {purchasedArtworks.map((artwork, idx) => {
                  const imageUrl = artwork.primary_image;

                  return (
                    <Card
                      key={`${artwork.id}-${idx}`}
                      hover
                      className="cursor-pointer transform hover:scale-105 md:hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                      onClick={() => navigate(`/artwork/${artwork.id}`)}
                    >
                      <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Purchased Badge */}
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            ✓ Purchased
                          </span>
                        </div>

                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={artwork.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                            {artwork.primary_image || '🎨'}
                          </span>
                        )}
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="font-bold text-base md:text-lg text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                          {artwork.title}
                        </h3>
                        <p
                          className="text-sm text-[#f2e9dd]/50 mb-2 hover:text-[#7C5FFF] cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            const username = artwork.artist_username?.replace('@', '');
                            if (username) {
                              navigate(`/portfolio/${username}`);
                            }
                          }}
                        >
                          {artwork.artist_name || 'Unknown Artist'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-[#f2e9dd]/50">
                          <span>₱{artwork.price?.toLocaleString()}</span>
                          <span>{new Date(artwork.purchaseDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export { FavoritesPage };