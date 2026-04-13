import MobileTabPageHeader from '../../components/page/MobileTabPageHeader';
import LoadingState from '../../components/loader/LoadingState';
import { ServiceOrderMobileList } from './partials/ServiceOrderMobileCard';
import { FunctionComponent, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import serviceOrderService from '../../services/service-order.service';
import { formatCurrency } from '../../utils';
import { Flex, Box, Button } from '@radix-ui/themes';
import { Confirm, Notify } from 'notiflix';
import dayjs from 'dayjs';

const ITEMS_PER_PAGE = 20;

const TodayServiceOrders: FunctionComponent = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<ServiceOrderWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const loadTodayOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const today = dayjs().format('YYYY-MM-DD');
            const result = await serviceOrderService.list({
                from: today,
                to: today,
                limit: 100,
                page: 1,
            });
            setOrders(result.orders || []);
        } catch {
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTodayOrders();
    }, [loadTodayOrders]);

    const totals = useMemo(() => {
        const revenue = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
        const paid = orders.reduce((sum, o) => sum + (o.amountPaid ?? 0), 0);
        return { revenue, paid, count: orders.length };
    }, [orders]);

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return orders.slice(start, start + ITEMS_PER_PAGE);
    }, [orders, currentPage]);

    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

    const handleView = useCallback((id: string) => {
        navigate(ROUTES.SERVICE_ORDERS + '/' + id);
    }, [navigate]);

    const handleStart = useCallback((id: string) => {
        Confirm.show('Start Order', 'Start working on this order?', 'Yes', 'Cancel', async () => {
            try {
                await serviceOrderService.startOrder(id);
                Notify.success('Order started');
                loadTodayOrders();
            } catch {
                Notify.failure('Failed to start order');
            }
        });
    }, [loadTodayOrders]);

    const handleCancel = useCallback((id: string) => {
        Confirm.show('Cancel Order', 'Cancel this service order?', 'Yes', 'No', async () => {
            try {
                await serviceOrderService.cancelOrder(id);
                Notify.success('Order cancelled');
                loadTodayOrders();
            } catch {
                Notify.failure('Failed to cancel order');
            }
        }, undefined, { okButtonBackground: '#ef4444', titleColor: '#ef4444' });
    }, [loadTodayOrders]);

    const handlePay = useCallback((id: string) => {
        navigate(ROUTES.SERVICE_ORDERS + '/' + id, { state: { openPayment: true } });
    }, [navigate]);

    return (
        <Flex direction="column" className="h-full overflow-hidden">
            <Box className="fixed top-0 left-0 right-0 z-50">
                <MobileTabPageHeader />
            </Box>

            <Box className="flex-1 min-h-0 overflow-hidden pt-[52px]">
                <div className="h-full overflow-y-auto pb-20">
                    {/* Summary strip */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Today's Revenue</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(totals.revenue, true)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(totals.paid, true)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
                            <p className="text-lg font-bold text-sky-600 dark:text-sky-400">
                                {totals.count}
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <LoadingState />
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No Orders Today
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Service orders created today will appear here.
                            </p>
                        </div>
                    ) : (
                        <ServiceOrderMobileList
                            orders={paginatedOrders}
                            onView={handleView}
                            onStart={handleStart}
                            onCancel={handleCancel}
                            onPay={handlePay}
                        />
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
                            <div className="flex gap-2">
                                <Button variant="soft" size="1" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
                                <Button variant="soft" size="1" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                            </div>
                        </div>
                    )}

                    <Box px="4" mt="2">
                        <Button
                            variant="soft"
                            size="3"
                            className="!w-full"
                            onClick={() => navigate(ROUTES.SERVICE_ORDERS)}
                        >
                            VIEW ALL ORDERS
                        </Button>
                    </Box>
                </div>
            </Box>
        </Flex>
    );
};

export default TodayServiceOrders;
