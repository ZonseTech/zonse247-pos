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

const endpoints = {
    summary: 'reports/summary',
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
};

export default reportsService;
