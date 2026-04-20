import { memo, useMemo, type FC, type MouseEvent } from 'react';
import { Flex, Text, Box, Badge, Button, Spinner } from '@radix-ui/themes';
import { User, Clock, ShoppingCart, Play } from 'lucide-react';
import { formatCurrency } from '../../../../utils';
import { STATUS_COLOR, ORDER_TYPE_CONFIG, formatShortDate } from './config';

const stopPropagation = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    fn();
};

export interface OrderCardProps {
    order: ServiceOrderWithItems;
    busy: boolean;
    onStart: () => void;
    onSelect: () => void;
}

export const OrderCard: FC<OrderCardProps> = memo(({ order, busy, onStart, onSelect }) => {
    const {
        status,
        orderType,
        orderNumber,
        customer,
        totalAmount,
        balanceDue,
        createdAt,
        items,
        productItems = [],
    } = order;

    const typeCfg = orderType ? ORDER_TYPE_CONFIG[orderType] : null;
    const TypeIcon = typeCfg?.icon;
    const isProductOnly = orderType === 'PRODUCT_ONLY';

    const displayItems = useMemo(() => [
        ...items.map(i => ({
            id: i.id,
            name: i.service?.name || 'Service',
            qty: i.quantity,
            isProduct: false,
        })),
        ...productItems.map(p => ({
            id: p.id,
            name: p.variant?.product?.name || p.variant?.variantName || 'Product',
            qty: p.quantity,
            isProduct: true,
        })),
    ], [items, productItems]);

    const staffNames = useMemo(() => {
        const names = items
            .flatMap(i => i.staffAssignments || [])
            .map(a => a.staff?.user?.fullname || a.staff?.employeeCode)
            .filter(Boolean);
        return [...new Set(names)];
    }, [items]);

    const actionButton = useMemo(() => {
        if (isProductOnly && status === 'PENDING') {
            return (
                <Button size="1" color="green" onClick={stopPropagation(onSelect)}>
                    <ShoppingCart size={12} /> Pay
                </Button>
            );
        }
        if (!isProductOnly && status === 'PENDING') {
            return (
                <Button size="1" color="blue" disabled={busy} onClick={stopPropagation(onStart)}>
                    {busy ? <Spinner size="1" /> : <Play size={12} />}
                    {busy ? '...' : 'Start'}
                </Button>
            );
        }
        if (status === 'COMPLETED') {
            return (
                <Button size="1" color="green" onClick={stopPropagation(onSelect)}>
                    <ShoppingCart size={12} /> Checkout
                </Button>
            );
        }
        if (status === 'IN_PROGRESS') {
            return (
                <Button size="1" variant="soft" color="blue" onClick={stopPropagation(onSelect)}>
                    <ShoppingCart size={12} /> Load
                </Button>
            );
        }
        return null;
    }, [isProductOnly, status, busy, onStart, onSelect]);

    return (
        <Box
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
            onClick={onSelect}
        >
            <Flex justify="between" gap="3">
                <Box style={{ minWidth: 0, flex: 1 }}>
                    <Flex align="center" gap="2" mb="1">
                        <Text size="2" weight="bold">{orderNumber}</Text>
                        <Badge size="1" color={STATUS_COLOR[status]}>
                            {status.replace('_', ' ')}
                        </Badge>
                        {typeCfg && TypeIcon && (
                            <Badge size="1" variant="soft" color={typeCfg.color}>
                                <TypeIcon size={10} />
                                <Text size="1" ml="1">{typeCfg.label}</Text>
                            </Badge>
                        )}
                    </Flex>

                    {customer && (
                        <Text size="1" color="gray" as="p">
                            {customer.name}
                            {customer.phone && ` · ${customer.phone}`}
                        </Text>
                    )}

                    <Flex gap="1" wrap="wrap" my="1">
                        {displayItems.slice(0, 3).map(item => (
                            <Badge
                                key={item.id}
                                size="1"
                                variant="soft"
                                color={item.isProduct ? 'amber' : 'gray'}
                            >
                                {item.name} x{item.qty}
                            </Badge>
                        ))}
                        {displayItems.length > 3 && (
                            <Text size="1" color="gray">+{displayItems.length - 3}</Text>
                        )}
                    </Flex>

                    <Flex align="center" gap="3">
                        {staffNames.length > 0 && (
                            <Flex align="center" gap="1">
                                <User size={10} className="text-gray-400" />
                                <Text size="1" color="gray">
                                    {staffNames.slice(0, 2).join(', ')}
                                    {staffNames.length > 2 && ` +${staffNames.length - 2}`}
                                </Text>
                            </Flex>
                        )}
                        <Flex align="center" gap="1">
                            <Clock size={10} className="text-gray-400" />
                            <Text size="1" color="gray">{formatShortDate(createdAt)}</Text>
                        </Flex>
                    </Flex>
                </Box>

                <Flex direction="column" align="end" gap="1" style={{ flexShrink: 0 }}>
                    <Text size="2" weight="bold">{formatCurrency(totalAmount)}</Text>
                    {balanceDue > 0 && (
                        <Text size="1" color="red">Due: {formatCurrency(balanceDue)}</Text>
                    )}
                    {actionButton && <Box mt="1">{actionButton}</Box>}
                </Flex>
            </Flex>
        </Box>
    );
});

OrderCard.displayName = 'OrderCard';
