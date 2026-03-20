import { TableColumn } from 'react-data-table-component';
import { Eye, Ban } from 'lucide-react';

interface PaymentColumnOptions {
    onView: (payment: SupplierPaymentWithAllocations) => void;
    onVoid: (payment: SupplierPaymentWithAllocations) => void;
}

export const paymentStatusConfig: Record<PaymentStatusType, { label: string; bg: string; text: string }> = {
    PENDING: {
        label: 'Pending',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-300',
    },
    COMPLETED: {
        label: 'Completed',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-300',
    },
    FAILED: {
        label: 'Failed',
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-300',
    },
    REFUNDED: {
        label: 'Refunded',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-300',
    },
    CANCELLED: {
        label: 'Voided',
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-600 dark:text-gray-300',
    },
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

export const getSupplierPaymentTableColumns = ({
    onView,
    onVoid,
}: PaymentColumnOptions): TableColumn<SupplierPaymentWithAllocations>[] => [
        {
            name: 'Payment #',
            selector: (row) => row.paymentNumber,
            sortable: true,
            cell: (row) => (
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {row.paymentNumber}
                </span>
            ),
            minWidth: '170px',
            grow: 1,
        },
        {
            name: 'Supplier',
            selector: (row) => row.supplier?.name || '',
            sortable: true,
            cell: (row) => (
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block">
                    {row.supplier?.name || '—'}
                </span>
            ),
            minWidth: '160px',
            grow: 2,
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => {
                const cfg = paymentStatusConfig[row.status];
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                    </span>
                );
            },
            minWidth: '120px',
        },
        {
            name: 'Amount',
            selector: (row) => row.amount,
            sortable: true,
            cell: (row) => (
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.amount)}
                </span>
            ),
            minWidth: '140px',
            grow: 1,
            right: true,
        },
        {
            name: 'Method',
            selector: (row) => row.paymentMethod || '',
            cell: (row) => (
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {row.paymentMethod || '—'}
                </span>
            ),
            minWidth: '120px',
            grow: 1,
        },
        {
            name: 'Invoices',
            selector: (row) => row.allocations?.length || 0,
            cell: (row) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {row.allocations?.length || 0}
                </span>
            ),
            minWidth: '80px',
        },
        {
            name: 'Date',
            selector: (row) => row.paymentDate?.toString() || '',
            sortable: true,
            cell: (row) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {row.paymentDate
                        ? new Date(row.paymentDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })
                        : '—'}
                </span>
            ),
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
                    {row.status === 'COMPLETED' && (
                        <button
                            onClick={() => onVoid(row)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Void Payment"
                        >
                            <Ban className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
            minWidth: '100px',
            right: true,
        },
    ];
