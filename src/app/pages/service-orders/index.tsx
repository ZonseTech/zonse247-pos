import { FC, Fragment, useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { ClipboardList, Plus, X, Clock, Play, CheckCircle, XCircle, DollarSign, Ban, TrendingUp, Wallet, AlertCircle } from 'lucide-react';
import DataTable from 'react-data-table-component';
import { HiOutlineMenuAlt4 } from 'react-icons/hi';
import { Button, Box, Flex, Text } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { useIsInsideHub } from '../../context/HubContext';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../components/TableEmptyState';
import { ZonseThemeContext, SummaryCards } from '../../components';
import MobileDateFilter from '../../components/reports/MobileDateFilter';
import type { SummaryCardItem } from '../../components';
import { SearchBar } from '../../components/SearchBar';
import { getTableStyles } from '../../utils/table-styles';
import { formatCurrency } from '../../utils';
import { useServiceOrders } from '../../hooks/useServiceOrders';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { getLeafPaymentMethods } from '../../utils/paymentMethod.helper';
import { PaymentMethodFilter } from '../sales/partials/PaymentMethodFilter';
import { getServiceOrderTableColumns } from './partials/ServiceOrderTableColumns';
import { ServiceOrderMobileList } from './partials/ServiceOrderMobileCard';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';

type RadixColor = 'cyan' | 'green' | 'yellow' | 'blue' | 'red' | 'orange' | 'violet';

const statusOptions: { value: ServiceOrderStatus | 'ALL'; label: string; icon: any; color: RadixColor }[] = [
    { value: 'ALL', label: 'All', icon: ClipboardList, color: 'cyan' },
    { value: 'PENDING', label: 'Pending', icon: Clock, color: 'yellow' },
    { value: 'IN_PROGRESS', label: 'In Progress', icon: Play, color: 'blue' },
    { value: 'COMPLETED', label: 'Completed', icon: CheckCircle, color: 'green' },
    { value: 'PARTIALLY_PAID', label: 'Partial', icon: DollarSign, color: 'orange' },
    { value: 'PAID', label: 'Paid', icon: DollarSign, color: 'violet' },
    { value: 'CANCELLED', label: 'Cancelled', icon: Ban, color: 'red' },
];

const ServiceOrders: FC = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);
    const isInsideHub = useIsInsideHub();
    const Wrapper = isInsideHub ? Fragment : AppLayout;

    const {
        orders,
        isLoading,
        searchTerm,
        setSearchTerm,
        clearSearch,
        statusFilter,
        setStatusFilter,
        paymentMethodFilter,
        setPaymentMethodFilter,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        totalPages,
        startOrder,
        cancelOrder,
    } = useServiceOrders();

    const { paymentMethods: allPaymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods();
    const paymentMethods = useMemo(() => getLeafPaymentMethods(allPaymentMethods), [allPaymentMethods]);

    const today = new Date().toISOString().slice(0, 10);
    const hasActiveFilters = useMemo(
        () => !!searchTerm || !!statusFilter || paymentMethodFilter !== 'all' || dateFrom !== today || dateTo !== today,
        [searchTerm, statusFilter, paymentMethodFilter, dateFrom, dateTo, today],
    );

    const summaryCards: SummaryCardItem[] = useMemo(() => {
        if (isInsideHub) {
            const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
            const totalPaid = orders.reduce((sum, o) => sum + (o.amountPaid ?? 0), 0);
            const totalOutstanding = orders.reduce((sum, o) => sum + (o.balanceDue ?? 0), 0);
            return [
                {
                    title: 'Revenue',
                    value: formatCurrency(totalRevenue, true),
                    icon: <TrendingUp className="w-5 h-5" />,
                    bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                    iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                    textColor: 'text-sky-500 dark:text-sky-400',
                },
                {
                    title: 'Paid',
                    value: formatCurrency(totalPaid, true),
                    icon: <Wallet className="w-5 h-5" />,
                    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                    iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                    textColor: 'text-emerald-500 dark:text-emerald-400',
                },
                {
                    title: 'Outstanding',
                    value: formatCurrency(totalOutstanding, true),
                    icon: <AlertCircle className="w-5 h-5" />,
                    bgColor: totalOutstanding > 0
                        ? 'bg-amber-50 dark:bg-amber-900/20'
                        : 'bg-gray-50 dark:bg-gray-800/40',
                    iconBgColor: totalOutstanding > 0
                        ? 'bg-amber-100 dark:bg-amber-900/40'
                        : 'bg-gray-100 dark:bg-gray-700/40',
                    textColor: totalOutstanding > 0
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-gray-400 dark:text-gray-500',
                },
                {
                    title: 'Orders',
                    value: totalRows,
                    icon: <ClipboardList className="w-5 h-5" />,
                    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
                    iconBgColor: 'bg-violet-100 dark:bg-violet-900/40',
                    textColor: 'text-violet-500 dark:text-violet-400',
                },
            ];
        }

        const countByStatus = (s: ServiceOrderStatus) => orders.filter((o) => o.status === s).length;
        return [
            {
                title: 'Total Orders',
                value: totalRows,
                icon: <ClipboardList className="w-5 h-5" />,
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Pending',
                value: countByStatus('PENDING'),
                icon: <Clock className="w-5 h-5" />,
                bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                iconBgColor: 'bg-yellow-100 dark:bg-yellow-900/40',
                textColor: 'text-yellow-500 dark:text-yellow-400',
            },
            {
                title: 'In Progress',
                value: countByStatus('IN_PROGRESS'),
                icon: <Play className="w-5 h-5" />,
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                iconBgColor: 'bg-blue-100 dark:bg-blue-900/40',
                textColor: 'text-blue-500 dark:text-blue-400',
            },
            {
                title: 'Completed',
                value: countByStatus('COMPLETED') + countByStatus('PARTIALLY_PAID') + countByStatus('PAID'),
                icon: <CheckCircle className="w-5 h-5" />,
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
        ];
    }, [orders, totalRows, isInsideHub]);

    const handleCreate = useCallback(() => {
        navigate(ROUTES.SERVICE_ORDERS + '/create');
    }, [navigate]);

    const handleView = useCallback((id: string) => {
        navigate(ROUTES.SERVICE_ORDERS + '/' + id);
    }, [navigate]);

    const handleStart = useCallback((id: string) => {
        Confirm.show(
            'Start Order',
            'Start working on this service order?',
            'Yes, Start',
            'Cancel',
            async () => {
                try {
                    await startOrder(id);
                    Notify.success('Service order started');
                } catch {
                    Notify.failure('Failed to start order');
                }
            },
        );
    }, [startOrder]);

    const handleCancel = useCallback((id: string) => {
        Confirm.show(
            'Cancel Order',
            'Are you sure you want to cancel this service order? This action cannot be undone.',
            'Yes, Cancel',
            'No',
            async () => {
                try {
                    await cancelOrder(id);
                    Notify.success('Service order cancelled');
                } catch {
                    Notify.failure('Failed to cancel order');
                }
            },
            undefined,
            { okButtonBackground: '#ef4444', titleColor: '#ef4444' },
        );
    }, [cancelOrder]);

    const handlePay = useCallback((id: string) => {
        navigate(ROUTES.SERVICE_ORDERS + '/' + id, { state: { openPayment: true } });
    }, [navigate]);

    const handleClearFilters = useCallback(() => {
        const t = new Date().toISOString().slice(0, 10);
        clearSearch();
        setStatusFilter('');
        setPaymentMethodFilter('all');
        setDateFrom(t);
        setDateTo(t);
    }, [clearSearch, setStatusFilter, setDateFrom, setDateTo]);

    const handlePageChange = useCallback((newPage: number) => setPage(newPage), [setPage]);
    const handlePerRowsChange = useCallback((newPerPage: number, newPage: number) => {
        setPerPage(newPerPage);
        setPage(newPage);
    }, [setPerPage, setPage]);

    const columns = getServiceOrderTableColumns({
        onView: handleView,
        onStart: handleStart,
        onCancel: handleCancel,
        onPay: handlePay,
    });

    return (
        <Wrapper>
            {!isInsideHub && (
                <PageHeader
                    title="Service Orders"
                    description="Track and manage service orders"
                    icon={<ClipboardList className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <Button size="2" onClick={handleCreate}>
                            <Plus className="w-4 h-4" />
                            New Order
                        </Button>
                    }
                />
            )}

            <Box className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Toolbar */}
                <Flex
                    align="center"
                    justify="between"
                    gap="3"
                    px="4"
                    py="3"
                    className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                >
                    <SearchBar
                        placeholder="Search by order #, customer…"
                        value={searchTerm}
                        onChange={setSearchTerm}
                        debounce={400}
                        className="flex-1 max-w-xs"
                    />
                    <Flex align="center" gap="2">
                        {isInsideHub && (
                            <Button size="2" onClick={handleCreate}>
                                <Plus className="w-4 h-4" />
                                New Order
                            </Button>
                        )}
                        <MobileDateFilter
                            startDate={dateFrom ? new Date(dateFrom) : null}
                            endDate={dateTo ? new Date(dateTo) : null}
                            onChange={(start, end) => {
                                setDateFrom(start ? start.toISOString().slice(0, 10) : '');
                                setDateTo(end ? end.toISOString().slice(0, 10) : '');
                            }}
                            align="right"
                        />
                        {hasActiveFilters && (
                            <Button variant="soft" color="red" size="2" onClick={handleClearFilters}>
                                <X className="w-4 h-4" />
                                Clear
                            </Button>
                        )}
                    </Flex>
                </Flex>

                {/* Status filter pills */}
                <Flex
                    align="center"
                    gap="2"
                    px="4"
                    py="2"
                    className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto"
                >
                    <Text size="2" weight="medium" className="text-gray-700 dark:text-gray-300 mr-1 whitespace-nowrap">
                        Status:
                    </Text>
                    <Flex align="center" gap="1">
                        {statusOptions.map((option) => {
                            const Icon = option.icon;
                            const currentValue = statusFilter || 'ALL';
                            const isSelected = currentValue === option.value;
                            return (
                                <Button
                                    key={option.value}
                                    size="2"
                                    variant={isSelected ? 'soft' : 'outline'}
                                    color={isSelected ? option.color : 'gray'}
                                    onClick={() => setStatusFilter(option.value === 'ALL' ? '' : option.value as ServiceOrderStatus)}
                                    className="whitespace-nowrap"
                                >
                                    <Icon className="w-4 h-4" />
                                    {option.label}
                                </Button>
                            );
                        })}
                    </Flex>
                </Flex>

                {/* Payment method filter pills */}
                <Flex
                    align="center"
                    gap="2"
                    px="4"
                    py="2"
                    className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto"
                >
                    <PaymentMethodFilter
                        selectedPaymentMethod={paymentMethodFilter}
                        onChange={setPaymentMethodFilter}
                        paymentMethods={paymentMethods}
                        isLoading={isLoadingPaymentMethods}
                    />
                </Flex>

                <SummaryCards
                    cards={summaryCards}
                    isLoading={isLoading}
                    variant="embedded"
                    gridClassName="grid-cols-2 md:grid-cols-4"
                />

                {isMobile ? (
                    <div className="overflow-hidden">
                        {isLoading ? (
                            <ServiceOrderMobileList
                                orders={[]}
                                onView={handleView}
                                onStart={handleStart}
                                onCancel={handleCancel}
                                onPay={handlePay}
                                isLoading
                            />
                        ) : orders.length === 0 ? (
                            <TableEmptyState
                                icon={<HiOutlineMenuAlt4 />}
                                title={hasActiveFilters ? 'No matching orders' : 'No service orders yet'}
                                description={hasActiveFilters ? 'Try adjusting your filters.' : 'Create your first service order to get started.'}
                                action={
                                    hasActiveFilters ? (
                                        <Button variant="ghost" size="2" onClick={handleClearFilters}>Clear filters</Button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <>
                                <ServiceOrderMobileList
                                    orders={orders}
                                    onView={handleView}
                                    onStart={handleStart}
                                    onCancel={handleCancel}
                                    onPay={handlePay}
                                />
                                <Flex align="center" justify="between" px="4" py="3" className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        Page {page} of {totalPages} ({totalRows} total)
                                    </span>
                                    <Flex gap="2">
                                        <Button variant="soft" size="1" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
                                        <Button variant="soft" size="1" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                                    </Flex>
                                </Flex>
                            </>
                        )}
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={orders}
                        progressPending={isLoading}
                        progressComponent={<TableSkeleton rows={5} columns={6} />}
                        noDataComponent={
                            <TableEmptyState
                                icon={<HiOutlineMenuAlt4 />}
                                title={hasActiveFilters ? 'No matching orders' : 'No service orders yet'}
                                description={hasActiveFilters ? 'Try adjusting your filters.' : 'Create your first service order to get started.'}
                            />
                        }
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
                        paginationPerPage={perPage}
                        paginationDefaultPage={page}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handlePerRowsChange}
                        customStyles={getTableStyles(mode || 'light')}
                        highlightOnHover
                        responsive
                    />
                )}
            </Box>
        </Wrapper>
    );
};

export default ServiceOrders;
