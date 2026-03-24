import { liveApi, getAuthHeaders } from './live-api.service';

/**
 * Goods Receipt Service
 * Aligned with zonse247-pos-api v1.6.1
 *
 * GRN flow: DRAFT → VERIFIED → POSTED
 *   - DRAFT: quantity entry, editable
 *   - VERIFIED: confirmed correct, no stock impact
 *   - POSTED: stock updated, movements created (irreversible)
 *
 * Multiple GRNs per PO allowed (partial deliveries).
 */

const endpoints = {
    root: 'goods-receipts',
    create: 'goods-receipts',
    list: 'goods-receipts',
    get: (id: string) => `goods-receipts/${id}`,
    update: (id: string) => `goods-receipts/${id}`,
    verify: (id: string) => `goods-receipts/${id}/verify`,
    post: (id: string) => `goods-receipts/${id}/post`,
    cancel: (id: string) => `goods-receipts/${id}/cancel`,
    delete: (id: string) => `goods-receipts/${id}`,
};

const goodsReceiptService = {
    endpoints,

    /**
     * POST /goods-receipts — Create a GRN in DRAFT status against a PO.
     * No stock impact at this stage.
     */
    async createGoodsReceipt(
        payload: CreateGoodsReceiptInput
    ): Promise<GoodsReceiptWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<GoodsReceiptResponse>(endpoints.create, payload, { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /goods-receipts — List GRNs with filters
     */
    async listGoodsReceipts(
        query: GoodsReceiptListQuery
    ): Promise<GoodsReceiptListResponse['data']> {
        const params: Record<string, any> = {};
        Object.keys(query).forEach((key) => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });

        const headers = await getAuthHeaders();
        return liveApi
            .get<GoodsReceiptListResponse>(endpoints.list, { headers, params })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /goods-receipts/:id — Get single GRN
     */
    async getGoodsReceipt(
        goodsReceiptId: string
    ): Promise<GoodsReceiptWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .get<GoodsReceiptResponse>(endpoints.get(goodsReceiptId), { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /goods-receipts/:id — Update a DRAFT GRN
     */
    async updateGoodsReceipt(
        goodsReceiptId: string,
        payload: UpdateGoodsReceiptInput
    ): Promise<GoodsReceiptWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .put<GoodsReceiptResponse>(
                endpoints.update(goodsReceiptId),
                payload,
                { headers }
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /goods-receipts/:id/verify — Verify a DRAFT GRN (DRAFT → VERIFIED)
     * Confirms the quantities. No stock impact yet.
     */
    async verifyGoodsReceipt(
        goodsReceiptId: string,
        payload?: VerifyGoodsReceiptInput
    ): Promise<GoodsReceiptWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<GoodsReceiptResponse>(
                endpoints.verify(goodsReceiptId),
                payload ?? {},
                { headers }
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /goods-receipts/:id/post — Post a VERIFIED GRN (VERIFIED → POSTED)
     *
     * THIS is where stock is actually updated:
     *   - Creates StockMovement (PURCHASE_RECEIPT, referenceType=GOODS_RECEIPT)
     *   - Updates Inventory (available_quantity, average_cost, last_purchase_cost)
     *   - May transition the PO to PARTIALLY_RECEIVED or RECEIVED
     */
    async postGoodsReceipt(
        goodsReceiptId: string,
        payload?: PostGoodsReceiptInput
    ): Promise<GoodsReceiptWithItems> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<GoodsReceiptResponse>(
                endpoints.post(goodsReceiptId),
                payload ?? {},
                { headers }
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /goods-receipts/:id/cancel — Cancel a GRN (DRAFT or VERIFIED only)
     */
    async cancelGoodsReceipt(goodsReceiptId: string): Promise<void> {
        const headers = await getAuthHeaders();
        return liveApi
            .post(endpoints.cancel(goodsReceiptId), {}, { headers })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * DELETE /goods-receipts/:id — Soft-delete a GRN (DRAFT or CANCELLED only)
     */
    async deleteGoodsReceipt(goodsReceiptId: string): Promise<void> {
        const headers = await getAuthHeaders();
        return liveApi
            .delete(endpoints.delete(goodsReceiptId), { headers })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },
};

export default goodsReceiptService;
