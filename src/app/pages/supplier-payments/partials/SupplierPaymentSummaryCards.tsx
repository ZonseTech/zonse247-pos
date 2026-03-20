import type { FunctionComponent } from 'react';
import { CreditCard, CheckCircle2, XCircle, DollarSign } from 'lucide-react';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

interface SupplierPaymentSummaryCardsProps {
    payments: SupplierPaymentWithAllocations[];
    isLoading?: boolean;
}

const SupplierPaymentSummaryCards: FunctionComponent<SupplierPaymentSummaryCardsProps> = ({ payments, isLoading }) => {
    const total = payments.length;
    const completed = payments.filter((p) => p.status === 'COMPLETED').length;
    const voided = payments.filter((p) => p.status === 'CANCELLED').length;
    const totalAmount = payments
        .filter((p) => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    const cards = [
        {
            label: 'Total Payments',
            value: total.toString(),
            icon: CreditCard,
            color: 'text-sky-500 dark:text-sky-400',
            bg: 'bg-sky-50 dark:bg-sky-900/20',
            iconBg: 'bg-sky-100 dark:bg-sky-900/40',
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
            label: 'Voided',
            value: voided.toString(),
            icon: XCircle,
            color: 'text-gray-500 dark:text-gray-400',
            bg: 'bg-gray-50 dark:bg-gray-800/40',
            iconBg: 'bg-gray-100 dark:bg-gray-700',
        },
        {
            label: 'Total Paid',
            value: formatCurrency(totalAmount),
            icon: DollarSign,
            color: 'text-indigo-500 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
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

export default SupplierPaymentSummaryCards;
