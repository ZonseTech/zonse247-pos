import api from './http.service';

/**
 * Supplier Service
 * Handles all supplier-related API calls for purchase order management
 */

const endpoints = {
    root: 'suppliers',

    // CRUD
    create: 'suppliers',
    update: 'suppliers',
    delete: 'suppliers',
    get: 'suppliers',
    list: 'suppliers',

    // Search
    search: 'suppliers/search',
    byCode: 'suppliers/code',

    // Statistics
    stats: 'suppliers/stats',
};

const supplierService = {
    endpoints,

    /**
     * POST /suppliers - Create a new supplier
     */
    async createSupplier(payload: CreateSupplierPayload): Promise<Supplier> {
        return api
            .post<SupplierResponse>(endpoints.create, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /suppliers - List suppliers with pagination and filters
     */
    async listSuppliers(query: SupplierListQuery): Promise<SupplierListResponse['data']> {
        // Build params object, filtering out undefined/null/empty values
        const params: any = {};
        Object.keys(query).forEach(key => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });

        return api
            .get<SupplierListResponse>(endpoints.list, params)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /suppliers/:id - Get supplier by ID
     */
    async getSupplier(
        supplierId: string,
        tenantId?: string,
        branchId?: string
    ): Promise<Supplier> {
        return api
            .get<SupplierResponse>(`${endpoints.get}/${supplierId}`, tenantId && branchId ? { tenantId, branchId } : {})
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /suppliers/code/:code - Get supplier by code
     */
    async getSupplierByCode(
        code: string,
        tenantId: string,
        branchId: string
    ): Promise<Supplier> {
        return api
            .get<SupplierResponse>(`${endpoints.byCode}/${encodeURIComponent(code)}`, { tenantId, branchId })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /suppliers/search - Search suppliers
     */
    async searchSuppliers(
        term: string,
        tenantId: string,
        branchId: string
    ): Promise<Supplier[]> {
        return api
            .get<ApiResponse<Supplier[]>>(`${endpoints.search}`, { term, tenantId, branchId })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /suppliers/:id - Update supplier
     */
    async updateSupplier(
        supplierId: string,
        payload: UpdateSupplierPayload
    ): Promise<Supplier> {
        return api
            .put<SupplierResponse>(`${endpoints.update}/${supplierId}`, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * DELETE /suppliers/:id - Delete supplier (soft delete)
     */
    async deleteSupplier(
        supplierId: string,
        tenantId?: string,
        branchId?: string
    ): Promise<void> {
        return api
            .delete(`${endpoints.delete}/${supplierId}`, tenantId && branchId ? { tenantId, branchId } : {})
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /suppliers/:id/stats - Get supplier statistics
     */
    async getSupplierStats(
        supplierId: string,
        tenantId: string,
        branchId: string
    ): Promise<{
        totalOrders: number;
        totalPurchaseValue: number;
        lastOrderDate?: string;
        averageOrderValue: number;
    }> {
        return api
            .get<ApiResponse<any>>(`${endpoints.stats}/${supplierId}`, { tenantId, branchId })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default supplierService;
