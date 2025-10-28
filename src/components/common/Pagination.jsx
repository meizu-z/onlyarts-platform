import React from 'react';
import Button from './Button';

/**
 * Pagination Component
 *
 * Reusable pagination UI component
 *
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {boolean} props.canGoNext - Can navigate to next page
 * @param {boolean} props.canGoPrev - Can navigate to previous page
 * @param {Function} props.getPageNumbers - Function to get page numbers to display
 * @param {Object} props.range - Current range {start, end}
 * @param {number} props.totalItems - Total number of items
 * @param {boolean} props.showInfo - Show pagination info text (default: true)
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  canGoNext,
  canGoPrev,
  getPageNumbers,
  range,
  totalItems,
  showInfo = true,
}) => {
  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Pagination Info */}
      {showInfo && range && totalItems > 0 && (
        <div className="text-sm text-[#f2e9dd]/60">
          Showing {range.start} to {range.end} of {totalItems} results
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          className="px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </Button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-[#f2e9dd]/40">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[2.5rem] px-3 py-2 text-sm rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold'
                    : 'bg-[#f2e9dd]/10 hover:bg-[#f2e9dd]/20 text-[#f2e9dd]'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Mobile: Current Page Indicator */}
        <div className="sm:hidden px-3 py-2 bg-[#f2e9dd]/10 rounded-lg text-sm text-[#f2e9dd]">
          Page {currentPage} of {totalPages}
        </div>

        {/* Next Button */}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

/**
 * Compact Pagination Component (for mobile/tight spaces)
 */
export const CompactPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  canGoNext,
  canGoPrev,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-2 mt-4">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        className="px-3 py-2 text-sm disabled:opacity-50"
      >
        ← Prev
      </Button>

      <span className="text-sm text-[#f2e9dd]/70">
        {currentPage} / {totalPages}
      </span>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="px-3 py-2 text-sm disabled:opacity-50"
      >
        Next →
      </Button>
    </div>
  );
};

/**
 * Page Size Selector Component
 */
export const PageSizeSelector = ({ pageSize, onChange, options = [10, 20, 50, 100] }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-[#f2e9dd]/70">Items per page:</label>
      <select
        value={pageSize}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-[#1a1a1a] border border-[#f2e9dd]/20 rounded-lg px-3 py-2 text-[#f2e9dd] text-sm focus:outline-none focus:border-[#f2e9dd]/40"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Pagination;
