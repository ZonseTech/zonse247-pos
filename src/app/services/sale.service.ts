import api from './http.service';

/**
 * Sale Service
 * POS sales with inventory reduction
 */

const endpoints = {
    // Base
    root: 'sales',

    // CRUD
    create: 'sales',
    get: 'sales',
    list: 'sales',

    // Actions
    void: 'sales/void',
    return: 'sales/return',

    // Statistics
    stats: 'sales/stats',
    dailySummary: 'sales/daily-summary',
    productSales: 'sales/product-sales',

    // Receipt
    receipt: 'sales/receipt',
    printReceipt: 'sales/print-receipt',
};

const saleService = {
    endpoints,

    /**
     * POST /sales - Create a new sale (POS transaction)
     * 
     * What happens behind the scenes:
     * 1. Stock availability is checked (must have >= quantity)
     * 2. Inventory is updated:
     *    - availableQuantity -= quantity
     *    - lastSoldAt = current timestamp
     * 3. Stock movement is created:
     *    - Movement: SALE (-quantity from available)
     * 4. Sale is marked as COMPLETED
     * 
     * Errors:
     * - Insufficient stock (unless allowNegativeStock is enabled)
     * - Product not found
     * - Product inactive or discontinued
     */
    async createSale(payload: CreateSalePayload): Promise<Sale> {
        return api
            .post<SaleResponse>(endpoints.create, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /sales/:id - Get sale details
     */
    async getSale(
        saleId: string,
        tenantId: string,
        branchId: string
    ): Promise<Sale> {
        return api
            .get<SaleResponse>(`${endpoints.get}/${saleId}`, {
                params: { tenantId, branchId },
            })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /sales - List sales with filters
     */
    async listSales(query: SaleListQuery): Promise<SaleListResponse['data']> {
        return api
            .get<SaleListResponse>(endpoints.list, {
                params: query,
            })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /sales/:id/void - Void a sale
     * 
     * What happens:
     * 1. Sale is marked as VOIDED
     * 2. Inventory quantities are reversed (stock added back):
     *    - availableQuantity += quantity
     * 3. Stock movements are created with type RETURN
     * 
     * Note: Voids reverse ALL items in the sale
     */
    async voidSale(
        saleId: string,
        payload: VoidSalePayload
    ): Promise<Sale> {
        return api
            .post<SaleResponse>(`${endpoints.void}/${saleId}`, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /sales/:id/return - Process a sale return
     * 
     * What happens:
     * 1. Sale is marked as RETURNED (or partially returned)
     * 2. Inventory quantities are reversed for returned items:
     *    - availableQuantity += returnedQuantity
     * 3. Stock movements are created with type RETURN
     * 4. Refund is processed (optional)
     * 
     * Note: Can return partial quantities
     */
    async returnSale(
        saleId: string,
        payload: ReturnSalePayload
    ): Promise<Sale> {
        return api
            .post<SaleResponse>(`${endpoints.return}/${saleId}`, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /sales/stats - Get sales statistics
     */
    async getSalesStats(
        tenantId: string,
        branchId: string,
        startDate?: string,
        endDate?: string,
        userId?: string
    ): Promise<SaleStats> {
        return api
            .get<ApiResponse<SaleStats>>(endpoints.stats, {
                params: { tenantId, branchId, startDate, endDate, userId },
            })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /sales/daily-summary - Get daily sales summary
     */
    async getDailySalesSummary(
        tenantId: string,
        branchId: string,
        startDate: string,
        endDate: string
    ): Promise<DailySalesSummary[]> {
        return api
            .get<ApiResponse<DailySalesSummary[]>>(endpoints.dailySummary, {
                params: { tenantId, branchId, startDate, endDate },
            })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /sales/product-sales/:productId - Get sales by product
     */
    async getProductSales(
        productId: string,
        tenantId: string,
        branchId: string,
        startDate?: string,
        endDate?: string
    ): Promise<{
        product: Product;
        totalQuantitySold: number;
        totalRevenue: number;
        totalProfit: number;
        salesCount: number;
    }> {
        return api
            .get<ApiResponse<any>>(`${endpoints.productSales}/${productId}`, {
                params: { tenantId, branchId, startDate, endDate },
            })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /sales/:id/receipt - Get receipt data
     */
    async getReceipt(
        saleId: string,
        tenantId: string,
        branchId: string
    ): Promise<any> {
        return api
            .get<ApiResponse<any>>(`${endpoints.receipt}/${saleId}`, {
                params: { tenantId, branchId },
            })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /sales/:id/print-receipt - Print receipt
     */
    async printReceipt(
        saleId: string,
        tenantId: string,
        branchId: string
    ): Promise<void> {
        return api
            .post(`${endpoints.printReceipt}/${saleId}`, {
                tenantId,
                branchId,
            })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },
};

export default saleService;
