import { TableColumn } from 'react-data-table-component';
import { Eye, CheckCircle, FileCheck, Ban } from 'lucide-react';
import { Badge, Button, IconButton, Tooltip, Flex } from '@radix-ui/themes';

interface GRNColumnOptions {
    onView: (grn: GoodsReceiptWithItems) => void;
    onVerify: (grn: GoodsReceiptWithItems) => void;
    onPost: (grn: GoodsReceiptWithItems) => void;
    onCancel: (grn: GoodsReceiptWithItems) => void;
}

export const grnStatusConfig: Record<GRNStatusType, { label: string; color: 'gray' | 'blue' | 'green' | 'red' }> = {
    DRAFT: { label: 'Draft', color: 'gray' },
    VERIFIED: { label: 'Verified', color: 'blue' },
    POSTED: { label: 'Posted', color: 'green' },
    CANCELLED: { label: 'Cancelled', color: 'red' },
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
            grow: 2,
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => {
                const cfg = grnStatusConfig[row.status];
                return (
                    <Badge variant="soft" color={cfg.color} radius="full">
                        {cfg.label}
                    </Badge>
                );
            },
            minWidth: '120px',
            grow: 0,
        },
        {
            name: 'Items',
            selector: (row) => row.items?.length || 0,
            cell: (row) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {row.items?.length || 0}
                </span>
            ),
            grow: 0,
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
            grow: 1,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <Flex align="center" gap="2">
                    <Tooltip content="View details">
                        <IconButton variant="ghost" size="1" onClick={() => onView(row)}>
                            <Eye className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>

                    {row.status === 'DRAFT' && (
                        <Button size="1" variant="soft" color="blue" onClick={() => onVerify(row)}>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Verify
                        </Button>
                    )}

                    {row.status === 'VERIFIED' && (
                        <Button size="1" variant="soft" color="green" onClick={() => onPost(row)}>
                            <FileCheck className="w-3.5 h-3.5" />
                            Post
                        </Button>
                    )}

                    {['DRAFT', 'VERIFIED'].includes(row.status) && (
                        <Tooltip content="Cancel receipt">
                            <IconButton variant="ghost" color="red" size="1" onClick={() => onCancel(row)}>
                                <Ban className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Flex>
            ),
            grow: 0,
            right: true,
        },
    ];
