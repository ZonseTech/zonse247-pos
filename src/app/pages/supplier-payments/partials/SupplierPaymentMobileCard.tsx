import type { FunctionComponent } from 'react';
import { Eye, Ban } from 'lucide-react';
import { Badge, Box, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes';
import { paymentStatusConfig } from './SupplierPaymentTableColumns';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

interface SupplierPaymentMobileCardProps {
    payment: SupplierPaymentWithAllocations;
    onView: (payment: SupplierPaymentWithAllocations) => void;
    onVoid: (payment: SupplierPaymentWithAllocations) => void;
}

const SupplierPaymentMobileCard: FunctionComponent<SupplierPaymentMobileCardProps> = ({
    payment,
    onView,
    onVoid,
}) => {
    const cfg = paymentStatusConfig[payment.status];

    return (
        <Box p="4" className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <Flex justify="between" align="start" mb="2">
                <Box className="flex-1 min-w-0">
                    <Flex align="center" gap="2" mb="1">
                        <Text size="2" weight="bold">
                            {payment.paymentNumber}
                        </Text>
                        <Badge variant="soft" color={cfg.color} radius="full" size="1">
                            {cfg.label}
                        </Badge>
                    </Flex>
                    <Text as="p" size="2" color="gray" truncate>
                        {payment.supplier?.name || '—'}
                    </Text>
                </Box>
                <Box className="text-right flex-shrink-0 ml-3">
                    <Text as="p" size="2" weight="bold">
                        {formatCurrency(payment.amount)}
                    </Text>
                    {payment.paymentMethod && (
                        <Text as="p" size="1" color="gray" className="capitalize">
                            {payment.paymentMethod}
                        </Text>
                    )}
                </Box>
            </Flex>

            <Flex justify="between" align="center" mt="3">
                <Flex align="center" gap="3">
                    <Text size="1" color="gray">{payment.allocations?.length || 0} invoice(s)</Text>
                    {payment.paymentDate && (
                        <Text size="1" color="gray">
                            {new Date(payment.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                    )}
                </Flex>
                <Flex align="center" gap="1">
                    <Tooltip content="View">
                        <IconButton
                            variant="ghost"
                            color="gray"
                            size="1"
                            onClick={() => onView(payment)}
                            aria-label="View payment"
                        >
                            <Eye className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    {payment.status === 'COMPLETED' && (
                        <Tooltip content="Void Payment">
                            <IconButton
                                variant="ghost"
                                color="red"
                                size="1"
                                onClick={() => onVoid(payment)}
                                aria-label="Void payment"
                            >
                                <Ban className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
};

// ── Mobile List Wrapper ────────────────────────────────────────────────────

interface SupplierPaymentMobileListProps {
    payments: SupplierPaymentWithAllocations[];
    onView: (payment: SupplierPaymentWithAllocations) => void;
    onVoid: (payment: SupplierPaymentWithAllocations) => void;
    isLoading: boolean;
}

export const SupplierPaymentMobileList: FunctionComponent<SupplierPaymentMobileListProps> = ({
    payments,
    onView,
    onVoid,
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
            {payments.map((payment) => (
                <SupplierPaymentMobileCard
                    key={payment.id}
                    payment={payment}
                    onView={onView}
                    onVoid={onVoid}
                />
            ))}
        </Box>
    );
};

export default SupplierPaymentMobileCard;
