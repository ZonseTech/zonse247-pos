import { TableColumn } from 'react-data-table-component';
import { Eye, XCircle, Send, CheckCircle2, Package } from 'lucide-react';
import { Badge, Button, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes';
import dayjs from 'dayjs';

interface PurchaseOrderTableActionsProps {
    onReceive: (po: PurchaseOrder) => void;
    onSend: (po: PurchaseOrder) => void;
    onCancel: (po: PurchaseOrder) => void;
    onView: (po: PurchaseOrder) => void;
}

const statusColorMap: Record<PurchaseOrderStatus, 'gray' | 'yellow' | 'indigo' | 'purple' | 'sky' | 'green' | 'red'> = {
    DRAFT: 'gray',
    PENDING: 'yellow',
    SENT: 'indigo',
    SHIPPED: 'purple',
    PARTIALLY_RECEIVED: 'sky',
    RECEIVED: 'green',
    CANCELLED: 'red',
};

const statusLabelMap: Record<PurchaseOrderStatus, string> = {
    DRAFT: 'Draft',
    PENDING: 'Pending',
    SENT: 'Sent',
    SHIPPED: 'Shipped',
    PARTIALLY_RECEIVED: 'Partial',
    RECEIVED: 'Received',
    CANCELLED: 'Cancelled',
};

export { statusColorMap as poStatusColorMap, statusLabelMap as poStatusLabelMap };

export const getPurchaseOrderTableColumns = ({
    onReceive,
    onSend,
    onCancel,
    onView,
}: PurchaseOrderTableActionsProps): TableColumn<PurchaseOrder>[] => [
        {
            name: 'PO Number',
            cell: (row) => (
                <Flex direction="column" py="2">
                    <Text weight="bold" className="text-sky-500 dark:text-sky-400">
                        {row.poNumber}
                    </Text>
                    <Text size="1" color="gray" className="mt-0.5">
                        {dayjs(row.orderDate).format('MMM D, YYYY')}
                    </Text>
                </Flex>
            ),
            sortable: true,
        },
        {
            name: 'Supplier',
            cell: (row) => (
                <Flex py="2">
                    <Text weight="medium" className="text-gray-900 dark:text-gray-100">
                        {row.supplier?.name || 'N/A'}
                    </Text>
                </Flex>
            ),
            sortable: true,
            grow: 2,
        },
        {
            name: 'Items',
            cell: (row) => {
                const totalOrdered = row.items?.reduce((s, i) => s + i.orderedQuantity, 0) || 0;
                const totalReceived = row.items?.reduce((s, i) => s + (i.receivedQuantity || 0), 0) || 0;
                const isPartial = row.status === 'PARTIALLY_RECEIVED';
                const isReceived = row.status === 'RECEIVED';
                const progress = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

                return (
                    <Flex direction="column" className="min-w-[100px]">
                        <Flex align="center" gap="1">
                            <Package className="w-3.5 h-3.5 text-gray-400" />
                            <Text size="2" className="text-gray-700 dark:text-gray-300">
                                {row.items?.length || 0} item{(row.items?.length || 0) !== 1 ? 's' : ''}
                            </Text>
                        </Flex>
                        {(isPartial || isReceived) && totalOrdered > 0 && (
                            <div className="mt-1">
                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${isReceived ? 'bg-green-500' : 'bg-sky-500'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <Text size="1" className="text-gray-500 dark:text-gray-400">
                                    {totalReceived}/{totalOrdered} received
                                </Text>
                            </div>
                        )}
                    </Flex>
                );
            },
        },
        {
            name: 'Total Amount',
            cell: (row) => {
                const total = row.totalAmount || row.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
                return (
                    <Text weight="bold" className="text-gray-900 dark:text-gray-100">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'MWK',
                        }).format(total)}
                    </Text>
                );
            },
            sortable: true,
            right: true,
        },
        {
            name: 'Status',
            cell: (row) => {
                const color = statusColorMap[row.status] || 'gray';
                const label = statusLabelMap[row.status] || row.status;
                return (
                    <Badge variant="soft" color={color} radius="full">
                        {label}
                    </Badge>
                );
            },
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => {
                const canSend = row.status === 'DRAFT' || row.status === 'PENDING';
                const canReceive = row.status === 'SENT' || row.status === 'SHIPPED' || row.status === 'PARTIALLY_RECEIVED';
                const canCancel = row.status === 'DRAFT' || row.status === 'PENDING' || row.status === 'SENT';

                return (
                    <Flex align="center" gap="2">
                        <Tooltip content="View details">
                            <IconButton variant="ghost" size="1" onClick={() => onView(row)}>
                                <Eye className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>

                        {canSend && (
                            <Button size="1" variant="soft" color="indigo" onClick={() => onSend(row)}>
                                <Send className="w-3.5 h-3.5" />
                                Send to Supplier
                            </Button>
                        )}
                        {canReceive && (
                            <Button size="1" variant="soft" color="green" onClick={() => onReceive(row)}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Receive Goods
                            </Button>
                        )}

                        {canCancel && (
                            <Tooltip content="Cancel order">
                                <IconButton variant="ghost" color="red" size="1" onClick={() => onCancel(row)}>
                                    <XCircle className="w-4 h-4" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Flex>
                );
            },
            right: true,
            minWidth: '260px',
        },
    ];
