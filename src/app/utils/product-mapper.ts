/**
 * Product Mapper Utilities
 * Converts ProductWithInventory (API v1.6.0+) to InventoryItem for POS compatibility
 */

/**
 * Maps a ProductWithInventory object to InventoryItem format
 * This ensures compatibility with existing cart and POS operations
 */
export function mapProductToInventoryItem(product: ProductWithInventory): InventoryItem {
    return {
        id: product.id,                          // Variant ID
        productId: product.productId,            // Parent product ID
        branchId: product.branchId,
        tenantId: product.tenantId,
        categoryId: product.categoryId || undefined,
        barcode: product.primaryBarcode || '',
        primaryBarcode: product.primaryBarcode || undefined,
        sku: product.sku || undefined,
        name: product.displayName || product.name,
        variantName: product.variantName,
        displayName: product.displayName,
        description: product.description || undefined,
        brand: product.brand || undefined,
        unit: product.unit || undefined,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        // Map inventory data
        quantity: product.inventory?.availableQuantity?.toString() || '0',
        availableQuantity: product.inventory?.availableQuantity || 0,
        reservedQuantity: product.inventory?.reservedQuantity || 0,
        damagedQuantity: product.inventory?.damagedQuantity || 0,
        reorderPoint: product.inventory?.reorderPoint || undefined,
        maxStock: product.inventory?.maxStock || undefined,
        trackInventory: product.inventory?.trackInventory ?? true,
        allowNegativeStock: product.inventory?.allowNegativeStock ?? false,
        averageCost: product.inventory?.averageCost || undefined,
        lastPurchaseCost: product.inventory?.lastPurchaseCost || undefined,
        // Status and flags
        status: product.status || 'ACTIVE',
        isTaxable: product.isTaxable ?? true,
        isActive: product.isActive ?? true,
        isDefault: product.isDefault ?? false,
        // Images and media
        imageUrl: product.imageUrl || undefined,
        // Category details
        categoryDetails: product.categoryDetails,
        // Barcodes array
        barcodes: product.barcodes || [],
        // Timestamps
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };
}

/**
 * Maps an array of ProductWithInventory objects to InventoryItem array
 */
export function mapProductsToInventoryItems(products: ProductWithInventory[]): InventoryItem[] {
    return products.map(mapProductToInventoryItem);
}

/**
 * Maps a search result to InventoryItem format
 */
export function mapSearchResultToInventoryItem(searchResult: SearchProductResult): InventoryItem | null {
    if (!searchResult.product) {
        return null;
    }
    return mapProductToInventoryItem(searchResult.product);
}
