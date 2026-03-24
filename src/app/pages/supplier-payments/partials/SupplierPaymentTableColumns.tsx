import { TableColumn } from 'react-data-table-component';
import { Eye, Ban } from 'lucide-react';
import { Badge, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes';

interface PaymentColumnOptions {
    onView: (payment: SupplierPaymentWithAllocations) => void;
    onVoid: (payment: SupplierPaymentWithAllocations) => void;
}

export const paymentStatusConfig: Record<PaymentStatusType, { label: string; color: 'orange' | 'green' | 'red' | 'gray' }> = {
    PENDING: { label: 'Pending', color: 'orange' },
    COMPLETED: { label: 'Completed', color: 'green' },
    FAILED: { label: 'Failed', color: 'red' },
    REFUNDED: { label: 'Refunded', color: 'orange' },
    CANCELLED: { label: 'Voided', color: 'gray' },
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
                <Text size="2" weight="medium">
                    {row.paymentNumber}
                </Text>
            ),
            minWidth: '170px',
            grow: 1,
        },
        {
            name: 'Supplier',
            selector: (row) => row.supplier?.name || '',
            sortable: true,
            cell: (row) => (
                <Text size="2" weight="medium" truncate>
                    {row.supplier?.name || '—'}
                </Text>
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
                    <Badge variant="soft" color={cfg.color} radius="full" size="1">
                        {cfg.label}
                    </Badge>
                );
            },
            minWidth: '120px',
        },
        {
            name: 'Amount',
            selector: (row) => row.amount,
            sortable: true,
            cell: (row) => (
                <Text size="2" weight="bold">
                    {formatCurrency(row.amount)}
                </Text>
            ),
            minWidth: '140px',
            grow: 1,
            right: true,
        },
        {
            name: 'Method',
            selector: (row) => row.paymentMethod || '',
            cell: (row) => (
                <Text size="2" color="gray" className="capitalize">
                    {row.paymentMethod || '—'}
                </Text>
            ),
            minWidth: '120px',
            grow: 1,
        },
        {
            name: 'Invoices',
            selector: (row) => row.allocations?.length || 0,
            cell: (row) => (
                <Text size="2" color="gray">
                    {row.allocations?.length || 0}
                </Text>
            ),
            minWidth: '80px',
        },
        {
            name: 'Date',
            selector: (row) => row.paymentDate?.toString() || '',
            sortable: true,
            cell: (row) => (
                <Text size="2" color="gray">
                    {row.paymentDate
                        ? new Date(row.paymentDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })
                        : '—'}
                </Text>
            ),
            minWidth: '130px',
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
                            aria-label="View payment"
                        >
                            <Eye className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    {row.status === 'COMPLETED' && (
                        <Tooltip content="Void Payment">
                            <IconButton
                                variant="ghost"
                                color="red"
                                size="1"
                                onClick={() => onVoid(row)}
                                aria-label="Void payment"
                            >
                                <Ban className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Flex>
            ),
            minWidth: '100px',
            right: true,
        },
    ];
