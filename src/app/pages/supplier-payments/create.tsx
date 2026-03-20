import * as Yup from 'yup';
import { Form, Formik, FieldArray, useFormikContext, type FormikHelpers } from 'formik';
import { FunctionComponent, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
    Wallet, Eye, Loader2, Ban, FileText, CheckCircle2,
} from 'lucide-react';
import { Notify, Report, Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import { ROUTES } from '../../utils/constants';
import { useSupplierPayments } from '../../hooks/useSupplierPayments';
import { useSuppliers } from '../../hooks/useSuppliers';
import { supplierInvoiceService } from '../../services';
import FormSkeleton from '../../components/skeleton/FormSkeleton';
import { paymentStatusConfig } from './partials/SupplierPaymentTableColumns';
import { getErrorMessage } from '../../utils/api-error-handler';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

const formatDate = (d?: Date | string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface AllocationRow {
    invoiceId: string;
    invoiceNumber: string;
    totalAmount: number;
    balanceDue: number;
    allocatedAmount: number;
    notes: string;
}

interface PaymentFormValues {
    supplierId: string;
    paymentDate: string;
    amount: number | '';
    paymentMethod: string;
    reference: string;
    notes: string;
    allocations: AllocationRow[];
}

type FormMode = 'create' | 'view';

// Payment method options
const PAYMENT_METHODS = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
    { label: 'Cheque', value: 'CHEQUE' },
    { label: 'Mobile Money', value: 'MOBILE_MONEY' },
];

// ─── SupplierFieldWatcher ───────────────────────────────────────────────────
// Watches supplierId and fetches outstanding invoices when a supplier is selected

interface SupplierFieldWatcherProps {
    onSupplierSelected: (supplierId: string) => void;
}

const SupplierFieldWatcher: FunctionComponent<SupplierFieldWatcherProps> = ({ onSupplierSelected }) => {
    const { values } = useFormikContext<PaymentFormValues>();
    const [lastSupplierId, setLastSupplierId] = useState('');

    useEffect(() => {
        if (values.supplierId && values.supplierId !== lastSupplierId) {
            setLastSupplierId(values.supplierId);
            onSupplierSelected(values.supplierId);
        }
    }, [values.supplierId, lastSupplierId, onSupplierSelected]);

    return null;
};

// ─── Component ──────────────────────────────────────────────────────────────

const SupplierPaymentForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { createPayment, voidPayment, getPayment } = useSupplierPayments();
    const { suppliers } = useSuppliers();

    // ── Routing state ─────────────────────────────────────────────────────
    const paymentId = (location.state as any)?.paymentId;
    const formMode: FormMode = paymentId ? 'view' : 'create';

    // ── Local state ───────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [payment, setPayment] = useState<SupplierPaymentWithAllocations | null>(null);
    const [outstandingInvoices, setOutstandingInvoices] = useState<SupplierInvoiceWithItems[]>([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    // ── Load existing payment (view mode) ─────────────────────────────────
    useEffect(() => {
        if (paymentId) {
            (async () => {
                setLoading(true);
                try {
                    const pay = await getPayment(paymentId);
                    if (pay) setPayment(pay);
                } catch (err: any) {
                    Notify.failure(getErrorMessage(err, 'Failed to load payment'));
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [paymentId]);

    // ── Options ───────────────────────────────────────────────────────────
    const supplierOptions = useMemo(
        () => suppliers.map(s => ({ label: s.name, value: s.id })),
        [suppliers],
    );

    // ── Fetch outstanding invoices for a supplier ─────────────────────────
    const fetchOutstandingInvoices = useCallback(async (supplierId: string) => {
        setLoadingInvoices(true);
        try {
            // Fetch PENDING invoices
            const pendingResult = await supplierInvoiceService.listInvoices({
                supplierId,
                status: 'PENDING',
                limit: 100,
            });
            // Fetch PARTIALLY_PAID invoices
            const partialResult = await supplierInvoiceService.listInvoices({
                supplierId,
                status: 'PARTIALLY_PAID',
                limit: 100,
            });
            // Fetch OVERDUE invoices
            const overdueResult = await supplierInvoiceService.listInvoices({
                supplierId,
                status: 'OVERDUE',
                limit: 100,
            });

            const all = [
                ...(pendingResult?.invoices || []),
                ...(partialResult?.invoices || []),
                ...(overdueResult?.invoices || []),
            ];
            setOutstandingInvoices(all);
        } catch (err) {
            console.error('Failed to load outstanding invoices:', err);
            setOutstandingInvoices([]);
        } finally {
            setLoadingInvoices(false);
        }
    }, []);

    // ── When supplier is selected, load their outstanding invoices ────────
    const handleSupplierSelected = useCallback((supplierId: string) => {
        fetchOutstandingInvoices(supplierId);
    }, [fetchOutstandingInvoices]);

    // ── Formik values ─────────────────────────────────────────────────────
    const defaultValues: PaymentFormValues = {
        supplierId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMethod: '',
        reference: '',
        notes: '',
        allocations: [],
    };

    const initialValues: PaymentFormValues = useMemo(() => {
        if (formMode === 'view' && payment) {
            return {
                supplierId: payment.supplierId,
                paymentDate: payment.paymentDate
                    ? new Date(payment.paymentDate).toISOString().split('T')[0]
                    : '',
                amount: payment.amount,
                paymentMethod: payment.paymentMethod || '',
                reference: payment.reference || '',
                notes: payment.notes || '',
                allocations: (payment.allocations || []).map(a => ({
                    invoiceId: a.invoiceId,
                    invoiceNumber: a.invoice?.invoiceNumber || a.invoiceId,
                    totalAmount: a.invoice?.totalAmount || 0,
                    balanceDue: a.invoice?.balanceDue || 0,
                    allocatedAmount: a.allocatedAmount,
                    notes: a.notes || '',
                })),
            };
        }
        return defaultValues;
    }, [formMode, payment]);

    // ── Validation ────────────────────────────────────────────────────────
    const validationSchema = Yup.object().shape({
        supplierId: Yup.string().required('Supplier is required'),
        paymentDate: Yup.string().required('Payment date is required'),
        amount: Yup.number()
            .required('Payment amount is required')
            .moreThan(0, 'Amount must be greater than 0'),
        paymentMethod: Yup.string(),
        reference: Yup.string(),
        notes: Yup.string().max(1000, 'Notes are too long'),
        allocations: Yup.array()
            .of(
                Yup.object().shape({
                    invoiceId: Yup.string().required('Invoice is required'),
                    allocatedAmount: Yup.number()
                        .required('Allocation amount is required')
                        .moreThan(0, 'Allocation amount must be greater than 0'),
                }),
            )
            .min(1, 'At least one invoice allocation is required'),
    });

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (values: PaymentFormValues, { resetForm }: FormikHelpers<PaymentFormValues>) => {
        if (formMode === 'view') return;

        // Validate: amount === sum(allocations)
        const totalAllocated = values.allocations.reduce((s, a) => s + Number(a.allocatedAmount || 0), 0);
        const paymentAmount = Number(values.amount || 0);

        if (Math.abs(paymentAmount - totalAllocated) > 0.01) {
            Report.failure(
                'Allocation Mismatch',
                `Payment amount (${formatCurrency(paymentAmount)}) must equal total allocated (${formatCurrency(totalAllocated)}). Difference: ${formatCurrency(Math.abs(paymentAmount - totalAllocated))}`,
                'Okay',
            );
            return;
        }

        // Validate: each allocation ≤ invoice balance
        for (const alloc of values.allocations) {
            if (Number(alloc.allocatedAmount) > alloc.balanceDue) {
                Report.failure(
                    'Over-Allocation',
                    `Allocation for ${alloc.invoiceNumber} (${formatCurrency(Number(alloc.allocatedAmount))}) exceeds the balance due (${formatCurrency(alloc.balanceDue)}).`,
                    'Okay',
                );
                return;
            }
        }

        setLoading(true);
        try {
            const payload: CreateSupplierPaymentInput = {
                supplierId: values.supplierId,
                paymentDate: values.paymentDate || undefined,
                amount: paymentAmount,
                paymentMethod: values.paymentMethod || undefined,
                reference: values.reference || undefined,
                notes: values.notes || undefined,
                allocations: values.allocations.map(a => ({
                    invoiceId: a.invoiceId,
                    allocatedAmount: Number(a.allocatedAmount),
                    notes: a.notes || undefined,
                })),
            };

            await createPayment(payload);

            Confirm.show(
                'Payment Recorded',
                'Supplier payment was recorded successfully. What would you like to do?',
                'Record Another',
                'Go to Payments',
                () => {
                    resetForm();
                    setOutstandingInvoices([]);
                },
                () => navigate(ROUTES.SUPPLIER_PAYMENTS),
            );
        } catch (error: any) {
            const errorMessage = getErrorMessage(error, 'Failed to record payment');
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    // ── View-mode actions ─────────────────────────────────────────────────
    const handleVoid = useCallback(() => {
        if (!payment) return;
        Confirm.show(
            'Void Payment',
            `Are you sure you want to void payment ${payment.paymentNumber}? This will restore the allocated invoice balances.`,
            'Yes, Void',
            'Cancel',
            async () => {
                await voidPayment(payment.id, 'Voided from detail page');
                const pay = await getPayment(payment.id);
                if (pay) setPayment(pay);
            },
        );
    }, [payment, voidPayment, getPayment]);

    // ── Page helpers ──────────────────────────────────────────────────────
    const getPageTitle = () => {
        if (formMode === 'view')
            return `Payment${payment?.paymentNumber ? ` — ${payment.paymentNumber}` : ''}`;
        return 'Record Supplier Payment';
    };

    const getPageIcon = () => {
        if (formMode === 'view') return <Eye className="w-8 h-8 text-emerald-500" />;
        return <Wallet className="w-8 h-8 text-emerald-500" />;
    };

    const isDisabled = formMode === 'view';
    const statusCfg = payment?.status ? paymentStatusConfig[payment.status] : null;

    // ── Loading skeleton ──────────────────────────────────────────────────
    if (loading && !payment && paymentId) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <FormSkeleton sections={2} fieldsPerSection={4} />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize
                    initialValues={initialValues}
                    validationSchema={formMode !== 'view' ? validationSchema : undefined}
                >
                    {({ isSubmitting, values, setFieldValue, errors }) => (
                        <Form>
                            {/* SupplierFieldWatcher for fetching outstanding invoices */}
                            {formMode === 'create' && (
                                <SupplierFieldWatcher
                                    onSupplierSelected={(supplierId) => {
                                        handleSupplierSelected(supplierId);
                                        // Clear allocations when supplier changes
                                        setFieldValue('allocations', []);
                                    }}
                                />
                            )}

                            <PageHeader
                                title={getPageTitle()}
                                description={
                                    formMode === 'view'
                                        ? 'View payment details and allocations'
                                        : 'Required fields are marked with an asterisk (*)'
                                }
                                icon={getPageIcon()}
                                showBackButton
                            />

                            <div className="mt-6 space-y-6">
                                {/* ── Status Badge & Info (View Mode) ──────────── */}
                                {formMode === 'view' && payment && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                {statusCfg && (
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                                                        {statusCfg.label}
                                                    </span>
                                                )}
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                    {payment.paymentNumber}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {payment.status === 'COMPLETED' && (
                                                    <Button type="button" theme="danger" layout="outline" onClick={handleVoid}>
                                                        <Ban className="w-4 h-4 mr-2" />
                                                        Void Payment
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Supplier</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {payment.supplier?.name || '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Payment Date</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {formatDate(payment.paymentDate)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {formatCurrency(payment.amount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Method</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 capitalize">
                                                    {payment.paymentMethod || '—'}
                                                </p>
                                            </div>
                                            {payment.reference && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Reference</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                        {payment.reference}
                                                    </p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Invoices Paid</p>
                                                <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mt-0.5">
                                                    {payment.allocations?.length || 0} invoice(s)
                                                </p>
                                            </div>
                                            {payment.notes && (
                                                <div className="col-span-2 sm:col-span-4">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                                                        {payment.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Allocations Table (View Mode) ────────────── */}
                                {formMode === 'view' && payment && payment.allocations?.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500" />
                                                Payment Allocations
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice</th>
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Invoice Total</th>
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Balance Due</th>
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Allocated</th>
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {payment.allocations.map((alloc) => (
                                                        <tr key={alloc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                            <td className="px-5 py-3">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {alloc.invoice?.invoiceNumber || alloc.invoiceId}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3 text-right">
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {formatCurrency(alloc.invoice?.totalAmount || 0)}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3 text-right">
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {formatCurrency(alloc.invoice?.balanceDue || 0)}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3 text-right">
                                                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                                    {formatCurrency(alloc.allocatedAmount)}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                                    {alloc.invoice?.status?.toLowerCase().replace('_', ' ') || '—'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                                                        <td className="px-5 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100" colSpan={3}>
                                                            Total Allocated
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                                {formatCurrency(
                                                                    payment.allocations.reduce(
                                                                        (sum, a) => sum + a.allocatedAmount,
                                                                        0,
                                                                    ),
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td />
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* ───────── CREATE MODE FORM ───────── */}
                                {formMode === 'create' && (
                                    <>
                                        {/* ── Payment Details Card ────────────── */}
                                        <FormFieldCard title="Payment Details">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-5">
                                                <FormSearchableSelect
                                                    label="Supplier"
                                                    name="supplierId"
                                                    options={supplierOptions}
                                                    placeholder="Select supplier..."
                                                    required
                                                />
                                                <FormInput
                                                    label="Payment Date"
                                                    name="paymentDate"
                                                    type="date"
                                                    required
                                                />
                                                <FormInput
                                                    label="Payment Amount (MWK)"
                                                    name="amount"
                                                    type="number"
                                                    placeholder="0.00"
                                                    required
                                                />
                                                <FormSearchableSelect
                                                    label="Payment Method"
                                                    name="paymentMethod"
                                                    options={PAYMENT_METHODS}
                                                    placeholder="Select method..."
                                                    isClearable
                                                />
                                                <FormInput
                                                    label="Reference / Cheque No."
                                                    name="reference"
                                                    placeholder="e.g. CHQ-00123"
                                                />
                                                <FormInput
                                                    label="Notes"
                                                    name="notes"
                                                    placeholder="Optional notes..."
                                                />
                                            </div>
                                        </FormFieldCard>

                                        {/* ── Invoice Allocations Card ─────────── */}
                                        <FormFieldCard title="Invoice Allocations">
                                            <div className="p-5">
                                                {/* Outstanding invoices selector */}
                                                {!values.supplierId ? (
                                                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">Select a supplier first to see outstanding invoices</p>
                                                    </div>
                                                ) : loadingInvoices ? (
                                                    <div className="text-center py-8">
                                                        <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-emerald-500" />
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading outstanding invoices...</p>
                                                    </div>
                                                ) : outstandingInvoices.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">No outstanding invoices for this supplier</p>
                                                    </div>
                                                ) : (
                                                    <FieldArray name="allocations">
                                                        {({ push, remove }) => (
                                                            <div className="space-y-4">
                                                                {/* Available invoices to allocate */}
                                                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                                                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                            Select invoices to allocate payment
                                                                        </p>
                                                                    </div>
                                                                    <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-60 overflow-y-auto">
                                                                        {outstandingInvoices.map((inv) => {
                                                                            const isSelected = values.allocations.some(a => a.invoiceId === inv.id);
                                                                            return (
                                                                                <div
                                                                                    key={inv.id}
                                                                                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${isSelected
                                                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                                                                        }`}
                                                                                    onClick={() => {
                                                                                        if (isSelected) {
                                                                                            const idx = values.allocations.findIndex(a => a.invoiceId === inv.id);
                                                                                            if (idx >= 0) remove(idx);
                                                                                        } else {
                                                                                            push({
                                                                                                invoiceId: inv.id,
                                                                                                invoiceNumber: inv.invoiceNumber,
                                                                                                totalAmount: inv.totalAmount,
                                                                                                balanceDue: inv.balanceDue,
                                                                                                allocatedAmount: inv.balanceDue, // Default to full balance
                                                                                                notes: '',
                                                                                            } as AllocationRow);
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div
                                                                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected
                                                                                                ? 'bg-emerald-500 border-emerald-500'
                                                                                                : 'border-gray-300 dark:border-gray-500'
                                                                                                }`}
                                                                                        >
                                                                                            {isSelected && (
                                                                                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                                                            )}
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                                                {inv.invoiceNumber}
                                                                                            </p>
                                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                                Due: {formatDate(inv.dueDate)} &middot; Total: {formatCurrency(inv.totalAmount)}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                                                                            {formatCurrency(inv.balanceDue)}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Balance Due</p>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>

                                                                {/* Allocation amounts editor */}
                                                                {values.allocations.length > 0 && (
                                                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                                Allocation Amounts
                                                                            </p>
                                                                        </div>
                                                                        <div className="overflow-x-auto">
                                                                            <table className="w-full text-left">
                                                                                <thead>
                                                                                    <tr className="border-b border-gray-100 dark:border-gray-700">
                                                                                        <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Invoice</th>
                                                                                        <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">Balance Due</th>
                                                                                        <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right w-40">Amount to Pay</th>
                                                                                        <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 w-10" />
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                                                    {values.allocations.map((alloc, idx) => (
                                                                                        <tr key={alloc.invoiceId}>
                                                                                            <td className="px-4 py-2">
                                                                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                                                    {alloc.invoiceNumber}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className="px-4 py-2 text-right">
                                                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                                                    {formatCurrency(alloc.balanceDue)}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className="px-4 py-2">
                                                                                                <input
                                                                                                    type="number"
                                                                                                    min="0"
                                                                                                    max={alloc.balanceDue}
                                                                                                    step="0.01"
                                                                                                    value={alloc.allocatedAmount}
                                                                                                    onChange={(e) => {
                                                                                                        const val = Number(e.target.value) || 0;
                                                                                                        setFieldValue(`allocations.${idx}.allocatedAmount`, val);
                                                                                                    }}
                                                                                                    className={`w-full text-right px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${Number(alloc.allocatedAmount) > alloc.balanceDue
                                                                                                        ? 'border-red-400 dark:border-red-500'
                                                                                                        : 'border-gray-300 dark:border-gray-600'
                                                                                                        }`}
                                                                                                />
                                                                                                {Number(alloc.allocatedAmount) > alloc.balanceDue && (
                                                                                                    <p className="text-xs text-red-500 mt-1 text-right">
                                                                                                        Exceeds balance
                                                                                                    </p>
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="px-4 py-2">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => remove(idx)}
                                                                                                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                                                                    title="Remove"
                                                                                                >
                                                                                                    <Ban className="w-4 h-4" />
                                                                                                </button>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>

                                                                        {/* Totals summary */}
                                                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                                                            <AllocationSummary />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </FieldArray>
                                                )}
                                            </div>
                                        </FormFieldCard>

                                        {/* ── Submit ────────────────────────────── */}
                                        <div className="flex items-center justify-end gap-3 pt-2">
                                            <Button
                                                type="button"
                                                theme="neutral"
                                                layout="outline"
                                                onClick={() => navigate(ROUTES.SUPPLIER_PAYMENTS)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                theme="primary"
                                                disabled={
                                                    isSubmitting ||
                                                    loading ||
                                                    values.allocations.length === 0
                                                }
                                            >
                                                {(isSubmitting || loading) && (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                )}
                                                Record Payment
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </AppLayout>
    );
};

// ── AllocationSummary (renders inside Formik) ───────────────────────────────

const AllocationSummary: FunctionComponent = () => {
    const { values } = useFormikContext<PaymentFormValues>();

    const totalAllocated = values.allocations.reduce(
        (sum, a) => sum + Number(a.allocatedAmount || 0),
        0,
    );
    const paymentAmount = Number(values.amount || 0);
    const difference = paymentAmount - totalAllocated;
    const isBalanced = Math.abs(difference) <= 0.01;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                    Payment: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(paymentAmount)}</span>
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                    Allocated: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totalAllocated)}</span>
                </span>
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-medium ${isBalanced
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
                }`}>
                {isBalanced ? (
                    <>
                        <CheckCircle2 className="w-4 h-4" />
                        Balanced
                    </>
                ) : (
                    <>
                        Difference: {formatCurrency(Math.abs(difference))}
                        {difference > 0 ? ' (under-allocated)' : ' (over-allocated)'}
                    </>
                )}
            </div>
        </div>
    );
};

export default SupplierPaymentForm;
