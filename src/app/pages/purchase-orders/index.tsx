import { FunctionComponent, useCallback, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Settings2, X } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { HiOutlineFilter } from 'react-icons/hi';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext, Select, ComponentLoader } from '../../components';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { getPurchaseOrderTableColumns } from './partials/PurchaseOrderTableColumns';
import { PurchaseOrderMobileList } from './partials/PurchaseOrderMobileCard';
import PurchaseOrderSummaryCards, { PurchaseOrderSummaryCard } from './partials/PurchaseOrderSummaryCards';
import { SearchBar } from './partials/SearchBar';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import ReceiveModal from './partials/ReceiveModal';

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
        searchTerm,
        setSearchTerm,
        receivePurchaseOrder,
        cancelPurchaseOrder,
    } = usePurchaseOrders();

    const hasActiveFilters = useMemo(() => {
        return !!statusFilter || !!searchTerm;
    }, [statusFilter, searchTerm]);

    // Calculate summary stats
    const summaryCards: PurchaseOrderSummaryCard[] = useMemo(() => {
        const pendingCount = purchaseOrders.filter(po => po.status === 'PENDING' || po.status === 'PARTIALLY_RECEIVED').length;
        const receivedCount = purchaseOrders.filter(po => po.status === 'RECEIVED').length;
        const cancelledCount = purchaseOrders.filter(po => po.status === 'CANCELLED').length;

        return [
            {
                title: 'Total Orders',
                value: totalRows,
                icon: 'total',
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Pending',
                value: pendingCount,
                icon: 'pending',
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
            {
                title: 'Received',
                value: receivedCount,
                icon: 'received',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Cancelled',
                value: cancelledCount,
                icon: 'cancelled',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-500 dark:text-red-400',
            },
        ];
    }, [purchaseOrders, totalRows]);

    const handleAddPO = useCallback(() => {
        navigate(ROUTES.PURCHASE_ORDER_FORM);
    }, [navigate]);

    const handleReceive = useCallback((po: PurchaseOrder) => {
        setReceivingPO(po);
    }, []);

    const handleCancel = useCallback(async (po: PurchaseOrder) => {
        const reason = prompt('Enter cancellation reason:');
        if (reason) {
            await cancelPurchaseOrder(po.id, reason);
        }
    }, [cancelPurchaseOrder]);

    const handleView = useCallback((po: PurchaseOrder) => {
        navigate(ROUTES.PURCHASE_ORDER_FORM, { state: { purchaseOrderId: po.purchaseOrderId } });
    }, [navigate]);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
        setSearchTerm('');
    }, [setStatusFilter, setSearchTerm]);

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
        onReceive: handleReceive,
        onCancel: handleCancel,
        onView: handleView,
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                    title="Purchase Orders"
                    description="Manage purchase orders and receive inventory"
                    action={
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <SearchBar
                                searchTerm={searchTerm}
                                onSearch={setSearchTerm}
                                placeholder="Search by PO number, supplier..."
                            />

                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as PurchaseOrderStatus | '')}
                                className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 transition-colors w-full sm:w-48"
                            >
                                <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    All Status
                                </option>
                                <option value="DRAFT" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Draft
                                </option>
                                <option value="PENDING" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Pending
                                </option>
                                <option value="PARTIALLY_RECEIVED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Partially Received
                                </option>
                                <option value="RECEIVED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Received
                                </option>
                                <option value="CANCELLED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Cancelled
                                </option>
                            </Select>

                            {selectedRows.length > 0 && !isMobile && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-md">
                                    <Settings2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                    <span className="text-sm font-medium text-sky-900 dark:text-sky-100">
                                        {selectedRows.length} selected
                                    </span>
                                </div>
                            )}

                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700"
                                >
                                    <HiOutlineFilter className="w-4 h-4" />
                                    <span>Clear</span>
                                </button>
                            )}
                            <Button
                                icon={HiOutlinePlus}
                                layout={isMobile ? 'outline' : 'primary'}
                                onClick={handleAddPO}
                                className="!px-3 sm:!px-4 !py-2 sm:!py-2.5"
                                theme="primary">
                                {!isMobile && <span className='hidden md:block'>
                                    New Purchase Order
                                </span>}
                            </Button>
                        </div>
                    }
                />

                {/* Main Content Container */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Summary Cards */}
                    <PurchaseOrderSummaryCards
                        cards={summaryCards}
                        isLoading={isLoading}
                    />

                    {/* Mobile View - Card List */}
                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <PurchaseOrderMobileList
                                    purchaseOrders={[]}
                                    onReceive={handleReceive}
                                    onCancel={handleCancel}
                                    onView={handleView}
                                    isLoading={true}
                                />
                            ) : purchaseOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {hasActiveFilters ? 'No matching purchase orders' : 'No purchase orders yet'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {hasActiveFilters
                                            ? "Try adjusting your filters to see purchase orders."
                                            : "Get started by creating your first purchase order."}
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="mt-4 text-sky-500 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium text-sm"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <PurchaseOrderMobileList
                                        purchaseOrders={purchaseOrders}
                                        onReceive={handleReceive}
                                        onCancel={handleCancel}
                                        onView={handleView}
                                        isLoading={false}
                                    />

                                    {/* Mobile Pagination */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {totalRows} total
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage(Math.max(1, page - 1))}
                                                disabled={page <= 1}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {page} / {Math.ceil(totalRows / perPage) || 1}
                                            </span>
                                            <button
                                                onClick={() => setPage(Math.min(Math.ceil(totalRows / perPage), page + 1))}
                                                disabled={page >= Math.ceil(totalRows / perPage)}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        /* Desktop View - Data Table */
                        <div className="overflow-hidden">
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
                                fixedHeader
                                selectableRows
                                selectableRowsHighlight
                                onSelectedRowsChange={handleRowSelected}
                                clearSelectedRows={toggleCleared}
                                fixedHeaderScrollHeight="calc(100vh - 480px)"
                                persistTableHead
                                noDataComponent={
                                    <div className="flex flex-col items-center justify-center py-12 dark:bg-gray-800 flex-1">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                            <ShoppingCart className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {hasActiveFilters ? 'No matching purchase orders' : 'No purchase orders yet'}
                                        </h3>
                                        <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                            {hasActiveFilters
                                                ? 'Try adjusting your filters to see purchase orders.'
                                                : 'Get started by creating your first purchase order.'
                                            }
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

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
