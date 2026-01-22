import React from 'react';
import { RotateCcw, CheckCircle, Clock, PackageX, Filter } from 'lucide-react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

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
        case 'total returns':
            return RotateCcw;
        case 'pending restock':
            return Clock;
        case 'restocked':
            return CheckCircle;
        case 'damaged':
            return PackageX;
        default:
            return RotateCcw;
    }
};

const getFilterKey = (title: string, idx: number): string => {
    return idx === 0 ? 'all' : title.toLowerCase().replace(/\s+/g, '-');
};

const getShortTitle = (title: string): string => {
    const shortNames: Record<string, string> = {
        'total returns': 'All',
        'pending restock': 'Pending',
        'restocked': 'Restocked',
        'damaged': 'Damaged',
    };
    return shortNames[title.toLowerCase()] || title;
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
                        focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400
                        focus:border-sky-500 dark:focus:border-sky-400
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
        <div className="flex flex-wrap items-center gap-1">
            {summaryData.map((filter, idx) => {
                const filterKey = getFilterKey(filter.title, idx);
                const isActive = activeFilter === filterKey;
                const Icon = getFilterIcon(filter.title);
                const displayTitle = compact ? getShortTitle(filter.title) : filter.title;

                return (
                    <button
                        key={idx}
                        onClick={() => handleFilterChange(filterKey)}
                        className={`
                            inline-flex items-center gap-1 
                            ${compact ? 'px-1.5 h-7' : 'px-2.5 h-9'}
                            rounded-md ${compact ? 'text-[10px]' : 'text-sm'} font-medium whitespace-nowrap
                            transition-all duration-200 border
                            ${isActive
                                ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/50 dark:text-sky-200 dark:border-sky-800'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                            }
                        `}
                    >
                        <Icon className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                        <span>{displayTitle}</span>
                        <span className={`
                            ${compact ? 'px-1 text-[9px]' : 'px-1.5 text-xs'} rounded font-medium
                            ${isActive
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-800 dark:text-sky-100'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }
                        `}>
                            {filter.value}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default Filters;
