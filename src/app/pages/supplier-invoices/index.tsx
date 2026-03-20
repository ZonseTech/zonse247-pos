import { FunctionComponent, useCallback, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Settings2 } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus } from 'react-icons/hi2';
import { HiOutlineFilter } from 'react-icons/hi';
import MobilePagination from '../../components/MobilePagination';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext, Select, ComponentLoader } from '../../components';
import { useSupplierInvoices } from '../../hooks/useSupplierInvoices';
import { getSupplierInvoiceTableColumns } from './partials/SupplierInvoiceTableColumns';
import { SupplierInvoiceMobileList } from './partials/SupplierInvoiceMobileCard';
import SupplierInvoiceSummaryCards, { type SupplierInvoiceSummaryCard } from './partials/SupplierInvoiceSummaryCards';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Confirm } from 'notiflix';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

const SupplierInvoiceManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const [selectedRows, setSelectedRows] = useState<SupplierInvoiceWithItems[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);

    const {
        invoices,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        cancelInvoice,
        disputeInvoice,
        deleteInvoice,
    } = useSupplierInvoices();

    const hasActiveFilters = useMemo(() => !!statusFilter, [statusFilter]);

    // Summary cards
    const summaryCards: SupplierInvoiceSummaryCard[] = useMemo(() => {
        const pendingCount = invoices.filter(i => i.status === 'PENDING').length;
        const partialPaidCount = invoices.filter(i => i.status === 'PARTIALLY_PAID').length;
        const paidCount = invoices.filter(i => i.status === 'PAID').length;
        const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;
        const totalOutstanding = invoices.reduce((sum, i) =>
            ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status) ? sum + i.balanceDue : sum, 0);

        return [
            {
                title: 'Total Invoices',
                value: totalRows,
                icon: 'total' as const,
                bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
                iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
                textColor: 'text-indigo-500 dark:text-indigo-400',
            },
            {
                title: 'Pending',
                value: pendingCount,
                icon: 'pending' as const,
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
            {
                title: 'Partially Paid',
                value: partialPaidCount,
                icon: 'pending' as const,
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                iconBgColor: 'bg-blue-100 dark:bg-blue-900/40',
                textColor: 'text-blue-500 dark:text-blue-400',
            },
            {
                title: 'Paid',
                value: paidCount,
                icon: 'paid' as const,
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Overdue',
                value: overdueCount,
                icon: 'overdue' as const,
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-500 dark:text-red-400',
            },
            {
                title: 'Outstanding',
                value: formatCurrency(totalOutstanding),
                icon: 'outstanding' as const,
                bgColor: 'bg-violet-50 dark:bg-violet-900/20',
                iconBgColor: 'bg-violet-100 dark:bg-violet-900/40',
                textColor: 'text-violet-500 dark:text-violet-400',
            },
        ];
    }, [invoices, totalRows]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAdd = useCallback(() => {
        navigate(ROUTES.SUPPLIER_INVOICE_FORM);
    }, [navigate]);

    const handleView = useCallback((invoice: SupplierInvoiceWithItems) => {
        navigate(ROUTES.SUPPLIER_INVOICE_FORM, { state: { invoiceId: invoice.id } });
    }, [navigate]);

    const handleCancel = useCallback((invoice: SupplierInvoiceWithItems) => {
        Confirm.show(
            'Cancel Invoice',
            `Are you sure you want to cancel invoice ${invoice.invoiceNumber}?`,
            'Yes, Cancel',
            'No',
            async () => {
                await cancelInvoice(invoice.id);
            },
        );
    }, [cancelInvoice]);

    const handleDispute = useCallback((invoice: SupplierInvoiceWithItems) => {
        Confirm.show(
            'Dispute Invoice',
            `Mark invoice ${invoice.invoiceNumber} as disputed? You can provide a reason.`,
            'Yes, Dispute',
            'Cancel',
            async () => {
                await disputeInvoice(invoice.id, 'Quantities or amounts under review');
            },
        );
    }, [disputeInvoice]);

    const handleDelete = useCallback((invoice: SupplierInvoiceWithItems) => {
        Confirm.show(
            'Delete Invoice',
            `Permanently delete invoice ${invoice.invoiceNumber}? This cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                await deleteInvoice(invoice.id);
            },
        );
    }, [deleteInvoice]);

    const handleRecordPayment = useCallback((invoice: SupplierInvoiceWithItems) => {
        navigate(ROUTES.SUPPLIER_PAYMENT_FORM, { state: { invoiceId: invoice.id, supplierId: invoice.supplierId } });
    }, [navigate]);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
    }, [setStatusFilter]);

    const handleRowSelected = useCallback((state: { selectedRows: SupplierInvoiceWithItems[] }) => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handlePageChange = useCallback((p: number) => setPage(p), [setPage]);

    const handlePerRowsChange = useCallback((newPerPage: number, p: number) => {
        setPerPage(newPerPage);
        setPage(p);
    }, [setPerPage, setPage]);

    const columns = getSupplierInvoiceTableColumns({
        onView: handleView,
        onCancel: handleCancel,
        onDispute: handleDispute,
        onDelete: handleDelete,
        onRecordPayment: handleRecordPayment,
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<FileText className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500 dark:text-indigo-400" />}
                    title="Supplier Invoices"
                    description="Manage supplier invoices and track payment obligations"
                    action={
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as InvoiceStatusType | '')}
                                className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors w-full sm:w-48"
                            >
                                <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    All Status
                                </option>
                                <option value="PENDING" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Pending
                                </option>
                                <option value="PARTIALLY_PAID" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Partially Paid
                                </option>
                                <option value="PAID" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Paid
                                </option>
                                <option value="OVERDUE" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Overdue
                                </option>
                                <option value="CANCELLED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Cancelled
                                </option>
                                <option value="DISPUTED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Disputed
                                </option>
                            </Select>

                            {selectedRows.length > 0 && !isMobile && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-md">
                                    <Settings2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                    <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
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
                                {!isMobile && <span className="hidden md:block">New Invoice</span>}
                            </Button>
                        </div>
                    }
                />

                {/* Main content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <SupplierInvoiceSummaryCards cards={summaryCards} isLoading={isLoading} />

                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <SupplierInvoiceMobileList
                                    invoices={[]}
                                    onView={handleView}
                                    onCancel={handleCancel}
                                    onDispute={handleDispute}
                                    onDelete={handleDelete}
                                    onRecordPayment={handleRecordPayment}
                                    isLoading={true}
                                />
                            ) : invoices.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {hasActiveFilters ? 'No matching invoices' : 'No invoices yet'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {hasActiveFilters
                                            ? 'Try adjusting your filters.'
                                            : 'Create a supplier invoice to track payment obligations.'}
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="mt-4 text-indigo-500 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <SupplierInvoiceMobileList
                                        invoices={invoices}
                                        onView={handleView}
                                        onCancel={handleCancel}
                                        onDispute={handleDispute}
                                        onDelete={handleDelete}
                                        onRecordPayment={handleRecordPayment}
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
                                data={invoices}
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
                                            <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {hasActiveFilters ? 'No matching invoices' : 'No invoices yet'}
                                        </h3>
                                        <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                            {hasActiveFilters
                                                ? 'Try adjusting your filters.'
                                                : 'Create a supplier invoice to track payment obligations.'}
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

export default SupplierInvoiceManagement;
