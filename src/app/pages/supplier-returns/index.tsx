import { FunctionComponent, useCallback, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { RotateCcw, Settings2 } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus } from 'react-icons/hi2';
import { HiOutlineFilter } from 'react-icons/hi';
import MobilePagination from '../../components/MobilePagination';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext, Select, ComponentLoader } from '../../components';
import { useSupplierReturns } from '../../hooks/useSupplierReturns';
import { getSupplierReturnTableColumns } from './partials/SupplierReturnTableColumns';
import { SupplierReturnMobileList } from './partials/SupplierReturnMobileCard';
import SupplierReturnSummaryCards from './partials/SupplierReturnSummaryCards';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Confirm } from 'notiflix';

const SupplierReturnManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const [selectedRows, setSelectedRows] = useState<SupplierReturnWithItems[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);

    const {
        returns,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        approveReturn,
        shipReturn,
        completeReturn,
        cancelReturn,
        deleteReturn,
    } = useSupplierReturns();

    const hasActiveFilters = useMemo(() => !!statusFilter, [statusFilter]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAdd = useCallback(() => {
        navigate(ROUTES.SUPPLIER_RETURN_FORM);
    }, [navigate]);

    const handleView = useCallback((r: SupplierReturnWithItems) => {
        navigate(ROUTES.SUPPLIER_RETURN_FORM, { state: { returnId: r.id } });
    }, [navigate]);

    const handleApprove = useCallback((r: SupplierReturnWithItems) => {
        Confirm.show(
            'Approve Return',
            `Approve return ${r.returnNumber}? This moves it to Approved status.`,
            'Yes, Approve',
            'Cancel',
            async () => { await approveReturn(r.id); },
        );
    }, [approveReturn]);

    const handleShip = useCallback((r: SupplierReturnWithItems) => {
        Confirm.show(
            'Ship Return',
            `Mark return ${r.returnNumber} as shipped? Goods are in transit to supplier.`,
            'Yes, Ship',
            'Cancel',
            async () => { await shipReturn(r.id); },
        );
    }, [shipReturn]);

    const handleComplete = useCallback((r: SupplierReturnWithItems) => {
        Confirm.show(
            'Complete Return',
            `Complete return ${r.returnNumber}? This will remove inventory and generate a credit note.`,
            'Yes, Complete',
            'Cancel',
            async () => { await completeReturn(r.id); },
        );
    }, [completeReturn]);

    const handleCancel = useCallback((r: SupplierReturnWithItems) => {
        Confirm.show(
            'Cancel Return',
            `Cancel return ${r.returnNumber}? This cannot be undone.`,
            'Yes, Cancel',
            'No',
            async () => { await cancelReturn(r.id); },
        );
    }, [cancelReturn]);

    const handleDelete = useCallback((r: SupplierReturnWithItems) => {
        Confirm.show(
            'Delete Return',
            `Permanently delete draft return ${r.returnNumber}?`,
            'Yes, Delete',
            'Cancel',
            async () => { await deleteReturn(r.id); },
        );
    }, [deleteReturn]);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
    }, [setStatusFilter]);

    const handleRowSelected = useCallback((state: { selectedRows: SupplierReturnWithItems[] }) => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handlePageChange = useCallback((p: number) => setPage(p), [setPage]);

    const handlePerRowsChange = useCallback((newPerPage: number, p: number) => {
        setPerPage(newPerPage);
        setPage(p);
    }, [setPerPage, setPage]);

    const columns = getSupplierReturnTableColumns({
        onView: handleView,
        onApprove: handleApprove,
        onShip: handleShip,
        onComplete: handleComplete,
        onCancel: handleCancel,
        onDelete: handleDelete,
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<RotateCcw className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500 dark:text-orange-400" />}
                    title="Supplier Returns"
                    description="Manage returns to suppliers and track credit notes"
                    action={
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as SupplierReturnStatusType | '')}
                                className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400 transition-colors w-full sm:w-48"
                            >
                                <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">All Status</option>
                                <option value="DRAFT" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">Draft</option>
                                <option value="APPROVED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">Approved</option>
                                <option value="SHIPPED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">Shipped</option>
                                <option value="COMPLETED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">Completed</option>
                                <option value="CANCELLED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">Cancelled</option>
                            </Select>

                            {selectedRows.length > 0 && !isMobile && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                                    <Settings2 className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                                    <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
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
                                onClick={handleAdd}
                                className="!px-3 sm:!px-4 !py-2 sm:!py-2.5"
                                theme="primary"
                            >
                                {!isMobile && <span className="hidden md:block">New Return</span>}
                            </Button>
                        </div>
                    }
                />

                {/* Main content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <SupplierReturnSummaryCards returns={returns} isLoading={isLoading} />

                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <SupplierReturnMobileList
                                    returns={[]}
                                    onView={handleView}
                                    onApprove={handleApprove}
                                    onShip={handleShip}
                                    onComplete={handleComplete}
                                    onCancel={handleCancel}
                                    onDelete={handleDelete}
                                    isLoading={true}
                                />
                            ) : returns.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <RotateCcw className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {hasActiveFilters ? 'No matching returns' : 'No returns yet'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {hasActiveFilters
                                            ? 'Try adjusting your filters.'
                                            : 'Create a supplier return to start the return process.'}
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="mt-4 text-orange-500 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 font-medium text-sm"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <SupplierReturnMobileList
                                        returns={returns}
                                        onView={handleView}
                                        onApprove={handleApprove}
                                        onShip={handleShip}
                                        onComplete={handleComplete}
                                        onCancel={handleCancel}
                                        onDelete={handleDelete}
                                        isLoading={false}
                                    />
                                    <MobilePagination page={page} totalRows={totalRows} perPage={perPage} onPageChange={setPage} />
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={returns}
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
                                            <RotateCcw className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {hasActiveFilters ? 'No matching returns' : 'No returns yet'}
                                        </h3>
                                        <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                            {hasActiveFilters
                                                ? 'Try adjusting your filters.'
                                                : 'Create a supplier return to start the return process.'}
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default SupplierReturnManagement;
