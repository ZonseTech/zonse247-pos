/**
 * Inventory Types
 * Updated for Product/Variant model (API v1.6.0+)
 */

/**
 * InventoryItem - flattened view of variant + inventory for display
 * The id field represents the variant ID
 */
interface InventoryItem {
    id?: string;           // Variant ID
    productId: string;     // Parent product ID
    branchId: string;
    tenantId: string;
    userId?: string;
    categoryId?: string;
    barcode?: string;
    primaryBarcode?: string;
    sku?: string;
    name: string;
    variantName?: string;
    displayName?: string;
    description?: string;
    brand?: string;
    unit?: string;
    color?: string;
    size?: string;
    dimensions?: string;
    weight?: number;
    properties?: Record<string, any>;
    costPrice?: number;
    sellingPrice: number;
    promoPrice?: number;
    promoStart?: Date | string;
    promoEnd?: Date | string;
    quantity?: string | number;
    availableQuantity?: number;
    originalQuantity?: string;
    reservedQuantity?: number;
    damagedQuantity?: number;
    minStock?: number;
    maxStock?: number;
    stock?: number;
    reorderLevel?: number;
    reorderPoint?: number;
    status?: string;
    trackInventory?: boolean;
    allowNegativeStock?: boolean;
    isTaxable?: boolean;
    expiryDateAlert?: string | number;
    expirationDate?: Date | string;
    manufactureDate?: Date | string;
    imageUrls?: string[] | any;
    imageUrl?: string;
    supplierName?: string;
    supplierCode?: string;
    createdBy?: string;
    lastUpdatedBy?: string;
    synced?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    categoryDetails?: CategoryDetails;
    isExpired?: boolean;
    isActive?: boolean;
    isDefault?: boolean;
    orderItems?: number;
    customPrice?: string;
    discount?: number;
    barcodes?: VariantBarcode[] | string[];
    averageCost?: number;
    lastPurchaseCost?: number;
}

/**
 * ProductVariantInventory - inventory data for a variant
 */
interface ProductVariantInventory {
    inventoryId?: string;
    availableQuantity: number;
    reservedQuantity: number;
    damagedQuantity: number;
    averageCost: number;
    lastPurchaseCost: number;
    reorderPoint: number | null;
    maxStock: number | null;
    trackInventory: boolean;
    allowNegativeStock: boolean;
    lastRestockedAt?: string | null;
    lastSoldAt?: string | null;
}

/**
 * ProductCategoryDetails - category information
 */
interface ProductCategoryDetails {
    categoryId: string;
    name: string;
    description: string | null;
    isDefault: boolean;
}

/**
 * ApiProduct - full product with its variants from API
 */
interface ApiProduct {
    id: string;
    tenantId: string;
    branchId: string;
    categoryId: string | null;
    name: string;
    description: string | null;
    brand: string | null;
    isTaxable: boolean;
    supplierName: string | null;
    supplierCode: string | null;
    defaultUnit: string;
    imageUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    categoryDetails: ProductCategoryDetails | null;
    variantCount: number;
    totalAvailableQuantity: number;
    totalReservedQuantity: number;
    variants: ProductVariant[];
}