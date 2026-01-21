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
import { useIsEBN } from '../../../hooks/useMediaQuery';

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
    compact?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    products: Boxes,
    units: Package,
    stockValue: DollarSign,
    retailValue: BarChart3,
    profit: TrendingUp,
    lowStock: AlertTriangle,
};

const InventorySummaryCards: FC<InventorySummaryCardsProps> = ({ cards, isLoading = false, compact = false }) => {
    const isEBN = useIsEBN();

    // EBN: Compact horizontal layout with 6 columns
    // Mobile: 2 columns with stacked layout
    // Desktop: 6 columns with horizontal layout

    if (isLoading) {
        return (
            <div className={
                isEBN
                    ? "grid grid-cols-6 gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700"
                    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700"
            }>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className={
                            isEBN
                                ? "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 animate-pulse"
                                : "bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4 animate-pulse"
                        }
                    >
                        <div className={isEBN ? "flex items-center gap-2" : "flex items-center gap-2 sm:gap-3"}>
                            <div className={
                                isEBN
                                    ? "w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0"
                                    : "w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-600 rounded-xl flex-shrink-0"
                            } />
                            <div className="flex-1 min-w-0">
                                <div className={isEBN ? "h-2.5 bg-gray-200 dark:bg-gray-600 rounded w-12 mb-1" : "h-3 bg-gray-200 dark:bg-gray-600 rounded w-14 mb-1.5"} />
                                <div className={isEBN ? "h-4 bg-gray-200 dark:bg-gray-600 rounded w-16" : "h-5 bg-gray-200 dark:bg-gray-600 rounded w-20"} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={
            isEBN
                ? "grid grid-cols-6 gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700"
                : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700"
        }>
            {cards.map((card, idx) => {
                const IconComponent = card.icon ? iconMap[card.icon] : Boxes;
                return (
                    <div
                        key={idx}
                        className={
                            isEBN
                                ? `${card.bgColor} rounded-lg p-2 transition-all duration-200 hover:shadow-sm active:scale-[0.98]`
                                : `${card.bgColor} rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-md`
                        }
                    >
                        {/* Horizontal layout - icon left, text right */}
                        <div className={isEBN ? "flex items-center gap-2" : "flex items-center gap-2 sm:gap-3"}>
                            <div className={
                                isEBN
                                    ? `${card.iconBgColor} p-1.5 rounded-lg flex-shrink-0`
                                    : `${card.iconBgColor} p-2 sm:p-2.5 rounded-xl flex-shrink-0`
                            }>
                                <IconComponent className={
                                    isEBN
                                        ? `w-4 h-4 ${card.textColor}`
                                        : `w-5 h-5 sm:w-6 sm:h-6 ${card.textColor}`
                                } />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={
                                    isEBN
                                        ? "text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight"
                                        : "text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight"
                                }>
                                    {card.title}
                                </p>
                                <p className={
                                    isEBN
                                        ? `text-sm font-bold ${card.textColor} leading-tight`
                                        : `text-base sm:text-lg font-bold ${card.textColor} leading-tight`
                                }>
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
