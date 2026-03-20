import { TableColumn } from 'react-data-table-component';
import { Eye, CheckCircle, FileCheck, Ban } from 'lucide-react';

interface GRNColumnOptions {
    onView: (grn: GoodsReceiptWithItems) => void;
    onVerify: (grn: GoodsReceiptWithItems) => void;
    onPost: (grn: GoodsReceiptWithItems) => void;
    onCancel: (grn: GoodsReceiptWithItems) => void;
}

export const grnStatusConfig: Record<GRNStatusType, { label: string; bg: string; text: string }> = {
    DRAFT: {
        label: 'Draft',
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-600 dark:text-gray-300',
    },
    VERIFIED: {
        label: 'Verified',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
    },
    POSTED: {
        label: 'Posted',
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

export const getGoodsReceiptTableColumns = ({
    onView,
    onVerify,
    onPost,
    onCancel,
}: GRNColumnOptions): TableColumn<GoodsReceiptWithItems>[] => [
        {
            name: 'Receipt #',
            selector: (row) => row.receiptNumber,
            sortable: true,
            cell: (row) => (
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {row.receiptNumber}
                </span>
            ),
            minWidth: '160px',
            grow: 1,
        },
        {
            name: 'PO Reference',
            selector: (row) => row.purchaseOrder?.poNumber || '',
            sortable: true,
            cell: (row) => (
                <div className="text-sm py-1">
                    <span className="text-sky-600 dark:text-sky-400 font-medium">
                        {row.purchaseOrder?.poNumber || '—'}
                    </span>
                    {row.purchaseOrder?.supplier?.name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {row.purchaseOrder.supplier.name}
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
                const cfg = grnStatusConfig[row.status];
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
            name: 'Total Cost',
            selector: (row) =>
                row.items?.reduce((sum, item) => sum + (item.totalCost || item.receivedQuantity * item.unitCost), 0) || 0,
            sortable: true,
            cell: (row) => {
                const totalCost = row.items?.reduce(
                    (sum, item) => sum + (item.totalCost || item.receivedQuantity * item.unitCost),
                    0,
                ) || 0;
                return (
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(totalCost)}
                    </span>
                );
            },
            minWidth: '140px',
            grow: 1,
            right: true,
        },
        {
            name: 'Received',
            selector: (row) => row.receivedAt?.toString() || '',
            sortable: true,
            cell: (row) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {row.receivedAt
                        ? new Date(row.receivedAt).toLocaleDateString('en-US', {
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
                            onClick={() => onVerify(row)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Verify"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}

                    {row.status === 'VERIFIED' && (
                        <button
                            onClick={() => onPost(row)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            title="Post (Stock Update)"
                        >
                            <FileCheck className="w-4 h-4" />
                        </button>
                    )}

                    {['DRAFT', 'VERIFIED'].includes(row.status) && (
                        <button
                            onClick={() => onCancel(row)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Cancel"
                        >
                            <Ban className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
            minWidth: '150px',
            right: true,
        },
    ];
