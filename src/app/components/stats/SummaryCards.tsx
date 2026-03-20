import { FC, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SummaryCardItem {
    title: string;
    value: string | number;
    subtitle?: string;
    displayValue?: string;
    icon: ReactNode;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
}

export interface SummaryCardsProps {
    cards: SummaryCardItem[];
    isLoading?: boolean;
    /** Number of skeleton placeholders to show while loading (default: cards.length or 4) */
    skeletonCount?: number;
    /** Grid columns class override (default: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4") */
    gridClassName?: string;
    /** Whether rendered inside a table card (adds border-b + padding) vs standalone (adds mb-6) */
    variant?: 'standalone' | 'embedded';
}

// ─── Component ─────────────────────────────────────────────────────────────────

const SummaryCards: FC<SummaryCardsProps> = ({
    cards,
    isLoading = false,
    skeletonCount,
    gridClassName = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    variant = 'standalone',
}) => {
    const count = (skeletonCount ?? cards.length) || 4;

    const wrapperClass = variant === 'embedded'
        ? `grid ${gridClassName} gap-3 p-4 border-b border-gray-200 dark:border-gray-700`
        : `grid ${gridClassName} gap-4 mb-6`;

    if (isLoading) {
        return (
            <div className={wrapperClass}>
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0" />
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16" />
                                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={wrapperClass}>
            {cards.map((card, index) => {
                const display = card.displayValue ?? (typeof card.value === 'number' ? card.value.toLocaleString() : card.value);

                return (
                    <div
                        key={index}
                        className={`${card.bgColor} rounded-lg p-4 border border-transparent transition-all duration-200 hover:shadow-md`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`${card.iconBgColor} ${card.textColor} p-2.5 rounded-lg flex-shrink-0`}>
                                {card.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                                    {card.title}
                                </p>
                                <p className={`text-lg font-bold ${card.textColor} leading-tight`}>
                                    {display}
                                </p>
                                {card.subtitle && (
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                                        {card.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryCards;
