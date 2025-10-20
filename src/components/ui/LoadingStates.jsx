import React from 'react';

// 🎨 Main Loading Component
export const LoadingPaint = ({ message = "Drying the paint.. please wait." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      {/* Animated Paintbrush */}
      <div className="relative w-16 h-16">
        <svg 
          className="w-16 h-16 animate-bounce" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 21L9 15L15 21L9 21L3 21Z" fill="#8B4513" className="animate-pulse" />
          <path d="M9 15L12 3L15 15L9 15Z" fill="#FFD700" className="animate-pulse" />
          <circle cx="12" cy="2" r="2" fill="#6366f1" className="animate-ping" />
        </svg>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-drip"></div>
        </div>
      </div>

      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
        {message}
      </p>

      <div className="flex gap-2">
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>

      <style jsx>{`
        @keyframes drip {
          0%, 100% { 
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% { 
            transform: translateY(20px) scale(0.5);
            opacity: 0.5;
          }
        }
        
        .animate-drip {
          animation: drip 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// 🎨 Skeleton Loader for Cards
export const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  );
};

// 🎨 Skeleton Grid
export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

// 🎨 Button Loading State
export const ButtonLoading = ({ children, loading, className = '', ...props }) => {
  return (
    <button 
      {...props}
      disabled={loading || props.disabled}
      className={`relative ${className} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  );
};

// 🎨 Full Page Loading
export const FullPageLoading = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
      <LoadingPaint />
    </div>
  );
};