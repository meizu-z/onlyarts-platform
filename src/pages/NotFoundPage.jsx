import React from 'react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <svg className="w-64 h-64 mx-auto" viewBox="0 0 200 200" fill="none">
            <rect x="40" y="40" width="120" height="90" fill="#e5e7eb" className="dark:fill-gray-700" />
            <path d="M40 40 L160 130 M160 40 L40 130" stroke="#ef4444" strokeWidth="4" />
            <ellipse cx="100" cy="160" rx="8" ry="12" fill="#8B4513" />
            <rect x="96" y="145" width="8" height="20" fill="#8B4513" />
            <circle cx="100" cy="142" r="4" fill="#6366f1" opacity="0.5" />
          </svg>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Canvas Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The artwork you're looking for has been moved or doesn't exist.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};