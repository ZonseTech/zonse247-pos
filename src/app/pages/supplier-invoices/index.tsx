import {
    FunctionComponent,
    useCallback,
    useContext,
    useState,
    useMemo,
} from 'react';
import { useNavigate } from 'react-router';
import {
    FileText,
    Plus,
    FilterX,
    Clock,
    CheckCircle2,
    AlertCircle,
    DollarSign,
    CreditCard,
} from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import { Box, Flex, Text, Select, Button, IconButton } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePagination from '../../components/MobilePagination';
import { getTableStyles } from '../../utils/table-styles';
import {
    ZonseThemeContext,
    ComponentLoader,
    ProcurementSummaryCards,
} from '../../components';
import type { ProcurementSummaryCard } from '../../components';
import { useSupplierInvoices } from '../../hooks/useSupplierInvoices';
import { getSupplierInvoiceTableColumns } from './partials/SupplierInvoiceTableColumns';
import { SupplierInvoiceMobileList } from './partials/SupplierInvoiceMobileCard';
import SupplierInvoiceFormModal from './partials/SupplierInvoiceFormModal';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Confirm } from 'notiflix';

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
    { value: 'PAID', label: 'Paid' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'DISPUTED', label: 'Disputed' },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'MWK',
    }).format(value);

const SupplierInvoiceManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const [formState, setFormState] = useState<{ invoiceId?: string } | null>(
        null,
    );

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
        loadInvoices,
        cancelInvoice,
        disputeInvoice,
        deleteInvoice,
    } = useSupplierInvoices();

    const hasActiveFilters = useMemo(() => !!statusFilter, [statusFilter]);

    // Summary cards
    const summaryCards: ProcurementSummaryCard[] = useMemo(() => {
        const pendingCount = invoices.filter(
            (i) => i.status === 'PENDING',
        ).length;
        const partialPaidCount = invoices.filter(
            (i) => i.status === 'PARTIALLY_PAID',
        ).length;
        const paidCount = invoices.filter((i) => i.status === 'PAID').length;
        const overdueCount = invoices.filter(
            (i) => i.status === 'OVERDUE',
        ).length;
        const totalOutstanding = invoices.reduce(
            (sum, i) =>
                ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status)
                    ? sum + i.balanceDue
                    : sum,
            0,
        );

        return [
            {
                title: 'Total Invoices',
                value: totalRows,
                icon: FileText,
                bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
                iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
                textColor: 'text-indigo-500 dark:text-indigo-400',
            },
            {
                title: 'Pending',
                value: pendingCount,
                icon: Clock,
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
            {
                title: 'Partially Paid',
                value: partialPaidCount,
                icon: CreditCard,
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                iconBgColor: 'bg-blue-100 dark:bg-blue-900/40',
                textColor: 'text-blue-500 dark:text-blue-400',
            },
            {
                title: 'Paid',
                value: paidCount,
                icon: CheckCircle2,
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Overdue',
                value: overdueCount,
                icon: AlertCircle,
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-500 dark:text-red-400',
            },
            {
                title: 'Outstanding',
                value: totalOutstanding,
                displayValue: formatCurrency(totalOutstanding),
                icon: DollarSign,
                bgColor: 'bg-violet-50 dark:bg-violet-900/20',
                iconBgColor: 'bg-violet-100 dark:bg-violet-900/40',
                textColor: 'text-violet-500 dark:text-violet-400',
            },
        ];
    }, [invoices, totalRows]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAdd = useCallback(() => setFormState({}), []);

    const handleView = useCallback((invoice: SupplierInvoiceWithItems) => {
        setFormState({ invoiceId: invoice.id });
    }, []);

    const handleCancel = useCallback(
        (invoice: SupplierInvoiceWithItems) => {
            Confirm.show(
                'Cancel Invoice',
                `Are you sure you want to cancel invoice ${invoice.invoiceNumber}?`,
                'Yes, Cancel',
                'No',
                async () => {
                    await cancelInvoice(invoice.id);
                },
            );
        },
        [cancelInvoice],
    );

    const handleDispute = useCallback(
        (invoice: SupplierInvoiceWithItems) => {
            Confirm.show(
                'Dispute Invoice',
                `Mark invoice ${invoice.invoiceNumber} as disputed? You can provide a reason.`,
                'Yes, Dispute',
                'Cancel',
                async () => {
                    await disputeInvoice(
                        invoice.id,
                        'Quantities or amounts under review',
                    );
                },
            );
        },
        [disputeInvoice],
    );

    const handleDelete = useCallback(
        (invoice: SupplierInvoiceWithItems) => {
            Confirm.show(
                'Delete Invoice',
                `Permanently delete invoice ${invoice.invoiceNumber}? This cannot be undone.`,
                'Yes, Delete',
                'Cancel',
                async () => {
                    await deleteInvoice(invoice.id);
                },
            );
        },
        [deleteInvoice],
    );

    const handleRecordPayment = useCallback(
        (invoice: SupplierInvoiceWithItems) => {
            navigate(ROUTES.SUPPLIER_PAYMENTS, {
                state: {
                    invoiceId: invoice.id,
                    supplierId: invoice.supplierId,
                },
            });
        },
        [navigate],
    );

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
    }, [setStatusFilter]);

    const handlePageChange = useCallback((p: number) => setPage(p), [setPage]);

    const handlePerRowsChange = useCallback(
        (newPerPage: number, p: number) => {
            setPerPage(newPerPage);
            setPage(p);
        },
        [setPerPage, setPage],
    );

    const columns = getSupplierInvoiceTableColumns({
        onView: handleView,
        onCancel: handleCancel,
        onDispute: handleDispute,
        onDelete: handleDelete,
        onRecordPayment: handleRecordPayment,
    });

    return (
        <AppLayout>
            <Box className="max-w-full">
                <PageHeader
                    icon={
                        <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500 dark:text-indigo-400" />
                    }
                    title="Supplier Invoices"
                    description="Manage supplier invoices and track payment obligations"
                    action={
                        <Flex
                            direction={{ initial: 'column', sm: 'row' }}
                            gap={{ initial: '2', sm: '3' }}
                            align="center"
                        >
                            <Select.Root
                                value={statusFilter || 'all'}
                                onValueChange={(val) =>
                                    setStatusFilter(
                                        val === 'all'
                                            ? ''
                                            : (val as InvoiceStatusType),
                                    )
                                }
                            >
                                <Select.Trigger
                                    variant="surface"
                                    placeholder="All Status"
                                    className="w-full sm:w-48"
                                />
                                <Select.Content position="popper">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <Select.Item
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>

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
                                    color="indigo"
                                    size="2"
                                    onClick={handleAdd}
                                    aria-label="New Invoice"
                                >
                                    <Plus className="w-4 h-4" />
                                </IconButton>
                            ) : (
                                <Button size="2" onClick={handleAdd}>
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden md:inline">
                                        New Invoice
                                    </span>
                                </Button>
                            )}
                        </Flex>
                    }
                />

                <Box className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Box px="4">
                        <ProcurementSummaryCards
                            cards={summaryCards}
                            isLoading={isLoading}
                        />
                    </Box>

                    {isMobile ? (
                        <Box className="overflow-hidden">
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
                                <Flex
                                    direction="column"
                                    align="center"
                                    justify="center"
                                    py="9"
                                    px="4"
                                >
                                    <Flex
                                        align="center"
                                        justify="center"
                                        className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4"
                                    >
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </Flex>
                                    <Text
                                        as="p"
                                        size="4"
                                        weight="medium"
                                        align="center"
                                        className="text-gray-900 dark:text-white mb-2"
                                    >
                                        {hasActiveFilters
                                            ? 'No matching invoices'
                                            : 'No invoices yet'}
                                    </Text>
                                    <Text
                                        as="p"
                                        size="2"
                                        color="gray"
                                        align="center"
                                        className="max-w-sm"
                                    >
                                        {hasActiveFilters
                                            ? 'Try adjusting your filters.'
                                            : 'Create a supplier invoice to track payment obligations.'}
                                    </Text>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            color="indigo"
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
                                    <SupplierInvoiceMobileList
                                        invoices={invoices}
                                        onView={handleView}
                                        onCancel={handleCancel}
                                        onDispute={handleDispute}
                                        onDelete={handleDelete}
                                        onRecordPayment={handleRecordPayment}
                                        isLoading={false}
                                    />
                                    <MobilePagination
                                        page={page}
                                        totalRows={totalRows}
                                        perPage={perPage}
                                        onPageChange={setPage}
                                    />
                                </>
                            )}
                        </Box>
                    ) : (
                        <Box className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={invoices}
                                theme={mode as Themes}
                                progressPending={isLoading}
                                progressComponent={
                                    <ComponentLoader loading={isLoading} />
                                }
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[
                                    10, 15, 25, 50, 100,
                                ]}
                                onChangeRowsPerPage={handlePerRowsChange}
                                onChangePage={handlePageChange}
                                customStyles={getTableStyles(mode)}
                                highlightOnHover
                                striped
                                responsive
                                persistTableHead
                                noDataComponent={
                                    <Flex
                                        direction="column"
                                        align="center"
                                        justify="center"
                                        py="9"
                                        className="dark:bg-gray-800 flex-1"
                                    >
                                        <Flex
                                            align="center"
                                            justify="center"
                                            className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700"
                                        >
                                            <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </Flex>
                                        <Text
                                            as="p"
                                            size="4"
                                            weight="bold"
                                            className="mt-4 text-gray-900 dark:text-gray-100"
                                        >
                                            {hasActiveFilters
                                                ? 'No matching invoices'
                                                : 'No invoices yet'}
                                        </Text>
                                        <Text
                                            as="p"
                                            size="2"
                                            color="gray"
                                            align="center"
                                            className="mt-2 max-w-sm"
                                        >
                                            {hasActiveFilters
                                                ? 'Try adjusting your filters.'
                                                : 'Create a supplier invoice to track payment obligations.'}
                                        </Text>
                                    </Flex>
                                }
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            {formState && (
                <SupplierInvoiceFormModal
                    invoiceId={formState.invoiceId}
                    onClose={() => setFormState(null)}
                    onSaved={loadInvoices}
                />
            )}
        </AppLayout>
    );
};

export default SupplierInvoiceManagement;
