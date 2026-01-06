import { FunctionComponent, useCallback, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Settings2, X } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus } from 'react-icons/hi2';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext, Select } from '../../components';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { getPurchaseOrderTableColumns } from './partials/PurchaseOrderTableColumns';
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
                    icon={<ShoppingCart className="w-8 h-8 text-blue-600" />}
                    title="Purchase Orders"
                    description="Manage purchase orders and receive inventory"
                    action={
                        <Button
                            icon={HiOutlinePlus}
                            layout={isMobile ? 'outline' : 'primary'}
                            onClick={handleAddPO}
                            theme="primary">
                            {!isMobile && <span className='hidden md:block'>
                                New Purchase Order
                            </span>}
                        </Button>
                    }
                >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4">
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <SearchBar
                                searchTerm={searchTerm}
                                onSearch={setSearchTerm}
                                placeholder="Search by PO number, supplier..."
                            />

                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as PurchaseOrderStatus | '')}
                                className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full sm:w-48"
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

                            {selectedRows.length > 0 && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                    <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        {selectedRows.length} selected
                                    </span>
                                </div>
                            )}

                            {hasActiveFilters && (
                                <Button
                                    onClick={handleClearFilters}
                                    theme="neutral"
                                    layout="outline"
                                    className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-700"
                                >
                                    <X className="w-4 h-4" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </PageHeader>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <DataTable
                        columns={columns}
                        data={purchaseOrders}
                        theme={mode as Themes}
                        progressPending={isLoading}
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
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
                        fixedHeaderScrollHeight="calc(100vh - 450px)"
                        persistTableHead
                        noDataComponent={
                            <div className="flex flex-col items-center justify-center py-12 dark:bg-gray-800 flex-1">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                    <ShoppingCart className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {statusFilter || searchTerm ? 'No matching purchase orders' : 'No purchase orders yet'}
                                </h3>
                                <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                    {statusFilter || searchTerm
                                        ? 'Try adjusting your filters to see purchase orders.'
                                        : 'Get started by creating your first purchase order.'
                                    }
                                </p>
                            </div>
                        }
                    />
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
