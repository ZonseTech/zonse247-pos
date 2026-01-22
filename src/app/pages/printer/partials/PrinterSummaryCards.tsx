import { FunctionComponent, ReactNode } from 'react';
import { Printer, Wifi, WifiOff, AlertTriangle, Star } from 'lucide-react';

export interface PrinterSummaryCard {
    title: string;
    value: number;
    icon: ReactNode;
    color: string;
    bgColor: string;
}

interface PrinterSummaryCardsProps {
    cards: PrinterSummaryCard[];
    isLoading?: boolean;
}

const PrinterSummaryCards: FunctionComponent<PrinterSummaryCardsProps> = ({
    cards,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 animate-pulse"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
                        </div>
                        <div className="h-6 w-8 bg-gray-200 dark:bg-gray-600 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`${card.bgColor} rounded-lg p-3 transition-all hover:scale-[1.02]`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 ${card.color}`}>
                            {card.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                            {card.title}
                        </span>
                    </div>
                    <p className={`text-xl font-bold ${card.color}`}>
                        {card.value}
                    </p>
                </div>
            ))}
        </div>
    );
};

export const getDefaultPrinterSummaryCards = (
    total: number,
    online: number,
    offline: number,
    defaultCount: number
): PrinterSummaryCard[] => [
        {
            title: 'Total',
            value: total,
            icon: <Printer className="w-4 h-4" />,
            color: 'text-sky-600 dark:text-sky-400',
            bgColor: 'bg-sky-50 dark:bg-sky-900/20'
        },
        {
            title: 'Online',
            value: online,
            icon: <Wifi className="w-4 h-4" />,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            title: 'Offline',
            value: offline,
            icon: <WifiOff className="w-4 h-4" />,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-700/50'
        },
        {
            title: 'Default',
            value: defaultCount,
            icon: <Star className="w-4 h-4" />,
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        }
    ];

export default PrinterSummaryCards;
