import api from './http.service';

/**
 * Inventory Valuation Service
 * Aligned with zonse247-pos-api v1.6.1
 *
 * Costing methods: WEIGHTED_AVERAGE | FIFO | LIFO (per-item configurable)
 * Base path: /inventory-valuation
 */

const endpoints = {
    root: 'inventory-valuation',

    // Valuation
    summary: 'inventory-valuation/summary',
    itemValuation: (inventoryId: string) => `inventory-valuation/${inventoryId}`,
    costLayers: (inventoryId: string) =>
        `inventory-valuation/${inventoryId}/cost-layers`,

    // COGS
    cogsPreview: 'inventory-valuation/cogs',
    cogsPeriod: 'inventory-valuation/cogs/period',
    cogsPeriodFromSales: 'inventory-valuation/cogs/period-from-sales',

    // Profitability & Aging
    grossProfitByProduct: 'inventory-valuation/gross-profit/by-product',
    aging: 'inventory-valuation/aging',

    // Configuration
    costingMethod: 'inventory-valuation/costing-method',
    openingBalance: 'inventory-valuation/opening-balance',
    rebuildLayers: 'inventory-valuation/rebuild-layers',
};

const inventoryValuationService = {
    endpoints,

    // ─── Valuation ─────────────────────────────────────────────────────────

    /**
     * GET /inventory-valuation/summary — Full branch valuation
     * Returns WAC + FIFO + LIFO totals and per-item breakdown
     */
    async getValuationSummary(): Promise<InventoryValuationSummary> {
        return api
            .get<ValuationSummaryResponse>(endpoints.summary)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /inventory-valuation/:inventoryId — Single item valuation
     * Returns WAC/FIFO/LIFO values + cost layers
     */
    async getItemValuation(inventoryId: string): Promise<ItemValuation> {
        return api
            .get<ItemValuationResponse>(endpoints.itemValuation(inventoryId))
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /inventory-valuation/:inventoryId/cost-layers
     * Remaining (non-depleted) cost layers
     */
    async getCostLayers(
        inventoryId: string
    ): Promise<Array<{ id: string; remainingQuantity: number; unitCost: number; layerDate: string }>> {
        return api
            .get<ApiResponse<any>>(endpoints.costLayers(inventoryId))
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    // ─── COGS ──────────────────────────────────────────────────────────────

    /**
     * POST /inventory-valuation/cogs — Preview COGS for a quantity (read-only)
     * Does NOT consume cost layers.
     */
    async previewCOGS(payload: {
        inventoryId: string;
        quantity: number;
        overrideMethod?: 'WEIGHTED_AVERAGE' | 'FIFO' | 'LIFO';
    }): Promise<COGSResult> {
        return api
            .post<COGSResponse>(endpoints.cogsPreview, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /inventory-valuation/cogs/period — Period COGS from stock movement ledger
     * Authoritative source: SUM(stock_movements.totalCost) WHERE movementType = 'SALE'
     */
    async getPeriodCOGS(
        startDate: string,
        endDate: string,
        branchId?: string
    ): Promise<PeriodCOGSResult> {
        return api
            .get<PeriodCOGSResponse>(endpoints.cogsPeriod, {
                startDate,
                endDate,
                ...(branchId && { branchId }),
            })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /inventory-valuation/cogs/period-from-sales — Period COGS from sale_items
     * Cross-check: should yield identical totalCOGS as ledger-based query.
     */
    async getPeriodCOGSFromSales(
        startDate: string,
        endDate: string,
        branchId?: string
    ): Promise<PeriodCOGSFromSalesResult> {
        return api
            .get<ApiResponse<PeriodCOGSFromSalesResult>>(
                endpoints.cogsPeriodFromSales,
                { startDate, endDate, ...(branchId && { branchId }) }
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    // ─── Profitability & Aging ─────────────────────────────────────────────

    /**
     * GET /inventory-valuation/gross-profit/by-product
     * Returns per-product revenue, COGS, profit, margin %
     */
    async getGrossProfitByProduct(
        startDate: string,
        endDate: string,
        branchId?: string
    ): Promise<GrossProfitByProductResult> {
        return api
            .get<GrossProfitResponse>(endpoints.grossProfitByProduct, {
                startDate,
                endDate,
                ...(branchId && { branchId }),
            })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /inventory-valuation/aging — Inventory aging / slow-mover analysis
     * Groups items into buckets (0-30, 31-60, …, 365+, never)
     */
    async getInventoryAging(
        thresholdDays?: number,
        branchId?: string
    ): Promise<InventoryAgingResult> {
        return api
            .get<InventoryAgingResponse>(endpoints.aging, {
                ...(thresholdDays !== undefined && { thresholdDays }),
                ...(branchId && { branchId }),
            })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    // ─── Configuration ─────────────────────────────────────────────────────

    /**
     * PUT /inventory-valuation/costing-method — Change costing method for an item
     */
    async changeCostingMethod(payload: {
        inventoryId: string;
        newMethod: 'WEIGHTED_AVERAGE' | 'FIFO' | 'LIFO';
    }): Promise<ChangeCostingMethodResult> {
        return api
            .put<ApiResponse<ChangeCostingMethodResult>>(
                endpoints.costingMethod,
                payload as any
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /inventory-valuation/opening-balance — Record opening stock
     * Creates cost layer + OPENING_BALANCE stock movement
     */
    async recordOpeningBalance(payload: {
        inventoryId: string;
        quantity: number;
        unitCost: number;
        openingDate?: string;
        notes?: string;
    }): Promise<void> {
        return api
            .post(endpoints.openingBalance, payload as any)
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /inventory-valuation/rebuild-layers — Rebuild cost layers from movement history
     * Useful for data repair or after switching costing methods
     */
    async rebuildCostLayers(payload: {
        inventoryId: string;
    }): Promise<{ layersCreated: number; layersConsumed: number }> {
        return api
            .post<ApiResponse<any>>(endpoints.rebuildLayers, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default inventoryValuationService;
