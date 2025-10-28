import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for pagination logic
 *
 * @param {Object} options - Pagination options
 * @param {number} options.initialPage - Initial page number (default: 1)
 * @param {number} options.initialPageSize - Initial items per page (default: 20)
 * @param {number} options.totalItems - Total number of items
 * @returns {Object} Pagination state and handlers
 */
export const usePagination = ({
  initialPage = 1,
  initialPageSize = 20,
  totalItems = 0,
} = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize) || 1;
  }, [totalItems, pageSize]);

  // Calculate current range
  const range = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    return { start, end };
  }, [currentPage, pageSize, totalItems]);

  // Check if we can go to next/prev page
  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;

  // Navigation handlers
  const goToPage = useCallback(
    (page) => {
      const pageNumber = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(pageNumber);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [canGoNext]);

  const prevPage = useCallback(() => {
    if (canGoPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [canGoPrev]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Reset pagination
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  // Get page numbers to display (for pagination UI)
  const getPageNumbers = useCallback(() => {
    const pages = [];
    const maxVisible = 5; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate middle pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    range,
    canGoNext,
    canGoPrev,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    changePageSize,
    reset,
    getPageNumbers,
  };
};

/**
 * Hook for client-side pagination (when you have all data)
 *
 * @param {Array} items - All items to paginate
 * @param {number} pageSize - Items per page (default: 20)
 * @returns {Object} Paginated data and pagination controls
 */
export const useClientPagination = (items = [], pageSize = 20) => {
  const pagination = usePagination({
    initialPageSize: pageSize,
    totalItems: items.length,
  });

  // Get current page items
  const paginatedItems = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, pagination.currentPage, pagination.pageSize]);

  return {
    items: paginatedItems,
    ...pagination,
  };
};

export default usePagination;
