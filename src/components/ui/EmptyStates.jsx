import React from 'react';

// 🎨 Empty Artworks State
export const EmptyArtworks = ({ isOwnProfile = false }) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="mb-8">
        <svg className="w-48 h-48 mx-auto" viewBox="0 0 200 200" fill="none">
          <rect x="30" y="30" width="140" height="110" fill="#f3f4f6" className="dark:fill-gray-700" stroke="#9ca3af" strokeWidth="3" strokeDasharray="8,8" />
          <path d="M100 140 L90 180 M100 140 L110 180 M70 180 L130 180" stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="150" cy="160" rx="25" ry="20" fill="#e5e7eb" className="dark:fill-gray-600" stroke="#9ca3af" strokeWidth="2" />
          <circle cx="145" cy="155" r="4" fill="#ef4444" />
          <circle cx="155" cy="155" r="4" fill="#3b82f6" />
          <circle cx="150" cy="165" r="4" fill="#eab308" />
        </svg>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {isOwnProfile ? "Your Canvas Awaits" : "No Artworks Yet"}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {isOwnProfile 
          ? "Start your artistic journey by uploading your first masterpiece."
          : "This artist hasn't shared any artworks yet. Check back soon!"}
      </p>

      {isOwnProfile && (
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Upload First Artwork
        </button>
      )}
    </div>
  );
};

// 👥 Empty Followers State
export const EmptyFollowers = ({ isOwnProfile = false }) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="mb-6">
        <svg className="w-32 h-32 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        0 Followers
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
        {isOwnProfile 
          ? "Share your artworks and engage with the community to build your following!"
          : "Be the first to follow this artist!"}
      </p>
    </div>
  );
};

// 👥 Empty Following State
export const EmptyFollowing = ({ isOwnProfile = false }) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="mb-6">
        <svg className="w-32 h-32 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Not Following Anyone Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
        {isOwnProfile 
          ? "Explore artists and start following creators you love!"
          : "This user hasn't followed anyone yet."}
      </p>

      {isOwnProfile && (
        <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Explore Artists
        </button>
      )}
    </div>
  );
};

// 💳 Empty Subscriptions State
export const EmptySubscriptions = () => {
  return (
    <div className="text-center py-16 px-4">
      <div className="mb-8">
        <svg className="w-40 h-40 mx-auto" viewBox="0 0 200 200" fill="none">
          <rect x="60" y="80" width="80" height="60" fill="#818cf8" opacity="0.2" stroke="#6366f1" strokeWidth="3" />
          <rect x="60" y="60" width="80" height="20" fill="#6366f1" />
          <path d="M100 60 L100 140" stroke="#4f46e5" strokeWidth="4" />
          <path d="M60 90 L140 90" stroke="#4f46e5" strokeWidth="4" />
          <ellipse cx="85" cy="60" rx="15" ry="10" fill="#ef4444" />
          <ellipse cx="115" cy="60" rx="15" ry="10" fill="#ef4444" />
          <circle cx="100" cy="60" r="6" fill="#dc2626" />
        </svg>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        No Active Subscriptions
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Subscribe to your favorite artists to unlock exclusive content!
      </p>

      <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
        Browse Artists
      </button>
    </div>
  );
};

// 🔍 Empty Search Results
export const EmptySearchResults = ({ searchQuery = "" }) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="mb-8">
        <svg className="w-32 h-32 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {searchQuery ? `No Results for "${searchQuery}"` : "No Artists Found"}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        We couldn't find any artists matching your search.
      </p>

      <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
        Explore All
      </button>
    </div>
  );
};

// ❤️ Empty Favorites
export const EmptyFavorites = () => {
  return (
    <div className="text-center py-16 px-4">
      <div className="mb-8">
        <svg className="w-40 h-40 mx-auto" viewBox="0 0 200 200" fill="none">
          <path 
            d="M100 160 C100 160, 40 120, 40 80 C40 50, 60 40, 80 40 C90 40, 95 45, 100 55 C105 45, 110 40, 120 40 C140 40, 160 50, 160 80 C160 120, 100 160, 100 160Z" 
            fill="none" 
            stroke="#e5e7eb" 
            strokeWidth="4"
            strokeDasharray="8,8"
            className="dark:stroke-gray-600"
          />
        </svg>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        No Favorites Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Start exploring and heart the artworks you love!
      </p>

      <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
        Explore Artworks
      </button>
    </div>
  );
};