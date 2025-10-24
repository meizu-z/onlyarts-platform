import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast'; // 🆕
import { EmptyFavorites } from '../components/ui/EmptyStates'; // 🆕
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Heart, Filter, ChevronDown, Users, Calendar } from 'lucide-react';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const toast = useToast(); // 🆕
  const [activeTab, setActiveTab] = useState('favorites');

  const favorites = [
    { title: 'Sunset Dreams', artist: '@artist1', image: '🌅' },
    { title: 'Digital Abstract', artist: '@artist2', image: '🎨' },
    { title: 'Urban Nights', artist: '@artist3', image: '🌃' },
    { title: 'Nature Flow', artist: '@artist4', image: '🌿' },
  ];

  const following = [
    { name: 'Artist One', username: '@artist1', artworks: 234, isLive: false },
    { name: 'Artist Two', username: '@artist2', artworks: 89, isLive: true },
    { name: 'Artist Three', username: '@artist3', artworks: 456, isLive: false },
  ];

  // 🆕 Handle remove from favorites
  const handleRemoveFavorite = (artwork) => {
    toast.info(`Removed "${artwork.title}" from favorites`);
  };

  // 🆕 Handle unfollow
  const handleUnfollow = (artist) => {
    toast.info(`Unfollowed ${artist.name}`);
  };

  return (
    <div className="flex-1">
      <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-8">Favorites & Following</h1>

      {/* Tabs */}
      <div className="flex gap-4 md:gap-8 border-b border-white/10 mb-8">
        {[
          { key: 'favorites', label: 'Favorites' },
          { key: 'following', label: 'Following' },
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
                <p className="text-sm md:text-base text-[#f2e9dd]/70">{favorites.length} artworks</p>
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
                {favorites.map((artwork, idx) => (
                  <Card
                    key={idx}
                    hover
                    className="cursor-pointer transform hover:scale-105 md:hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                        {artwork.image}
                      </span>
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-bold text-base md:text-lg text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                        {artwork.title}
                      </h3>
                      <p className="text-sm text-[#f2e9dd]/50 mb-3">{artwork.artist}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-[#FF5F9E] hover:bg-[#FF5F9E]/10 transform hover:scale-105 transition-all duration-200"
                        onClick={() => handleRemoveFavorite(artwork)}
                      >
                        <Heart size={16} className="mr-2" fill="currentColor" /> Remove
                      </Button>
                    </div>
                  </Card>
                ))}
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
            {['Abstract', 'Portraits', 'Landscapes'].map((collection, idx) => (
              <Card
                key={idx}
                hover
                className="cursor-pointer transform hover:scale-105 md:hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    🎨
                  </span>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-base md:text-lg text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                    {collection}
                  </h3>
                  <p className="text-sm text-[#f2e9dd]/50 mb-3">{Math.floor(Math.random() * 30) + 10} items</p>
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
  );
};

export { FavoritesPage };