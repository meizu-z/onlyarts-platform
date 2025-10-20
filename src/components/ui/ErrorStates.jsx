import React from 'react';

// 🚨 404 Page - Page Not Found
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

// 🚨 API Error Message Component
export const APIError = ({ error, retry }) => {
  const getErrorMessage = (error) => {
    if (error?.response?.status === 404) return "Resource not found";
    if (error?.response?.status === 401) return "You need to log in";
    if (error?.response?.status === 403) return "You don't have permission";
    if (error?.response?.status === 500) return "Server error, try again later";
    if (error?.message === "Network Error") return "Check your internet connection";
    return error?.message || "Something went wrong";
  };

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-red-600 dark:text-red-400 mb-4">
        {getErrorMessage(error)}
      </p>

      {retry && (
        <button
          onClick={retry}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

// 🚨 Network Error (Offline)
export const NetworkError = ({ retry }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <svg className="w-32 h-32 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No Internet Connection
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Please check your internet connection and try again.
        </p>

        {retry && (
          <button
            onClick={retry}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
};

// 🚨 Inline Error (for form fields)
export const InlineError = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-1">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  );
};