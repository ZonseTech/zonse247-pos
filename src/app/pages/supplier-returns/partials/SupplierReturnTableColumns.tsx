import { TableColumn } from 'react-data-table-component';
import { Eye, CheckCircle, Truck, PackageCheck, Ban, Trash2 } from 'lucide-react';
import { Badge, Box, Button, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes';

interface ReturnColumnOptions {
    onView: (r: SupplierReturnWithItems) => void;
    onApprove: (r: SupplierReturnWithItems) => void;
    onShip: (r: SupplierReturnWithItems) => void;
    onComplete: (r: SupplierReturnWithItems) => void;
    onCancel: (r: SupplierReturnWithItems) => void;
    onDelete: (r: SupplierReturnWithItems) => void;
}

export const returnStatusConfig: Record<SupplierReturnStatusType, { label: string; color: 'gray' | 'blue' | 'purple' | 'green' | 'red' }> = {
    DRAFT: { label: 'Draft', color: 'gray' },
    APPROVED: { label: 'Approved', color: 'blue' },
    SHIPPED: { label: 'Shipped', color: 'purple' },
    COMPLETED: { label: 'Completed', color: 'green' },
    CANCELLED: { label: 'Cancelled', color: 'red' },
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
                <Text size="2" weight="medium">
                    {row.returnNumber}
                </Text>
            ),
            grow: 1,
        },
        {
            name: 'Supplier',
            selector: (row) => row.supplier?.name || '',
            sortable: true,
            cell: (row) => (
                <Box py="1">
                    <Text as="p" size="2" weight="medium" truncate>
                        {row.supplier?.name || '—'}
                    </Text>
                    {row.purchaseOrder?.poNumber && (
                        <Text as="p" size="1" className="text-sky-600 dark:text-sky-400">
                            PO: {row.purchaseOrder.poNumber}
                        </Text>
                    )}
                </Box>
            ),
            grow: 2,
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => {
                const cfg = returnStatusConfig[row.status];
                return (
                    <Badge variant="soft" color={cfg.color} radius="full" size="1">
                        {cfg.label}
                    </Badge>
                );
            },
        },
        {
            name: 'Items',
            selector: (row) => row.items?.length || 0,
            cell: (row) => (
                <Text size="2" color="gray">
                    {row.items?.length || 0}
                </Text>
            ),
        },
        {
            name: 'Total',
            selector: (row) => row.totalAmount,
            sortable: true,
            cell: (row) => (
                <Text size="2" weight="bold">
                    {formatCurrency(row.totalAmount)}
                </Text>
            ),
            grow: 1,
            right: true,
        },
        {
            name: 'Date',
            selector: (row) => row.returnDate?.toString() || '',
            sortable: true,
            cell: (row) => (
                <Text size="2" color="gray">
                    {row.returnDate
                        ? new Date(row.returnDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })
                        : '—'}
                </Text>
            ),
            grow: 1,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <Flex align="center" gap="1">
                    <Tooltip content="View">
                        <IconButton
                            variant="ghost"
                            color="gray"
                            size="1"
                            onClick={() => onView(row)}
                            aria-label="View return"
                        >
                            <Eye className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>

                    {row.status === 'DRAFT' && (
                        <Button size="1" variant="soft" color="blue" onClick={() => onApprove(row)}>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                        </Button>
                    )}

                    {row.status === 'APPROVED' && (
                        <Button size="1" variant="soft" color="purple" onClick={() => onShip(row)}>
                            <Truck className="w-3.5 h-3.5" />
                            Ship
                        </Button>
                    )}

                    {row.status === 'SHIPPED' && (
                        <Button size="1" variant="soft" color="green" onClick={() => onComplete(row)}>
                            <PackageCheck className="w-3.5 h-3.5" />
                            Complete
                        </Button>
                    )}

                    {['DRAFT', 'APPROVED'].includes(row.status) && (
                        <Tooltip content="Cancel">
                            <IconButton
                                variant="ghost"
                                color="red"
                                size="1"
                                onClick={() => onCancel(row)}
                                aria-label="Cancel return"
                            >
                                <Ban className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {row.status === 'DRAFT' && (
                        <Tooltip content="Delete">
                            <IconButton
                                variant="ghost"
                                color="red"
                                size="1"
                                onClick={() => onDelete(row)}
                                aria-label="Delete return"
                            >
                                <Trash2 className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Flex>
            ),
            right: true,
        },
    ];
