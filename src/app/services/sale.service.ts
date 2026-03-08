import api from './http.service';

/**
 * Sale Service
 * HTTP client for the POS Sales API
 * 
 * The API handles all business logic:
 * - Validates product variants and stock availability
 * - Supports both single and multiple payment methods  
 * - Updates inventory and creates stock movements
 * - Generates unique sale numbers
 * 
 * Sale items reference variantId (the sellable unit)
 */

const endpoints = {
    root: 'sales',
    create: 'sales',
    get: 'sales',
    list: 'sales',
    void: 'sales',
    return: 'sales/return',
    summaries: 'sales/summaries',
};

const saleService = {
    endpoints,

    /**
     * POST /sales - Create a new sale
     * 
     * The API will:
     * - Validate variants and check stock availability
     * - Support multiple payment methods
     * - Update inventory and create stock movements
     * - Generate unique sale number
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
     * GET /sales/:saleId - Get a single sale by ID
     * tenantId and branchId are added by http.service interceptor
     */
    async getSale(
        saleId: string,
        _tenantId?: string,
        _branchId?: string
    ): Promise<Sale> {
        return api
            .get<SaleResponse>(`${endpoints.get}/${saleId}`)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /sales - List sales with pagination and filters
     */
    async listSales(query: SaleListQuery): Promise<SaleListResponse['data']> {
        return api
            .get<SaleListResponse>(endpoints.list, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /sales/:saleId/void - Void a sale and restore inventory
     * 
     * The API will:
     * - Mark sale as voided
     * - Restore inventory quantities
     * - Create reversal stock movements
     */
    async voidSale(saleId: string, payload: VoidSalePayload): Promise<Sale> {
        return api
            .post<SaleResponse>(`${endpoints.void}/${saleId}/void`, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /sales/return/:saleId - Process a return
     */
    async returnSale(saleId: string, payload: ReturnSalePayload): Promise<Sale> {
        return api
            .post<SaleResponse>(`${endpoints.return}/${saleId}`, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /sales/summaries - Get sales summary statistics
     * 
     * Returns: totalSales, totalVoided, netSales, counts by status
     */
    async getSummaries(options?: SalesSummaryOptions): Promise<SalesSummary> {
        return api
            .get<ApiResponse<SalesSummary>>(endpoints.summaries, options || {})
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /sales/:saleId - Get receipt data (alias for getSale with full details)
     * tenantId and branchId are added by http.service interceptor
     */
    async getReceipt(
        saleId: string,
        _tenantId?: string,
        _branchId?: string
    ): Promise<Sale> {
        return api
            .get<SaleResponse>(`${endpoints.get}/${saleId}`)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default saleService;
