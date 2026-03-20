import type { FunctionComponent } from 'react';
import { Eye, Ban } from 'lucide-react';
import { paymentStatusConfig } from './SupplierPaymentTableColumns';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

interface SupplierPaymentMobileCardProps {
    payment: SupplierPaymentWithAllocations;
    onView: (payment: SupplierPaymentWithAllocations) => void;
    onVoid: (payment: SupplierPaymentWithAllocations) => void;
}

const SupplierPaymentMobileCard: FunctionComponent<SupplierPaymentMobileCardProps> = ({
    payment,
    onView,
    onVoid,
}) => {
    const cfg = paymentStatusConfig[payment.status];

    return (
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {payment.paymentNumber}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {payment.supplier?.name || '—'}
                    </p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(payment.amount)}
                    </p>
                    {payment.paymentMethod && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {payment.paymentMethod}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{payment.allocations?.length || 0} invoice(s)</span>
                    {payment.paymentDate && (
                        <span>
                            {new Date(payment.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onView(payment)}
                        className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {payment.status === 'COMPLETED' && (
                        <button
                            onClick={() => onVoid(payment)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <Ban className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Mobile List Wrapper ────────────────────────────────────────────────────

interface SupplierPaymentMobileListProps {
    payments: SupplierPaymentWithAllocations[];
    onView: (payment: SupplierPaymentWithAllocations) => void;
    onVoid: (payment: SupplierPaymentWithAllocations) => void;
    isLoading: boolean;
}

export const SupplierPaymentMobileList: FunctionComponent<SupplierPaymentMobileListProps> = ({
    payments,
    onView,
    onVoid,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 animate-pulse">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                            </div>
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {payments.map((payment) => (
                <SupplierPaymentMobileCard
                    key={payment.id}
                    payment={payment}
                    onView={onView}
                    onVoid={onVoid}
                />
            ))}
        </div>
    );
};

export default SupplierPaymentMobileCard;
