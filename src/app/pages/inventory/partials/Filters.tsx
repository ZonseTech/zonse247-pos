import React from 'react';
import { Package, PackageCheck, PackageX, Clock, TrendingDown, Filter } from 'lucide-react';
import { useIsMobile, useIsEBN } from '../../../hooks/useMediaQuery';

interface SummaryCard {
    title: string;
    value: number | string;
    bgColor?: string;
    onClick: () => void;
}

interface FiltersProps {
    summaryData: SummaryCard[];
    activeFilter: string;
    onClear: () => void;
    compact?: boolean;
}

const getFilterIcon = (title: string) => {
    switch (title.toLowerCase()) {
        case 'total stock':
            return Package;
        case 'new stock':
            return PackageCheck;
        case 'expiring soon':
            return Clock;
        case 'expired':
            return PackageX;
        case 'low stock':
            return TrendingDown;
        default:
            return Package;
    }
};

const getFilterKey = (title: string, idx: number): string => {
    return idx === 0 ? 'all' : title.toLowerCase().replace(/\s+/g, '-');
};

const getShortTitle = (title: string): string => {
    switch (title.toLowerCase()) {
        case 'total stock':
            return 'All';
        case 'new stock':
            return 'New';
        case 'expiring soon':
            return 'Expiring';
        case 'expired':
            return 'Expired';
        case 'low stock':
            return 'Low';
        default:
            return title.split(' ')[0];
    }
};

const Filters: React.FC<FiltersProps> = ({ summaryData, activeFilter, onClear, compact = false }) => {
    const isMobile = useIsMobile();

    const handleFilterChange = (filterKey: string) => {
        if (filterKey === 'all') {
            onClear();
        } else {
            const filter = summaryData.find((f, idx) => getFilterKey(f.title, idx) === filterKey);
            if (filter) {
                filter.onClick();
            }
        }
    };

    if (isMobile) {
        const activeFilterData = summaryData.find((f, idx) => getFilterKey(f.title, idx) === activeFilter);
        const ActiveIcon = activeFilterData ? getFilterIcon(activeFilterData.title) : Filter;

        return (
            <div className="relative w-full">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ActiveIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <select
                    value={activeFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 
                        appearance-none cursor-pointer
                        rounded-md text-sm font-medium
                        bg-white dark:bg-gray-800 
                        text-gray-700 dark:text-gray-200
                        border border-gray-300 dark:border-gray-600
                        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                        focus:border-blue-500 dark:focus:border-blue-400
                        transition-colors"
                >
                    {summaryData.map((filter, idx) => {
                        const filterKey = getFilterKey(filter.title, idx);
                        return (
                            <option
                                key={idx}
                                value={filterKey}
                                className="bg-white dark:bg-gray-800"
                            >
                                {filter.title} ({filter.value})
                            </option>
                        );
                    })}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className={compact ? "flex flex-wrap items-center gap-1" : "flex flex-wrap items-center gap-2"}>
            {summaryData.map((filter, idx) => {
                const filterKey = getFilterKey(filter.title, idx);
                const isActive = activeFilter === filterKey;
                const Icon = getFilterIcon(filter.title);

                return (
                    <button
                        key={idx}
                        onClick={() => handleFilterChange(filterKey)}
                        className={compact
                            ? `inline-flex items-center gap-1 px-1.5 h-7
                                rounded text-[10px] font-medium whitespace-nowrap
                                transition-all duration-200 border
                                ${isActive
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                            }`
                            : `inline-flex items-center gap-1.5 px-2.5 h-9
                                rounded-md text-sm font-medium whitespace-nowrap
                                transition-all duration-200 border
                                ${isActive
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                            }`
                        }
                        title={filter.title}
                    >
                        <Icon className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                        <span>{compact ? getShortTitle(filter.title) : filter.title}</span>
                        <span className={compact
                            ? `px-1 rounded text-[10px] font-medium
                                ${isActive
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`
                            : `px-1.5 rounded text-xs font-medium
                                ${isActive
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`
                        }>
                            {filter.value}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default Filters;
