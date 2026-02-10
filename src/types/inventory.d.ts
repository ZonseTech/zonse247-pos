interface InventoryItem {
    productId: string;
    branchId: string;
    tenantId: string;
    userId: string;
    categoryId?: string;
    barcode: string;
    sku?: string;
    name: string;
    description?: string;
    brand?: string;
    unit?: string;
    color?: string;
    size?: string;
    dimensions?: string;
    weight?: number;
    properties?: Record<string, any>;
    costPrice: number;
    sellingPrice: number;
    promoPrice?: number;
    promoStart?: Date | string;
    promoEnd?: Date | string;
    quantity: string;
    originalQuantity: string;
    reservedQuantity?: number;
    minStock?: number;
    maxStock?: number;
    stock?: number;
    reorderLevel?: number;
    status?: string;
    trackInventory?: boolean;
    allowNegativeStock?: boolean;
    isTaxable?: boolean;
    expiryDateAlert: string;
    expirationDate?: Date | string;
    manufactureDate?: Date | string;
    imageUrls?: string[] | any;
    supplierName?: string;
    supplierCode?: string;
    createdBy?: string;
    lastUpdatedBy?: string;
    synced?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    categoryDetails?: Category;
    isExpired?: boolean;
    orderItems?: number;
    customPrice?: string;
    discount?: number;
    isDefault?: boolean;
}

// API Response Types for Products with Variants
interface ProductVariantInventory {
    inventoryId: string;
    availableQuantity: number;
    reservedQuantity: number;
    damagedQuantity: number;
    averageCost: number;
    lastPurchaseCost: number;
    reorderPoint: number | null;
    maxStock: number;
    trackInventory: boolean;
    allowNegativeStock: boolean;
    lastRestockedAt: string | null;
    lastSoldAt: string | null;
}

interface ProductVariant {
    id: string;
    sku: string | null;
    variantName: string;
    primaryBarcode: string | null;
    sellingPrice: number;
    costPrice: number;
    unit: string;
    description: string | null;
    brand: string | null;
    imageUrl: string | null;
    isTaxable: boolean;
    supplierName: string | null;
    supplierCode: string | null;
    size: string | null;
    weight: number | null;
    weightUnit: string | null;
    volume: number | null;
    volumeUnit: string | null;
    dimensions: string | null;
    customAttributes: Record<string, any> | null;
    promoPrice: number | null;
    promoStart: string | null;
    promoEnd: string | null;
    expirationDate: string | null;
    manufactureDate: string | null;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    inventory: ProductVariantInventory;
    barcodes: string[];
}

interface ProductCategoryDetails {
    categoryId: string;
    name: string;
    description: string | null;
    isDefault: boolean;
}

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