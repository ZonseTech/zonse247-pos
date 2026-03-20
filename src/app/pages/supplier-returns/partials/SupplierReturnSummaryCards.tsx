import type { FunctionComponent } from 'react';
import { RotateCcw, FileEdit, Truck, CheckCircle2, XCircle } from 'lucide-react';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

interface SupplierReturnSummaryCardsProps {
    returns: SupplierReturnWithItems[];
    isLoading?: boolean;
}

const SupplierReturnSummaryCards: FunctionComponent<SupplierReturnSummaryCardsProps> = ({ returns, isLoading }) => {
    const total = returns.length;
    const drafts = returns.filter((r) => r.status === 'DRAFT').length;
    const shipped = returns.filter((r) => r.status === 'SHIPPED').length;
    const completed = returns.filter((r) => r.status === 'COMPLETED').length;
    const totalValue = returns
        .filter((r) => r.status !== 'CANCELLED')
        .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

    const cards = [
        {
            label: 'Total Returns',
            value: total.toString(),
            icon: RotateCcw,
            color: 'text-sky-500 dark:text-sky-400',
            bg: 'bg-sky-50 dark:bg-sky-900/20',
            iconBg: 'bg-sky-100 dark:bg-sky-900/40',
        },
        {
            label: 'Drafts',
            value: drafts.toString(),
            icon: FileEdit,
            color: 'text-gray-500 dark:text-gray-400',
            bg: 'bg-gray-50 dark:bg-gray-800/40',
            iconBg: 'bg-gray-100 dark:bg-gray-700',
        },
        {
            label: 'In Transit',
            value: shipped.toString(),
            icon: Truck,
            color: 'text-purple-500 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            iconBg: 'bg-purple-100 dark:bg-purple-900/40',
        },
        {
            label: 'Completed',
            value: completed.toString(),
            icon: CheckCircle2,
            color: 'text-emerald-500 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
        },
        {
            label: 'Total Value',
            value: formatCurrency(totalValue),
            icon: XCircle,
            color: 'text-indigo-500 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`flex items-center gap-3 p-3 rounded-xl ${card.bg} transition-all duration-200`}
                >
                    <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg ${card.iconBg}`}>
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                        {isLoading ? (
                            <div className="h-5 w-12 bg-gray-200 dark:bg-gray-600 animate-pulse rounded mt-0.5" />
                        ) : (
                            <p className={`text-lg font-bold ${card.color} truncate`}>{card.value}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SupplierReturnSummaryCards;
