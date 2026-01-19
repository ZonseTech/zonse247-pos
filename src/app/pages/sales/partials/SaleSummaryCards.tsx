import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Receipt, RotateCcw } from 'lucide-react';
import { SaleSummaryCard } from '../../../hooks/useSaleSummary';

interface SaleSummaryCardsProps {
    cards: SaleSummaryCard[];
    isLoading?: boolean;
}

const getIcon = (title: string) => {
    switch (title) {
        case 'Total Sales':
            return TrendingUp;
        case 'Total Returns':
            return RotateCcw;
        case 'Net Sales':
            return DollarSign;
        case 'Total Transactions':
            return Receipt;
        default:
            return DollarSign;
    }
};

const SaleSummaryCards: React.FC<SaleSummaryCardsProps> = ({ cards, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 animate-pulse"
                    >
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16 sm:w-20 mb-2" />
                                <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-600 rounded w-20 sm:w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            {cards.map((card, idx) => {
                const Icon = getIcon(card.title);
                return (
                    <div
                        key={idx}
                        className={`${card.bgColor} rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-md`}
                    >
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`${card.iconBgColor} p-2 sm:p-2.5 rounded-lg flex-shrink-0`}>
                                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.textColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                                    {card.title}
                                </p>
                                <p className={`text-sm sm:text-lg font-bold ${card.textColor} truncate`}>
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

export default SaleSummaryCards;
