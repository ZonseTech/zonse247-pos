import type { FunctionComponent } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';

export interface SupplierInvoiceSummaryCard {
    title: string;
    value: number | string;
    icon: 'total' | 'pending' | 'paid' | 'overdue' | 'outstanding';
    bgColor: string;
    iconBgColor: string;
    textColor: string;
}

interface Props {
    cards: SupplierInvoiceSummaryCard[];
    isLoading: boolean;
}

const iconMap = {
    total: FileText,
    pending: Clock,
    paid: CheckCircle2,
    overdue: AlertCircle,
    outstanding: DollarSign,
};

const SupplierInvoiceSummaryCards: FunctionComponent<Props> = ({ cards, isLoading }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            {cards.map((card, index) => {
                const Icon = iconMap[card.icon];
                return (
                    <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-xl ${card.bgColor} transition-all duration-200`}
                    >
                        <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg ${card.iconBgColor}`}>
                            <Icon className={`w-5 h-5 ${card.textColor}`} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.title}</p>
                            {isLoading ? (
                                <div className="h-5 w-12 bg-gray-200 dark:bg-gray-600 animate-pulse rounded mt-0.5" />
                            ) : (
                                <p className={`text-lg font-bold ${card.textColor} truncate`}>{card.value}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SupplierInvoiceSummaryCards;
