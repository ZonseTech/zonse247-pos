/**
 * Product Types for Inventory Management
 * Following the business flow: Products are defined first, orders show intent, receipts confirm reality
 */

/**
 * Barcode source types
 */
type BarcodeSource = 'MANUFACTURER' | 'STORE' | 'CUSTOM';

/**
 * Barcode types supported
 */
type BarcodeType = 'EAN13' | 'EAN8' | 'UPC' | 'CODE128' | 'CODE39' | 'QR' | 'CUSTOM';

/**
 * Product barcode definition
 */
interface ProductBarcode {
    id?: string;
    productId?: string;
    barcode: string;
    barcodeType: BarcodeType;
    barcodeSource: BarcodeSource;
    description?: string;
    isPrimary?: boolean;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * Product status
 */
type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';

/**
 * Main Product entity
 */
interface Product {
    id: string;
    productId: string;
    tenantId: string;
    branchId: string;
    sku: string;
    name: string;
    description?: string;
    unit: string; // e.g., 'bag', 'piece', 'kg', 'liter'

    // Barcodes
    primaryBarcode?: string;
    barcodes?: ProductBarcode[];

    // Pricing
    sellingPrice: number;
    costPrice?: number; // Base cost, actual cost tracked in inventory
    taxRate?: number;

    // Categorization
    categoryId?: string;
    brand?: string;

    // Physical attributes
    weight?: number;
    dimensions?: string;
    color?: string;
    size?: string;

    // Images
    imageUrls?: string[];
    thumbnailUrl?: string;

    // Status and metadata
    status: ProductStatus;
    isActive: boolean;

    // Inventory link
    inventory?: ProductInventory;

    // Audit
    createdBy: string;
    updatedBy?: string;
    createdAt: Date | string;
    updatedAt: Date | string;

    // Additional properties
    properties?: Record<string, any>;
}

/**
 * Product inventory tracking (separate from product master)
 */
interface ProductInventory {
    id: string;
    productId: string;
    tenantId: string;
    branchId: string;

    // Stock quantities
    availableQuantity: number;      // Sellable stock (what customers can buy)
    reservedQuantity: number;       // Reserved for orders/holds
    damagedQuantity: number;        // Damaged/unusable stock
    totalQuantity: number;          // Total = available + reserved + damaged

    // Cost tracking
    averageCost: number;            // Weighted average cost (FIFO/LIFO)
    lastPurchaseCost: number;       // Most recent purchase price

    // Stock management settings
    trackInventory: boolean;        // Enable stock tracking
    allowNegativeStock: boolean;    // Allow overselling

    // Reorder settings
    minStock?: number;
    maxStock?: number;
    reorderLevel?: number;
    reorderQuantity?: number;

    // Timestamps
    lastPurchaseAt?: Date | string;
    lastSoldAt?: Date | string;
    lastStockTakeAt?: Date | string;

    // Audit
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Product creation payload
 */
interface CreateProductPayload {
    tenantId: string;
    branchId: string;
    sku: string;
    name: string;
    description?: string;
    unit: string;
    sellingPrice: number;
    costPrice?: number;
    categoryId?: string;
    brand?: string;
    primaryBarcode?: string;
    barcodes?: Omit<ProductBarcode, 'id' | 'productId' | 'createdAt' | 'updatedAt'>[];
    imageUrls?: string[];
    weight?: number;
    dimensions?: string;
    color?: string;
    size?: string;
    trackInventory?: boolean;
    allowNegativeStock?: boolean;
    minStock?: number;
    maxStock?: number;
    reorderLevel?: number;
    properties?: Record<string, any>;
}

/**
 * Product update payload
 */
interface UpdateProductPayload {
    tenantId: string;
    branchId: string;
    name?: string;
    description?: string;
    sellingPrice?: number;
    costPrice?: number;
    categoryId?: string;
    brand?: string;
    status?: ProductStatus;
    imageUrls?: string[];
    weight?: number;
    dimensions?: string;
    properties?: Record<string, any>;
}

/**
 * Product search result
 */
interface ProductSearchResult {
    product: Product;
    matchedBy: 'sku' | 'barcode' | 'name' | 'id';
    matchedValue: string;
}

/**
 * Product list query parameters
 */
interface ProductListQuery {
    tenantId: string;
    branchId: string;
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: ProductStatus;
    inStock?: boolean;
    lowStock?: boolean;
}

/**
 * Product response from API
 */
interface ProductResponse {
    success: boolean;
    message: string;
    data: Product;
}

/**
 * Product list response
 */
interface ProductListResponse {
    success: boolean;
    message: string;
    data: {
        products: Product[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

/**
 * Product search response
 */
interface ProductSearchResponse {
    success: boolean;
    message: string;
    data: ProductSearchResult;
}
