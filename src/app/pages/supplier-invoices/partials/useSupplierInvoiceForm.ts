import { useState, useEffect, useMemo, useCallback } from 'react';
import { Notify, Report, Confirm } from 'notiflix';
import type { FormikHelpers } from 'formik';
import { useSupplierInvoices } from '../../../hooks/useSupplierInvoices';
import { usePurchaseOrders } from '../../../hooks/usePurchaseOrders';
import { supplierReturnService } from '../../../services';
import { getErrorMessage } from '../../../utils/api-error-handler';
import { formatCurrency } from './helpers';
import { DEFAULT_VALUES, type FormMode, type InvoiceFormItem, type InvoiceFormValues } from './types';

interface UseSupplierInvoiceFormParams {
    invoiceId?: string;
    onSaved: () => void;
}

export const useSupplierInvoiceForm = ({ invoiceId, onSaved }: UseSupplierInvoiceFormParams) => {
    const {
        createInvoice,
        getInvoice,
        cancelInvoice,
        disputeInvoice,
        threeWayMatch,
    } = useSupplierInvoices();

    const {
        purchaseOrders,
        getPurchaseOrder,
        setSupplierFilter,
        setPerPage,
    } = usePurchaseOrders();

    const formMode: FormMode = invoiceId ? 'view' : 'create';

    // ── Local state ───────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState<SupplierInvoiceWithItems | null>(null);
    const [matchData, setMatchData] = useState<ThreeWayMatchResult[]>([]);
    const [showMatch, setShowMatch] = useState(false);
    const [loadingPO, setLoadingPO] = useState(false);
    const [variantLabels, setVariantLabels] = useState<Record<string, string>>({});

    // ── Credit note state ─────────────────────────────────────────────────
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [pendingCreditNotes, setPendingCreditNotes] = useState<SupplierCreditNote[]>([]);
    const [loadingCredits, setLoadingCredits] = useState(false);
    const [applyingCreditId, setApplyingCreditId] = useState<string | null>(null);

    // ── Load enough POs for dropdown ──────────────────────────────────────
    useEffect(() => { setPerPage(100); }, []);

    // ── Load existing invoice (view mode) ─────────────────────────────────
    useEffect(() => {
        if (!invoiceId) return;
        (async () => {
            setLoading(true);
            try {
                const inv = await getInvoice(invoiceId);
                if (inv) {
                    setInvoice(inv);
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
    }, [invoiceId]);

    // ── Supplier → PO cascade ─────────────────────────────────────────────
    const handleSupplierChange = useCallback((supplierId: string) => {
        setSupplierFilter(supplierId);
    }, [setSupplierFilter]);

    // ── PO options (filtered by supplier) ─────────────────────────────────
    const poOptions = useMemo(
        () => purchaseOrders
            .filter(po => ['SENT', 'SHIPPED', 'PARTIALLY_RECEIVED', 'RECEIVED'].includes(po.status))
            .map(po => ({
                label: `${po.poNumber} — ${po.supplier?.name || 'Unknown'} (${formatCurrency(po.totalAmount ?? 0)})`,
                value: po.id,
            })),
        [purchaseOrders],
    );

    // ── PO selected → load details + populate items ───────────────────────
    const handlePOSelected = useCallback(async (
        poId: string,
        setFieldValue: (field: string, value: any) => void,
    ) => {
        setLoadingPO(true);
        try {
            const po = await getPurchaseOrder(poId);
            if (!po) return;

            if (po.supplierId) {
                setFieldValue('supplierId', po.supplierId);
            }
            if (po.items?.length) {
                // Build display labels from variant info
                const labels: Record<string, string> = {};
                const newItems: InvoiceFormItem[] = po.items.map(item => {
                    const vName = item.variant?.variantName || '';
                    const pName = item.variant?.product?.name || '';
                    const sku = item.variant?.sku || '';
                    labels[item.variantId] = pName
                        ? `${pName} - ${vName} (${sku || 'No SKU'})`
                        : `${vName} (${sku || 'No SKU'})`;
                    return {
                        purchaseOrderItemId: item.id,
                        variantId: item.variantId,
                        quantity: item.receivedQuantity || item.orderedQuantity,
                        unitPrice: item.unitPrice,
                        taxRate: 0,
                        taxAmount: 0,
                        discountAmount: 0,
                        notes: '',
                    };
                });
                setVariantLabels(prev => ({ ...prev, ...labels }));
                setFieldValue('items', newItems);
            }
        } catch (err: any) {
            Notify.failure(getErrorMessage(err, 'Failed to load PO details'));
        } finally {
            setLoadingPO(false);
        }
    }, [getPurchaseOrder]);

    // ── Initial form values ───────────────────────────────────────────────
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
        return DEFAULT_VALUES;
    }, [formMode, invoice]);

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = useCallback(async (
        values: InvoiceFormValues,
        { resetForm }: FormikHelpers<InvoiceFormValues>,
    ) => {
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
            Notify.success('Supplier invoice created successfully');
            resetForm();
            onSaved();
        } catch (error: any) {
            Report.failure('Error', getErrorMessage(error, 'Failed to create invoice'), 'Okay');
        } finally {
            setLoading(false);
        }
    }, [formMode, createInvoice, onSaved]);

    // ── View-mode actions ─────────────────────────────────────────────────
    const refreshInvoice = useCallback(async () => {
        if (!invoice) return;
        const inv = await getInvoice(invoice.id);
        if (inv) setInvoice(inv);
    }, [invoice, getInvoice]);

    const handleCancel = useCallback(() => {
        if (!invoice) return;
        Confirm.show(
            'Cancel Invoice',
            `Are you sure you want to cancel invoice ${invoice.invoiceNumber}?`,
            'Yes, Cancel',
            'No',
            async () => {
                await cancelInvoice(invoice.id);
                await refreshInvoice();
            },
        );
    }, [invoice, cancelInvoice, refreshInvoice]);

    const handleDispute = useCallback(() => {
        if (!invoice) return;
        Confirm.show(
            'Dispute Invoice',
            `Mark invoice ${invoice.invoiceNumber} as disputed?`,
            'Yes, Dispute',
            'Cancel',
            async () => {
                await disputeInvoice(invoice.id, 'Quantities or amounts under review');
                await refreshInvoice();
            },
        );
    }, [invoice, disputeInvoice, refreshInvoice]);

    // ── Credit notes ─────────────────────────────────────────────────────
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
            await refreshInvoice();
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
    }, [invoice, refreshInvoice]);

    return {
        // State
        formMode,
        variantLabels,
        invoiceId,
        loading,
        loadingPO,
        invoice,
        matchData,
        showMatch,
        setShowMatch,
        poOptions,
        initialValues,

        // Credit modal
        showCreditModal,
        setShowCreditModal,
        pendingCreditNotes,
        loadingCredits,
        applyingCreditId,

        // Actions
        handleSubmit,
        handleSupplierChange,
        handlePOSelected,
        handleCancel,
        handleDispute,
        handleOpenCreditModal,
        handleApplyCreditNote,
    };
};
