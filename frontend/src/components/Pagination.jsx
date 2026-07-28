import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange, disabled = false }) => {
  const [pageInput, setPageInput] = useState('');

  if (totalPages <= 1) return null;

  const pageNum = Math.max(1, Math.min(currentPage, totalPages));

  // Build page numbers array with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, pageNum - 1);
      let end = Math.min(totalPages - 1, pageNum + 1);

      if (pageNum <= 3) {
        end = 4;
      } else if (pageNum >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('..');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const targetPage = parseInt(pageInput, 10);
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
      onPageChange(targetPage);
      setPageInput('');
    }
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Pagination Navigation"
      className="mt-10 flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-gray-100"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => onPageChange(pageNum - 1)}
        disabled={pageNum <= 1 || disabled}
        aria-label="Go to previous page"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
        }}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold shadow-xs transition-all duration-200 ${pageNum <= 1 || disabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95'
          }`}
      >
        <FiChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {pages.map((p, idx) => {
          if (typeof p === 'string') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-sm font-medium opacity-50 select-none"
                style={{ color: 'var(--text-secondary)' }}
              >
                ...
              </span>
            );
          }

          const isActive = p === pageNum;

          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              disabled={disabled}
              aria-label={`Go to page ${p}`}
              aria-current={isActive ? 'page' : undefined}
              style={{
                backgroundColor: isActive ? 'var(--primary)' : 'var(--card-bg)',
                borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                color: isActive ? 'var(--btn-primary-text, #ffffff)' : 'var(--text)',
              }}
              className={`min-w-[40px] h-10 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-center ${isActive
                  ? 'shadow-md scale-105 font-bold'
                  : 'hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(pageNum + 1)}
        disabled={pageNum >= totalPages || disabled}
        aria-label="Go to next page"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
        }}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold shadow-xs transition-all duration-200 ${pageNum >= totalPages || disabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95'
          }`}
      >
        <span>Next</span>
        <FiChevronRight className="h-4 w-4" />
      </button>

      {/* Direct Page Jumper Form */}
      <form onSubmit={handleJumpSubmit} className="flex items-center gap-2 sm:ml-4">
        <span className="text-xs font-medium opacity-70" style={{ color: 'var(--text-secondary)' }}>
          Page:
        </span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          placeholder={pageNum.toString()}
          disabled={disabled}
          style={{
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text)',
            borderColor: 'var(--input-border)',
          }}
          className="w-12 rounded-xl border px-2 py-1.5 text-center text-sm outline-none transition focus:ring-2 focus:ring-[var(--primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="submit"
          disabled={disabled || !pageInput}
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--btn-primary-text, #ffffff)',
          }}
          className="rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs transition hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Go
        </button>
      </form>
    </nav>
  );
};

export default Pagination;
