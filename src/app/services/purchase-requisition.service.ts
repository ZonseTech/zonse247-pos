import { liveApi, getAuthHeaders } from './live-api.service';

/**
 * Purchase Requisition Service
 * Aligned with zonse247-pos-api v1.6.1
 *
 * Requisitions = internal requests for stock before a PO is raised.
 * Flow: PENDING → APPROVED / PARTIALLY_APPROVED / REJECTED → (link to PO)
 */

const endpoints = {
    root: 'purchase-requisitions',
    create: 'purchase-requisitions',
    list: 'purchase-requisitions',
    get: (id: string) => `purchase-requisitions/${id}`,
    update: (id: string) => `purchase-requisitions/${id}`,
    approve: (id: string) => `purchase-requisitions/${id}/approve`,
    reject: (id: string) => `purchase-requisitions/${id}/reject`,
    cancel: (id: string) => `purchase-requisitions/${id}/cancel`,
    delete: (id: string) => `purchase-requisitions/${id}`,
};

const purchaseRequisitionService = {
    endpoints,

    /**
     * POST /purchase-requisitions — Create a new requisition
     * Status defaults to PENDING. No inventory impact.
     */
    async createRequisition(
        payload: CreateRequisitionInput
    ): Promise<PurchaseRequisitionWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<RequisitionResponse>(endpoints.create, payload, { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /purchase-requisitions — List requisitions with filters
     */
    async listRequisitions(
        query: RequisitionListQuery
    ): Promise<RequisitionListResponse['data']> {
        const params: Record<string, any> = {};
        Object.keys(query).forEach((key) => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });

        const headers = await getAuthHeaders();
        return liveApi
            .get<RequisitionListResponse>(endpoints.list, { headers, params })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /purchase-requisitions/:id — Get single requisition
     */
    async getRequisition(
        requisitionId: string
    ): Promise<PurchaseRequisitionWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .get<RequisitionResponse>(endpoints.get(requisitionId), { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /purchase-requisitions/:id — Update a PENDING requisition
     */
    async updateRequisition(
        requisitionId: string,
        payload: UpdateRequisitionInput
    ): Promise<PurchaseRequisitionWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .put<RequisitionResponse>(
                endpoints.update(requisitionId),
                payload,
                { headers }
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /purchase-requisitions/:id/approve — Approve (full or partial)
     */
    async approveRequisition(
        requisitionId: string,
        payload?: ApproveRequisitionInput
    ): Promise<PurchaseRequisitionWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<RequisitionResponse>(
                endpoints.approve(requisitionId),
                payload ?? {},
                { headers }
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /purchase-requisitions/:id/reject — Reject a requisition
     */
    async rejectRequisition(
        requisitionId: string,
        payload?: RejectRequisitionInput
    ): Promise<PurchaseRequisitionWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<RequisitionResponse>(
                endpoints.reject(requisitionId),
                payload ?? {},
                { headers }
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /purchase-requisitions/:id/cancel — Cancel a requisition
     */
    async cancelRequisition(requisitionId: string): Promise<void> {
        const headers = await getAuthHeaders();
        return liveApi
            .post(endpoints.cancel(requisitionId), {}, { headers })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * DELETE /purchase-requisitions/:id — Soft-delete a requisition
     */
    async deleteRequisition(requisitionId: string): Promise<void> {
        const headers = await getAuthHeaders();
        return liveApi
            .delete(endpoints.delete(requisitionId), { headers })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },
};

export default purchaseRequisitionService;
