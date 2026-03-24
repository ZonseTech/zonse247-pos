import { TableColumn } from 'react-data-table-component';
import { Eye, Ban, AlertTriangle, Trash2, CreditCard } from 'lucide-react';

interface InvoiceColumnOptions {
    onView: (invoice: SupplierInvoiceWithItems) => void;
    onCancel: (invoice: SupplierInvoiceWithItems) => void;
    onDispute: (invoice: SupplierInvoiceWithItems) => void;
    onDelete: (invoice: SupplierInvoiceWithItems) => void;
    onRecordPayment?: (invoice: SupplierInvoiceWithItems) => void;
}

export const invoiceStatusConfig: Record<InvoiceStatusType, { label: string; bg: string; text: string; color: string }> = {
    PENDING: {
        label: 'Pending',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-300',
        color: 'amber',
    },
    PARTIALLY_PAID: {
        label: 'Partially Paid',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        color: 'blue',
    },
    PAID: {
        label: 'Paid',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        color: 'green',
    },
    OVERDUE: {
        label: 'Overdue',
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-300',
        color: 'red',
    },
    CANCELLED: {
        label: 'Cancelled',
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-600 dark:text-gray-300',
        color: 'gray',
    },
    DISPUTED: {
        label: 'Disputed',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-300',
        color: 'orange',
    },
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

export const getSupplierInvoiceTableColumns = ({
    onView,
    onCancel,
    onDispute,
    onDelete,
    onRecordPayment,
}: InvoiceColumnOptions): TableColumn<SupplierInvoiceWithItems>[] => [
        {
            name: 'Invoice #',
            selector: (row) => row.invoiceNumber,
            sortable: true,
            cell: (row) => (
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {row.invoiceNumber}
                </span>
            ),
            minWidth: '150px',
            grow: 1,
        },
        {
            name: 'Supplier',
            selector: (row) => row.supplier?.name || '',
            sortable: true,
            cell: (row) => (
                <div className="text-sm py-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate block">
                        {row.supplier?.name || '—'}
                    </span>
                    {row.purchaseOrder?.poNumber && (
                        <p className="text-xs text-sky-600 dark:text-sky-400">
                            PO: {row.purchaseOrder.poNumber}
                        </p>
                    )}
                </div>
            ),
            minWidth: '160px',
            grow: 2,
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => {
                const cfg = invoiceStatusConfig[row.status];
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                    </span>
                );
            },
            minWidth: '130px',
        },
        {
            name: 'Total',
            selector: (row) => row.totalAmount,
            sortable: true,
            cell: (row) => (
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.totalAmount)}
                </span>
            ),
            minWidth: '130px',
            grow: 1,
            right: true,
        },
        {
            name: 'Balance Due',
            selector: (row) => row.balanceDue,
            sortable: true,
            cell: (row) => {
                const paidPercent = row.totalAmount > 0 ? Math.round((row.amountPaid / row.totalAmount) * 100) : 0;
                const showProgress = row.status === 'PARTIALLY_PAID' || (row.amountPaid > 0 && row.status !== 'PAID');
                return (
                    <div className="min-w-[100px]">
                        <span className={`text-sm font-semibold ${row.balanceDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {formatCurrency(row.balanceDue)}
                        </span>
                        {showProgress && (
                            <div className="mt-1">
                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-blue-500 transition-all"
                                        style={{ width: `${paidPercent}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {paidPercent}% paid
                                </span>
                            </div>
                        )}
                    </div>
                );
            },
            minWidth: '130px',
            grow: 1,
            right: true,
        },
        {
            name: 'Due Date',
            selector: (row) => row.dueDate?.toString() || '',
            sortable: true,
            cell: (row) => {
                const isOverdue = row.dueDate && new Date(row.dueDate) < new Date() && row.balanceDue > 0;
                return (
                    <span className={`text-sm ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                        {row.dueDate
                            ? new Date(row.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })
                            : '—'}
                    </span>
                );
            },
            minWidth: '130px',
            grow: 1,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onView(row)}
                        className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </button>

                    {['PENDING', 'OVERDUE', 'PARTIALLY_PAID'].includes(row.status) && (
                        <button
                            onClick={() => onDispute(row)}
                            className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                            title="Dispute"
                        >
                            <AlertTriangle className="w-4 h-4" />
                        </button>
                    )}
                    {['PENDING', 'PARTIALLY_PAID', 'OVERDUE'].includes(row.status) && onRecordPayment && (
                        <button
                            onClick={() => onRecordPayment(row)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            title="Record Payment"
                        >
                            <CreditCard className="w-4 h-4" />
                        </button>
                    )}
                    {['PENDING', 'DISPUTED'].includes(row.status) && (
                        <button
                            onClick={() => onCancel(row)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Cancel"
                        >
                            <Ban className="w-4 h-4" />
                        </button>
                    )}

                    {['PENDING', 'CANCELLED'].includes(row.status) && (
                        <button
                            onClick={() => onDelete(row)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
            minWidth: '150px',
            right: true,
        },
    ];
