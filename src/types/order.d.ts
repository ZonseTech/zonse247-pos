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

interface CartItem {
    barcode: number | string;
    variantId?: string;         // Variant ID (preferred for API v1.6.0+)
    productId: string;          // Product ID (parent)
    name: string;
    categoryId: string;
    sellingPrice: number;
    discount: number;
    discountIsPercentage?: boolean;
    purchasePrice: number;
    variancePrice?: number;
    quantity: number;
    isDefault?: boolean;
    categoryDetails?: Category;
    productDetails?: Product;
}