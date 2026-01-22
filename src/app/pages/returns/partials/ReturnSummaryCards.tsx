import React from 'react';
import { RotateCcw, CheckCircle, Clock, PackageX, DollarSign } from 'lucide-react';

export interface ReturnSummaryCard {
    title: string;
    value: number | string;
    displayValue: string;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
}

interface ReturnSummaryCardsProps {
    cards: ReturnSummaryCard[];
    isLoading?: boolean;
    compact?: boolean;
    mobile?: boolean;
}

const getIcon = (title: string) => {
    switch (title) {
        case 'Total Returns':
            return RotateCcw;
        case 'Pending Restock':
            return Clock;
        case 'Restocked':
            return CheckCircle;
        case 'Damaged':
            return PackageX;
        case 'Total Refunded':
            return DollarSign;
        default:
            return RotateCcw;
    }
};

// Get short title for mobile
const getShortTitle = (title: string) => {
    switch (title) {
        case 'Total Returns':
            return 'Returns';
        case 'Pending Restock':
            return 'Pending';
        case 'Restocked':
            return 'Stocked';
        case 'Damaged':
            return 'Damaged';
        case 'Total Refunded':
            return 'Refunded';
        default:
            return title;
    }
};

const ReturnSummaryCards: React.FC<ReturnSummaryCardsProps> = ({ cards, isLoading, compact = false, mobile = false }) => {
    if (isLoading) {
        return (
            <div className={`grid ${mobile ? 'grid-cols-4 gap-1.5 p-2' : compact ? 'grid-cols-4 gap-1 p-2' : 'grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4'} border-b border-gray-200 dark:border-gray-700`}>
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`bg-gray-50 dark:bg-gray-700/50 ${mobile ? 'rounded-lg p-2' : compact ? 'rounded-lg p-1.5' : 'rounded-xl p-3 sm:p-4'} animate-pulse`}
                    >
                        {mobile ? (
                            <div className="flex flex-col items-center text-center">
                                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-lg mb-1" />
                                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-10 mb-1" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-6" />
                            </div>
                        ) : (
                            <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2 sm:gap-3'}`}>
                                <div className={`${compact ? 'w-5 h-5' : 'w-8 h-8 sm:w-10 sm:h-10'} bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0`} />
                                <div className="flex-1 min-w-0">
                                    <div className={`${compact ? 'h-2' : 'h-3'} bg-gray-200 dark:bg-gray-600 rounded w-12 mb-1`} />
                                    <div className={`${compact ? 'h-3' : 'h-4 sm:h-5'} bg-gray-200 dark:bg-gray-600 rounded w-8`} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={`grid ${mobile ? 'grid-cols-4 gap-1.5 p-2' : compact ? 'grid-cols-4 gap-1 p-2' : 'grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4'} border-b border-gray-200 dark:border-gray-700`}>
            {cards.map((card, idx) => {
                const Icon = getIcon(card.title);

                // Mobile layout - vertical centered cards
                if (mobile) {
                    return (
                        <div
                            key={idx}
                            className={`${card.bgColor} rounded-lg p-2 transition-all duration-150 active:scale-95`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`${card.iconBgColor} p-1.5 rounded-lg mb-1`}>
                                    <Icon className={`w-3.5 h-3.5 ${card.textColor}`} />
                                </div>
                                <p className="text-[8px] font-medium text-gray-500 dark:text-gray-400 leading-tight">
                                    {getShortTitle(card.title)}
                                </p>
                                <p className={`text-sm font-bold ${card.textColor} leading-tight`}>
                                    {card.displayValue}
                                </p>
                            </div>
                        </div>
                    );
                }

                return (
                    <div
                        key={idx}
                        className={`${card.bgColor} ${compact ? 'rounded-lg p-1.5' : 'rounded-xl p-3 sm:p-4'} transition-all duration-200 hover:shadow-md active:scale-[0.98]`}
                    >
                        <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2 sm:gap-3'}`}>
                            <div className={`${card.iconBgColor} ${compact ? 'p-1' : 'p-2 sm:p-2.5'} rounded-lg flex-shrink-0`}>
                                <Icon className={`${compact ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5'} ${card.textColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`${compact ? 'text-[8px]' : 'text-[10px] sm:text-xs'} font-medium text-gray-500 dark:text-gray-400 truncate`}>
                                    {compact ? getShortTitle(card.title) : card.title}
                                </p>
                                <p className={`${compact ? 'text-[11px]' : 'text-sm sm:text-lg'} font-bold ${card.textColor} truncate`}>
                                    {card.displayValue}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ReturnSummaryCards;
