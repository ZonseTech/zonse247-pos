import * as Yup from 'yup';
import { Form, Formik, FieldArray, useFormikContext, type FormikHelpers } from 'formik';
import { FunctionComponent, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
    FileText, Plus, Trash2, Eye, X, Loader2, CheckCircle2, Package,
    Ban, AlertTriangle, Link2, Scale, Receipt,
} from 'lucide-react';
import { Notify, Report, Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, FormFieldCard, Modal } from '../../components';
import FormInput from '../../components/FormInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import { ROUTES } from '../../utils/constants';
import { useSupplierInvoices } from '../../hooks/useSupplierInvoices';
import { useSuppliers } from '../../hooks/useSuppliers';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { useProducts } from '../../hooks/useProducts';
import FormSkeleton from '../../components/skeleton/FormSkeleton';
import { invoiceStatusConfig } from './partials/SupplierInvoiceTableColumns';
import { supplierReturnService } from '../../services';
import { creditNoteStatusConfig } from '../credit-notes/partials/CreditNoteTableColumns';
import { getErrorMessage } from '../../utils/api-error-handler';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

const formatDate = (d?: Date | string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface InvoiceFormItem {
    purchaseOrderItemId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    discountAmount: number;
    notes: string;
}

interface InvoiceFormValues {
    supplierId: string;
    purchaseOrderId: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    taxAmount: number;
    discountAmount: number;
    notes: string;
    items: InvoiceFormItem[];
}

type FormMode = 'create' | 'view';

// ─── POFieldWatcher ─────────────────────────────────────────────────────────
// Watches the purchaseOrderId field and auto-populates items when a PO is selected

interface POFieldWatcherProps {
    purchaseOrders: PurchaseOrder[];
    onPOSelected: (po: PurchaseOrder) => void;
}

const POFieldWatcher: FunctionComponent<POFieldWatcherProps> = ({ purchaseOrders, onPOSelected }) => {
    const { values } = useFormikContext<InvoiceFormValues>();
    const [lastPOId, setLastPOId] = useState('');

    useEffect(() => {
        if (values.purchaseOrderId && values.purchaseOrderId !== lastPOId) {
            setLastPOId(values.purchaseOrderId);
            const po = purchaseOrders.find(p => p.id === values.purchaseOrderId);
            if (po) onPOSelected(po);
        }
    }, [values.purchaseOrderId, lastPOId, purchaseOrders, onPOSelected]);

    return null;
};

// ─── Component ──────────────────────────────────────────────────────────────

const SupplierInvoiceForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        createInvoice,
        getInvoice,
        cancelInvoice,
        disputeInvoice,
        threeWayMatch,
    } = useSupplierInvoices();
    const { suppliers } = useSuppliers();
    const { purchaseOrders } = usePurchaseOrders();
    const { products } = useProducts();

    // ── Routing state ─────────────────────────────────────────────────────
    const invoiceId = (location.state as any)?.invoiceId;
    const formMode: FormMode = invoiceId ? 'view' : 'create';

    // ── Local state ───────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState<SupplierInvoiceWithItems | null>(null);
    const [matchData, setMatchData] = useState<ThreeWayMatchResult[]>([]);
    const [showMatch, setShowMatch] = useState(false);

    // ── Credit note modal state ───────────────────────────────────────────
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [pendingCreditNotes, setPendingCreditNotes] = useState<SupplierCreditNote[]>([]);
    const [loadingCredits, setLoadingCredits] = useState(false);
    const [applyingCreditId, setApplyingCreditId] = useState<string | null>(null);

    // ── Load existing invoice (view mode) ─────────────────────────────────
    useEffect(() => {
        if (invoiceId) {
            (async () => {
                setLoading(true);
                try {
                    const inv = await getInvoice(invoiceId);
                    if (inv) {
                        setInvoice(inv);
                        // Auto-load 3-way match if linked to a PO
                        if (inv.purchaseOrderId) {
                            const match = await threeWayMatch(inv.purchaseOrderId);
                            setMatchData(match);
                        }
                    }
                } catch (err: any) {
                    Notify.failure(getErrorMessage(err, 'Failed to load invoice'));
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [invoiceId]);

    // ── Options ───────────────────────────────────────────────────────────
    const supplierOptions = useMemo(
        () => suppliers.map(s => ({ label: s.name, value: s.id })),
        [suppliers],
    );

    // Only show POs that are SENT, SHIPPED or PARTIALLY_RECEIVED
    const poOptions = useMemo(
        () => purchaseOrders
            .filter(po => ['SENT', 'SHIPPED', 'PARTIALLY_RECEIVED', 'RECEIVED'].includes(po.status))
            .map(po => ({
                label: `${po.poNumber} — ${po.supplier?.name || 'Unknown'} (${formatCurrency(po.totalAmount ?? 0)})`,
                value: po.id,
            })),
        [purchaseOrders],
    );

    const variantOptions = useMemo(
        () => products.map(p => ({
            label: `${p.name} - ${p.variantName} (${p.sku || 'No SKU'})`,
            value: p.id,
        })),
        [products],
    );

    // ── When PO is selected, auto-populate items ──────────────────────────
    const handlePOSelected = useCallback((po: PurchaseOrder) => {
        // This is handled by the Formik form via setFieldValue in the POFieldWatcher callback
    }, []);

    // ── Formik values ─────────────────────────────────────────────────────
    const emptyItem: InvoiceFormItem = {
        purchaseOrderItemId: '',
        variantId: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        taxAmount: 0,
        discountAmount: 0,
        notes: '',
    };

    const defaultValues: InvoiceFormValues = {
        supplierId: '',
        purchaseOrderId: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        taxAmount: 0,
        discountAmount: 0,
        notes: '',
        items: [{ ...emptyItem }],
    };

    const initialValues: InvoiceFormValues = useMemo(() => {
        if (formMode === 'view' && invoice) {
            return {
                supplierId: invoice.supplierId,
                purchaseOrderId: invoice.purchaseOrderId || '',
                invoiceNumber: invoice.invoiceNumber,
                invoiceDate: invoice.invoiceDate
                    ? new Date(invoice.invoiceDate).toISOString().split('T')[0]
                    : '',
                dueDate: invoice.dueDate
                    ? new Date(invoice.dueDate).toISOString().split('T')[0]
                    : '',
                taxAmount: invoice.taxAmount,
                discountAmount: invoice.discountAmount,
                notes: invoice.notes || '',
                items: invoice.items.map(item => ({
                    purchaseOrderItemId: item.purchaseOrderItemId || '',
                    variantId: item.variantId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    taxRate: item.taxRate || 0,
                    taxAmount: item.taxAmount,
                    discountAmount: item.discountAmount,
                    notes: item.notes || '',
                })),
            };
        }
        return defaultValues;
    }, [formMode, invoice]);

    // ── Validation ────────────────────────────────────────────────────────
    const validationSchema = Yup.object().shape({
        supplierId: Yup.string().required('Supplier is required'),
        invoiceNumber: Yup.string().required('Invoice number is required'),
        invoiceDate: Yup.string().required('Invoice date is required'),
        dueDate: Yup.string(),
        purchaseOrderId: Yup.string(),
        taxAmount: Yup.number().min(0, 'Tax must be 0 or higher'),
        discountAmount: Yup.number().min(0, 'Discount must be 0 or higher'),
        notes: Yup.string().max(1000, 'Notes are too long'),
        items: Yup.array()
            .of(
                Yup.object().shape({
                    variantId: Yup.string().required('Product variant is required'),
                    quantity: Yup.number()
                        .required('Quantity is required')
                        .min(1, 'Quantity must be at least 1'),
                    unitPrice: Yup.number()
                        .required('Unit price is required')
                        .min(0, 'Unit price must be 0 or higher'),
                }),
            )
            .min(1, 'At least one item is required'),
    });

    const calculateSubtotal = (items: InvoiceFormItem[]) =>
        items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (values: InvoiceFormValues, { resetForm }: FormikHelpers<InvoiceFormValues>) => {
        if (formMode === 'view') return;
        setLoading(true);
        try {
            const payload: CreateSupplierInvoiceInput = {
                supplierId: values.supplierId,
                purchaseOrderId: values.purchaseOrderId || undefined,
                invoiceNumber: values.invoiceNumber,
                invoiceDate: values.invoiceDate,
                dueDate: values.dueDate || undefined,
                taxAmount: Number(values.taxAmount) || undefined,
                discountAmount: Number(values.discountAmount) || undefined,
                notes: values.notes || undefined,
                items: values.items.map(item => ({
                    purchaseOrderItemId: item.purchaseOrderItemId || undefined,
                    variantId: item.variantId,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    taxRate: Number(item.taxRate) || undefined,
                    taxAmount: Number(item.taxAmount) || undefined,
                    discountAmount: Number(item.discountAmount) || undefined,
                    notes: item.notes || undefined,
                })),
            };

            await createInvoice(payload);

            Confirm.show(
                'Invoice Created',
                'Supplier invoice created successfully. What would you like to do?',
                'Add Another',
                'Go to Invoices',
                () => resetForm(),
                () => navigate(ROUTES.SUPPLIER_INVOICES),
            );
        } catch (error: any) {
            const errorMessage = getErrorMessage(error, 'Failed to create invoice');
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    // ── View-mode actions ─────────────────────────────────────────────────
    const handleCancel = useCallback(() => {
        if (!invoice) return;
        Confirm.show(
            'Cancel Invoice',
            `Are you sure you want to cancel invoice ${invoice.invoiceNumber}?`,
            'Yes, Cancel',
            'No',
            async () => {
                await cancelInvoice(invoice.id);
                const inv = await getInvoice(invoice.id);
                if (inv) setInvoice(inv);
            },
        );
    }, [invoice, cancelInvoice, getInvoice]);

    const handleDispute = useCallback(() => {
        if (!invoice) return;
        Confirm.show(
            'Dispute Invoice',
            `Mark invoice ${invoice.invoiceNumber} as disputed?`,
            'Yes, Dispute',
            'Cancel',
            async () => {
                await disputeInvoice(invoice.id, 'Quantities or amounts under review');
                const inv = await getInvoice(invoice.id);
                if (inv) setInvoice(inv);
            },
        );
    }, [invoice, disputeInvoice, getInvoice]);

    // ── Apply Credit Note ────────────────────────────────────────────────
    const handleOpenCreditModal = useCallback(async () => {
        if (!invoice?.supplierId) return;
        setShowCreditModal(true);
        setLoadingCredits(true);
        try {
            const result = await supplierReturnService.listCreditNotes({
                status: 'PENDING',
                supplierId: invoice.supplierId,
                limit: 100,
            });
            setPendingCreditNotes(result?.data || []);
        } catch (err: any) {
            Notify.failure(getErrorMessage(err, 'Failed to load credit notes'));
            setPendingCreditNotes([]);
        } finally {
            setLoadingCredits(false);
        }
    }, [invoice]);

    const handleApplyCreditNote = useCallback(async (creditNoteId: string) => {
        if (!invoice) return;
        setApplyingCreditId(creditNoteId);
        try {
            await supplierReturnService.applyCreditNote(creditNoteId, { invoiceId: invoice.id });
            Notify.success('Credit note applied to invoice');
            // Refresh invoice
            const inv = await getInvoice(invoice.id);
            if (inv) setInvoice(inv);
            // Refresh the pending list
            const result = await supplierReturnService.listCreditNotes({
                status: 'PENDING',
                supplierId: invoice.supplierId,
                limit: 100,
            });
            setPendingCreditNotes(result?.data || []);
        } catch (err: any) {
            Notify.failure(getErrorMessage(err, 'Failed to apply credit note'));
        } finally {
            setApplyingCreditId(null);
        }
    }, [invoice, getInvoice]);

    // ── Helpers ────────────────────────────────────────────────────────────
    const getPageTitle = () => {
        if (formMode === 'view')
            return `Invoice${invoice?.invoiceNumber ? ` — ${invoice.invoiceNumber}` : ''}`;
        return 'New Supplier Invoice';
    };

    const getPageIcon = () => {
        if (formMode === 'view') return <Eye className="w-8 h-8 text-indigo-500" />;
        return <FileText className="w-8 h-8 text-indigo-500" />;
    };

    const isDisabled = formMode === 'view';
    const statusCfg = invoice?.status ? invoiceStatusConfig[invoice.status] : null;

    // ── Loading skeleton ──────────────────────────────────────────────────
    if (loading && !invoice && invoiceId) {
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
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form>
                            {/* POFieldWatcher for auto-populating items */}
                            {formMode === 'create' && (
                                <POFieldWatcher
                                    purchaseOrders={purchaseOrders}
                                    onPOSelected={(po) => {
                                        // Set supplier from PO
                                        if (po.supplierId) {
                                            setFieldValue('supplierId', po.supplierId);
                                        }
                                        // Populate items from PO items
                                        if (po.items && po.items.length > 0) {
                                            const newItems: InvoiceFormItem[] = po.items.map(item => ({
                                                purchaseOrderItemId: item.id,
                                                variantId: item.variantId,
                                                quantity: item.receivedQuantity || item.orderedQuantity,
                                                unitPrice: item.unitPrice,
                                                taxRate: 0,
                                                taxAmount: 0,
                                                discountAmount: 0,
                                                notes: '',
                                            }));
                                            setFieldValue('items', newItems);
                                        }
                                    }}
                                />
                            )}

                            <PageHeader
                                title={getPageTitle()}
                                description={
                                    formMode === 'view'
                                        ? 'View invoice details'
                                        : 'Required fields are marked with an asterisk (*)'
                                }
                                icon={getPageIcon()}
                                showBackButton
                            />

                            <div className="mt-6 space-y-6">
                                {/* ── Status Badge & Info (View Mode) ──────────── */}
                                {formMode === 'view' && invoice && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                {statusCfg && (
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                                                        {statusCfg.label}
                                                    </span>
                                                )}
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                    {invoice.invoiceNumber}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {/* 3-Way Match button */}
                                                {invoice.purchaseOrderId && (
                                                    <Button
                                                        type="button"
                                                        theme="primary"
                                                        layout="outline"
                                                        onClick={() => setShowMatch(!showMatch)}
                                                    >
                                                        <Scale className="w-4 h-4 mr-2" />
                                                        {showMatch ? 'Hide' : 'Show'} 3-Way Match
                                                    </Button>
                                                )}
                                                {/* Cancel — PENDING only */}
                                                {invoice.status === 'PENDING' && (
                                                    <>
                                                        <Button type="button" theme="warning" layout="outline" onClick={handleDispute}>
                                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                                            Dispute
                                                        </Button>
                                                        <Button type="button" theme="danger" layout="outline" onClick={handleCancel}>
                                                            <Ban className="w-4 h-4 mr-2" />
                                                            Cancel
                                                        </Button>
                                                    </>
                                                )}
                                                {/* Apply Credit — when balance due > 0 and not cancelled */}
                                                {invoice.balanceDue > 0 && invoice.status !== 'CANCELLED' && (
                                                    <Button type="button" theme="success" layout="outline" onClick={handleOpenCreditModal}>
                                                        <Receipt className="w-4 h-4 mr-2" />
                                                        Apply Credit
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Supplier</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {invoice.supplier?.name || '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Invoice Date</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {formatDate(invoice.invoiceDate)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                                                <p className={`text-sm font-medium mt-0.5 ${invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.balanceDue > 0
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-gray-900 dark:text-gray-100'
                                                    }`}>
                                                    {formatDate(invoice.dueDate)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {formatCurrency(invoice.totalAmount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Amount Paid</p>
                                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                    {formatCurrency(invoice.amountPaid)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Balance Due</p>
                                                <p className={`text-sm font-bold mt-0.5 ${invoice.balanceDue > 0
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-emerald-600 dark:text-emerald-400'
                                                    }`}>
                                                    {formatCurrency(invoice.balanceDue)}
                                                </p>
                                            </div>
                                            {invoice.purchaseOrder && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Linked PO</p>
                                                    <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mt-0.5 flex items-center gap-1">
                                                        <Link2 className="w-3.5 h-3.5" />
                                                        {invoice.purchaseOrder.poNumber}
                                                    </p>
                                                </div>
                                            )}
                                            {invoice.notes && (
                                                <div className="col-span-2 sm:col-span-4">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                                                        {invoice.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── 3-Way Match Panel ────────────────────────── */}
                                {showMatch && matchData.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-sky-200 dark:border-sky-800 p-5">
                                        <h3 className="text-sm font-semibold text-sky-800 dark:text-sky-300 flex items-center gap-2 mb-4">
                                            <Scale className="w-5 h-5" />
                                            3-Way Match: PO vs GRN vs Invoice
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-200 dark:border-gray-600">
                                                        <th className="text-left py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Item</th>
                                                        <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Ordered</th>
                                                        <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Received</th>
                                                        <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Invoiced</th>
                                                        <th className="text-center py-2 pl-3 font-medium text-gray-600 dark:text-gray-400">Match</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {matchData.map((m, idx) => {
                                                        const variant = products.find(p => p.id === m.variantId);
                                                        return (
                                                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                                                <td className="py-2 pr-4 text-gray-900 dark:text-gray-100">
                                                                    {variant ? `${variant.name} - ${variant.variantName}` : m.variantId.slice(0, 8)}
                                                                </td>
                                                                <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{m.orderedQuantity}</td>
                                                                <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{m.receivedQuantity}</td>
                                                                <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{m.invoicedQuantity}</td>
                                                                <td className="py-2 pl-3 text-center">
                                                                    {m.match ? (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                                                            Match
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                                                            title={m.discrepancies.join(', ')}
                                                                        >
                                                                            Mismatch
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        {matchData.some(m => !m.match) && (
                                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                                                <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-1">Discrepancies:</p>
                                                <ul className="text-xs text-red-700 dark:text-red-400 space-y-0.5">
                                                    {matchData
                                                        .filter(m => !m.match)
                                                        .flatMap((m, i) => m.discrepancies.map((d, j) => (
                                                            <li key={`${i}-${j}`}>• {d}</li>
                                                        )))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Invoice Details Card (Create Mode) ────────── */}
                                {formMode !== 'view' && (
                                    <FormFieldCard title="Invoice Details">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormSearchableSelect
                                                label="Supplier"
                                                name="supplierId"
                                                options={supplierOptions}
                                                placeholder="Search and select supplier..."
                                                required
                                                disabled={isDisabled}
                                            />

                                            <FormSearchableSelect
                                                label="Link to Purchase Order"
                                                name="purchaseOrderId"
                                                options={poOptions}
                                                placeholder="Optional — select a PO..."
                                                isClearable
                                                disabled={isDisabled}
                                            />

                                            <FormInput
                                                label="Invoice Number"
                                                name="invoiceNumber"
                                                placeholder="INV-001"
                                                required
                                                disabled={isDisabled}
                                            />

                                            <FormInput
                                                label="Invoice Date"
                                                name="invoiceDate"
                                                type="date"
                                                required
                                                disabled={isDisabled}
                                            />

                                            <FormInput
                                                label="Due Date"
                                                name="dueDate"
                                                type="date"
                                                disabled={isDisabled}
                                            />

                                            <div /> {/* spacer */}

                                            <FormInput
                                                label="Tax Amount (MWK)"
                                                name="taxAmount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                disabled={isDisabled}
                                            />

                                            <FormInput
                                                label="Discount Amount (MWK)"
                                                name="discountAmount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                disabled={isDisabled}
                                            />

                                            <div className="md:col-span-2">
                                                <FormInput
                                                    label="Notes"
                                                    name="notes"
                                                    placeholder="Additional notes..."
                                                    disabled={isDisabled}
                                                />
                                            </div>
                                        </div>
                                    </FormFieldCard>
                                )}

                                {/* ── Items Card ───────────────────────────────── */}
                                <FormFieldCard title={formMode === 'view' ? 'Invoice Items' : 'Items'}>
                                    {formMode === 'view' && invoice ? (
                                        /* ── View-mode items ─────── */
                                        <div className="space-y-3">
                                            {invoice.items.map((item, index) => {
                                                const vName = item.variant?.variantName || '';
                                                const pName = item.variant?.product?.name || '';
                                                const displayName = pName
                                                    ? `${pName}${vName && vName !== 'Default' ? ` — ${vName}` : ''}`
                                                    : vName || 'Unknown';
                                                const sku = item.variant?.sku || '';

                                                return (
                                                    <div
                                                        key={item.id || index}
                                                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {displayName}
                                                                </p>
                                                                {sku && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        SKU: {sku}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                {formatCurrency(item.totalPrice)}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Quantity</span>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.quantity}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Unit Price</span>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.unitPrice)}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Tax</span>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.taxAmount)}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Discount</span>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.discountAmount)}</p>
                                                            </div>
                                                        </div>
                                                        {item.notes && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{item.notes}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* View-mode totals */}
                                            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                                <div className="flex flex-col items-end gap-1 text-sm">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
                                                        <span className="font-medium text-gray-900 dark:text-gray-100 w-28 text-right">
                                                            {formatCurrency(invoice.subtotal)}
                                                        </span>
                                                    </div>
                                                    {invoice.taxAmount > 0 && (
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-gray-500 dark:text-gray-400">Tax:</span>
                                                            <span className="font-medium text-gray-900 dark:text-gray-100 w-28 text-right">
                                                                +{formatCurrency(invoice.taxAmount)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {invoice.discountAmount > 0 && (
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                                                            <span className="font-medium text-emerald-600 dark:text-emerald-400 w-28 text-right">
                                                                -{formatCurrency(invoice.discountAmount)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                                                        <span className="text-gray-600 dark:text-gray-400 font-medium">Total:</span>
                                                        <span className="text-lg font-bold text-gray-900 dark:text-white w-28 text-right">
                                                            {formatCurrency(invoice.totalAmount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ── Create-mode items (FieldArray) ─────── */
                                        <FieldArray name="items">
                                            {({ push, remove }) => (
                                                <div className="space-y-4">
                                                    <Button
                                                        type="button"
                                                        onClick={() => push({ ...emptyItem })}
                                                        theme="primary"
                                                        layout="outline"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Item
                                                    </Button>

                                                    {values.items.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                                            <Package className="w-12 h-12 mb-2 opacity-50" />
                                                            <p>No items added yet</p>
                                                            <p className="text-xs mt-1">Link a PO above to auto-populate items, or add manually.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {values.items.map((item, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                                                >
                                                                    <div className="flex justify-between items-center mb-3">
                                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                            Item #{index + 1}
                                                                        </span>
                                                                        {values.items.length > 1 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => remove(index)}
                                                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                                title="Remove item"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                                        <div className="md:col-span-2">
                                                                            <FormSearchableSelect
                                                                                label="Product Variant"
                                                                                name={`items.${index}.variantId`}
                                                                                options={variantOptions}
                                                                                placeholder="Search product..."
                                                                                required
                                                                            />
                                                                        </div>
                                                                        <FormInput
                                                                            label="Quantity"
                                                                            name={`items.${index}.quantity`}
                                                                            type="number"
                                                                            min="1"
                                                                            required
                                                                        />
                                                                        <FormInput
                                                                            label="Unit Price (MWK)"
                                                                            name={`items.${index}.unitPrice`}
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <div className="mt-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                                                        Subtotal:{' '}
                                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                                            {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {values.items.length > 0 && (
                                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                                            <div className="flex flex-col items-end gap-1 text-sm">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-gray-100 w-28 text-right">
                                                                        {formatCurrency(calculateSubtotal(values.items))}
                                                                    </span>
                                                                </div>
                                                                {Number(values.taxAmount) > 0 && (
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="text-gray-500 dark:text-gray-400">Tax:</span>
                                                                        <span className="font-medium text-gray-900 dark:text-gray-100 w-28 text-right">
                                                                            +{formatCurrency(Number(values.taxAmount))}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {Number(values.discountAmount) > 0 && (
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                                                                        <span className="font-medium text-emerald-600 dark:text-emerald-400 w-28 text-right">
                                                                            -{formatCurrency(Number(values.discountAmount))}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Total:</span>
                                                                    <span className="text-lg font-bold text-gray-900 dark:text-white w-28 text-right">
                                                                        {formatCurrency(calculateSubtotal(values.items) + Number(values.taxAmount || 0) - Number(values.discountAmount || 0))}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </FieldArray>
                                    )}
                                </FormFieldCard>

                                {/* ── Actions ──────────────────────────────────── */}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        theme={formMode === 'view' ? 'primary' : 'danger'}
                                        onClick={() => navigate(ROUTES.SUPPLIER_INVOICES)}
                                        disabled={isSubmitting || loading}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        {formMode === 'view' ? 'Back to List' : 'Cancel'}
                                    </Button>
                                    {formMode !== 'view' && (
                                        <Button
                                            type="submit"
                                            theme="success"
                                            disabled={isSubmitting || loading}
                                        >
                                            {isSubmitting || loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Create Invoice
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>

            {/* ── Apply Credit Note Modal ────────────────────────────── */}
            <Modal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                title="Apply Credit Note"
                size="lg"
            >
                <div className="p-5">
                    {invoice && (
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Invoice</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {invoice.invoiceNumber}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Balance Due</p>
                                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(invoice.balanceDue)}
                                </p>
                            </div>
                        </div>
                    )}

                    {loadingCredits ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-3" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loading credit notes…</p>
                        </div>
                    ) : pendingCreditNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                                <Receipt className="w-7 h-7 text-gray-400" />
                            </div>
                            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                                No pending credit notes
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                                There are no pending credit notes for this supplier. Complete supplier returns to generate credit notes.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Select a credit note to apply against this invoice:
                            </p>
                            {pendingCreditNotes.map((cn) => {
                                const cfg = creditNoteStatusConfig[cn.status];
                                return (
                                    <div
                                        key={cn.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {cn.creditNoteNumber}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            {cn.supplierReturn?.returnNumber && (
                                                <p className="text-xs text-sky-600 dark:text-sky-400">
                                                    Return: {cn.supplierReturn.returnNumber}
                                                </p>
                                            )}
                                            {cn.creditNoteDate && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {new Date(cn.creditNoteDate).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                {formatCurrency(cn.amount)}
                                            </span>
                                            <Button
                                                type="button"
                                                theme="success"
                                                layout="outline"
                                                onClick={() => handleApplyCreditNote(cn.id)}
                                                disabled={applyingCreditId !== null}
                                                className="!px-3 !py-1.5 text-xs"
                                            >
                                                {applyingCreditId === cn.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    'Apply'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Modal>
        </AppLayout>
    );
};

export default SupplierInvoiceForm;
