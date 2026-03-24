// ─── Supplier Invoice Form Types ────────────────────────────────────────────

export interface InvoiceFormItem {
    purchaseOrderItemId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    discountAmount: number;
    notes: string;
}

export interface InvoiceFormValues {
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

export type FormMode = 'create' | 'view';

export const EMPTY_ITEM: InvoiceFormItem = {
    purchaseOrderItemId: '',
    variantId: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    notes: '',
};

export const DEFAULT_VALUES: InvoiceFormValues = {
    supplierId: '',
    purchaseOrderId: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    taxAmount: 0,
    discountAmount: 0,
    notes: '',
    items: [{ ...EMPTY_ITEM }],
};
