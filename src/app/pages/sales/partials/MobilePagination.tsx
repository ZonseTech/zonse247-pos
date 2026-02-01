import { FunctionComponent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobilePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

const MobilePagination: FunctionComponent<MobilePaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
}) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="flex items-center justify-between py-4 px-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {startItem}-{endItem} of {totalItems}
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
                    {currentPage} / {totalPages}
                </span>
            </div>
        </div>
    );
};

export default MobilePagination;
