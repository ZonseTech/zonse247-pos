// ─── Supplier Payment Form Types ────────────────────────────────────────────

export interface AllocationRow {
    invoiceId: string;
    invoiceNumber: string;
    totalAmount: number;
    balanceDue: number;
    allocatedAmount: number;
    notes: string;
}

export interface PaymentFormValues {
    supplierId: string;
    paymentDate: string;
    amount: number | '';
    paymentMethod: string;
    reference: string;
    notes: string;
    allocations: AllocationRow[];
}

export type FormMode = 'create' | 'view';

export const DEFAULT_VALUES: PaymentFormValues = {
    supplierId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMethod: '',
    reference: '',
    notes: '',
    allocations: [],
};
