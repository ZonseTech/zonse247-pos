import { FunctionComponent, useCallback, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Settings2, Plus, FilterX, Clock, Send, CheckCircle } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import { Box, Flex, Text, Select, Button, IconButton } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePagination from '../../components/MobilePagination';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext, ComponentLoader, SummaryCards } from '../../components';
import type { SummaryCardItem } from '../../components';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { getPurchaseOrderTableColumns } from './partials/PurchaseOrderTableColumns';
import { PurchaseOrderMobileList } from './partials/PurchaseOrderMobileCard';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import ReceiveModal from './partials/ReceiveModal';
import { Confirm } from 'notiflix';

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
    { value: 'RECEIVED', label: 'Received' },
    { value: 'SENT', label: 'Sent' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const PurchaseOrderManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const [selectedRows, setSelectedRows] = useState<PurchaseOrder[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);
    const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);

    const {
        purchaseOrders,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        sendPurchaseOrder,
        receivePurchaseOrder,
        cancelPurchaseOrder,
    } = usePurchaseOrders();

    const hasActiveFilters = useMemo(() => {
        return !!statusFilter;
    }, [statusFilter]);

    // Calculate summary stats
    const summaryCards: SummaryCardItem[] = useMemo(() => {
        const pendingCount = purchaseOrders.filter(po => po.status === 'PENDING' || po.status === 'DRAFT').length;
        const sentCount = purchaseOrders.filter(po => po.status === 'SENT' || po.status === 'SHIPPED').length;
        const partialCount = purchaseOrders.filter(po => po.status === 'PARTIALLY_RECEIVED').length;
        const receivedCount = purchaseOrders.filter(po => po.status === 'RECEIVED').length;

        return [
            {
                title: 'Total Orders',
                value: totalRows,
                icon: <ShoppingCart className="w-5 h-5" />,
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Pending / Draft',
                value: pendingCount,
                icon: <Clock className="w-5 h-5" />,
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
            {
                title: 'Sent / In Transit',
                value: sentCount,
                icon: <Send className="w-5 h-5" />,
                bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
                iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
                textColor: 'text-indigo-500 dark:text-indigo-400',
            },
            {
                title: 'Partial Received',
                value: partialCount,
                icon: <Send className="w-5 h-5" />,
                bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
                iconBgColor: 'bg-cyan-100 dark:bg-cyan-900/40',
                textColor: 'text-cyan-500 dark:text-cyan-400',
            },
            {
                title: 'Received',
                value: receivedCount,
                icon: <CheckCircle className="w-5 h-5" />,
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
        ];
    }, [purchaseOrders, totalRows]);

    const handleAddPO = useCallback(() => {
        navigate(ROUTES.PURCHASE_ORDER_FORM);
    }, [navigate]);

    const handleSend = useCallback(async (po: PurchaseOrder) => {
        Confirm.show(
            'Send Purchase Order',
            `Send ${po.poNumber} to ${po.supplier?.name || 'supplier'}?`,
            'Yes, Send',
            'Cancel',
            async () => {
                await sendPurchaseOrder(po.id);
            }
        );
    }, [sendPurchaseOrder]);

    const handleReceive = useCallback((po: PurchaseOrder) => {
        setReceivingPO(po);
    }, []);

    const handleCancel = useCallback(async (po: PurchaseOrder) => {
        Confirm.show(
            'Cancel Purchase Order',
            `Are you sure you want to cancel ${po.poNumber}?`,
            'Yes, Cancel',
            'No',
            async () => {
                await cancelPurchaseOrder(po.id);
            }
        );
    }, [cancelPurchaseOrder]);

    const handleView = useCallback((po: PurchaseOrder) => {
        navigate(ROUTES.PURCHASE_ORDER_FORM, { state: { purchaseOrderId: po.id } });
    }, [navigate]);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
    }, [setStatusFilter]);

    const handleRowSelected = useCallback((state: { selectedRows: PurchaseOrder[] }) => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setPage(page);
    }, [setPage]);

    const handlePerRowsChange = useCallback((newPerPage: number, page: number) => {
        setPerPage(newPerPage);
        setPage(page);
    }, [setPerPage, setPage]);

    const columns = getPurchaseOrderTableColumns({
        onSend: handleSend,
        onReceive: handleReceive,
        onCancel: handleCancel,
        onView: handleView,
    });

    return (
        <AppLayout>
            <Box className="max-w-full">
                <PageHeader
                    icon={<ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                    title="Purchase Orders"
                    description="Manage purchase orders and receive inventory"
                    action={
                        <Flex direction={{ initial: 'column', sm: 'row' }} gap={{ initial: '2', sm: '3' }} align="center">
                            <Select.Root
                                value={statusFilter || 'all'}
                                onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val as PurchaseOrderStatus)}
                            >
                                <Select.Trigger
                                    variant="surface"
                                    placeholder="All Status"
                                    className="w-full sm:w-48"
                                />
                                <Select.Content position="popper">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <Select.Item key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>

                            {selectedRows.length > 0 && !isMobile && (
                                <Flex align="center" gap="2" px="4" py="2" className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-md">
                                    <Settings2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                    <Text size="2" weight="medium" className="text-sky-900 dark:text-sky-100">
                                        {selectedRows.length} selected
                                    </Text>
                                </Flex>
                            )}

                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    color="red"
                                    size="2"
                                    onClick={handleClearFilters}
                                >
                                    <FilterX className="w-4 h-4" />
                                    Clear
                                </Button>
                            )}

                            {isMobile ? (
                                <IconButton
                                    variant="outline"
                                    size="2"
                                    onClick={handleAddPO}
                                    aria-label="New Purchase Order"
                                >
                                    <Plus className="w-4 h-4" />
                                </IconButton>
                            ) : (
                                <Button
                                    size="2"
                                    onClick={handleAddPO}
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden md:inline">New Purchase Order</span>
                                </Button>
                            )}
                        </Flex>
                    }
                />

                <Box className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <SummaryCards
                        cards={summaryCards}
                        isLoading={isLoading}
                        variant="embedded"
                        gridClassName="grid-cols-2 md:grid-cols-5"
                    />

                    {isMobile ? (
                        <Box className="overflow-hidden">
                            {isLoading ? (
                                <PurchaseOrderMobileList
                                    purchaseOrders={[]}
                                    onSend={handleSend}
                                    onReceive={handleReceive}
                                    onCancel={handleCancel}
                                    onView={handleView}
                                    isLoading={true}
                                />
                            ) : purchaseOrders.length === 0 ? (
                                <Flex direction="column" align="center" justify="center" py="9" px="4">
                                    <Flex align="center" justify="center" className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                                    </Flex>
                                    <Text as="p" size="4" weight="medium" align="center" className="text-gray-900 dark:text-white mb-2">
                                        {hasActiveFilters ? 'No matching purchase orders' : 'No purchase orders yet'}
                                    </Text>
                                    <Text as="p" size="2" color="gray" align="center" className="max-w-sm">
                                        {hasActiveFilters
                                            ? "Try adjusting your filters to see purchase orders."
                                            : "Get started by creating your first purchase order."}
                                    </Text>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"

                                            size="2"
                                            mt="4"
                                            onClick={handleClearFilters}
                                        >
                                            Clear filters
                                        </Button>
                                    )}
                                </Flex>
                            ) : (
                                <>
                                    <PurchaseOrderMobileList
                                        purchaseOrders={purchaseOrders}
                                        onSend={handleSend}
                                        onReceive={handleReceive}
                                        onCancel={handleCancel}
                                        onView={handleView}
                                        isLoading={false}
                                    />
                                    <MobilePagination page={page} totalRows={totalRows} perPage={perPage} onPageChange={setPage} />
                                </>
                            )}
                        </Box>
                    ) : (
                        <Box className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={purchaseOrders}
                                theme={mode as Themes}
                                progressPending={isLoading}
                                progressComponent={<ComponentLoader loading={isLoading} />}
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                                onChangeRowsPerPage={handlePerRowsChange}
                                onChangePage={handlePageChange}
                                customStyles={getTableStyles(mode)}
                                highlightOnHover
                                striped
                                responsive
                                selectableRows
                                selectableRowsHighlight
                                onSelectedRowsChange={handleRowSelected}
                                clearSelectedRows={toggleCleared}
                                persistTableHead
                                noDataComponent={
                                    <Flex direction="column" align="center" justify="center" py="9" className="dark:bg-gray-800 flex-1">
                                        <Flex align="center" justify="center" className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700">
                                            <ShoppingCart className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </Flex>
                                        <Text as="p" size="4" weight="bold" className="mt-4 text-gray-900 dark:text-gray-100">
                                            {hasActiveFilters ? 'No matching purchase orders' : 'No purchase orders yet'}
                                        </Text>
                                        <Text as="p" size="2" color="gray" align="center" className="mt-2 max-w-sm">
                                            {hasActiveFilters
                                                ? 'Try adjusting your filters to see purchase orders.'
                                                : 'Get started by creating your first purchase order.'
                                            }
                                        </Text>
                                    </Flex>
                                }
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            {receivingPO && (
                <ReceiveModal
                    purchaseOrder={receivingPO}
                    onClose={() => setReceivingPO(null)}
                    onReceive={receivePurchaseOrder}
                />
            )}
        </AppLayout>
    );
};

export default PurchaseOrderManagement;
