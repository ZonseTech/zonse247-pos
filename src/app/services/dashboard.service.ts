import api from './http.service';

export interface DashboardQuery {
    branchId?: string;
}

export interface DashboardSummary {
    todaysRevenue: number;
    revenueDelta: number;
    todaysSalesCount: number;
    salesDelta: number;
    todaysGrossProfit: number;
    grossProfitDelta: number;
}

export interface DashboardDataPoint {
    label: string;
    value: number;
}

export interface RevenueTrendResponse {
    data: DashboardDataPoint[];
}

export interface PaymentMethodsResponse {
    data: DashboardDataPoint[];
}

export interface TopSellingProduct {
    name: string;
    unitsSold: number;
}

export interface TopProductsResponse {
    data: TopSellingProduct[];
}

export interface RecentSaleItem {
    id: string;
    customer: string;
    amount: number;
    time: string;
    status: 'completed' | 'refunded';
}

export interface RecentSalesResponse {
    data: RecentSaleItem[];
}

export interface LowStockItem {
    name: string;
    remaining: number;
    reorderPoint: number;
}

export interface LowStockResponse {
    data: LowStockItem[];
}

const endpoints = {
    summary: 'dashboard/summary',
    revenueTrend: 'dashboard/revenue-trend',
    paymentMethods: 'dashboard/payment-methods',
    topProducts: 'dashboard/top-products',
    recentSales: 'dashboard/recent-sales',
    lowStock: 'dashboard/low-stock',
};

const dashboardService = {
    endpoints,

    /**
     * GET /v1/dashboard/summary
     * Fetches today's revenue, sales count, and gross profit with day-over-day deltas
     */
    async getSummary(query: DashboardQuery = {}): Promise<DashboardSummary> {
        return api
            .get<ApiResponse<DashboardSummary>>(endpoints.summary, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/dashboard/revenue-trend
     * Fetches revenue for each of the last 7 days
     */
    async getRevenueTrend(query: DashboardQuery = {}): Promise<RevenueTrendResponse> {
        return api
            .get<ApiResponse<RevenueTrendResponse>>(endpoints.revenueTrend, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/dashboard/payment-methods
     * Fetches today's revenue grouped by payment method
     */
    async getPaymentMethods(query: DashboardQuery = {}): Promise<PaymentMethodsResponse> {
        return api
            .get<ApiResponse<PaymentMethodsResponse>>(endpoints.paymentMethods, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/dashboard/top-products
     * Fetches the top 10 best-selling products
     */
    async getTopProducts(query: DashboardQuery = {}): Promise<TopProductsResponse> {
        return api
            .get<ApiResponse<TopProductsResponse>>(endpoints.topProducts, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/dashboard/recent-sales
     * Fetches the most recent sales
     */
    async getRecentSales(query: DashboardQuery = {}): Promise<RecentSalesResponse> {
        return api
            .get<ApiResponse<RecentSalesResponse>>(endpoints.recentSales, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/dashboard/low-stock
     * Fetches inventory items at or below their reorder point
     */
    async getLowStock(query: DashboardQuery = {}): Promise<LowStockResponse> {
        return api
            .get<ApiResponse<LowStockResponse>>(endpoints.lowStock, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default dashboardService;
