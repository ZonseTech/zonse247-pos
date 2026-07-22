import { liveApi, getAuthHeaders } from './live-api.service';

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

    // Product history
    products: (id: string) => `suppliers/${id}/products`,
};

const supplierService = {
    endpoints,

    /**
     * POST /suppliers - Create a new supplier
     */
    async createSupplier(payload: CreateSupplierPayload): Promise<Supplier> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<SupplierResponse>(endpoints.create, payload, { headers })
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

        const headers = await getAuthHeaders();
        return liveApi
            .get<SupplierListResponse>(endpoints.list, { headers, params })
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
        const headers = await getAuthHeaders();
        return liveApi
            .get<SupplierResponse>(`${endpoints.get}/${supplierId}`, {
                headers,
                params: tenantId && branchId ? { tenantId, branchId } : {},
            })
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
        const headers = await getAuthHeaders();
        return liveApi
            .get<SupplierResponse>(`${endpoints.byCode}/${encodeURIComponent(code)}`, {
                headers,
                params: { tenantId, branchId },
            })
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
        const headers = await getAuthHeaders();
        return liveApi
            .get<ApiResponse<{ suppliers?: Supplier[] }>>(`${endpoints.search}`, {
                headers,
                params: { term, tenantId, branchId },
            })
            .then((res) => {
                const data = res.data.data;
                return Array.isArray(data) ? data : (data?.suppliers || []);
            })
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
        const headers = await getAuthHeaders();
        return liveApi
            .put<SupplierResponse>(`${endpoints.update}/${supplierId}`, payload, { headers })
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
        const headers = await getAuthHeaders();
        return liveApi
            .delete(`${endpoints.delete}/${supplierId}`, {
                headers,
                params: tenantId && branchId ? { tenantId, branchId } : {},
            })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /suppliers/:id/products - Products historically supplied by this supplier
     */
    async getSupplierProductHistory(supplierId: string): Promise<SupplierProductHistoryItem[]> {
        const headers = await getAuthHeaders();
        return liveApi
            .get<SupplierProductHistoryResponse>(endpoints.products(supplierId), { headers })
            .then((res) => res.data.data)
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
        const headers = await getAuthHeaders();
        return liveApi
            .get<ApiResponse<any>>(`${endpoints.stats}/${supplierId}`, {
                headers,
                params: { tenantId, branchId },
            })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default supplierService;
