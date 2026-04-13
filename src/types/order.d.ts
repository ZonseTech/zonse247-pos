interface OrderItem {
    itemId: string;
    refNumber?: string;
    transactionId: string;
    productId: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
    createdAt?: string;
    updatedAt?: string;
    synced?: number;
}

interface OrderSummary {
    refNumber: string;
    itemCount: number;
    totalQuantity: number;
    totalPurchasePrice: number;
    totalSellingPrice: number;
    totalProfit: number;
    items: OrderItem[];
}

interface HoldOrder {
    itemId: string;
    reference: string;
    items: Array<CartItem>;
    total: number;
    totalItems: number;
    date: Date | string;
    status: string;
    userId?: string;
    till?: string;
}

/**
 * CartItem - represents a sellable unit in the cart
 * Uses variantId as the unique identifier (API v1.6.0+)
 * The `id` from ProductWithInventory maps to `variantId` here
 */
interface CartItem {
    barcode: number | string;
    variantId: string;          // Required: Variant ID (the sellable unit)
    productId?: string;         // Optional: Parent product ID for reference
    name: string;
    variantName?: string;
    categoryId: string;
    sellingPrice: number;
    discount: number;
    discountIsPercentage?: boolean;
    purchasePrice: number;
    variancePrice?: number;
    quantity: number;
    isDefault?: boolean;
    trackInventory?: boolean;
    categoryDetails?: Category;
    productDetails?: Product;
}