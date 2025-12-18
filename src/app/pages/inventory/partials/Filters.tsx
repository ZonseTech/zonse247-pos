import React from 'react';
import { Package, PackageCheck, PackageX, Clock, TrendingDown } from 'lucide-react';

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

const Filters: React.FC<FiltersProps> = ({ summaryData, activeFilter, onClear }) => {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {summaryData.map((filter, idx) => {
                const isTotal = idx === 0;
                const filterKey = filter.title.toLowerCase().replace(/\s+/g, '-');
                const isActive = activeFilter === (isTotal ? 'all' : filterKey);
                const Icon = getFilterIcon(filter.title);

                return (
                    <button
                        key={idx}
                        onClick={() => {
                            if (isTotal) {
                                onClear();
                            } else {
                                filter.onClick();
                            }
                        }}
                        className={`
                            inline-flex items-center gap-1.5 px-2.5 h-9
                            rounded-md text-sm font-medium whitespace-nowrap
                            transition-all duration-200 border
                            ${isActive
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                            }
                        `}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{filter.title}</span>
                        <span className={`
                            px-1.5 rounded text-xs font-medium
                            ${isActive
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
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
