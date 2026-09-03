import { useState, useEffect, useMemo, useCallback } from 'react';
import { Notify, Report, Confirm } from 'notiflix';
import { useSupplierPayments } from '../../../hooks/useSupplierPayments';
import { usePaymentMethods } from '../../../hooks/usePaymentMethods';
import { supplierInvoiceService } from '../../../services';
import { getErrorMessage } from '../../../utils/api-error-handler';
import type { PaymentFormValues, AllocationRow, FormMode } from './types';
import { formatCurrency } from './helpers';

interface UseSupplierPaymentFormParams {
    paymentId?: string;
    preSupplierId?: string;
    preInvoiceId?: string;
    onSaved: () => void;
}

export const useSupplierPaymentForm = ({ paymentId, preSupplierId, preInvoiceId, onSaved }: UseSupplierPaymentFormParams) => {
    const { createPayment, voidPayment, getPayment } = useSupplierPayments();
    const { paymentMethods, isLoading: loadingMethods } = usePaymentMethods();

    const formMode: FormMode = paymentId ? 'view' : 'create';

    // ── Local state ───────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [payment, setPayment] = useState<SupplierPaymentWithAllocations | null>(null);
    const [outstandingInvoices, setOutstandingInvoices] = useState<SupplierInvoiceWithItems[]>([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);
    const [prePopulated, setPrePopulated] = useState(false);

    // ── Payment method options (from API) ─────────────────────────────────
    const paymentMethodOptions = useMemo(
        () => paymentMethods.map((m) => ({ label: m.name, value: m.name })),
        [paymentMethods],
    );

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

    // ── Fetch outstanding invoices for a supplier ─────────────────────────
    const fetchOutstandingInvoices = useCallback(async (supplierId: string) => {
        setLoadingInvoices(true);
        try {
            const [pendingResult, partialResult, overdueResult] = await Promise.all([
                supplierInvoiceService.listInvoices({ supplierId, status: 'PENDING', limit: 100 }),
                supplierInvoiceService.listInvoices({ supplierId, status: 'PARTIALLY_PAID', limit: 100 }),
                supplierInvoiceService.listInvoices({ supplierId, status: 'OVERDUE', limit: 100 }),
            ]);
            const all = [
                ...(pendingResult?.invoices || []),
                ...(partialResult?.invoices || []),
                ...(overdueResult?.invoices || []),
            ];
            setOutstandingInvoices(all);
            return all;
        } catch (err) {
            console.error('Failed to load outstanding invoices:', err);
            setOutstandingInvoices([]);
            return [];
        } finally {
            setLoadingInvoices(false);
        }
    }, []);

    // ── Auto-populate from invoice page navigation ────────────────────────
    useEffect(() => {
        if (prePopulated || formMode !== 'create' || !preSupplierId) return;
        setPrePopulated(true);

        (async () => {
            const invoices = await fetchOutstandingInvoices(preSupplierId);

            if (preInvoiceId) {
                // Try to find the invoice in outstanding list
                let inv = invoices.find((i) => i.id === preInvoiceId);

                // If not in outstanding list, fetch it directly
                if (!inv) {
                    try {
                        inv = await supplierInvoiceService.getInvoice(preInvoiceId);
                    } catch {
                        // ignore
                    }
                }

                if (inv && inv.balanceDue > 0) {
                    setPreAllocation({
                        invoiceId: inv.id,
                        invoiceNumber: inv.invoiceNumber,
                        totalAmount: inv.totalAmount,
                        balanceDue: inv.balanceDue,
                        allocatedAmount: inv.balanceDue,
                        notes: '',
                    });
                }
            }
        })();
    }, [preSupplierId, preInvoiceId, prePopulated, formMode, fetchOutstandingInvoices]);

    // Pre-populated allocation (set once, consumed by initialValues)
    const [preAllocation, setPreAllocation] = useState<AllocationRow | null>(null);

    // ── Supplier change handler (called by FieldWatcher) ──────────────────
    const handleSupplierSelected = useCallback(
        (supplierId: string) => {
            fetchOutstandingInvoices(supplierId);
        },
        [fetchOutstandingInvoices],
    );

    // ── Formik values ─────────────────────────────────────────────────────
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
                allocations: (payment.allocations || []).map((a) => ({
                    invoiceId: a.invoiceId,
                    invoiceNumber: a.invoice?.invoiceNumber || a.invoiceId,
                    totalAmount: a.invoice?.totalAmount || 0,
                    balanceDue: a.invoice?.balanceDue || 0,
                    allocatedAmount: a.allocatedAmount,
                    notes: a.notes || '',
                })),
            };
        }

        // Create mode — may have pre-populated data from invoice page
        return {
            supplierId: preSupplierId || '',
            paymentDate: new Date().toISOString().split('T')[0],
            amount: preAllocation ? preAllocation.balanceDue : '',
            paymentMethod: '',
            reference: '',
            notes: '',
            allocations: preAllocation ? [preAllocation] : [],
        };
    }, [formMode, payment, preSupplierId, preAllocation]);

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = useCallback(
        async (values: PaymentFormValues, { resetForm }: { resetForm: () => void }) => {
            if (formMode === 'view') return;

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
                    allocations: values.allocations.map((a) => ({
                        invoiceId: a.invoiceId,
                        allocatedAmount: Number(a.allocatedAmount),
                        notes: a.notes || undefined,
                    })),
                };

                await createPayment(payload);
                Notify.success('Supplier payment recorded successfully');
                resetForm();
                setOutstandingInvoices([]);
                onSaved();
            } catch (error: any) {
                Report.failure('Error', getErrorMessage(error, 'Failed to record payment'), 'Okay');
            } finally {
                setLoading(false);
            }
        },
        [formMode, createPayment, onSaved],
    );

    // ── Void payment (view mode) ──────────────────────────────────────────
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

    return {
        formMode,
        paymentId,
        loading,
        payment,
        outstandingInvoices,
        loadingInvoices,
        paymentMethodOptions,
        loadingMethods,
        initialValues,
        handleSubmit,
        handleSupplierSelected,
        handleVoid,
    };
};
