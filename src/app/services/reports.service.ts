import api from './http.service';

export interface ServiceOrderSummary {
    totalRevenue: number;
    orderCount: number;
    totalConsumptionCost: number;
    grossProfit: number;
}

export interface ReportSummary {
    totalSales: number;
    expenses: number;
    netProfit: number;
    topStocks: number;
    topCategory: string;
    receiptCount: number;
    paymentModes: number;
    serviceOrders?: ServiceOrderSummary;
    combinedRevenue?: number;
    combinedGrossProfit?: number;
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

export interface NetProfitDataPoint {
    label: string;
    value: number;
}

export interface NetProfitTabData {
    data: NetProfitDataPoint[];
}

export interface NetProfitResponse {
    hourly: NetProfitTabData;
    weekly: NetProfitTabData;
    monthly: NetProfitTabData;
}

export interface NetProfitQuery {
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
    orderCount: number;
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

export interface ExpensesTrendDataPoint {
    label: string;
    value: number;
}

export interface ExpensesTrendTabData {
    data: ExpensesTrendDataPoint[];
}

export interface ExpensesTrendResponse {
    hourly: ExpensesTrendTabData;
    weekly: ExpensesTrendTabData;
    monthly: ExpensesTrendTabData;
}

export interface ExpensesTrendQuery {
    startDate?: string;
    endDate?: string;
    branchId?: string;
}

export interface ExpensesByCategoryItem {
    name: string;
    count: number;
    totalAmount: number;
}

export interface ExpensesByCategoryResponse {
    data: ExpensesByCategoryItem[];
}

export interface ExpensesByCategoryQuery {
    startDate?: string;
    endDate?: string;
    branchId?: string;
}

const endpoints = {
    summary: 'reports/summary',
    totalSales: 'reports/total-sales',
    netProfit: 'reports/net-profit',
    receiptCount: 'reports/receipt-count',
    paymentModes: 'reports/payment-modes',
    topStocks: 'reports/top-stocks',
    topCategory: 'reports/top-categories',
    expensesTrend: 'reports/expenses-trend',
    expensesByCategory: 'reports/expenses-by-category',
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
     * GET /v1/reports/net-profit
     * Fetches the net profit data for the profit report
     */
    async getNetProfit(query: NetProfitQuery = {}): Promise<NetProfitResponse> {
        return api
            .get<ApiResponse<NetProfitResponse>>(endpoints.netProfit, query)
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

    /**
     * GET /v1/reports/expenses-trend
     * Fetches approved expenses for the expenses trend report
     */
    async getExpensesTrend(query: ExpensesTrendQuery = {}): Promise<ExpensesTrendResponse> {
        return api
            .get<ApiResponse<ExpensesTrendResponse>>(endpoints.expensesTrend, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/reports/expenses-by-category
     * Fetches approved expenses grouped by category
     */
    async getExpensesByCategory(query: ExpensesByCategoryQuery = {}): Promise<ExpensesByCategoryResponse> {
        return api
            .get<ApiResponse<ExpensesByCategoryResponse>>(endpoints.expensesByCategory, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default reportsService;
