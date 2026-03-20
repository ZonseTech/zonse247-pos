import type { FunctionComponent } from 'react';
import { Receipt, Clock, CheckCircle2, XCircle, Banknote } from 'lucide-react';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

interface CreditNoteSummaryCardsProps {
    creditNotes: SupplierCreditNote[];
    isLoading?: boolean;
}

const CreditNoteSummaryCards: FunctionComponent<CreditNoteSummaryCardsProps> = ({ creditNotes, isLoading }) => {
    const total = creditNotes.length;
    const pending = creditNotes.filter((cn) => cn.status === 'PENDING').length;
    const applied = creditNotes.filter((cn) => cn.status === 'APPLIED').length;
    const cancelled = creditNotes.filter((cn) => cn.status === 'CANCELLED').length;
    const totalValue = creditNotes
        .filter((cn) => cn.status !== 'CANCELLED')
        .reduce((sum, cn) => sum + (cn.amount || 0), 0);

    const cards = [
        {
            label: 'Total Notes',
            value: total.toString(),
            icon: Receipt,
            color: 'text-sky-500 dark:text-sky-400',
            bg: 'bg-sky-50 dark:bg-sky-900/20',
            iconBg: 'bg-sky-100 dark:bg-sky-900/40',
        },
        {
            label: 'Pending',
            value: pending.toString(),
            icon: Clock,
            color: 'text-amber-500 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            iconBg: 'bg-amber-100 dark:bg-amber-900/40',
        },
        {
            label: 'Applied',
            value: applied.toString(),
            icon: CheckCircle2,
            color: 'text-emerald-500 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
        },
        {
            label: 'Cancelled',
            value: cancelled.toString(),
            icon: XCircle,
            color: 'text-red-500 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-900/20',
            iconBg: 'bg-red-100 dark:bg-red-900/40',
        },
        {
            label: 'Total Value',
            value: formatCurrency(totalValue),
            icon: Banknote,
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

export default CreditNoteSummaryCards;
