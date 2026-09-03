import {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useState,
    useMemo,
} from 'react';
import { useLocation } from 'react-router';
import {
    Wallet,
    Plus,
    FilterX,
    CreditCard,
    CheckCircle2,
    XCircle,
    DollarSign,
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
import { useSupplierPayments } from '../../hooks/useSupplierPayments';
import { getSupplierPaymentTableColumns } from './partials/SupplierPaymentTableColumns';
import { SupplierPaymentMobileList } from './partials/SupplierPaymentMobileCard';
import SupplierPaymentFormModal from './partials/SupplierPaymentFormModal';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Confirm } from 'notiflix';

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CANCELLED', label: 'Voided' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'REFUNDED', label: 'Refunded' },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'MWK',
    }).format(value);

const SupplierPaymentManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const location = useLocation();
    const { mode } = useContext(ZonseThemeContext);

    const [formState, setFormState] = useState<{
        paymentId?: string;
        preSupplierId?: string;
        preInvoiceId?: string;
    } | null>(null);

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
        loadPayments,
        voidPayment,
    } = useSupplierPayments();

    // Cross-module entry point: "Pay this invoice" on the Supplier Invoices list
    // navigates here with { invoiceId, supplierId } state to pre-fill the create modal.
    useEffect(() => {
        const state = location.state as {
            invoiceId?: string;
            supplierId?: string;
        } | null;
        if (state?.invoiceId || state?.supplierId) {
            setFormState({
                preSupplierId: state.supplierId,
                preInvoiceId: state.invoiceId,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const hasActiveFilters = useMemo(() => !!statusFilter, [statusFilter]);

    const summaryCards: ProcurementSummaryCard[] = useMemo(() => {
        const completed = payments.filter(
            (p) => p.status === 'COMPLETED',
        ).length;
        const voided = payments.filter((p) => p.status === 'CANCELLED').length;
        const totalAmount = payments
            .filter((p) => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        return [
            {
                title: 'Total Payments',
                value: totalRows,
                icon: CreditCard,
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Completed',
                value: completed,
                icon: CheckCircle2,
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Voided',
                value: voided,
                icon: XCircle,
                bgColor: 'bg-gray-50 dark:bg-gray-800/40',
                iconBgColor: 'bg-gray-100 dark:bg-gray-700',
                textColor: 'text-gray-500 dark:text-gray-400',
            },
            {
                title: 'Total Paid',
                value: totalAmount,
                displayValue: formatCurrency(totalAmount),
                icon: DollarSign,
                bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
                iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
                textColor: 'text-indigo-500 dark:text-indigo-400',
            },
        ];
    }, [payments, totalRows]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAdd = useCallback(() => setFormState({}), []);

    const handleView = useCallback(
        (payment: SupplierPaymentWithAllocations) => {
            setFormState({ paymentId: payment.id });
        },
        [],
    );

    const handleVoid = useCallback(
        (payment: SupplierPaymentWithAllocations) => {
            Confirm.show(
                'Void Payment',
                `Are you sure you want to void payment ${payment.paymentNumber}? This will restore the allocated invoice balances.`,
                'Yes, Void',
                'Cancel',
                async () => {
                    await voidPayment(payment.id, 'Voided from list');
                },
            );
        },
        [voidPayment],
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

    const columns = getSupplierPaymentTableColumns({
        onView: handleView,
        onVoid: handleVoid,
    });

    return (
        <AppLayout>
            <Box className="max-w-full">
                <PageHeader
                    icon={
                        <Wallet className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500 dark:text-emerald-400" />
                    }
                    title="Supplier Payments"
                    description="Record and manage payments to suppliers"
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
                                            : (val as PaymentStatusType),
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
                                    color="cyan"
                                    size="2"
                                    onClick={handleAdd}
                                    aria-label="Record Payment"
                                >
                                    <Plus className="w-4 h-4" />
                                </IconButton>
                            ) : (
                                <Button size="2" onClick={handleAdd}>
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden md:inline">
                                        Record Payment
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
                                <SupplierPaymentMobileList
                                    payments={[]}
                                    onView={handleView}
                                    onVoid={handleVoid}
                                    isLoading={true}
                                />
                            ) : payments.length === 0 ? (
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
                                        <Wallet className="w-8 h-8 text-gray-400" />
                                    </Flex>
                                    <Text
                                        as="p"
                                        size="4"
                                        weight="medium"
                                        align="center"
                                        className="text-gray-900 dark:text-white mb-2"
                                    >
                                        {hasActiveFilters
                                            ? 'No matching payments'
                                            : 'No payments yet'}
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
                                            : 'Record a payment to track supplier payment activity.'}
                                    </Text>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            color="cyan"
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
                                    <SupplierPaymentMobileList
                                        payments={payments}
                                        onView={handleView}
                                        onVoid={handleVoid}
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
                                data={payments}
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
                                            <Wallet className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </Flex>
                                        <Text
                                            as="p"
                                            size="4"
                                            weight="bold"
                                            className="mt-4 text-gray-900 dark:text-gray-100"
                                        >
                                            {hasActiveFilters
                                                ? 'No matching payments'
                                                : 'No payments yet'}
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
                                                : 'Record a payment to track supplier payment activity.'}
                                        </Text>
                                    </Flex>
                                }
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            {formState && (
                <SupplierPaymentFormModal
                    paymentId={formState.paymentId}
                    preSupplierId={formState.preSupplierId}
                    preInvoiceId={formState.preInvoiceId}
                    onClose={() => setFormState(null)}
                    onSaved={loadPayments}
                />
            )}
        </AppLayout>
    );
};

export default SupplierPaymentManagement;
