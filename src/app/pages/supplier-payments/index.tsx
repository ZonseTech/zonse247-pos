import { FunctionComponent, useCallback, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Wallet, Settings2 } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus } from 'react-icons/hi2';
import { HiOutlineFilter } from 'react-icons/hi';
import MobilePagination from '../../components/MobilePagination';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext, Select, ComponentLoader } from '../../components';
import { useSupplierPayments } from '../../hooks/useSupplierPayments';
import { getSupplierPaymentTableColumns } from './partials/SupplierPaymentTableColumns';
import { SupplierPaymentMobileList } from './partials/SupplierPaymentMobileCard';
import SupplierPaymentSummaryCards from './partials/SupplierPaymentSummaryCards';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Confirm } from 'notiflix';

const SupplierPaymentManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const [selectedRows, setSelectedRows] = useState<SupplierPaymentWithAllocations[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);

    const {
        payments,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        voidPayment,
    } = useSupplierPayments();

    const hasActiveFilters = useMemo(() => !!statusFilter, [statusFilter]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAdd = useCallback(() => {
        navigate(ROUTES.SUPPLIER_PAYMENT_FORM);
    }, [navigate]);

    const handleView = useCallback((payment: SupplierPaymentWithAllocations) => {
        navigate(ROUTES.SUPPLIER_PAYMENT_FORM, { state: { paymentId: payment.id } });
    }, [navigate]);

    const handleVoid = useCallback((payment: SupplierPaymentWithAllocations) => {
        Confirm.show(
            'Void Payment',
            `Are you sure you want to void payment ${payment.paymentNumber}? This will restore the allocated invoice balances.`,
            'Yes, Void',
            'Cancel',
            async () => {
                await voidPayment(payment.id, 'Voided from list');
            },
        );
    }, [voidPayment]);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
    }, [setStatusFilter]);

    const handleRowSelected = useCallback((state: { selectedRows: SupplierPaymentWithAllocations[] }) => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handlePageChange = useCallback((p: number) => setPage(p), [setPage]);

    const handlePerRowsChange = useCallback((newPerPage: number, p: number) => {
        setPerPage(newPerPage);
        setPage(p);
    }, [setPerPage, setPage]);

    const columns = getSupplierPaymentTableColumns({
        onView: handleView,
        onVoid: handleVoid,
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<Wallet className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500 dark:text-emerald-400" />}
                    title="Supplier Payments"
                    description="Record and manage payments to suppliers"
                    action={
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as PaymentStatusType | '')}
                                className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors w-full sm:w-48"
                            >
                                <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    All Status
                                </option>
                                <option value="COMPLETED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Completed
                                </option>
                                <option value="PENDING" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Pending
                                </option>
                                <option value="CANCELLED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Voided
                                </option>
                                <option value="FAILED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Failed
                                </option>
                                <option value="REFUNDED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Refunded
                                </option>
                            </Select>

                            {selectedRows.length > 0 && !isMobile && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md">
                                    <Settings2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
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
                                {!isMobile && <span className="hidden md:block">Record Payment</span>}
                            </Button>
                        </div>
                    }
                />

                {/* Main content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <SupplierPaymentSummaryCards payments={payments} isLoading={isLoading} />

                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <SupplierPaymentMobileList
                                    payments={[]}
                                    onView={handleView}
                                    onVoid={handleVoid}
                                    isLoading={true}
                                />
                            ) : payments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <Wallet className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {hasActiveFilters ? 'No matching payments' : 'No payments yet'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {hasActiveFilters
                                            ? 'Try adjusting your filters.'
                                            : 'Record a payment to track supplier payment activity.'}
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="mt-4 text-emerald-500 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium text-sm"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <SupplierPaymentMobileList
                                        payments={payments}
                                        onView={handleView}
                                        onVoid={handleVoid}
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
                                data={payments}
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
                                            <Wallet className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {hasActiveFilters ? 'No matching payments' : 'No payments yet'}
                                        </h3>
                                        <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                            {hasActiveFilters
                                                ? 'Try adjusting your filters.'
                                                : 'Record a payment to track supplier payment activity.'}
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

export default SupplierPaymentManagement;
