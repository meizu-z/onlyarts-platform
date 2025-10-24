/**
 * useApi Hook
 * Custom hook for handling API calls with loading, error, and success states
 */

import { useState, useCallback } from 'react';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { useToast } from '../components/ui/Toast';

/**
 * Hook for making API calls with built-in state management
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation successful',
    initialData = null,
  } = options;

  const toast = useToast();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute the API call
   */
  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiFunction(...args);
        setData(result);

        if (showSuccessToast) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);

        logError(apiFunction.name || 'API Call', err);

        if (showErrorToast) {
          toast.error(errorMessage);
        }

        if (onError) {
          onError(errorMessage, err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, toast]
  );

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

/**
 * Hook for making API calls that load data on mount
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useApiOnMount = (apiFunction, dependencies = [], options = {}) => {
  const {
    skip = false,
    ...apiOptions
  } = options;

  const { data, loading, error, execute, reset } = useApi(apiFunction, {
    ...apiOptions,
    showErrorToast: apiOptions.showErrorToast ?? true,
  });

  const [mounted, setMounted] = useState(false);

  // Auto-execute on mount
  useState(() => {
    if (!skip && !mounted) {
      execute();
      setMounted(true);
    }
  }, [skip, mounted, ...dependencies]);

  /**
   * Refetch data
   */
  const refetch = useCallback(async () => {
    reset();
    return await execute();
  }, [execute, reset]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for pagination
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - Pagination state and methods
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const {
    initialPage = 1,
    initialLimit = 10,
    ...apiOptions
  } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const { data, loading, error, execute } = useApi(apiFunction, {
    ...apiOptions,
    onSuccess: (result) => {
      if (result?.total !== undefined) {
        setTotal(result.total);
      }
      if (apiOptions.onSuccess) {
        apiOptions.onSuccess(result);
      }
    },
  });

  /**
   * Fetch page
   */
  const fetchPage = useCallback(
    async (pageNum = page) => {
      return await execute({ page: pageNum, limit });
    },
    [execute, page, limit]
  );

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(total / limit);
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      fetchPage(newPage);
    }
  }, [page, total, limit, fetchPage]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(() => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchPage(newPage);
    }
  }, [page, fetchPage]);

  /**
   * Go to specific page
   */
  const goToPage = useCallback(
    (pageNum) => {
      const totalPages = Math.ceil(total / limit);
      if (pageNum >= 1 && pageNum <= totalPages) {
        setPage(pageNum);
        fetchPage(pageNum);
      }
    },
    [total, limit, fetchPage]
  );

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data: data?.items || data?.data || [],
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    setLimit,
    refetch: () => fetchPage(page),
  };
};

export default useApi;
