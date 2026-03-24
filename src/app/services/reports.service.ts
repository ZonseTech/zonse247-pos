import api from './http.service';

export interface ReportSummary {
    totalSales: number;
    grossProfit: number;
    topStocks: number;
    topCategory: string;
    receiptCount: number;
    paymentModes: number;
}

export interface ReportSummaryQuery {
    startDate?: string;
    endDate?: string;
    branchId?: string;
}

export interface TotalSalesDataPoint {
    label: string;
    value: number;
}

export interface TotalSalesTabData {
    data: TotalSalesDataPoint[];
}

export interface TotalSalesResponse {
    hourly: TotalSalesTabData;
    weekly: TotalSalesTabData;
    monthly: TotalSalesTabData;
}

export interface TotalSalesQuery {
    startDate?: string;
    endDate?: string;
    branchId?: string;
}

export interface GrossProfitDataPoint {
    label: string;
    value: number;
}

export interface GrossProfitTabData {
    data: GrossProfitDataPoint[];
}

export interface GrossProfitResponse {
    hourly: GrossProfitTabData;
    weekly: GrossProfitTabData;
    monthly: GrossProfitTabData;
}

export interface GrossProfitQuery {
    startDate?: string;
    endDate?: string;
    branchId?: string;
}

export interface ReceiptCountDataPoint {
    label: string;
    value: number;
}

export interface ReceiptCountTabData {
    data: ReceiptCountDataPoint[];
}

export interface ReceiptCountResponse {
    hourly: ReceiptCountTabData;
    weekly: ReceiptCountTabData;
    monthly: ReceiptCountTabData;
}

export interface ReceiptCountQuery {
    startDate?: string;
    endDate?: string;
    branchId?: string;
}

export interface PaymentModeDataPoint {
    label: string;
    value: number;
    transactions: number;
}

export interface PaymentModesResponse {
    data: PaymentModeDataPoint[];
}

export interface PaymentModesQuery {
    startDate?: string;
    endDate?: string;
    branchId?: string;
}

export interface TopStockItem {
    name: string;
    quantity: number;
    pricing: number;
}

export interface TopStocksResponse {
    data: TopStockItem[];
}

export interface TopStocksQuery {
    startDate?: string;
    endDate?: string;
    branchId?: string;
}

export interface TopCategoryItem {
    name: string;
    count: number;
    totalPrice: number;
}

export interface TopCategoryResponse {
    data: TopCategoryItem[];
}

export interface TopCategoryQuery {
    startDate?: string;
    endDate?: string;
    branchId?: string;
}

const endpoints = {
    summary: 'reports/summary',
    totalSales: 'reports/total-sales',
    grossProfit: 'reports/gross-profit',
    receiptCount: 'reports/receipt-count',
    paymentModes: 'reports/payment-modes',
    topStocks: 'reports/top-stocks',
    topCategory: 'reports/top-categories',
};

const reportsService = {
    endpoints,

    /**
     * GET /v1/reports/summary
     * Fetches the report summary data for mobile reports
     */
    async getSummary(query: ReportSummaryQuery = {}): Promise<ReportSummary> {
        return api
            .get<ApiResponse<ReportSummary>>(endpoints.summary, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/reports/total-sales
     * Fetches the total sales data for the revenue report
     */
    async getTotalSales(query: TotalSalesQuery = {}): Promise<TotalSalesResponse> {
        return api
            .get<ApiResponse<TotalSalesResponse>>(endpoints.totalSales, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/reports/gross-profit
     * Fetches the gross profit data for the profit report
     */
    async getGrossProfit(query: GrossProfitQuery = {}): Promise<GrossProfitResponse> {
        return api
            .get<ApiResponse<GrossProfitResponse>>(endpoints.grossProfit, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/reports/receipt-count
     * Fetches the receipt count data for the sales count report
     */
    async getReceiptCount(query: ReceiptCountQuery = {}): Promise<ReceiptCountResponse> {
        return api
            .get<ApiResponse<ReceiptCountResponse>>(endpoints.receiptCount, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/reports/payment-modes
     * Fetches the payment modes breakdown data
     */
    async getPaymentModes(query: PaymentModesQuery = {}): Promise<PaymentModesResponse> {
        return api
            .get<ApiResponse<PaymentModesResponse>>(endpoints.paymentModes, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/reports/top-stocks
     * Fetches the top 10 selling stocks data
     */
    async getTopStocks(query: TopStocksQuery = {}): Promise<TopStocksResponse> {
        return api
            .get<ApiResponse<TopStocksResponse>>(endpoints.topStocks, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/reports/top-category
     * Fetches the top category data with order count and total price
     */
    async getTopCategory(query: TopCategoryQuery = {}): Promise<TopCategoryResponse> {
        return api
            .get<ApiResponse<TopCategoryResponse>>(endpoints.topCategory, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default reportsService;
