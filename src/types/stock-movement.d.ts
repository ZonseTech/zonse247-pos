/**
 * Stock Movement Types
 * Complete audit trail of all inventory changes
 */

/**
 * Stock movement types
 */
type StockMovementType =
    | 'PURCHASE_RECEIPT'  // Goods received from supplier (IN +)
    | 'SALE'              // Items sold to customer (OUT -)
    | 'RETURN'            // Customer return / Sale void (IN +)
    | 'ADJUSTMENT'        // Manual stock adjustment (IN/OUT ±)
    | 'TRANSFER_IN'       // Transfer from another branch (IN +)
    | 'TRANSFER_OUT'      // Transfer to another branch (OUT -)
    | 'DAMAGE'            // Items marked as damaged
    | 'EXPIRY'            // Expired items removed (OUT -)
    | 'STOCK_TAKE'        // Physical stock count adjustment (±)
    | 'PRODUCTION'        // Items produced/manufactured (IN +)
    | 'CONSUMPTION';      // Items consumed in production (OUT -)

/**
 * Stock movement direction
 */
type StockMovementDirection = 'IN' | 'OUT' | 'ADJUSTMENT';

/**
 * Stock movement entity
 */
interface StockMovement {
    id: string;
    tenantId: string;
    branchId: string;

    // Product reference
    productId: string;
    variantId?: string; // Variant ID for variant-level tracking
    inventoryId?: string; // Inventory record ID
    product?: Product; // Populated in responses
    variant?: ProductVariant; // Populated in responses

    // Movement details
    movementType: StockMovementType;
    direction: StockMovementDirection;
    quantity: number; // Always positive, direction determines IN/OUT

    // Inventory impact
    previousQuantity: number;        // Stock before movement
    newQuantity: number;             // Stock after movement
    previousAvailableQuantity?: number;
    newAvailableQuantity?: number;
    previousDamagedQuantity?: number;
    newDamagedQuantity?: number;

    // Cost tracking
    unitCost: number;
    totalCost: number; // quantity * unitCost

    // References
    referenceType?: 'PURCHASE_ORDER' | 'SALE' | 'TRANSFER' | 'ADJUSTMENT' | 'STOCK_TAKE';
    referenceId?: string; // ID of related PO, Sale, Transfer, etc.
    referenceNumber?: string; // Human-readable reference (PO-202601-0001, SALE-20260105-00001)

    // Location tracking
    fromBranchId?: string; // For transfers
    toBranchId?: string;   // For transfers
    warehouseLocation?: string; // Bin/shelf location

    // Movement date
    movementDate: Date | string;

    // User who performed the movement
    performedBy: string;
    performedByUser?: User; // Populated in responses

    // Notes and reason
    notes?: string;
    reason?: string;

    // Audit
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Create stock movement payload
 */
interface CreateStockMovementPayload {
    tenantId: string;
    branchId: string;
    productId: string;
    movementType: StockMovementType;
    quantity: number;
    unitCost: number;
    referenceType?: string;
    referenceId?: string;
    referenceNumber?: string;
    performedBy: string;
    notes?: string;
    reason?: string;
    movementDate?: Date | string;
}

/**
 * Stock movement list query
 */
interface StockMovementListQuery {
    tenantId: string;
    branchId: string;
    productId?: string;
    variantId?: string;
    inventoryId?: string;
    movementType?: StockMovementType;
    startDate?: Date | string;
    endDate?: Date | string;
    page?: number;
    limit?: number;
}

/**
 * Stock movement response
 */
interface StockMovementResponse {
    success: boolean;
    message: string;
    data: StockMovement;
}

/**
 * Stock movement list response
 */
interface StockMovementListResponse {
    success: boolean;
    message: string;
    data: {
        movements: StockMovement[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

/**
 * Stock movement summary
 */
interface StockMovementSummary {
    productId: string;
    product?: Product;
    totalIn: number;
    totalOut: number;
    netMovement: number;
    movementCount: number;
    averageCost: number;
    totalValue: number;
}

/**
 * Stock adjustment payload
 */
interface StockAdjustmentPayload {
    tenantId: string;
    branchId: string;
    productId: string;
    adjustmentType: 'ADD' | 'SUBTRACT' | 'SET';
    quantity: number; // For SET, this is the new total quantity
    reason: string;
    notes?: string;
    performedBy: string;
}

/**
 * Damage stock payload
 */
interface DamageStockPayload {
    tenantId: string;
    branchId: string;
    productId: string;
    quantity: number;
    reason: string;
    notes?: string;
    performedBy: string;
    referenceId?: string; // Related PO or other reference
}

/**
 * Transfer stock payload
 */
interface TransferStockPayload {
    tenantId: string;
    fromBranchId: string;
    toBranchId: string;
    productId: string;
    quantity: number;
    notes?: string;
    performedBy: string;
}
