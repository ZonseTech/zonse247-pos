import type { FunctionComponent } from 'react';
import { Eye, CheckCircle, Truck, PackageCheck, Ban, Trash2 } from 'lucide-react';
import { Badge, Box, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes';
import { returnStatusConfig } from './SupplierReturnTableColumns';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

interface SupplierReturnMobileCardProps {
    returnItem: SupplierReturnWithItems;
    onView: (r: SupplierReturnWithItems) => void;
    onApprove: (r: SupplierReturnWithItems) => void;
    onShip: (r: SupplierReturnWithItems) => void;
    onComplete: (r: SupplierReturnWithItems) => void;
    onCancel: (r: SupplierReturnWithItems) => void;
    onDelete: (r: SupplierReturnWithItems) => void;
}

const SupplierReturnMobileCard: FunctionComponent<SupplierReturnMobileCardProps> = ({
    returnItem,
    onView,
    onApprove,
    onShip,
    onComplete,
    onCancel,
    onDelete,
}) => {
    const cfg = returnStatusConfig[returnItem.status];

    return (
        <Box p="4" className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <Flex justify="between" align="start" mb="2">
                <Box className="flex-1 min-w-0">
                    <Flex align="center" gap="2" mb="1">
                        <Text size="2" weight="bold">
                            {returnItem.returnNumber}
                        </Text>
                        <Badge variant="soft" color={cfg.color} radius="full" size="1">
                            {cfg.label}
                        </Badge>
                    </Flex>
                    <Text as="p" size="2" color="gray" truncate>
                        {returnItem.supplier?.name || '—'}
                    </Text>
                    {returnItem.purchaseOrder?.poNumber && (
                        <Text as="p" size="1" className="text-sky-600 dark:text-sky-400 mt-0.5">
                            PO: {returnItem.purchaseOrder.poNumber}
                        </Text>
                    )}
                </Box>
                <Box className="text-right flex-shrink-0 ml-3">
                    <Text as="p" size="2" weight="bold">
                        {formatCurrency(returnItem.totalAmount)}
                    </Text>
                    <Text as="p" size="1" color="gray">
                        {returnItem.items?.length || 0} item(s)
                    </Text>
                </Box>
            </Flex>

            <Flex justify="between" align="center" mt="3">
                <Text size="1" color="gray">
                    {returnItem.returnDate
                        ? new Date(returnItem.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : ''}
                </Text>
                <Flex align="center" gap="1">
                    <Tooltip content="View">
                        <IconButton
                            variant="ghost"
                            color="gray"
                            size="1"
                            onClick={() => onView(returnItem)}
                            aria-label="View return"
                        >
                            <Eye className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    {returnItem.status === 'DRAFT' && (
                        <Tooltip content="Approve">
                            <IconButton
                                variant="ghost"
                                color="blue"
                                size="1"
                                onClick={() => onApprove(returnItem)}
                                aria-label="Approve return"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {returnItem.status === 'APPROVED' && (
                        <Tooltip content="Ship">
                            <IconButton
                                variant="ghost"
                                color="purple"
                                size="1"
                                onClick={() => onShip(returnItem)}
                                aria-label="Ship return"
                            >
                                <Truck className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {returnItem.status === 'SHIPPED' && (
                        <Tooltip content="Complete">
                            <IconButton
                                variant="ghost"
                                color="green"
                                size="1"
                                onClick={() => onComplete(returnItem)}
                                aria-label="Complete return"
                            >
                                <PackageCheck className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {['DRAFT', 'APPROVED'].includes(returnItem.status) && (
                        <Tooltip content="Cancel">
                            <IconButton
                                variant="ghost"
                                color="red"
                                size="1"
                                onClick={() => onCancel(returnItem)}
                                aria-label="Cancel return"
                            >
                                <Ban className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {returnItem.status === 'DRAFT' && (
                        <Tooltip content="Delete">
                            <IconButton
                                variant="ghost"
                                color="red"
                                size="1"
                                onClick={() => onDelete(returnItem)}
                                aria-label="Delete return"
                            >
                                <Trash2 className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
};

// ── Mobile List Wrapper ────────────────────────────────────────────────────

interface SupplierReturnMobileListProps {
    returns: SupplierReturnWithItems[];
    onView: (r: SupplierReturnWithItems) => void;
    onApprove: (r: SupplierReturnWithItems) => void;
    onShip: (r: SupplierReturnWithItems) => void;
    onComplete: (r: SupplierReturnWithItems) => void;
    onCancel: (r: SupplierReturnWithItems) => void;
    onDelete: (r: SupplierReturnWithItems) => void;
    isLoading: boolean;
}

export const SupplierReturnMobileList: FunctionComponent<SupplierReturnMobileListProps> = ({
    returns,
    onView,
    onApprove,
    onShip,
    onComplete,
    onCancel,
    onDelete,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <Box className="divide-y divide-gray-100 dark:divide-gray-700">
                {[1, 2, 3].map((i) => (
                    <Box key={i} p="4" className="animate-pulse">
                        <Flex justify="between" align="start" mb="2">
                            <Box className="flex-1">
                                <Box className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1" />
                                <Box className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                            </Box>
                            <Box className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        </Flex>
                    </Box>
                ))}
            </Box>
        );
    }

    return (
        <Box className="divide-y divide-gray-100 dark:divide-gray-700">
            {returns.map((r) => (
                <SupplierReturnMobileCard
                    key={r.id}
                    returnItem={r}
                    onView={onView}
                    onApprove={onApprove}
                    onShip={onShip}
                    onComplete={onComplete}
                    onCancel={onCancel}
                    onDelete={onDelete}
                />
            ))}
        </Box>
    );
};

export default SupplierReturnMobileCard;
