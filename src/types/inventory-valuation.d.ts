/**
 * Inventory Valuation Types
 * Aligned with zonse247-pos-api v1.6.1
 *
 * Supports perpetual inventory with multiple costing methods:
 * - WEIGHTED_AVERAGE (default, cached on Inventory row)
 * - FIFO (oldest cost layers consumed first)
 * - LIFO (newest cost layers consumed first)
 */

/**
 * Costing method
 */
type CostingMethodType = 'WEIGHTED_AVERAGE' | 'FIFO' | 'LIFO';

// ─── Cost Layers ───────────────────────────────────────────────────────────

/**
 * Inventory cost layer
 * Each purchase / opening-stock / return creates a layer;
 * each sale / transfer-out / damage consumes layers.
 */
interface InventoryCostLayer {
    id: string;
    tenantId: string;
    branchId: string;
    inventoryId: string;
    remainingQuantity: number;
    originalQuantity: number;
    unitCost: number;
    referenceType: string | null;
    referenceId: string | null;
    movementId: string | null;
    layerDate: Date | string;
    depletedAt: Date | string | null;
    version: number;
    deletedAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * COGS calculation result
 */
interface COGSResult {
    totalCost: number;
    quantityConsumed: number;
    layersConsumed: Array<{
        layerId: string;
        quantityUsed: number;
        unitCost: number;
        costForLayer: number;
    }>;
    /** Weighted average unit cost for the consumed quantity */
    weightedUnitCost: number;
}

// ─── Valuation ─────────────────────────────────────────────────────────────

/**
 * Single item valuation
 */
interface InventoryValuationItem {
    inventoryId: string;
    productId: string;
    variantId: string | null;
    productName: string;
    variantName: string | null;
    sku: string | null;
    costingMethod: CostingMethodType;
    availableQuantity: number;
    totalValue: number;
    averageCost: number;
    fifoValue: number | null;
    lifoValue: number | null;
}

/**
 * Branch-level valuation summary (aggregate totals)
 */
interface InventoryValuationSummary {
    tenantId: string;
    branchId: string;
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    totalWeightedAverageValue: number;
    totalFIFOValue: number;
    totalLIFOValue: number;
    valuationDate: Date | string;
}

/**
 * Paginated valuation response data
 */
interface InventoryValuationData {
    items: InventoryValuationItem[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
    summary: InventoryValuationSummary;
}

/**
 * Query params for paginated valuation summary
 */
interface ValuationSummaryQuery {
    page?: number;
    limit?: number;
    search?: string;
    costingMethod?: CostingMethodType;
}

/**
 * Single-item valuation detail
 */
interface ItemValuation {
    costingMethod: CostingMethodType;
    availableQuantity: number;
    weightedAverageValue: number;
    fifoValue: number;
    lifoValue: number;
    activeValue: number;
    costLayers: Array<{
        id: string;
        remainingQuantity: number;
        unitCost: number;
        layerDate: Date | string;
    }>;
}

// ─── COGS & Profit Reports ────────────────────────────────────────────────

/**
 * Period COGS from stock movement ledger
 */
interface PeriodCOGSResult {
    tenantId: string;
    branchId: string;
    startDate: Date | string;
    endDate: Date | string;
    totalCOGS: number;
    saleMovementCount: number;
    totalUnitsSold: number;
    byProduct: Array<{
        productId: string;
        productName: string;
        variantId: string | null;
        sku: string | null;
        unitsSold: number;
        cogs: number;
    }>;
}

/**
 * Period COGS from sale_items (cross-check)
 */
interface PeriodCOGSFromSalesResult {
    tenantId: string;
    branchId: string;
    startDate: Date | string;
    endDate: Date | string;
    totalCOGS: number;
    saleCount: number;
    totalUnitsSold: number;
    byProduct: Array<{
        productId: string;
        productName: string;
        variantId: string;
        sku: string | null;
        unitsSold: number;
        cogs: number;
    }>;
}

/**
 * Gross profit product item
 */
interface GrossProfitProductItem {
    productId: string;
    productName: string;
    variantId: string;
    variantName: string | null;
    sku: string | null;
    unitsSold: number;
    revenue: number;
    cogs: number;
    grossProfit: number;
    marginPercent: number;
}

/**
 * Gross profit summary
 */
interface GrossProfitSummary {
    tenantId: string;
    branchId: string;
    startDate: Date | string;
    endDate: Date | string;
    totalRevenue: number;
    totalCOGS: number;
    totalGrossProfit: number;
    overallMarginPercent: number;
    totalUnitsSold: number;
}

/**
 * Gross profit by product — paginated response data
 */
interface GrossProfitByProductResult {
    items: GrossProfitProductItem[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
    summary: GrossProfitSummary;
}

/**
 * Query params for paginated gross profit
 */
interface GrossProfitQuery {
    startDate: string;
    endDate: string;
    page?: number;
    perPage?: number;
    search?: string;
    branchId?: string;
}

// ─── Inventory Aging ───────────────────────────────────────────────────────

/**
 * Aging bucket
 */
interface InventoryAgingBucket {
    itemCount: number;
    totalQuantity: number;
    totalValue: number;
}

/**
 * Aging item detail
 */
interface InventoryAgingItem {
    inventoryId: string;
    productId: string;
    productName: string;
    variantId: string | null;
    sku: string | null;
    availableQuantity: number;
    averageCost: number;
    stockValue: number;
    lastSoldAt: Date | string | null;
    lastRestockedAt: Date | string | null;
    daysSinceLastSale: number | null;
    status: 'active' | 'slow' | 'dead';
}

/**
 * Inventory aging / slow-mover analysis
 */
interface InventoryAgingResult {
    tenantId: string;
    branchId: string;
    thresholdDays: number;
    totalItems: number;
    totalSlowMovers: number;
    totalNeverSold: number;
    slowMoverValue: number;
    neverSoldValue: number;
    buckets: {
        '0-30': InventoryAgingBucket;
        '31-60': InventoryAgingBucket;
        '61-90': InventoryAgingBucket;
        '91-180': InventoryAgingBucket;
        '181-365': InventoryAgingBucket;
        '365+': InventoryAgingBucket;
        never: InventoryAgingBucket;
    };
    items: InventoryAgingItem[];
}

// ─── Costing Method Change ─────────────────────────────────────────────────

/**
 * Change costing method input
 */
interface ChangeCostingMethodInput {
    tenantId: string;
    branchId: string;
    inventoryId: string;
    newMethod: CostingMethodType;
    changedBy: string;
}

/**
 * Change costing method result
 */
interface ChangeCostingMethodResult {
    inventoryId: string;
    previousMethod: CostingMethodType;
    newMethod: CostingMethodType;
    layersRebuilt: boolean;
}

// ─── API Responses ─────────────────────────────────────────────────────────

/**
 * Valuation summary API response
 */
interface ValuationSummaryResponse {
    success: boolean;
    message: string;
    data: InventoryValuationData;
}

/**
 * Item valuation API response
 */
interface ItemValuationResponse {
    success: boolean;
    message: string;
    data: ItemValuation;
}

/**
 * COGS API response
 */
interface COGSResponse {
    success: boolean;
    message: string;
    data: COGSResult;
}

/**
 * Period COGS API response
 */
interface PeriodCOGSResponse {
    success: boolean;
    message: string;
    data: PeriodCOGSResult;
}

/**
 * Gross profit API response
 */
interface GrossProfitResponse {
    success: boolean;
    message: string;
    data: GrossProfitByProductResult;
}

/**
 * Aging API response
 */
interface InventoryAgingResponse {
    success: boolean;
    message: string;
    data: InventoryAgingResult;
}
