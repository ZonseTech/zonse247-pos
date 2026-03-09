/**
 * Product Types for Inventory Management
 * Updated for Product/Variant model (API v1.6.0+)
 * Products are parent entities, Variants are the sellable units
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
 * Variant barcode record
 */
interface VariantBarcode {
    id: string;
    variantId: string;
    barcode: string;
    barcodeType: BarcodeType;
    barcodeSource: BarcodeSource;
    description?: string | null;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * @deprecated Use VariantBarcode instead
 */
interface ProductBarcode extends Partial<VariantBarcode> {
    productId?: string;
    isPrimary?: boolean;
}

/**
 * Product status
 */
type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';

/**
 * Product - the parent/master product (e.g., "Nivea Lotion")
 */
interface Product {
    id: string;
    tenantId: string;
    branchId: string;
    categoryId?: string | null;
    name: string;
    description?: string | null;
    brand?: string | null;
    isTaxable?: boolean | null;
    supplierName?: string | null;
    supplierCode?: string | null;
    defaultUnit?: string | null;
    customAttributeSchema?: string | null;
    imageUrl?: string | null;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * ProductVariant - the sellable unit (e.g., "Nivea 50ml", "Nivea 200ml")
 */
interface ProductVariant {
    id: string;
    productId: string;
    tenantId: string;
    branchId: string;
    sku?: string | null;
    variantName: string;
    primaryBarcode?: string | null;
    sellingPrice: number;
    costPrice: number;
    unit: string;
    description?: string | null;
    brand?: string | null;
    imageUrl?: string | null;
    isTaxable?: boolean | null;
    supplierName?: string | null;
    supplierCode?: string | null;
    size?: string | null;
    weight?: number | null;
    weightUnit?: string | null;
    volume?: number | null;
    volumeUnit?: string | null;
    dimensions?: string | null;
    customAttributes?: string | null;
    promoPrice?: number | null;
    promoStart?: Date | string | null;
    promoEnd?: Date | string | null;
    expirationDate?: Date | string | null;
    manufactureDate?: Date | string | null;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    inventory?: {
        availableQuantity: number;
        reservedQuantity?: number;
        damagedQuantity?: number;
        averageCost?: number;
        lastPurchaseCost?: number;
        reorderPoint?: number | null;
        maxStock?: number | null;
        trackInventory?: boolean;
        allowNegativeStock?: boolean;
    };
}

/**
 * Inventory data for a variant
 */
interface InventoryInfo {
    availableQuantity: number;
    reservedQuantity: number;
    damagedQuantity: number;
    averageCost: number;
    lastPurchaseCost: number;
    reorderPoint?: number | null;
    maxStock?: number | null;
    trackInventory: boolean;
    allowNegativeStock: boolean;
}

/**
 * @deprecated Use InventoryInfo instead - kept for backwards compatibility
 */
interface ProductInventory extends InventoryInfo {
    id: string;
    productId: string;
    tenantId: string;
    branchId: string;
    totalQuantity?: number;
    minStock?: number;
    reorderLevel?: number;
    reorderQuantity?: number;
    lastPurchaseAt?: Date | string;
    lastSoldAt?: Date | string;
    lastStockTakeAt?: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Category details for display
 */
interface CategoryDetails {
    categoryId: string;
    name: string;
    description?: string | null;
    isActive?: boolean | null;
    isDefault?: boolean | null;
}

/**
 * Variant with inventory info
 */
interface VariantWithInventory extends ProductVariant {
    inventory?: InventoryInfo;
    barcodes?: VariantBarcode[];
}

/**
 * Product with all its variants
 */
interface ProductWithVariants extends Product {
    variants: VariantWithInventory[];
    categoryDetails?: CategoryDetails;
}

/**
 * Flattened view of a product+variant for POS terminal use
 * The `id` field is the VARIANT id for POS operations
 */
interface ProductWithInventory {
    id: string;            // This is the VARIANT id
    productId: string;     // Parent product id
    tenantId: string;
    branchId: string;
    categoryId?: string | null;
    sku?: string | null;
    name: string;          // Product name
    variantName: string;   // Variant name
    displayName: string;   // Combined display name
    primaryBarcode?: string | null;
    sellingPrice: number;
    costPrice: number;
    unit: string;
    description?: string | null;
    brand?: string | null;
    imageUrl?: string | null;
    isTaxable?: boolean | null;
    isActive: boolean;
    status?: ProductStatus;
    isDefault: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    inventory?: InventoryInfo;
    categoryDetails?: CategoryDetails;
    barcodes?: VariantBarcode[];
}

/**
 * Barcode input for creating/updating
 */
interface BarcodeInput {
    barcode: string;
    barcodeType?: BarcodeType;
    barcodeSource?: BarcodeSource;
    description?: string;
}

/**
 * Variant input for product creation
 */
interface VariantInput {
    sku?: string;
    variantName?: string;
    primaryBarcode?: string;
    sellingPrice: number;
    costPrice?: number;
    unit?: string;
    barcodes?: BarcodeInput[];
}

/**
 * Input for creating a new product with its default variant
 */
interface CreateProductInput {
    tenantId: string;
    branchId: string;
    categoryId?: string;
    name: string;
    description?: string;
    brand?: string;
    isTaxable?: boolean;
    supplierName?: string;
    supplierCode?: string;
    defaultUnit?: string;
    imageUrl?: string;
    variant?: VariantInput;
    sku?: string | null;
    primaryBarcode?: string;
    sellingPrice?: number;
    unit?: string;
    trackInventory?: boolean;
    allowNegativeStock?: boolean;
    minStock?: number;
    maxStock?: number;
    reorderLevel?: number;
    barcodes?: BarcodeInput[];
}

/**
 * @deprecated Use CreateProductInput instead
 */
interface CreateProductPayload extends Partial<CreateProductInput> {
    sku?: string;
    name: string;
    unit?: string;
    sellingPrice?: number;
    costPrice?: number;
    imageUrls?: string[];
    weight?: number;
    dimensions?: string;
    color?: string;
    size?: string;
    properties?: Record<string, any>;
}

/**
 * Input for creating a new variant of an existing product
 */
interface CreateVariantInput {
    productId: string;
    sku?: string;
    variantName: string;
    primaryBarcode?: string;
    sellingPrice: number;
    costPrice?: number;
    unit?: string;
    description?: string;
    brand?: string;
    imageUrl?: string;
    isTaxable?: boolean;
    supplierName?: string;
    supplierCode?: string;
    size?: string;
    weight?: number;
    weightUnit?: string;
    volume?: number;
    volumeUnit?: string;
    dimensions?: string;
    customAttributes?: Record<string, any>;
    promoPrice?: number;
    promoStart?: Date | string;
    promoEnd?: Date | string;
    expirationDate?: Date | string;
    manufactureDate?: Date | string;
    isDefault?: boolean;
    trackInventory?: boolean;
    allowNegativeStock?: boolean;
    minStock?: number;
    maxStock?: number;
    reorderLevel?: number;
    barcodes?: BarcodeInput[];
}

/**
 * Input for updating a product (parent only)
 */
interface UpdateProductInput {
    name?: string;
    categoryId?: string;
    description?: string;
    brand?: string;
    isTaxable?: boolean;
    supplierName?: string;
    supplierCode?: string;
    defaultUnit?: string;
    imageUrl?: string;
    isActive?: boolean;
}

/**
 * Input for updating a variant
 */
interface UpdateVariantInput {
    sku?: string;
    variantName?: string;
    primaryBarcode?: string;
    sellingPrice?: number;
    costPrice?: number;
    unit?: string;
    description?: string;
    brand?: string;
    imageUrl?: string;
    isTaxable?: boolean;
    supplierName?: string;
    supplierCode?: string;
    size?: string;
    weight?: number;
    weightUnit?: string;
    volume?: number;
    volumeUnit?: string;
    dimensions?: string;
    customAttributes?: Record<string, any>;
    promoPrice?: number;
    promoStart?: Date | string;
    promoEnd?: Date | string;
    expirationDate?: Date | string;
    manufactureDate?: Date | string;
    isDefault?: boolean;
    isActive?: boolean;
    trackInventory?: boolean;
    allowNegativeStock?: boolean;
    minStock?: number;
    maxStock?: number;
    reorderLevel?: number;
    barcodes?: BarcodeInput[];
}

/**
 * @deprecated Use UpdateProductInput or UpdateVariantInput instead
 */
interface UpdateProductPayload extends Partial<CreateProductPayload> {
    status?: ProductStatus;
}

/**
 * Search match type
 */
type SearchMatchType = 'sku' | 'primaryBarcode' | 'barcode' | 'name' | 'variantName';

/**
 * Product search result - now returns ProductWithInventory (flattened variant)
 */
interface SearchProductResult {
    product: ProductWithInventory;
    matchedBy: SearchMatchType;
}

/**
 * @deprecated Use SearchProductResult instead
 */
interface ProductSearchResult {
    product: ProductWithInventory;
    matchedBy: SearchMatchType;
    matchedValue?: string;
}

/**
 * Duplicate barcode check result
 */
interface DuplicateBarcodeResult {
    exists: boolean;
    productName?: string;
    variantName?: string;
    matchType?: 'primary' | 'alternative';
}

/**
 * List products options
 */
interface ListProductsOptions {
    page?: number;
    perPage?: number;
    search?: string;
    filter?: 'all' | 'active' | 'inactive' | 'new' | 'new-stock' | 'low-stock' | 'out-of-stock';
    status?: string;
    categoryId?: string;
    includeInactive?: boolean;
}

/**
 * @deprecated Use ListProductsOptions instead
 */
interface ProductListQuery {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: ProductStatus;
    inStock?: boolean;
    lowStock?: boolean;
}

/**
 * Paginated products response
 */
interface PaginatedProductsResponse {
    products: ProductWithInventory[];
    total: number;
    totalPages: number;
}

/**
 * Product response from API
 */
interface ProductResponse {
    success: boolean;
    message: string;
    data: ProductWithInventory;
}

/**
 * Product list response
 */
interface ProductListResponse {
    success: boolean;
    message: string;
    data: {
        products: ProductWithInventory[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            perPage?: number;
            currentPage?: number;
            totalItems?: number;
        };
        total?: number;
        totalPages?: number;
    };
}

/**
 * Product search response
 */
interface ProductSearchResponse {
    success: boolean;
    message: string;
    data: SearchProductResult;
}
