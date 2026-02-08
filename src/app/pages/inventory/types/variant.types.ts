/**
 * Variant interface - matches API ProductVariant structure
 * All fields that the API expects for a product variant
 */
export interface Variant {
    id: string;
    variantName: string;
    barcode: string;
    primaryBarcode?: string;
    sku: string;
    brand: string;
    description: string;
    color: string;
    size: string;
    dimensions: string;
    weight: number;

    // Pricing
    costPrice: number;
    sellingPrice: number;
    promoPrice: number;
    promoStart: string;
    promoEnd: string;

    // Inventory levels
    quantity: string;
    originalQuantity: string;
    reservedQuantity: number;
    minStock: number;
    maxStock: number;
    reorderLevel: number;

    // Status and flags
    status: string;
    trackInventory: boolean;
    allowNegativeStock: boolean;
    isTaxable: boolean;
    isDefault?: boolean;
    isActive?: boolean;

    // Dates
    expirationDate: string;
    manufactureDate: string;

    // Supplier info
    supplierName: string;
    supplierCode: string;

    // Additional barcodes
    additionalBarcodes?: Array<{
        barcode: string;
        type?: string;
        source?: string;
    }>;
}

/**
 * Form values structure for inventory forms
 * Contains product-level fields and an array of variants
 */
export interface InventoryFormValues {
    productId: string;
    name: string;
    categoryId: string;
    unit: string;
    variants: Variant[];
}

/**
 * Create a default variant with all required fields
 */
export const createDefaultVariant = (): Variant => ({
    id: '',
    variantName: '',
    barcode: '',
    primaryBarcode: '',
    sku: '',
    brand: '',
    description: '',
    color: '',
    size: '',
    dimensions: '',
    weight: 0,
    costPrice: 0,
    sellingPrice: 0,
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
    isDefault: true,
    isActive: true,
    expirationDate: '',
    manufactureDate: '',
    supplierName: '',
    supplierCode: '',
    additionalBarcodes: [],
});

/**
 * Create default form values with one default variant
 */
export const createDefaultFormValues = (): InventoryFormValues => ({
    productId: '',
    name: '',
    categoryId: '',
    unit: 'pc',
    variants: [createDefaultVariant()],
});

/**
 * Validate min/max stock relationship
 */
export const validateStockLevels = (variant: Variant): { field: string; message: string } | null => {
    const minStock = Number(variant.minStock) || 0;
    const maxStock = Number(variant.maxStock) || 1000;
    const reorderLevel = Number(variant.reorderLevel) || 5;

    if (minStock > maxStock) {
        return {
            field: 'minStock',
            message: `Minimum stock (${minStock}) cannot exceed maximum stock (${maxStock})`
        };
    }

    if (reorderLevel > maxStock) {
        return {
            field: 'reorderLevel',
            message: `Reorder level (${reorderLevel}) cannot exceed maximum stock (${maxStock})`
        };
    }

    return null;
};
