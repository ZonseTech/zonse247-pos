import { FC } from 'react';
import { Package, Clock, CheckCircle2, FileCheck, LucideIcon } from 'lucide-react';

export interface GoodsReceiptSummaryCard {
    title: string;
    value: number;
    displayValue?: string;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
    icon?: 'total' | 'draft' | 'verified' | 'posted';
}

interface GoodsReceiptSummaryCardsProps {
    cards: GoodsReceiptSummaryCard[];
    isLoading?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    total: Package,
    draft: Clock,
    verified: CheckCircle2,
    posted: FileCheck,
};

const GoodsReceiptSummaryCards: FC<GoodsReceiptSummaryCardsProps> = ({ cards, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16" />
                                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-10" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            {cards.map((card, index) => {
                const IconComponent = card.icon ? iconMap[card.icon] : Package;
                return (
                    <div
                        key={index}
                        className={`${card.bgColor} rounded-xl p-3 transition-all duration-200 hover:shadow-md`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${card.iconBgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <IconComponent className={`w-5 h-5 ${card.textColor}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{card.title}</p>
                                <p className={`text-lg font-bold ${card.textColor}`}>
                                    {card.displayValue ?? card.value}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GoodsReceiptSummaryCards;
