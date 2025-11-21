import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { EmptyFavorites } from '../components/ui/EmptyStates';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { favoritesService, mockFavorites, mockFollowingArtists, mockCollections } from '../services/favorites.service';
import { profileService } from '../services/profile.service';
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
  const [following, setFollowing] = useState([]);
  const [collections, setCollections] = useState([]);

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
        } else if (activeTab === 'following') {
          setFollowing(mockFollowingArtists);
        } else if (activeTab === 'collections') {
          setCollections(mockCollections);
        }

        setLoading(false);
        return;
      }

      // REAL API MODE: Call backend
      if (activeTab === 'favorites') {
        const response = await favoritesService.getFavorites();
        setFavorites(response.favorites || []);
      } else if (activeTab === 'following') {
        // TODO: Following is available in Profile page - redirect there or implement proper endpoint
        setFollowing([]);
      } else if (activeTab === 'collections') {
        const response = await favoritesService.getCollections();
        setCollections(response.collections || []);
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

  // Helper to get item counts
  const getItemCounts = () => {
    const artworkCount = favorites.filter(f => f.type === 'artwork').length;
    const exhibitionCount = favorites.filter(f => f.type === 'exhibition').length;
    return { artworkCount, exhibitionCount };
  };

  // Handle unfollow with optimistic update
  const handleUnfollow = async (artist) => {
    const oldFollowing = [...following];

    // Optimistic update
    setFollowing(following.filter(a => a.id !== artist.id));
    toast.info(`Unfollowed ${artist.name}`);

    try {
      // DEMO MODE: Just show toast
      if (USE_DEMO_MODE) {
        return;
      }

      // REAL API MODE: Call backend
      await profileService.unfollowUser(artist.username.replace('@', ''));
    } catch (error) {
      // Revert on error
      setFollowing(oldFollowing);
      toast.error('Failed to unfollow. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-4 md:p-6 lg:p-8">
          <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-8">Favorites & Following</h1>
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
          <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-8">Favorites & Following</h1>
          <APIError error={error} retry={fetchData} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-8">Favorites & Following</h1>

      {/* Tabs */}
      <div className="flex gap-4 md:gap-8 border-b border-white/10 mb-8">
        {[
          { key: 'favorites', label: 'Favorites' },
          { key: 'following', label: 'Following' },
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
                  return (
                    <p className="text-sm md:text-base text-[#f2e9dd]/70">
                      {favorites.length} items
                      {artworkCount > 0 && ` (${artworkCount} artwork${artworkCount !== 1 ? 's' : ''})`}
                      {exhibitionCount > 0 && ` (${exhibitionCount} exhibition${exhibitionCount !== 1 ? 's' : ''})`}
                    </p>
                  );
                })()}
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="transform hover:scale-105 transition-all duration-200">
                    <Filter size={16} className="mr-2" /> Filter
                  </Button>
                  <Button variant="secondary" size="sm" className="transform hover:scale-105 transition-all duration-200">
                    Sort <ChevronDown size={16} className="ml-1" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {favorites.map((item, idx) => {
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
                          navigate(`/exhibitions/${item.id}`);
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

      {activeTab === 'following' && (
        <>
          <p className="text-sm md:text-base text-[#f2e9dd]/70 mb-6">{following.length} artists</p>
          <div className="space-y-4">
            {following.map((artist, idx) => (
              <Card
                key={idx}
                className="p-3 md:p-6 transform hover:scale-105 transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg shadow-[#7C5FFF]/30 transform hover:scale-110 transition-transform">
                      {artist.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base md:text-lg text-[#f2e9dd]">{artist.name}</h3>
                        {artist.isLive && (
                          <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                            </span>
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#f2e9dd]/50">{artist.username} • {artist.artworks} artworks</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="transform hover:scale-105 transition-all duration-200"
                      onClick={() => handleUnfollow(artist)}
                    >
                      Unfollow
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        toast.info(`Viewing ${artist.name}'s profile...`);
                        navigate(`/profile/${artist.username.replace('@', '')}`);
                      }}
                      className="transform hover:scale-105 transition-all duration-200"
                    >
                      View Page
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'collections' && (
        <>
          <Button
            className="mb-6 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
            onClick={() => toast.info('Create collection feature coming soon!')}
          >
            + Create New Collection
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {collections.map((collection, idx) => (
              <Card
                key={collection.id || idx}
                hover
                className="cursor-pointer transform hover:scale-105 md:hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    {collection.coverImage || '🎨'}
                  </span>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-base md:text-lg text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-[#f2e9dd]/50 mb-3">{collection.itemCount} items</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full transform hover:scale-105 transition-all duration-200"
                    onClick={() => toast.info('Collection options coming soon!')}
                  >
                    •••
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export { FavoritesPage };