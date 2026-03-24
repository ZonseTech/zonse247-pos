// ─── Supplier Return Form Types ─────────────────────────────────────────────

export interface ReturnFormItem {
    goodsReceiptItemId: string;
    variantId: string;
    displayName: string;
    returnQuantity: number;
    unitCost: number;
    reason: string;
    notes: string;
}

export interface ReturnFormValues {
    supplierId: string;
    purchaseOrderId: string;
    goodsReceiptId: string;
    reason: string;
    notes: string;
    items: ReturnFormItem[];
}

export type FormMode = 'create' | 'view';

export const EMPTY_ITEM: ReturnFormItem = {
    goodsReceiptItemId: '',
    variantId: '',
    displayName: '',
    returnQuantity: 1,
    unitCost: 0,
    reason: '',
    notes: '',
};

export const DEFAULT_VALUES: ReturnFormValues = {
    supplierId: '',
    purchaseOrderId: '',
    goodsReceiptId: '',
    reason: '',
    notes: '',
    items: [{ ...EMPTY_ITEM }],
};

export const RETURN_REASONS = [
    { label: 'Damaged goods', value: 'Damaged goods' },
    { label: 'Wrong items received', value: 'Wrong items received' },
    { label: 'Excess quantity', value: 'Excess quantity' },
    { label: 'Quality issue', value: 'Quality issue' },
    { label: 'Expired products', value: 'Expired products' },
    { label: 'Not as ordered', value: 'Not as ordered' },
    { label: 'Other', value: 'Other' },
];
