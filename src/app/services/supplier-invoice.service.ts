import { liveApi, getAuthHeaders } from './live-api.service';

/**
 * Supplier Invoice Service
 * Aligned with zonse247-pos-api v1.6.1
 *
 * 3-way match: PO (ordered) ↔ GRN (received) ↔ Invoice (billed)
 */

const endpoints = {
    root: 'supplier-invoices',
    create: 'supplier-invoices',
    list: 'supplier-invoices',
    get: (id: string) => `supplier-invoices/${id}`,
    update: (id: string) => `supplier-invoices/${id}`,
    cancel: (id: string) => `supplier-invoices/${id}/cancel`,
    dispute: (id: string) => `supplier-invoices/${id}/dispute`,
    delete: (id: string) => `supplier-invoices/${id}`,
    threeWayMatch: (poId: string) => `supplier-invoices/match/${poId}`,
    supplierBalance: (supplierId: string) =>
        `supplier-invoices/balance/${supplierId}`,
};

const supplierInvoiceService = {
    endpoints,

    /**
     * POST /supplier-invoices — Create a supplier invoice
     */
    async createInvoice(
        payload: CreateSupplierInvoiceInput
    ): Promise<SupplierInvoiceWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<SupplierInvoiceResponse>(endpoints.create, payload, { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /supplier-invoices — List invoices with filters
     */
    async listInvoices(
        query: SupplierInvoiceListQuery
    ): Promise<SupplierInvoiceListResponse['data']> {
        const params: Record<string, any> = {};
        Object.keys(query).forEach((key) => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });

        const headers = await getAuthHeaders();
        return liveApi
            .get<SupplierInvoiceListResponse>(endpoints.list, { headers, params })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /supplier-invoices/:id — Get single invoice
     */
    async getInvoice(invoiceId: string): Promise<SupplierInvoiceWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .get<SupplierInvoiceResponse>(endpoints.get(invoiceId), { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /supplier-invoices/:id — Update a PENDING invoice
     */
    async updateInvoice(
        invoiceId: string,
        payload: UpdateSupplierInvoiceInput
    ): Promise<SupplierInvoiceWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .put<SupplierInvoiceResponse>(
                endpoints.update(invoiceId),
                payload,
                { headers }
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /supplier-invoices/three-way-match/:purchaseOrderId
     * Compare ordered vs received vs invoiced for a PO
     */
    async threeWayMatch(
        purchaseOrderId: string
    ): Promise<ThreeWayMatchResult[]> {
        const headers = await getAuthHeaders();
        return liveApi
            .get<ThreeWayMatchResponse>(
                endpoints.threeWayMatch(purchaseOrderId),
                { headers }
            )
            .then((res) => {
                const data = res.data.data as any;
                return Array.isArray(data) ? data : (data?.matches || []);
            })
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /supplier-invoices/:id/cancel — Cancel a PENDING invoice
     */
    async cancelInvoice(invoiceId: string): Promise<void> {
        const headers = await getAuthHeaders();
        return liveApi
            .post(endpoints.cancel(invoiceId), {}, { headers })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /supplier-invoices/:id/dispute — Mark invoice as DISPUTED
     */
    async disputeInvoice(
        invoiceId: string,
        reason?: string
    ): Promise<SupplierInvoiceWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<SupplierInvoiceResponse>(
                endpoints.dispute(invoiceId),
                { reason },
                { headers }
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /supplier-invoices/supplier-balance/:supplierId
     * Get outstanding balance for a supplier
     */
    async getSupplierBalance(
        supplierId: string
    ): Promise<{ totalOutstanding: number; invoiceCount: number }> {
        const headers = await getAuthHeaders();
        return liveApi
            .get<SupplierBalanceResponse>(
                endpoints.supplierBalance(supplierId),
                { headers }
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * DELETE /supplier-invoices/:id — Soft-delete PENDING or CANCELLED invoice
     */
    async deleteInvoice(invoiceId: string): Promise<void> {
        const headers = await getAuthHeaders();
        return liveApi
            .delete(endpoints.delete(invoiceId), { headers })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },
};

export default supplierInvoiceService;
