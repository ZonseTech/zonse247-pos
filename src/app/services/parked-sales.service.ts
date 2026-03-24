import api from './http.service';

/**
 * Parked Sales Service
 * For temporarily saving sales that will be completed later
 * 
 * API Endpoints:
 * - POST /v1/sales/parked - Park a sale
 * - GET /v1/sales/parked/list - List all parked sales
 * - GET /v1/sales/parked/count - Get parked sales count by status
 * - GET /v1/sales/parked/:holdOrderId - Get a specific parked sale
 * - PUT /v1/sales/parked/:holdOrderId - Update a parked sale
 * - POST /v1/sales/parked/:holdOrderId/resume - Resume a parked sale
 * - DELETE /v1/sales/parked/:holdOrderId - Delete a parked sale
 */

const endpoints = {
    root: 'parked-sales',
    park: 'parked-sales',
    list: 'parked-sales/list',
    count: 'parked-sales/count',
    show: 'parked-sales',
    update: 'parked-sales',
    resume: 'parked-sales',
    delete: 'parked-sales',
};

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface ParkedSalesCountResponse {
    parked: number;
    resumed: number;
    voided: number;
    total: number;
}

const parkedSalesService = {
    endpoints,

    /**
     * POST /v1/sales/parked - Park a sale
     * 
     * What happens:
     * 1. Cart items are saved with current prices
     * 2. Customer info is preserved if selected
     * 3. Sale is marked as PARKED with timestamp
     * 4. Inventory is NOT reduced (items still available for other sales)
     */
    async create(payload: CreateParkedSalePayload): Promise<ParkedSale> {
        return api
            .post<ApiResponse<ParkedSale>>(endpoints.park, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/sales/parked/list - List all parked sales with filters
     */
    async list(query: Partial<ParkedSaleListQuery> = {}): Promise<{ parkedSales: ParkedSale[]; pagination: any }> {
        return api
            .get<ApiResponse<{ parkedSales: ParkedSale[]; pagination: any }>>(endpoints.list, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/sales/parked/count - Get parked sales count by status
     */
    async getCount(query: { branchId?: string; userId?: string; status?: ParkedSaleStatus } = {}): Promise<ParkedSalesCountResponse> {
        return api
            .get<ApiResponse<ParkedSalesCountResponse>>(endpoints.count, query)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /v1/sales/parked/:holdOrderId - Get a specific parked sale
     */
    async show(holdOrderId: string): Promise<ParkedSale> {
        return api
            .get<ApiResponse<ParkedSale>>(`${endpoints.show}/${holdOrderId}`)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /v1/sales/parked/:holdOrderId - Update a parked sale
     */
    async update(holdOrderId: string, payload: Partial<CreateParkedSalePayload>): Promise<ParkedSale> {
        return api
            .put<ApiResponse<ParkedSale>>(`${endpoints.update}/${holdOrderId}`, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /v1/sales/parked/:holdOrderId/resume - Resume a parked sale (load to cart)
     * 
     * What happens:
     * 1. Parked sale status is updated to RESUMED
     * 2. Items are returned for loading into cart
     * 3. Original parked sale record is kept for audit
     */
    async resume(holdOrderId: string, payload: ResumeParkedSalePayload): Promise<ParkedSale> {
        return api
            .post<ApiResponse<ParkedSale>>(`${endpoints.resume}/${holdOrderId}/resume`, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * DELETE /v1/sales/parked/:holdOrderId - Delete a parked sale
     */
    async delete(holdOrderId: string): Promise<boolean> {
        return api
            .delete(`${endpoints.delete}/${holdOrderId}`)
            .then(() => true)
            .catch((err) => {
                throw err;
            });
    },
};

export default parkedSalesService;
