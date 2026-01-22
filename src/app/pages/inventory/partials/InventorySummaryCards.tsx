import { FC, useState } from 'react';
import {
    Boxes,
    Package,
    DollarSign,
    BarChart3,
    TrendingUp,
    AlertTriangle,
    LucideIcon
} from 'lucide-react';
import { useIsEBN, useIsMobile } from '../../../hooks/useMediaQuery';

export interface InventorySummaryCard {
    title: string;
    value: number;
    displayValue?: string;
    fullValue?: string;
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
    const isMobile = useIsMobile();
    const [expandedCard, setExpandedCard] = useState<number | null>(null);

    const handleCardClick = (idx: number) => {
        if (isMobile || isEBN) {
            setExpandedCard(expandedCard === idx ? null : idx);
        }
    };

    // EBN: Compact horizontal layout with 6 columns
    // Mobile: 3 columns with stacked layout
    // Desktop: 6 columns with horizontal layout

    if (isLoading) {
        return (
            <div className={
                isEBN
                    ? "grid grid-cols-6 gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700"
                    : "grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700"
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
                ? "grid grid-cols-6 gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700 relative"
                : "grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 relative"
        }>
            {cards.map((card, idx) => {
                const IconComponent = card.icon ? iconMap[card.icon] : Boxes;
                const displayValue = card.displayValue ?? card.value.toLocaleString();
                const fullValue = card.fullValue ?? displayValue;
                const isExpanded = expandedCard === idx;

                // Determine if card is on the right side (for mobile: last column in 3-col grid, for EBN: last 3 cards in 6-col grid)
                const isRightSide = isMobile ? (idx % 3 === 2) : (isEBN ? idx >= 3 : idx >= 3);

                return (
                    <div
                        key={idx}
                        onClick={() => handleCardClick(idx)}
                        className={
                            isEBN
                                ? `${card.bgColor} rounded-lg p-2 transition-all duration-200 hover:shadow-sm cursor-pointer select-none relative ${isExpanded ? 'z-50 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 shadow-xl scale-110' : ''}`
                                : `${card.bgColor} rounded-xl p-2 sm:p-4 transition-all duration-200 hover:shadow-md ${(isMobile) ? 'cursor-pointer select-none' : ''} relative ${(isMobile && isExpanded) ? 'z-50 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 shadow-xl scale-105' : ''}`
                        }
                    >
                        {/* EBN: Horizontal layout - icon left, text right */}
                        {/* Mobile: Vertical layout - icon top, title, value */}
                        {/* Desktop: Horizontal layout */}
                        {isEBN ? (
                            <div className="flex items-center gap-2">
                                <div className={`${card.iconBgColor} p-1.5 rounded-lg flex-shrink-0`}>
                                    <IconComponent className={`w-4 h-4 ${card.textColor}`} />
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight">
                                        {card.title}
                                    </p>
                                    <p className={`text-xs font-bold ${card.textColor} leading-tight truncate`} title={fullValue}>
                                        {displayValue}
                                    </p>
                                </div>
                            </div>
                        ) : isMobile ? (
                            <div className="flex flex-col items-center text-center gap-1">
                                <div className={`${card.iconBgColor} p-2 rounded-lg`}>
                                    <IconComponent className={`w-5 h-5 ${card.textColor}`} />
                                </div>
                                <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight">
                                    {card.title}
                                </p>
                                <p className={`text-xs font-bold ${card.textColor} leading-tight truncate w-full`} title={fullValue}>
                                    {displayValue}
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className={`${card.iconBgColor} p-2.5 rounded-xl flex-shrink-0`}>
                                    <IconComponent className={`w-6 h-6 ${card.textColor}`} />
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight">
                                        {card.title}
                                    </p>
                                    <p className={`text-base font-bold ${card.textColor} leading-tight truncate`} title={fullValue}>
                                        {fullValue}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Expanded tooltip overlay for mobile/EBN */}
                        {isExpanded && (isMobile || isEBN) && (
                            <div
                                className={`absolute ${isRightSide ? 'right-0' : 'left-0'} ${isEBN ? 'top-full mt-1' : 'top-full mt-2'} z-50 ${card.bgColor} rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 p-3 whitespace-nowrap`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex flex-col items-center text-center gap-2">
                                    <div className={`${card.iconBgColor} p-2 rounded-lg`}>
                                        <IconComponent className={`w-5 h-5 ${card.textColor}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {card.title}
                                        </p>
                                        <p className={`text-base font-bold ${card.textColor} whitespace-nowrap`}>
                                            {fullValue}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Backdrop overlay when a card is expanded (mobile/EBN) */}
            {expandedCard !== null && (isMobile || isEBN) && (
                <div
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={() => setExpandedCard(null)}
                />
            )}
        </div>
    );
};

export default InventorySummaryCards;
