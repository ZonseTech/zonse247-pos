import { FC } from 'react';
import { Eye, CheckCircle, XCircle, Send, Package, Calendar, Truck } from 'lucide-react';
import { Box, Flex, Text, Badge, IconButton, Skeleton } from '@radix-ui/themes';
import dayjs from 'dayjs';
import { poStatusColorMap, poStatusLabelMap } from './PurchaseOrderTableColumns';

interface PurchaseOrderMobileCardProps {
    purchaseOrder: PurchaseOrder;
    onReceive: (po: PurchaseOrder) => void;
    onSend: (po: PurchaseOrder) => void;
    onCancel: (po: PurchaseOrder) => void;
    onView: (po: PurchaseOrder) => void;
}

const PurchaseOrderMobileCard: FC<PurchaseOrderMobileCardProps> = ({
    purchaseOrder,
    onReceive,
    onSend,
    onCancel,
    onView,
}) => {
    const color = poStatusColorMap[purchaseOrder.status] || 'gray';
    const label = poStatusLabelMap[purchaseOrder.status] || purchaseOrder.status;
    const total = purchaseOrder.totalAmount || purchaseOrder.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;

    return (
        <Box className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <Flex justify="between" gap="3" mb="3">
                <Box className="flex-1 min-w-0">
                    <Flex align="center" gap="2" mb="1">
                        <Text size="3" weight="bold" className="text-sky-500 dark:text-sky-400">
                            {purchaseOrder.poNumber}
                        </Text>
                        <Badge variant="soft" color={color} radius="full">
                            {label}
                        </Badge>
                    </Flex>
                    <Text size="2" color="gray" className="truncate block">
                        {purchaseOrder.supplier?.name || 'N/A'}
                    </Text>
                </Box>

                <Box className="text-right flex-shrink-0">
                    <Text size="5" weight="bold" className="text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'MWK',
                            minimumFractionDigits: 0,
                        }).format(total)}
                    </Text>
                </Box>
            </Flex>

            <Flex align="center" gap="4" mb="3">
                <Flex align="center" gap="1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <Text size="2" color="gray">{dayjs(purchaseOrder.orderDate).format('MMM D, YYYY')}</Text>
                </Flex>
                <Flex align="center" gap="1">
                    <Package className="w-3.5 h-3.5 text-gray-500" />
                    <Text size="2" color="gray">{purchaseOrder.items?.length || 0} item{(purchaseOrder.items?.length || 0) !== 1 ? 's' : ''}</Text>
                </Flex>
            </Flex>

            {(() => {
                const totalOrdered = purchaseOrder.items?.reduce((s, i) => s + i.orderedQuantity, 0) || 0;
                const totalReceived = purchaseOrder.items?.reduce((s, i) => s + (i.receivedQuantity || 0), 0) || 0;
                const isPartial = purchaseOrder.status === 'PARTIALLY_RECEIVED';
                const isFullyReceived = purchaseOrder.status === 'RECEIVED';
                if ((!isPartial && !isFullyReceived) || totalOrdered === 0) return null;
                const progress = Math.round((totalReceived / totalOrdered) * 100);
                return (
                    <Box mb="3">
                        <Flex justify="between" mb="1">
                            <Text size="1" color="gray">Received</Text>
                            <Text size="1" weight="medium" color="gray">{totalReceived}/{totalOrdered} ({progress}%)</Text>
                        </Flex>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${isFullyReceived ? 'bg-green-500' : 'bg-sky-500'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </Box>
                );
            })()}

            {purchaseOrder.expectedDeliveryDate && (
                <Flex align="center" gap="1" mb="3">
                    <Truck className="w-3.5 h-3.5 text-gray-500" />
                    <Text size="2" color="gray">Expected: {dayjs(purchaseOrder.expectedDeliveryDate).format('MMM D, YYYY')}</Text>
                </Flex>
            )}

            <Flex align="center" gap="2" pt="3" className="border-t border-gray-100 dark:border-gray-700">
                <IconButton variant="ghost" size="1" onClick={() => onView(purchaseOrder)}>
                    <Eye className="w-4 h-4" />
                </IconButton>
                {(purchaseOrder.status === 'DRAFT' || purchaseOrder.status === 'PENDING') && (
                    <IconButton variant="ghost" color="indigo" size="1" onClick={() => onSend(purchaseOrder)}>
                        <Send className="w-4 h-4" />
                    </IconButton>
                )}
                {(purchaseOrder.status === 'SENT' || purchaseOrder.status === 'SHIPPED' || purchaseOrder.status === 'PARTIALLY_RECEIVED') && (
                    <IconButton variant="ghost" color="green" size="1" onClick={() => onReceive(purchaseOrder)}>
                        <CheckCircle className="w-4 h-4" />
                    </IconButton>
                )}
                {(purchaseOrder.status === 'DRAFT' || purchaseOrder.status === 'PENDING' || purchaseOrder.status === 'SENT') && (
                    <Box className="ml-auto">
                        <IconButton variant="ghost" color="red" size="1" onClick={() => onCancel(purchaseOrder)}>
                            <XCircle className="w-4 h-4" />
                        </IconButton>
                    </Box>
                )}
            </Flex>
        </Box>
    );
};

interface PurchaseOrderMobileListProps {
    purchaseOrders: PurchaseOrder[];
    onReceive: (po: PurchaseOrder) => void;
    onSend: (po: PurchaseOrder) => void;
    onCancel: (po: PurchaseOrder) => void;
    onView: (po: PurchaseOrder) => void;
    isLoading?: boolean;
}

export const PurchaseOrderMobileList: FC<PurchaseOrderMobileListProps> = ({
    purchaseOrders,
    onReceive,
    onSend,
    onCancel,
    onView,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <Box className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, i) => (
                    <Box key={i} p="4">
                        <Flex justify="between" gap="3" mb="3">
                            <Flex direction="column" gap="2" className="flex-1">
                                <Skeleton><Text size="3">PO-000000</Text></Skeleton>
                                <Skeleton><Text size="2">Supplier Name</Text></Skeleton>
                            </Flex>
                            <Skeleton><Text size="4">MWK 0000</Text></Skeleton>
                        </Flex>
                        <Flex gap="4" mb="3">
                            <Skeleton><Text size="2">Jan 1, 2024</Text></Skeleton>
                            <Skeleton><Text size="2">0 items</Text></Skeleton>
                        </Flex>
                        <Flex gap="2" pt="3">
                            <Skeleton><Box style={{ width: 64, height: 32 }} /></Skeleton>
                            <Skeleton><Box style={{ width: 80, height: 32 }} /></Skeleton>
                        </Flex>
                    </Box>
                ))}
            </Box>
        );
    }

    return (
        <Box className="divide-y divide-gray-200 dark:divide-gray-700">
            {purchaseOrders.map((po) => (
                <PurchaseOrderMobileCard
                    key={po.id}
                    purchaseOrder={po}
                    onReceive={onReceive}
                    onSend={onSend}
                    onCancel={onCancel}
                    onView={onView}
                />
            ))}
        </Box>
    );
};

export default PurchaseOrderMobileCard;
