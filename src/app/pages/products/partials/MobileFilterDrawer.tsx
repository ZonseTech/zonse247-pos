import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Select, DateRangeFilter } from '../../../components';

interface MobileFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    categoryFilter?: string;
    startDate: string;
    endDate: string;
    onFilterByCategory: (categoryId: string) => void;
    onDateChange: (dates: [Date | null, Date | null]) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
    isOpen,
    onClose,
    categories,
    categoryFilter,
    startDate,
    endDate,
    onFilterByCategory,
    onDateChange,
    onClearFilters,
    hasActiveFilters,
}) => {
    const [showDateFilter, setShowDateFilter] = useState(false);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />

            {/* Drawer */}
            <div
                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl z-50 
                    max-h-[80vh] overflow-hidden
                    transform transition-transform duration-300 ease-out
                    animate-slide-up"
            >
                {/* Handle */}
                <div className="flex justify-center py-3">
                    <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(80vh-140px)]">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                        </label>
                        <Select
                            value={categoryFilter || ''}
                            onChange={(e) => onFilterByCategory(e.target.value)}
                            className="w-full h-12 px-4 text-base
                                border border-gray-300 dark:border-gray-600 
                                rounded-lg bg-white dark:bg-gray-700 
                                text-gray-900 dark:text-gray-100 
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category: Category) => (
                                <option key={category.categoryId} value={category.categoryId}>
                                    {category.name as string}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                        <button
                            onClick={() => setShowDateFilter(!showDateFilter)}
                            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            <span>Date Range</span>
                            {showDateFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {showDateFilter && (
                            <div className="mt-2">
                                <DateRangeFilter
                                    startDate={startDate ? new Date(startDate) : null}
                                    endDate={endDate ? new Date(endDate) : null}
                                    onChange={onDateChange}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-3">
                    {hasActiveFilters && (
                        <Button
                            onClick={() => {
                                onClearFilters();
                                onClose();
                            }}
                            theme="neutral"
                            layout="outline"
                            className="flex-1 h-12"
                        >
                            Clear All
                        </Button>
                    )}
                    <Button onClick={onClose} theme="primary" className="flex-1 h-12">
                        Apply Filters
                    </Button>
                </div>
            </div>
        </>
    );
};

export default MobileFilterDrawer;
