import { FC } from 'react';
import { Eye, CheckCircle, XCircle, Ban, Package, Calendar, ShoppingCart } from 'lucide-react';
import { Box, Flex, Text, Badge, IconButton, Skeleton } from '@radix-ui/themes';
import dayjs from 'dayjs';
import { canCreatePOFromRequisition } from '../../../utils/purchase-requisition.helper';

interface RequisitionMobileCardProps {
    requisition: PurchaseRequisitionWithItems;
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

const RequisitionMobileCard: FC<RequisitionMobileCardProps> = ({
    requisition,
    onApprove,
    onReject,
    onCancel,
    onView,
    onCreatePO,
}) => {
    const totalQty = requisition.items?.reduce((sum, item) => sum + item.requestedQuantity, 0) || 0;
    const isPartiallyApproved = requisition.status === 'PARTIALLY_APPROVED';
    const isApproved = requisition.status === 'APPROVED' || isPartiallyApproved;
    const totalApproved = isApproved
        ? requisition.items?.reduce((sum, item) => sum + (item.approvedQuantity ?? item.requestedQuantity), 0) || 0
        : 0;
    const approvalPercent = isPartiallyApproved && totalQty > 0 ? Math.round((totalApproved / totalQty) * 100) : 0;

    return (
        <Box className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" p="4">
            <Flex justify="between" align="start" gap="3" mb="3">
                <Box flexGrow="1" minWidth="0">
                    <Flex align="center" gap="2" mb="1">
                        <Text size="3" weight="bold" className="text-sky-500 dark:text-sky-400">
                            {requisition.requisitionNumber}
                        </Text>
                        <Badge
                            variant="soft"
                            color={statusColorMap[requisition.status] as any}
                            size="1"
                            radius="full"
                        >
                            {statusLabelMap[requisition.status]}
                        </Badge>
                    </Flex>
                    {requisition.requestedByUser && (
                        <Text as="p" size="2" color="gray" truncate>
                            {requisition.requestedByUser.fullname}
                        </Text>
                    )}
                </Box>

                <Box flexShrink="0" className="text-right">
                    {isPartiallyApproved ? (
                        <Box>
                            <Text size="4" weight="bold" className="text-sky-600 dark:text-sky-400">
                                {totalApproved} <Text as="span" size="2" weight="regular" color="gray">/ {totalQty}</Text>
                            </Text>
                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-0.5 ml-auto">
                                <div className="h-full rounded-full bg-sky-500" style={{ width: `${approvalPercent}%` }} />
                            </div>
                            <Text size="1" color="gray">{approvalPercent}% approved</Text>
                        </Box>
                    ) : (
                        <Text size="4" weight="bold">
                            {totalQty} <Text as="span" size="2" weight="regular" color="gray">units</Text>
                        </Text>
                    )}
                </Box>
            </Flex>

            <Flex align="center" gap="4" mb="3">
                <Flex align="center" gap="1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <Text size="2" color="gray">{dayjs(requisition.createdAt).format('MMM D, YYYY')}</Text>
                </Flex>
                <Flex align="center" gap="1">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    <Text size="2" color="gray">
                        {requisition.items?.length || 0} item{(requisition.items?.length || 0) !== 1 ? 's' : ''}
                    </Text>
                </Flex>
            </Flex>

            {requisition.notes && (
                <Text as="p" size="2" color="gray" mb="3" className="line-clamp-2">
                    {requisition.notes}
                </Text>
            )}

            {requisition.status === 'REJECTED' && requisition.rejectedReason && (
                <Box className="bg-red-50 dark:bg-red-900/20 rounded-lg" p="2" mb="3">
                    <Text size="2" className="text-red-600 dark:text-red-400">
                        <Text as="span" weight="medium">Reason: </Text>{requisition.rejectedReason}
                    </Text>
                </Box>
            )}

            <Flex align="center" gap="2" pt="3" className="border-t border-gray-100 dark:border-gray-700">
                <IconButton variant="ghost" size="1" onClick={() => onView(requisition)} aria-label="View">
                    <Eye className="w-4 h-4" />
                </IconButton>
                {requisition.status === 'PENDING' && (
                    <>
                        <IconButton variant="ghost" color="green" size="1" onClick={() => onApprove(requisition)} aria-label="Approve">
                            <CheckCircle className="w-4 h-4" />
                        </IconButton>
                        <IconButton variant="ghost" color="red" size="1" onClick={() => onReject(requisition)} aria-label="Reject">
                            <XCircle className="w-4 h-4" />
                        </IconButton>
                        <Box flexGrow="1" />
                        <IconButton variant="ghost" color="gray" size="1" onClick={() => onCancel(requisition)} aria-label="Cancel">
                            <Ban className="w-4 h-4" />
                        </IconButton>
                    </>
                )}
                {canCreatePOFromRequisition(requisition) && onCreatePO && (
                    <IconButton variant="ghost" color="iris" size="1" onClick={() => onCreatePO(requisition)} aria-label="Create PO">
                        <ShoppingCart className="w-4 h-4" />
                    </IconButton>
                )}
            </Flex>
        </Box>
    );
};

interface RequisitionMobileListProps {
    requisitions: PurchaseRequisitionWithItems[];
    onApprove: (req: PurchaseRequisitionWithItems) => void;
    onReject: (req: PurchaseRequisitionWithItems) => void;
    onCancel: (req: PurchaseRequisitionWithItems) => void;
    onView: (req: PurchaseRequisitionWithItems) => void;
    onCreatePO?: (req: PurchaseRequisitionWithItems) => void;
    isLoading?: boolean;
}

export const RequisitionMobileList: FC<RequisitionMobileListProps> = ({
    requisitions,
    onApprove,
    onReject,
    onCancel,
    onView,
    onCreatePO,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <Box className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, i) => (
                    <Box key={i} p="4">
                        <Flex justify="between" align="start" gap="3" mb="3">
                            <Flex direction="column" gap="2" flexGrow="1">
                                <Skeleton width="128px" height="20px" />
                                <Skeleton width="96px" height="16px" />
                            </Flex>
                            <Skeleton width="80px" height="24px" />
                        </Flex>
                        <Flex gap="4" mb="3">
                            <Skeleton width="96px" height="16px" />
                            <Skeleton width="64px" height="16px" />
                        </Flex>
                        <Flex gap="2" pt="3">
                            <Skeleton width="64px" height="32px" />
                            <Skeleton width="80px" height="32px" />
                        </Flex>
                    </Box>
                ))}
            </Box>
        );
    }

    return (
        <Box className="divide-y divide-gray-200 dark:divide-gray-700">
            {requisitions.map((req) => (
                <RequisitionMobileCard
                    key={req.id}
                    requisition={req}
                    onApprove={onApprove}
                    onReject={onReject}
                    onCancel={onCancel}
                    onView={onView}
                    onCreatePO={onCreatePO}
                />
            ))}
        </Box>
    );
};

export default RequisitionMobileCard;
