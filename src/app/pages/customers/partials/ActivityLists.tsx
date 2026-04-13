import { FC, ReactNode } from 'react';
import { Calendar, Hash, ShoppingCart, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import { Text, Flex, Badge, IconButton } from '@radix-ui/themes';
import * as Separator from '@radix-ui/react-separator';
import { formatCurrency } from '../../../utils';

/* ─── Shared types ───────────────────────────────────────────────── */

type StatusColor = 'green' | 'yellow' | 'blue' | 'red' | 'orange' | 'amber' | 'gray';

const STATUS_COLOR_MAP: Record<string, StatusColor> = {
    COMPLETED: 'green',
    PAID: 'green',
    PENDING: 'yellow',
    IN_PROGRESS: 'blue',
    CANCELLED: 'red',
    VOIDED: 'red',
    RETURNED: 'orange',
    PARTIALLY_PAID: 'amber',
};

interface PaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Sales list ─────────────────────────────────────────────────── */

export const SalesActivityList: FC<{ sales: Sale[]; isLoading: boolean } & PaginationProps> = ({
    sales, isLoading, page, totalPages, totalItems, onPageChange,
}) => {
    if (isLoading) return <ActivitySkeleton />;
    if (sales.length === 0 && page === 1) return <EmptyState icon={<ShoppingCart className="w-6 h-6 text-gray-400" />} message="No sales for this customer." />;

    return (
        <>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {sales.map((sale) => (
                    <ActivityRow
                        key={sale.id}
                        iconBg="bg-sky-100 dark:bg-sky-900/30"
                        icon={<ShoppingCart className="w-4 h-4 text-sky-500" />}
                        title={sale.saleNumber}
                        status={sale.status}
                        date={sale.createdAt}
                        itemCount={sale.items?.length || 0}
                        amount={sale.totalAmount}
                    />
                ))}
            </div>
            {totalItems > 0 && (
                <PaginationFooter page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={onPageChange} />
            )}
        </>
    );
};

/* ─── Service orders list ────────────────────────────────────────── */

export const ServiceOrdersActivityList: FC<{ orders: ServiceOrderWithItems[]; isLoading: boolean } & PaginationProps> = ({
    orders, isLoading, page, totalPages, totalItems, onPageChange,
}) => {
    if (isLoading) return <ActivitySkeleton />;
    if (orders.length === 0 && page === 1) return <EmptyState icon={<Wrench className="w-6 h-6 text-gray-400" />} message="No service orders for this customer." />;

    return (
        <>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {orders.map((order) => (
                    <ActivityRow
                        key={order.id}
                        iconBg="bg-purple-100 dark:bg-purple-900/30"
                        icon={<Wrench className="w-4 h-4 text-purple-500" />}
                        title={order.orderNumber}
                        status={order.status}
                        date={order.createdAt}
                        itemCount={(order.items?.length || 0) + (order.productItems?.length || 0)}
                        amount={order.totalAmount}
                        balanceDue={order.balanceDue}
                    />
                ))}
            </div>
            {totalItems > 0 && (
                <PaginationFooter page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={onPageChange} />
            )}
        </>
    );
};

/* ─── Shared row ─────────────────────────────────────────────────── */

const ActivityRow: FC<{
    iconBg: string;
    icon: ReactNode;
    title: string;
    status: string;
    date: Date | string;
    itemCount: number;
    amount: number;
    balanceDue?: number;
}> = ({ iconBg, icon, title, status, date, itemCount, amount, balanceDue }) => (
    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <Flex align="center" justify="between">
            <Flex align="center" gap="2" className="min-w-0">
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <Flex align="center" gap="2">
                        <Text size="2" weight="medium" truncate>{title}</Text>
                        <Badge variant="soft" color={STATUS_COLOR_MAP[status] || 'gray'} size="1" radius="full">
                            {status.replace(/_/g, ' ')}
                        </Badge>
                    </Flex>
                    <Flex gap="2" mt="1">
                        <Text size="1" color="gray" className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(date)}
                        </Text>
                        <Text size="1" color="gray" className="inline-flex items-center gap-1">
                            <Hash className="w-3 h-3" /> {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </Text>
                    </Flex>
                </div>
            </Flex>
            <div className="text-right flex-shrink-0 ml-2">
                <Text size="2" weight="bold">{formatCurrency(amount)}</Text>
                {(balanceDue ?? 0) > 0 && (
                    <Text as="p" size="1" color="amber">Due: {formatCurrency(balanceDue!)}</Text>
                )}
            </div>
        </Flex>
    </div>
);

/* ─── Empty / Skeleton ───────────────────────────────────────────── */

const EmptyState: FC<{ icon: ReactNode; message: string }> = ({ icon, message }) => (
    <Flex direction="column" align="center" justify="center" py="9" px="4">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            {icon}
        </div>
        <Text size="2" color="gray" align="center">{message}</Text>
    </Flex>
);

const ActivitySkeleton: FC = () => (
    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="px-4 py-3 animate-pulse">
                <Flex align="center" gap="2">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-700/60 rounded w-40" />
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 flex-shrink-0" />
                </Flex>
            </div>
        ))}
    </div>
);

/* ─── Pagination footer ──────────────────────────────────────────── */

const PaginationFooter: FC<PaginationProps> = ({ page, totalPages, totalItems, onPageChange }) => (
    <>
        <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700" />
        <Flex align="center" justify="between" px="4" py="2">
            <Text size="1" color="gray">
                Page {page} of {totalPages} ({totalItems} total)
            </Text>
            <Flex gap="1">
                <IconButton variant="soft" color="gray" size="1" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
                    <ChevronLeft className="w-3.5 h-3.5" />
                </IconButton>
                <IconButton variant="soft" color="gray" size="1" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
                    <ChevronRight className="w-3.5 h-3.5" />
                </IconButton>
            </Flex>
        </Flex>
    </>
);
