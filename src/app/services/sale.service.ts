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
    receipt: 'sales/:saleId',
    printReceipt: 'sales/print-receipt',
};

const saleService = {
    endpoints,
    async createSale(payload: CreateSalePayload): Promise<Sale> {
        return api
            .post<SaleResponse>(endpoints.create, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

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

    async getReceipt(
        saleId: string,
        tenantId: string,
        branchId: string
    ): Promise<any> {
        return api
            .get<ApiResponse<any>>(`${endpoints.receipt.replace(':saleId', saleId)}`, {
                params: { tenantId, branchId },
            })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

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
