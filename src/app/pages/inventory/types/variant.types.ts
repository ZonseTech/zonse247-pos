export interface Variant {
    id: string;
    variantName: string;
    barcode: string;
    sku: string;
    brand: string;
    description: string;
    color: string;
    size: string;
    dimensions: string;
    weight: number;
    costPrice: number;
    sellPrice: number;
    promoPrice: number;
    promoStart: string;
    promoEnd: string;
    quantity: string;
    originalQuantity: string;
    reservedQuantity: number;
    minStock: number;
    maxStock: number;
    reorderLevel: number;
    status: string;
    trackInventory: boolean;
    allowNegativeStock: boolean;
    isTaxable: boolean;
    expirationDate: string;
    manufactureDate: string;
    supplierName: string;
    supplierCode: string;
}

export const createDefaultVariant = (): Variant => ({
    id: crypto.randomUUID(),
    variantName: '',
    barcode: '',
    sku: '',
    brand: '',
    description: '',
    color: '',
    size: '',
    dimensions: '',
    weight: 0,
    costPrice: 0,
    sellPrice: 0,
    promoPrice: 0,
    promoStart: '',
    promoEnd: '',
    quantity: '0',
    originalQuantity: '0',
    reservedQuantity: 0,
    minStock: 1,
    maxStock: 1000,
    reorderLevel: 5,
    status: 'active',
    trackInventory: true,
    allowNegativeStock: false,
    isTaxable: true,
    expirationDate: '',
    manufactureDate: '',
    supplierName: '',
    supplierCode: '',
});

export interface InventoryFormValues {
    productId: string;
    name: string;
    categoryId: string;
    unit: string;
    variants: Variant[];
}

export const createDefaultFormValues = (): InventoryFormValues => ({
    productId: '',
    name: '',
    categoryId: '',
    unit: 'pc',
    variants: [createDefaultVariant()],
});
