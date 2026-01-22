import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Receipt, RotateCcw, LucideIcon } from 'lucide-react';
import { SaleSummaryCard } from '../../../hooks/useSaleSummary';
import { useIsEBN, useIsMobile } from '../../../hooks/useMediaQuery';

interface SaleSummaryCardsProps {
    cards: SaleSummaryCard[];
    isLoading?: boolean;
    compact?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    'Total Sales': TrendingUp,
    'Total Returns': RotateCcw,
    'Net Sales': DollarSign,
    'Total Transactions': Receipt,
};

const getIcon = (title: string): LucideIcon => {
    return iconMap[title] || DollarSign;
};

// Format currency abbreviated (MK 1.3M)
const formatCurrencyShort = (value: number): string => {
    if (value >= 1000000) {
        return `MK ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `MK ${(value / 1000).toFixed(1)}K`;
    }
    return `MK ${value.toFixed(0)}`;
};

const SaleSummaryCards: React.FC<SaleSummaryCardsProps> = ({ cards, isLoading, compact = false }) => {
    const isEBN = useIsEBN();
    const isMobile = useIsMobile();
    const [expandedCard, setExpandedCard] = useState<number | null>(null);

    const handleCardClick = (idx: number) => {
        if (isMobile || isEBN) {
            setExpandedCard(expandedCard === idx ? null : idx);
        }
    };

    if (isLoading) {
        return (
            <div className={
                isEBN
                    ? "grid grid-cols-4 gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700"
                    : compact
                        ? "grid grid-cols-4 gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700"
                        : "grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700"
            }>
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={
                            isEBN
                                ? "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 animate-pulse"
                                : compact
                                    ? "bg-gray-50 dark:bg-gray-700/50 rounded-md p-1.5 animate-pulse"
                                    : "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 animate-pulse"
                        }
                    >
                        <div className={isEBN ? "flex items-center gap-2" : "flex items-center gap-1.5"}>
                            <div className={
                                isEBN
                                    ? "w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0"
                                    : compact
                                        ? "w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded flex-shrink-0"
                                        : "w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0"
                            } />
                            <div className="flex-1 min-w-0">
                                <div className={isEBN ? "h-2.5 bg-gray-200 dark:bg-gray-600 rounded w-12 mb-1" : compact ? "h-2 bg-gray-200 dark:bg-gray-600 rounded w-12 mb-1" : "h-3 bg-gray-200 dark:bg-gray-600 rounded w-16 sm:w-20 mb-2"} />
                                <div className={isEBN ? "h-4 bg-gray-200 dark:bg-gray-600 rounded w-16" : compact ? "h-3 bg-gray-200 dark:bg-gray-600 rounded w-14" : "h-4 sm:h-5 bg-gray-200 dark:bg-gray-600 rounded w-20 sm:w-24"} />
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
                ? "grid grid-cols-4 gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700 relative"
                : compact
                    ? "grid grid-cols-4 gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700 relative"
                    : "grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 relative"
        }>
            {cards.map((card, idx) => {
                const Icon = getIcon(card.title);
                const displayValue = card.isMonetary ? formatCurrencyShort(card.value) : card.displayValue;
                const fullValue = card.displayValue;
                const isExpanded = expandedCard === idx;

                // Determine if card is on the right side (for 2-col mobile: odd index, for 4-col: last 2 cards)
                const isRightSide = isMobile ? (idx % 2 === 1) : (idx >= 2);

                return (
                    <div
                        key={idx}
                        onClick={() => handleCardClick(idx)}
                        className={
                            isEBN
                                ? `${card.bgColor} rounded-lg p-2 transition-all duration-200 hover:shadow-sm cursor-pointer select-none relative ${isExpanded ? 'z-50 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 shadow-xl scale-110' : ''}`
                                : isMobile
                                    ? `${card.bgColor} rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-md cursor-pointer select-none relative ${isExpanded ? 'z-50 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 shadow-xl scale-105' : ''}`
                                    : compact
                                        ? `${card.bgColor} rounded-md p-1.5 transition-all duration-200 hover:shadow-sm`
                                        : `${card.bgColor} rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-md`
                        }
                    >
                        {/* EBN: Horizontal layout */}
                        {/* Mobile: Horizontal layout - icon left with title, value below */}
                        {/* Desktop/Compact: Horizontal layout */}
                        {isEBN ? (
                            <div className="flex items-center gap-2">
                                <div className={`${card.iconBgColor} p-1.5 rounded-lg flex-shrink-0`}>
                                    <Icon className={`w-4 h-4 ${card.textColor}`} />
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight truncate">
                                        {card.title}
                                    </p>
                                    <p className={`text-xs font-bold ${card.textColor} leading-tight truncate`} title={fullValue}>
                                        {displayValue}
                                    </p>
                                </div>
                            </div>
                        ) : isMobile ? (
                            <div className="flex items-center gap-2">
                                <div className={`${card.iconBgColor} p-2 rounded-lg flex-shrink-0`}>
                                    <Icon className={`w-4 h-4 ${card.textColor}`} />
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight truncate">
                                        {card.title}
                                    </p>
                                    <p className={`text-xs font-bold ${card.textColor} leading-tight truncate`} title={fullValue}>
                                        {displayValue}
                                    </p>
                                </div>
                            </div>
                        ) : compact ? (
                            <div className="flex items-center gap-1.5">
                                <div className={`${card.iconBgColor} p-1 rounded flex-shrink-0`}>
                                    <Icon className={`w-3 h-3 ${card.textColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[8px] font-medium text-gray-500 dark:text-gray-400 truncate">
                                        {card.title}
                                    </p>
                                    <p className={`text-xs font-bold ${card.textColor} truncate`}>
                                        {fullValue}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`${card.iconBgColor} p-2 sm:p-2.5 rounded-lg flex-shrink-0`}>
                                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.textColor}`} />
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                                        {card.title}
                                    </p>
                                    <p className={`text-sm sm:text-lg font-bold ${card.textColor} truncate`} title={fullValue}>
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
                                <div className="flex items-center gap-3">
                                    <div className={`${card.iconBgColor} p-2 rounded-lg flex-shrink-0`}>
                                        <Icon className={`w-5 h-5 ${card.textColor}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
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

export default SaleSummaryCards;
