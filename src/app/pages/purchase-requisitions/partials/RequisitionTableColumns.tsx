import { TableColumn } from 'react-data-table-component';
import { Eye, CheckCircle, XCircle, Ban, Package, ShoppingCart } from 'lucide-react';
import { Flex, Text, Badge, IconButton, Tooltip, Progress } from '@radix-ui/themes';
import dayjs from 'dayjs';
import { canCreatePOFromRequisition } from '../../../utils/purchase-requisition.helper';

interface RequisitionTableActionsProps {
    onApprove: (req: PurchaseRequisitionWithItems) => void;
    onReject: (req: PurchaseRequisitionWithItems) => void;
    onCancel: (req: PurchaseRequisitionWithItems) => void;
    onView: (req: PurchaseRequisitionWithItems) => void;
    onCreatePO?: (req: PurchaseRequisitionWithItems) => void;
}

const statusColorMap: Record<RequisitionStatusType, 'yellow' | 'green' | 'sky' | 'red' | 'gray'> = {
    PENDING: 'yellow',
    APPROVED: 'green',
    PARTIALLY_APPROVED: 'sky',
    REJECTED: 'red',
    CANCELLED: 'gray',
};

const statusLabelMap: Record<RequisitionStatusType, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    PARTIALLY_APPROVED: 'Partial',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
};

export const getRequisitionTableColumns = ({
    onApprove,
    onReject,
    onCancel,
    onView,
    onCreatePO,
}: RequisitionTableActionsProps): TableColumn<PurchaseRequisitionWithItems>[] => [
        {
            name: 'Requisition #',
            cell: (row) => (
                <Flex direction="column" py="2">
                    <Text size="2" weight="bold" className="text-sky-500 dark:text-sky-400">
                        {row.requisitionNumber}
                    </Text>
                    <Text size="1" color="gray" className="mt-0.5">
                        {dayjs(row.createdAt).format('MMM D, YYYY')}
                    </Text>
                </Flex>
            ),
            sortable: true,
        },
        {
            name: 'Requested By',
            cell: (row) => (
                <Text size="2" weight="medium">
                    {row.requestedByUser
                        ? row.requestedByUser.fullname
                        : 'N/A'}
                </Text>
            ),
            sortable: true,
            grow: 2,
        },
        {
            name: 'Items',
            cell: (row) => (
                <Flex align="center" gap="1">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    <Text size="2" color="gray">
                        {row.items?.length || 0} item{(row.items?.length || 0) !== 1 ? 's' : ''}
                    </Text>
                </Flex>
            ),
        },
        {
            name: 'Total Qty',
            cell: (row) => {
                const totalRequested = row.items?.reduce((sum, item) => sum + item.requestedQuantity, 0) || 0;
                const isPartiallyApproved = row.status === 'PARTIALLY_APPROVED';
                const isApproved = row.status === 'APPROVED' || isPartiallyApproved;
                const totalApproved = isApproved
                    ? row.items?.reduce((sum, item) => sum + (item.approvedQuantity ?? item.requestedQuantity), 0) || 0
                    : 0;
                const approvalPercent = isPartiallyApproved && totalRequested > 0
                    ? Math.round((totalApproved / totalRequested) * 100)
                    : 0;

                return (
                    <Flex direction="column" align="end" className="min-w-[70px]">
                        {isPartiallyApproved ? (
                            <>
                                <Text size="2" weight="bold">
                                    <Text as="span" className="text-sky-600 dark:text-sky-400">{totalApproved}</Text>
                                    <Text as="span" color="gray"> / {totalRequested}</Text>
                                </Text>
                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${approvalPercent}%` }} />
                                </div>
                                <Text size="1" color="gray">{approvalPercent}% approved</Text>
                            </>
                        ) : (
                            <Text size="2" weight="bold">
                                {totalRequested}
                            </Text>
                        )}
                    </Flex>
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
                    <Badge variant="soft" color={color as any} size="1" radius="full">
                        {label}
                    </Badge>
                );
            },
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <Flex align="center" gap="1">
                    <Tooltip content="View details">
                        <IconButton
                            variant="ghost"

                            size="1"
                            onClick={() => onView(row)}
                        >
                            <Eye className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    {row.status === 'PENDING' && (
                        <>
                            <Tooltip content="Approve">
                                <IconButton
                                    variant="ghost"
                                    color="green"
                                    size="1"
                                    onClick={() => onApprove(row)}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip content="Reject">
                                <IconButton
                                    variant="ghost"
                                    color="red"
                                    size="1"
                                    onClick={() => onReject(row)}
                                >
                                    <XCircle className="w-4 h-4" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip content="Cancel">
                                <IconButton
                                    variant="ghost"
                                    color="gray"
                                    size="1"
                                    onClick={() => onCancel(row)}
                                >
                                    <Ban className="w-4 h-4" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                    {canCreatePOFromRequisition(row) && onCreatePO && (
                        <Tooltip content="Create Purchase Order">
                            <IconButton
                                variant="ghost"
                                color="iris"
                                size="1"
                                onClick={() => onCreatePO(row)}
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Flex>
            ),
            right: true,
        },
    ];
