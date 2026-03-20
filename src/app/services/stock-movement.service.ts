import api from './http.service';

/**
 * Stock Movement Service
 * Complete audit trail of all inventory changes
 */

const endpoints = {
    // Base
    root: 'stock-movements',

    // List/Query
    list: 'stock-movements',
    get: (id: string) => `stock-movements/${id}`,
    byProduct: 'stock-movements/product',
    byVariant: 'stock-movements/variant',
    byBranch: 'stock-movements/branch',

    // Create
    create: 'stock-movements',

    // Actions
    adjust: 'stock-movements/adjust',
    damage: 'stock-movements/damage',
    expiry: 'stock-movements/expiry',
    transfer: 'stock-movements/transfer',
    stockCount: 'stock-movements/stock-count',
    correction: 'stock-movements/correction',
    sync: 'stock-movements/sync',

    // Data repair
    recalculate: (inventoryId: string) => `stock-movements/recalculate/${inventoryId}`,
    recalculateBranch: 'stock-movements/recalculate-branch',

    // Summary
    summary: 'stock-movements/summary',
    productSummary: 'stock-movements/product-summary',

    /** @deprecated Use stockCount instead */
    stockTake: 'stock-movements/stock-count',
};

const stockMovementService = {
    endpoints,

    /**
     * GET /stock-movements/product/:productId - Get product stock history
     * Shows complete audit trail of all stock changes for a product
     */
    async getProductStockHistory(
        productId: string,
        tenantId: string,
        branchId: string,
        limit: number = 50,
        page: number = 1,
        startDate?: string,
        endDate?: string,
        movementType?: StockMovementType
    ): Promise<StockMovement[]> {
        return api
            .get<StockMovementListResponse>(`${endpoints.byProduct}/${productId}`, { tenantId, branchId, limit, page, startDate, endDate, movementType })
            .then((res) => res.data.data.movements)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /stock-movements/variant/:variantId - Get variant stock history
     * Shows complete audit trail of all stock changes for a specific variant
     */
    async getVariantStockHistory(
        variantId: string,
        tenantId: string,
        branchId: string,
        limit: number = 50,
        page: number = 1,
        startDate?: string,
        endDate?: string,
        movementType?: StockMovementType
    ): Promise<StockMovement[]> {
        return api
            .get<StockMovementListResponse>(`${endpoints.byVariant}/${variantId}`, { tenantId, branchId, limit, page, startDate, endDate, movementType })
            .then((res) => res.data.data.movements)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /stock-movements/branch - Get branch stock movements
     */
    async getBranchStockMovements(
        query: StockMovementListQuery
    ): Promise<StockMovementListResponse['data']> {
        // Build params object, filtering out undefined/null/empty values
        const params: any = {};
        Object.keys(query).forEach(key => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });

        return api
            .get<StockMovementListResponse>(endpoints.byBranch, params)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /stock-movements - List all stock movements with filters
     */
    async listStockMovements(
        query: StockMovementListQuery
    ): Promise<StockMovementListResponse['data']> {
        return api
            .get<StockMovementListResponse>(endpoints.list, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /stock-movements - Create manual stock movement
     * Generally used by system, not directly by users
     */
    async createStockMovement(
        payload: CreateStockMovementPayload
    ): Promise<StockMovement> {
        return api
            .post<StockMovementResponse>(endpoints.create, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /stock-movements/adjust - Manual stock adjustment
     * quantity is signed: positive = add, negative = subtract
     * Auth header provides tenantId, branchId, and performedBy.
     */
    async adjustStock(payload: StockAdjustmentPayload): Promise<StockMovement> {
        return api
            .post<StockMovementResponse>(endpoints.adjust, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /stock-movements/damage - Mark stock as damaged
     * Moves stock from available to damaged
     */
    async damageStock(payload: DamageStockPayload): Promise<StockMovement> {
        return api
            .post<StockMovementResponse>(endpoints.damage, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /stock-movements/transfer - Transfer stock between branches
     * Creates two movements:
     * - TRANSFER_OUT from source branch
     * - TRANSFER_IN to destination branch
     */
    async transferStock(payload: TransferStockPayload): Promise<{
        transferOut: StockMovement;
        transferIn: StockMovement;
    }> {
        return api
            .post<ApiResponse<any>>(endpoints.transfer, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /stock-movements/stock-count — Physical stock count reconciliation
     * Backend computes variance = actual − system. If ≠ 0, creates ADJUSTMENT movement.
     */
    async performStockCount(payload: {
        inventoryId: string;
        actualQuantity: number;
        unitCost?: number;
        notes?: string;
    }): Promise<{
        movementId: string;
        previousQuantity: number;
        newQuantity: number;
        variance: number;
    }> {
        return api
            .post<ApiResponse<any>>(endpoints.stockCount, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /stock-movements/expiry — Record expired stock
     */
    async recordExpiry(payload: {
        inventoryId: string;
        quantity: number;
        unitCost?: number;
        expiryDate?: string;
        notes?: string;
    }): Promise<StockMovement> {
        return api
            .post<StockMovementResponse>(endpoints.expiry, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /stock-movements/correction — Reverse a prior movement
     */
    async correctMovement(payload: {
        originalMovementId: string;
        reason: string;
    }): Promise<StockMovement> {
        return api
            .post<StockMovementResponse>(endpoints.correction, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /stock-movements/sync — Bulk sync from offline terminal
     */
    async syncMovements(
        movements: SyncMovementInput[]
    ): Promise<BulkSyncResult> {
        return api
            .post<ApiResponse<BulkSyncResult>>(endpoints.sync, { movements } as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /stock-movements/:id — Get single stock movement
     */
    async getStockMovement(movementId: string): Promise<StockMovement> {
        return api
            .get<StockMovementResponse>(endpoints.get(movementId))
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /stock-movements/recalculate/:inventoryId — Rebuild single item from movements
     */
    async recalculateInventory(inventoryId: string): Promise<void> {
        return api
            .post(endpoints.recalculate(inventoryId), {})
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /stock-movements/recalculate-branch — Rebuild all branch inventory
     */
    async recalculateBranch(): Promise<void> {
        return api
            .post(endpoints.recalculateBranch, {})
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * @deprecated Use performStockCount instead
     * POST /stock-movements/stock-count - Physical stock count
     */
    async performStockTake(payload: {
        tenantId: string;
        branchId: string;
        productId: string;
        physicalCount: number;
        performedBy: string;
        notes?: string;
    }): Promise<StockMovement> {
        return api
            .post<StockMovementResponse>(endpoints.stockTake, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /stock-movements/summary - Get stock movement summary
     */
    async getStockMovementSummary(
        tenantId: string,
        branchId: string,
        startDate?: string,
        endDate?: string,
        movementType?: StockMovementType
    ): Promise<{
        totalIn: number;
        totalOut: number;
        netMovement: number;
        movementCount: number;
        totalValue: number;
    }> {
        return api
            .get<ApiResponse<any>>(endpoints.summary, { tenantId, branchId, startDate, endDate, movementType })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /stock-movements/product-summary/:productId - Get product movement summary
     */
    async getProductMovementSummary(
        productId: string,
        tenantId: string,
        branchId: string,
        startDate?: string,
        endDate?: string
    ): Promise<StockMovementSummary> {
        return api
            .get<ApiResponse<StockMovementSummary>>(
                `${endpoints.productSummary}/${productId}`,
                { tenantId, branchId, startDate, endDate }
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default stockMovementService;
