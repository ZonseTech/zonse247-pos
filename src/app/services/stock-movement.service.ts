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
    byProduct: 'stock-movements/product',
    byBranch: 'stock-movements/branch',

    // Create
    create: 'stock-movements',

    // Actions
    adjust: 'stock-movements/adjust',
    damage: 'stock-movements/damage',
    transfer: 'stock-movements/transfer',
    stockTake: 'stock-movements/stock-take',

    // Summary
    summary: 'stock-movements/summary',
    productSummary: 'stock-movements/product-summary',
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
        startDate?: string,
        endDate?: string
    ): Promise<StockMovement[]> {
        return api
            .get<StockMovementListResponse>(`${endpoints.byProduct}/${productId}`, { tenantId, branchId, limit, startDate, endDate })
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
     * Types: ADD, SUBTRACT, SET
     * 
     * Examples:
     * - ADD: Add 10 units (found stock)
     * - SUBTRACT: Remove 5 units (theft/loss)
     * - SET: Set total to 100 (after physical count)
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
     * POST /stock-movements/stock-take - Physical stock count
     * Adjusts inventory to match physical count
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
