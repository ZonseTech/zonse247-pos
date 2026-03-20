import type { FunctionComponent } from 'react';
import { Eye, Ban, AlertTriangle, Trash2, CreditCard } from 'lucide-react';
import { invoiceStatusConfig } from './SupplierInvoiceTableColumns';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

interface SupplierInvoiceMobileCardProps {
    invoice: SupplierInvoiceWithItems;
    onView: (invoice: SupplierInvoiceWithItems) => void;
    onCancel: (invoice: SupplierInvoiceWithItems) => void;
    onDispute: (invoice: SupplierInvoiceWithItems) => void;
    onDelete: (invoice: SupplierInvoiceWithItems) => void;
    onRecordPayment?: (invoice: SupplierInvoiceWithItems) => void;
}

const SupplierInvoiceMobileCard: FunctionComponent<SupplierInvoiceMobileCardProps> = ({
    invoice,
    onView,
    onCancel,
    onDispute,
    onDelete,
    onRecordPayment,
}) => {
    const cfg = invoiceStatusConfig[invoice.status];
    const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.balanceDue > 0;

    return (
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {invoice.invoiceNumber}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {invoice.supplier?.name || '—'}
                    </p>
                    {invoice.purchaseOrder?.poNumber && (
                        <p className="text-xs text-sky-600 dark:text-sky-400">
                            PO: {invoice.purchaseOrder.poNumber}
                        </p>
                    )}
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(invoice.totalAmount)}
                    </p>
                    <p className={`text-xs font-medium ${invoice.balanceDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        Due: {formatCurrency(invoice.balanceDue)}
                    </p>
                    {(() => {
                        const paidPercent = invoice.totalAmount > 0 ? Math.round((invoice.amountPaid / invoice.totalAmount) * 100) : 0;
                        const showProgress = invoice.status === 'PARTIALLY_PAID' || (invoice.amountPaid > 0 && invoice.status !== 'PAID');
                        if (!showProgress) return null;
                        return (
                            <div className="mt-1">
                                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${paidPercent}%` }} />
                                </div>
                                <span className="text-[9px] text-gray-500 dark:text-gray-400">{paidPercent}% paid</span>
                            </div>
                        );
                    })()}
                </div>
            </div>

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{invoice.items?.length || 0} items</span>
                    {invoice.dueDate && (
                        <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                            Due: {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onView(invoice)}
                        className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {['PENDING', 'OVERDUE', 'PARTIALLY_PAID'].includes(invoice.status) && (
                        <button
                            onClick={() => onDispute(invoice)}
                            className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        >
                            <AlertTriangle className="w-4 h-4" />
                        </button>
                    )}
                    {['PENDING', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status) && onRecordPayment && (
                        <button
                            onClick={() => onRecordPayment(invoice)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                        >
                            <CreditCard className="w-4 h-4" />
                        </button>
                    )}
                    {['PENDING', 'DISPUTED'].includes(invoice.status) && (
                        <button
                            onClick={() => onCancel(invoice)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <Ban className="w-4 h-4" />
                        </button>
                    )}
                    {['PENDING', 'CANCELLED'].includes(invoice.status) && (
                        <button
                            onClick={() => onDelete(invoice)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Mobile List Wrapper ────────────────────────────────────────────────────

interface SupplierInvoiceMobileListProps {
    invoices: SupplierInvoiceWithItems[];
    onView: (invoice: SupplierInvoiceWithItems) => void;
    onCancel: (invoice: SupplierInvoiceWithItems) => void;
    onDispute: (invoice: SupplierInvoiceWithItems) => void;
    onDelete: (invoice: SupplierInvoiceWithItems) => void;
    onRecordPayment?: (invoice: SupplierInvoiceWithItems) => void;
    isLoading: boolean;
}

export const SupplierInvoiceMobileList: FunctionComponent<SupplierInvoiceMobileListProps> = ({
    invoices,
    onView,
    onCancel,
    onDispute,
    onDelete,
    onRecordPayment,
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
                        <div className="flex items-center justify-between mt-3">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                            <div className="flex gap-1">
                                <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {invoices.map((invoice) => (
                <SupplierInvoiceMobileCard
                    key={invoice.id}
                    invoice={invoice}
                    onView={onView}
                    onCancel={onCancel}
                    onDispute={onDispute}
                    onDelete={onDelete}
                    onRecordPayment={onRecordPayment}
                />
            ))}
        </div>
    );
};

export default SupplierInvoiceMobileCard;
