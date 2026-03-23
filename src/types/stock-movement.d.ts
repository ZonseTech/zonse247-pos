/**
 * Stock Movement Types
 * Aligned with zonse247-pos-api v1.6.1
 *
 * GOLDEN RULE: Never update inventory directly — always record a stock movement.
 * The Inventory table is a cache; movements are the source of truth.
 */

/**
 * Stock movement types
 */
type StockMovementType =
    | 'PURCHASE_RECEIPT'
    | 'SALE'
    | 'RETURN'
    | 'ADJUSTMENT'
    | 'TRANSFER_IN'
    | 'TRANSFER_OUT'
    | 'DAMAGE'
    | 'EXPIRY'
    | 'OPENING_BALANCE'
    | 'RETURN_TO_SUPPLIER';

/**
 * Stock reference types
 */
type StockReferenceType =
    | 'PURCHASE_ORDER'
    | 'GOODS_RECEIPT'
    | 'SALE'
    | 'RETURN'
    | 'ADJUSTMENT'
    | 'TRANSFER'
    | 'OPENING_BALANCE'
    | 'SUPPLIER_RETURN';

/**
 * @deprecated Use StockMovementType direction semantics instead
 */
type StockMovementDirection = 'IN' | 'OUT' | 'ADJUSTMENT';

// ─── Core Entity ───────────────────────────────────────────────────────────

/**
 * Stock movement entity
 */
interface StockMovement {
    id: string;
    tenantId: string;
    branchId: string;
    terminalId?: string | null;

    // Inventory reference
    inventoryId: string;

    // Movement details
    movementType: StockMovementType;
    quantity: number; // Always positive, type determines direction

    // Inventory impact
    previousQuantity: number;
    newQuantity: number;

    // Reference
    referenceType?: StockReferenceType | null;
    referenceId?: string | null;

    // Cost tracking
    unitCost: number;
    totalCost: number; // quantity × unitCost

    // Notes
    notes?: string | null;

    // User who performed the movement
    movedBy: string;

    // Movement date
    movementDate: Date | string;

    // Audit
    createdAt: Date | string;

    // Relations (populated in responses)
    inventory?: {
        variant: {
            id: string;
            variantName: string;
            sku: string | null;
        } | null;
        product: {
            id: string;
            name: string;
        } | null;
    };

    /**
     * @deprecated Use inventoryId / inventory instead
     */
    productId?: string;
    variantId?: string;
    product?: Product;
    variant?: ProductVariant;
    direction?: 'IN' | 'OUT' | 'ADJUSTMENT';
    previousAvailableQuantity?: number;
    newAvailableQuantity?: number;
    previousDamagedQuantity?: number;
    newDamagedQuantity?: number;
    referenceNumber?: string;
    fromBranchId?: string;
    toBranchId?: string;
    warehouseLocation?: string;
    performedBy?: string;
    performedByUser?: any;
    reason?: string;
    updatedAt?: Date | string;
}

// ─── Input Payloads ────────────────────────────────────────────────────────

/**
 * Create stock movement input
 */
interface CreateStockMovementInput {
    id?: string;
    tenantId: string;
    branchId: string;
    terminalId?: string | null;
    inventoryId: string;
    movementType: StockMovementType;
    quantity: number;
    referenceType?: StockReferenceType | null;
    referenceId?: string | null;
    unitCost: number;
    notes?: string | null;
    movedBy: string;
    movementDate?: Date | string;
}

/**
 * Record movement with upsert (creates inventory if not exists)
 */
interface RecordMovementWithUpsertInput {
    tenantId: string;
    branchId: string;
    terminalId?: string | null;
    variantId: string;
    productId?: string;
    movementType: StockMovementType;
    quantity: number;
    referenceType?: StockReferenceType | null;
    referenceId?: string | null;
    unitCost: number;
    notes?: string | null;
    movedBy: string;
    movementDate?: Date | string;
}

/**
 * API-based movement recording (simplified)
 */
interface RecordMovementAPIInput {
    variantId?: string;
    inventoryId?: string;
    movementType: StockMovementType;
    quantity: number;
    referenceType?: StockReferenceType | null;
    referenceId?: string | null;
    unitCost?: number;
    notes?: string | null;
}

/**
 * Sync movement input (offline terminal)
 */
interface SyncMovementInput {
    id: string;
    tenantId: string;
    branchId: string;
    terminalId: string;
    inventoryId?: string;
    variantId?: string;
    productId?: string;
    movementType: StockMovementType;
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    referenceType?: StockReferenceType | null;
    referenceId?: string | null;
    unitCost: number;
    totalCost: number;
    notes?: string | null;
    movedBy: string;
    movementDate: Date | string;
    createdAt: Date | string;
}

/**
 * Bulk sync result
 */
interface BulkSyncResult {
    success: boolean;
    processed: number;
    inserted: number;
    skipped: number;
    errors: Array<{
        movementId: string;
        error: string;
    }>;
    inventoriesRecalculated: number;
}

// ─── Legacy Payloads (backward compat) ─────────────────────────────────────

/**
 * @deprecated Use CreateStockMovementInput
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
 * Stock adjustment payload
 * API: POST /stock-movements/adjust
 * Accepts: { inventoryId, quantity (signed: +add / -subtract), unitCost?, notes? }
 * Auth provides tenantId, branchId, and performedBy automatically.
 */
interface StockAdjustmentPayload {
    inventoryId: string;
    quantity: number;
    unitCost?: number;
    notes?: string;
}

/**
 * Damage stock payload
 * API: POST /stock-movements/damage
 * Accepts: { inventoryId, quantity, unitCost?, notes? }
 */
interface DamageStockPayload {
    inventoryId: string;
    quantity: number;
    unitCost?: number;
    notes?: string;
}

/**
 * Transfer stock payload
 * API: POST /stock-movements/transfer
 * Full API: { sourceInventoryId, destinationBranchId, destinationInventoryId, quantity, unitCost?, transferId, notes? }
 * NOTE: This type retains the simplified shape used by the frontend hook/modal.
 * The hook should map these fields to the API contract before sending.
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

// ─── Query & Response ──────────────────────────────────────────────────────

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
