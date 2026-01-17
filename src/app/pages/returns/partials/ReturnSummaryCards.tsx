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

const ReturnSummaryCards: React.FC<ReturnSummaryCardsProps> = ({ cards, isLoading, compact = false }) => {
    if (isLoading) {
        return (
            <div className={`flex flex-row ${compact ? 'gap-1 p-2' : 'gap-2 sm:gap-4 p-3 sm:p-4'} border-b border-gray-200 dark:border-gray-700`}>
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg ${compact ? 'p-1.5' : 'p-3 sm:p-4'} animate-pulse`}
                    >
                        <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2 sm:gap-3'}`}>
                            <div className={`${compact ? 'w-5 h-5' : 'w-8 h-8 sm:w-10 sm:h-10'} bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                                <div className={`${compact ? 'h-2' : 'h-3'} bg-gray-200 dark:bg-gray-600 rounded w-12 mb-1`} />
                                <div className={`${compact ? 'h-3' : 'h-4 sm:h-5'} bg-gray-200 dark:bg-gray-600 rounded w-8`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={`flex flex-row ${compact ? 'gap-1 p-2' : 'gap-2 sm:gap-4 p-3 sm:p-4'} border-b border-gray-200 dark:border-gray-700`}>
            {cards.map((card, idx) => {
                const Icon = getIcon(card.title);
                return (
                    <div
                        key={idx}
                        className={`flex-1 ${card.bgColor} rounded-lg ${compact ? 'p-1.5' : 'p-3 sm:p-4'} transition-all duration-200 hover:shadow-md`}
                    >
                        <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2 sm:gap-3'}`}>
                            <div className={`${card.iconBgColor} ${compact ? 'p-1' : 'p-2 sm:p-2.5'} rounded-lg flex-shrink-0`}>
                                <Icon className={`${compact ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5'} ${card.textColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`${compact ? 'text-[8px]' : 'text-[10px] sm:text-xs'} font-medium text-gray-500 dark:text-gray-400 truncate`}>
                                    {card.title}
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
