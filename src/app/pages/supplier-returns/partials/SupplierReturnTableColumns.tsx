import { TableColumn } from 'react-data-table-component';
import { Eye, CheckCircle, Truck, PackageCheck, Ban, Trash2 } from 'lucide-react';

interface ReturnColumnOptions {
    onView: (r: SupplierReturnWithItems) => void;
    onApprove: (r: SupplierReturnWithItems) => void;
    onShip: (r: SupplierReturnWithItems) => void;
    onComplete: (r: SupplierReturnWithItems) => void;
    onCancel: (r: SupplierReturnWithItems) => void;
    onDelete: (r: SupplierReturnWithItems) => void;
}

export const returnStatusConfig: Record<SupplierReturnStatusType, { label: string; bg: string; text: string }> = {
    DRAFT: {
        label: 'Draft',
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-600 dark:text-gray-300',
    },
    APPROVED: {
        label: 'Approved',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
    },
    SHIPPED: {
        label: 'Shipped',
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-300',
    },
    COMPLETED: {
        label: 'Completed',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-300',
    },
    CANCELLED: {
        label: 'Cancelled',
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-300',
    },
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

export const getSupplierReturnTableColumns = ({
    onView,
    onApprove,
    onShip,
    onComplete,
    onCancel,
    onDelete,
}: ReturnColumnOptions): TableColumn<SupplierReturnWithItems>[] => [
        {
            name: 'Return #',
            selector: (row) => row.returnNumber,
            sortable: true,
            cell: (row) => (
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {row.returnNumber}
                </span>
            ),
            minWidth: '160px',
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
                const cfg = returnStatusConfig[row.status];
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                    </span>
                );
            },
            minWidth: '120px',
        },
        {
            name: 'Items',
            selector: (row) => row.items?.length || 0,
            cell: (row) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {row.items?.length || 0}
                </span>
            ),
            minWidth: '80px',
        },
        {
            name: 'Total',
            selector: (row) => row.totalAmount,
            sortable: true,
            cell: (row) => (
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.totalAmount)}
                </span>
            ),
            minWidth: '140px',
            grow: 1,
            right: true,
        },
        {
            name: 'Date',
            selector: (row) => row.returnDate?.toString() || '',
            sortable: true,
            cell: (row) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {row.returnDate
                        ? new Date(row.returnDate).toLocaleDateString('en-US', {
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

                    {row.status === 'DRAFT' && (
                        <button
                            onClick={() => onApprove(row)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Approve"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}

                    {row.status === 'APPROVED' && (
                        <button
                            onClick={() => onShip(row)}
                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title="Ship"
                        >
                            <Truck className="w-4 h-4" />
                        </button>
                    )}

                    {row.status === 'SHIPPED' && (
                        <button
                            onClick={() => onComplete(row)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            title="Complete"
                        >
                            <PackageCheck className="w-4 h-4" />
                        </button>
                    )}

                    {['DRAFT', 'APPROVED'].includes(row.status) && (
                        <button
                            onClick={() => onCancel(row)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Cancel"
                        >
                            <Ban className="w-4 h-4" />
                        </button>
                    )}

                    {row.status === 'DRAFT' && (
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
            minWidth: '180px',
            right: true,
        },
    ];
