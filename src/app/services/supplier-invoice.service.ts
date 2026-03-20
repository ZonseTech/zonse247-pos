import api from './http.service';

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
        return api
            .post<SupplierInvoiceResponse>(endpoints.create, payload as any)
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

        return api
            .get<SupplierInvoiceListResponse>(endpoints.list, params)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /supplier-invoices/:id — Get single invoice
     */
    async getInvoice(invoiceId: string): Promise<SupplierInvoiceWithItems> {
        return api
            .get<SupplierInvoiceResponse>(endpoints.get(invoiceId))
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
        return api
            .put<SupplierInvoiceResponse>(
                endpoints.update(invoiceId),
                payload as any
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
        return api
            .get<ThreeWayMatchResponse>(
                endpoints.threeWayMatch(purchaseOrderId)
            )
            .then((res) => {
                const data = res.data.data;
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
        return api
            .post(endpoints.cancel(invoiceId), {})
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
        return api
            .post<SupplierInvoiceResponse>(
                endpoints.dispute(invoiceId),
                { reason } as any
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
        return api
            .get<SupplierBalanceResponse>(
                endpoints.supplierBalance(supplierId)
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
        return api
            .delete(endpoints.delete(invoiceId))
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },
};

export default supplierInvoiceService;
