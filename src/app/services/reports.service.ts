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

const endpoints = {
    summary: 'reports/summary',
    totalSales: 'reports/total-sales',
    grossProfit: 'reports/gross-profit',
};

const reportsService = {
    endpoints,

    /**
     * GET /api/v1/reports/summary
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
     * GET /api/v1/reports/total-sales
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
     * GET /api/v1/reports/gross-profit
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
};

export default reportsService;
