import { FC } from 'react';
import {
    Boxes,
    Package,
    DollarSign,
    BarChart3,
    TrendingUp,
    AlertTriangle,
    LucideIcon
} from 'lucide-react';

export interface InventorySummaryCard {
    title: string;
    value: number;
    displayValue?: string;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
    icon?: 'products' | 'units' | 'stockValue' | 'retailValue' | 'profit' | 'lowStock';
}

interface InventorySummaryCardsProps {
    cards: InventorySummaryCard[];
    isLoading?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    products: Boxes,
    units: Package,
    stockValue: DollarSign,
    retailValue: BarChart3,
    profit: TrendingUp,
    lowStock: AlertTriangle,
};

const InventorySummaryCards: FC<InventorySummaryCardsProps> = ({ cards, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-3 animate-pulse">
                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                            <div className="space-y-1 sm:space-y-2 text-center sm:text-left w-full">
                                <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-600 rounded w-12 sm:w-16 mx-auto sm:mx-0" />
                                <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-600 rounded w-8 sm:w-10 mx-auto sm:mx-0" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            {cards.map((card, index) => {
                const IconComponent = card.icon ? iconMap[card.icon] : Boxes;
                return (
                    <div
                        key={index}
                        className={`${card.bgColor} rounded-lg sm:rounded-xl p-2 sm:p-3 transition-all duration-200 hover:shadow-md`}
                    >
                        {/* Mobile: Stacked layout, Desktop: Horizontal layout */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${card.iconBgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${card.textColor}`} />
                            </div>
                            <div className="min-w-0 text-center sm:text-left w-full">
                                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 truncate">{card.title}</p>
                                <p className={`text-sm sm:text-lg font-bold ${card.textColor} truncate`}>
                                    {card.displayValue ?? card.value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default InventorySummaryCards;
