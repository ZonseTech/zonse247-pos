export interface POFormItem {
    variantId: string;
    orderedQuantity: number;
    unitPrice: number;
    notes: string;
}

export interface POFormValues {
    supplierId: string;
    expectedDeliveryDate: string;
    notes: string;
    items: POFormItem[];
}

export type FormMode = 'create-manual' | 'create-from-requisition' | 'view';
