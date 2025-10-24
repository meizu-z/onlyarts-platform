/**
 * Error Handler Utilities
 * Centralized error handling and user-friendly error messages
 */

/**
 * Get user-friendly error message from API error
 * @param {Object|string} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  // If error is already a string
  if (typeof error === 'string') {
    return error;
  }

  // If error has a message property
  if (error?.message) {
    return error.message;
  }

  // If error has response data with message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Network error
  if (error?.type === 'NETWORK_ERROR') {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Timeout error
  if (error?.type === 'TIMEOUT_ERROR') {
    return 'Request timeout. The server took too long to respond. Please try again.';
  }

  // HTTP status-based messages
  if (error?.status || error?.response?.status) {
    const status = error.status || error.response.status;

    switch (status) {
      case 400:
        return error?.errors
          ? formatValidationErrors(error.errors)
          : 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data. Please try again.';
      case 422:
        return error?.errors
          ? formatValidationErrors(error.errors)
          : 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please slow down and try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  // Default error message
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Format validation errors into user-friendly message
 * @param {Object|Array} errors
 * @returns {string}
 */
export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(err => err.message || err).join(', ');
  }

  if (typeof errors === 'object') {
    return Object.values(errors).flat().join(', ');
  }

  return 'Validation failed';
};

/**
 * Check if error is a network error
 * @param {Object} error
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return error?.type === 'NETWORK_ERROR' || !error?.response;
};

/**
 * Check if error is an authentication error
 * @param {Object} error
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error?.status === 401 || error?.response?.status === 401;
};

/**
 * Check if error is a validation error
 * @param {Object} error
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  const status = error?.status || error?.response?.status;
  return status === 400 || status === 422;
};

/**
 * Log error for debugging (in development only)
 * @param {string} context
 * @param {Object} error
 */
export const logError = (context, error) => {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, {
      message: getErrorMessage(error),
      error,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Handle async function with error catching
 * @param {Function} asyncFn
 * @param {Function} onError - Optional error callback
 * @returns {Function}
 */
export const handleAsyncError = (asyncFn, onError) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const message = getErrorMessage(error);
      logError(asyncFn.name || 'AsyncFunction', error);

      if (onError) {
        onError(message, error);
      }

      throw error;
    }
  };
};

/**
 * Create error object for consistent error handling
 * @param {string} message
 * @param {string} type
 * @param {Object} data
 * @returns {Object}
 */
export const createError = (message, type = 'ERROR', data = {}) => {
  return {
    message,
    type,
    ...data,
  };
};

export default {
  getErrorMessage,
  formatValidationErrors,
  isNetworkError,
  isAuthError,
  isValidationError,
  logError,
  handleAsyncError,
  createError,
};
