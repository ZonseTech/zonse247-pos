import api from './http.service';

/**
 * Supplier Return Service
 * Aligned with zonse247-pos-api v1.6.1
 *
 * Return flow: DRAFT → APPROVED → SHIPPED → COMPLETED | CANCELLED
 * Stock impact only at COMPLETED — inventory reduced, WAC adjusted, credit note generated.
 *
 * Also handles Credit Notes (sub-routes on /supplier-returns).
 */

const endpoints = {
    // Returns
    root: 'supplier-returns',
    create: 'supplier-returns',
    list: 'supplier-returns',
    get: (id: string) => `supplier-returns/${id}`,
    update: (id: string) => `supplier-returns/${id}`,
    approve: (id: string) => `supplier-returns/${id}/approve`,
    ship: (id: string) => `supplier-returns/${id}/ship`,
    complete: (id: string) => `supplier-returns/${id}/complete`,
    cancel: (id: string) => `supplier-returns/${id}/cancel`,
    delete: (id: string) => `supplier-returns/${id}`,

    // Credit Notes
    creditNotes: 'supplier-returns/credit-notes',
    applyCreditNote: (creditNoteId: string) =>
        `supplier-returns/credit-notes/${creditNoteId}/apply`,
};

const supplierReturnService = {
    endpoints,

    // ─── Returns ───────────────────────────────────────────────────────────

    /**
     * POST /supplier-returns — Create return in DRAFT status
     * No stock impact. Safe to draft/approve without touching inventory.
     */
    async createReturn(
        payload: CreateSupplierReturnInput
    ): Promise<SupplierReturnWithItems> {
        return api
            .post<SupplierReturnResponse>(endpoints.create, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /supplier-returns — List returns with filters
     */
    async listReturns(
        query: SupplierReturnListQuery
    ): Promise<SupplierReturnListResponse['data']> {
        const params: Record<string, any> = {};
        Object.keys(query).forEach((key) => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });

        return api
            .get<SupplierReturnListResponse>(endpoints.list, params)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /supplier-returns/:id — Get return with items + credit notes
     */
    async getReturn(
        supplierReturnId: string
    ): Promise<SupplierReturnWithItems> {
        return api
            .get<SupplierReturnResponse>(endpoints.get(supplierReturnId))
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /supplier-returns/:id — Update a DRAFT return
     */
    async updateReturn(
        supplierReturnId: string,
        payload: UpdateSupplierReturnInput
    ): Promise<SupplierReturnWithItems> {
        return api
            .put<SupplierReturnResponse>(
                endpoints.update(supplierReturnId),
                payload as any
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /supplier-returns/:id/approve — DRAFT → APPROVED
     * No stock impact.
     */
    async approveReturn(
        supplierReturnId: string,
        notes?: string
    ): Promise<SupplierReturnWithItems> {
        return api
            .post<SupplierReturnResponse>(
                endpoints.approve(supplierReturnId),
                { notes } as any
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /supplier-returns/:id/ship — APPROVED → SHIPPED
     * No stock impact — goods in transit.
     */
    async shipReturn(
        supplierReturnId: string,
        notes?: string
    ): Promise<SupplierReturnWithItems> {
        return api
            .post<SupplierReturnResponse>(
                endpoints.ship(supplierReturnId),
                { notes } as any
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /supplier-returns/:id/complete — → COMPLETED
     *
     * THIS is where stock impact happens:
     *   - RETURN_TO_SUPPLIER stock movement at original purchase cost
     *   - Inventory reduced, WAC adjusted
     *   - Credit note auto-generated (PENDING)
     */
    async completeReturn(
        supplierReturnId: string,
        notes?: string
    ): Promise<SupplierReturnWithItems> {
        return api
            .post<SupplierReturnResponse>(
                endpoints.complete(supplierReturnId),
                { notes } as any
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /supplier-returns/:id/cancel — → CANCELLED (from DRAFT or APPROVED)
     */
    async cancelReturn(
        supplierReturnId: string,
        notes?: string
    ): Promise<SupplierReturnWithItems> {
        return api
            .post<SupplierReturnResponse>(
                endpoints.cancel(supplierReturnId),
                { notes } as any
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * DELETE /supplier-returns/:id — Delete (DRAFT only)
     */
    async deleteReturn(supplierReturnId: string): Promise<void> {
        return api
            .delete(endpoints.delete(supplierReturnId))
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    // ─── Credit Notes ──────────────────────────────────────────────────────

    /**
     * GET /supplier-returns/credit-notes — List all credit notes
     */
    async listCreditNotes(
        query: CreditNoteListQuery
    ): Promise<CreditNoteListResponse['data']> {
        const params: Record<string, any> = {};
        Object.keys(query).forEach((key) => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });

        return api
            .get<CreditNoteListResponse>(endpoints.creditNotes, params)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /supplier-returns/credit-notes/:id/apply — Apply credit to an invoice
     * Reduces invoice balanceDue by credit note amount.
     */
    async applyCreditNote(
        creditNoteId: string,
        payload: ApplySupplierCreditNoteInput
    ): Promise<SupplierCreditNote> {
        return api
            .post<ApiResponse<SupplierCreditNote>>(
                endpoints.applyCreditNote(creditNoteId),
                payload as any
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default supplierReturnService;
