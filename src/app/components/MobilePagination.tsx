import React from 'react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

interface MobilePaginationProps {
    /** Current page number (1-based) */
    page: number;
    /** Total number of rows/items */
    totalRows: number;
    /** Items per page */
    perPage: number;
    /** Callback when page changes */
    onPageChange: (page: number) => void;
    /** Optional: show "Showing X-Y of Z" instead of just "N total" */
    showRange?: boolean;
    /** Optional: custom className for the wrapper */
    className?: string;
}

const MobilePagination: React.FC<MobilePaginationProps> = ({
    page,
    totalRows,
    perPage,
    onPageChange,
    showRange = false,
    className = '',
}) => {
    const totalPages = Math.max(1, Math.ceil(totalRows / perPage));
    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    const startItem = totalRows === 0 ? 0 : (page - 1) * perPage + 1;
    const endItem = Math.min(page * perPage, totalRows);

    return (
        <div
            className={`flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 ${className}`}
        >
            <span className="text-xs text-gray-600 dark:text-gray-400">
                {showRange && totalRows > 0
                    ? `${startItem}-${endItem} of ${totalRows}`
                    : `${totalRows} total`}
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={!hasPrev}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    <HiOutlineChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {page} / {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={!hasNext}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    <HiOutlineChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default MobilePagination;
