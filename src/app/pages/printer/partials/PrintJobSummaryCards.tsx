import { FunctionComponent, ReactNode } from 'react';
import {
    FileText,
    Clock,
    Loader2,
    CheckCircle,
    XCircle,
    Ban
} from 'lucide-react';

export interface PrintJobSummaryCard {
    title: string;
    value: number;
    icon: ReactNode;
    color: string;
    bgColor: string;
}

interface PrintJobSummaryCardsProps {
    cards: PrintJobSummaryCard[];
    isLoading?: boolean;
}

const PrintJobSummaryCards: FunctionComponent<PrintJobSummaryCardsProps> = ({
    cards,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 animate-pulse"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                            <div className="h-4 w-14 bg-gray-200 dark:bg-gray-600 rounded" />
                        </div>
                        <div className="h-6 w-8 bg-gray-200 dark:bg-gray-600 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
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

export const getDefaultPrintJobSummaryCards = (
    total: number,
    pending: number,
    printing: number,
    completed: number,
    failed: number,
    cancelled: number
): PrintJobSummaryCard[] => [
        {
            title: 'Total',
            value: total,
            icon: <FileText className="w-4 h-4" />,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            title: 'Pending',
            value: pending,
            icon: <Clock className="w-4 h-4" />,
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        },
        {
            title: 'Printing',
            value: printing,
            icon: <Loader2 className="w-4 h-4" />,
            color: 'text-sky-600 dark:text-sky-400',
            bgColor: 'bg-sky-50 dark:bg-sky-900/20'
        },
        {
            title: 'Completed',
            value: completed,
            icon: <CheckCircle className="w-4 h-4" />,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            title: 'Failed',
            value: failed,
            icon: <XCircle className="w-4 h-4" />,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-900/20'
        },
        {
            title: 'Cancelled',
            value: cancelled,
            icon: <Ban className="w-4 h-4" />,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-700/50'
        }
    ];

export default PrintJobSummaryCards;
