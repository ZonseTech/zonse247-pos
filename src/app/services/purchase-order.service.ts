import api from './http.service';

/**
 * Purchase Order Service
 * Core of the inventory workflow: "Orders show intent, receipts confirm reality"
 */

const endpoints = {
    root: 'purchase-orders',
    create: 'purchase-orders',
    update: 'purchase-orders',
    delete: 'purchase-orders',
    get: 'purchase-orders',
    list: 'purchase-orders',
    receive: (id: string) => `purchase-orders/${id}/receive`,
    cancel: (id: string) => `purchase-orders/${id}/cancel`,
    lock: (id: string) => `purchase-orders/${id}/lock`,
    unlock: (id: string) => `purchase-orders/${id}/unlock`,
    stats: 'purchase-orders/stats',
    bySupplier: 'purchase-orders/by-supplier',
};

const purchaseOrderService = {
    endpoints,

    /**
     * POST /purchase-orders - Create a new purchase order
     * IMPORTANT: This does NOT change inventory until received
     */
    async createPurchaseOrder(payload: CreatePurchaseOrderPayload): Promise<PurchaseOrder> {
        return api
            .post<PurchaseOrderResponse>(endpoints.create, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /purchase-orders - List purchase orders with filters
     */
    async listPurchaseOrders(
        query: PurchaseOrderListQuery
    ): Promise<PurchaseOrderListResponse['data']> {
        // Build params object, filtering out undefined/null/empty values
        const params: any = {};
        Object.keys(query).forEach(key => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });

        return api
            .get<PurchaseOrderListResponse>(endpoints.list, params)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /purchase-orders/:id - Get purchase order by ID
     */
    async getPurchaseOrder(
        purchaseOrderId: string,
        tenantId?: string,
        branchId?: string
    ): Promise<PurchaseOrder> {
        return api
            .get<PurchaseOrderResponse>(`${endpoints.get}/${purchaseOrderId}`, tenantId && branchId ? { tenantId, branchId } : {})
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /purchase-orders/:id - Update purchase order
     * Only allowed if status is DRAFT or PENDING
     */
    async updatePurchaseOrder(
        purchaseOrderId: string,
        payload: UpdatePurchaseOrderPayload
    ): Promise<PurchaseOrder> {
        return api
            .put<PurchaseOrderResponse>(`${endpoints.update}/${purchaseOrderId}`, payload as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /purchase-orders/:id/receive - Receive purchase order
     * THIS IS WHERE INVENTORY IS UPDATED
     * 
     * What happens behind the scenes:
     * 1. Inventory is updated:
     *    - availableQuantity += receivedQuantity
     *    - damagedQuantity += damagedQuantity
     *    - averageCost is recalculated (weighted average)
     *    - lastPurchaseCost = unitPrice
     * 
     * 2. Stock movements are created:
     *    - Movement 1: PURCHASE_RECEIPT (+receivedQuantity to available)
     *    - Movement 2: DAMAGE (+damagedQuantity to damaged) if any
     * 
     * 3. PO status changes to RECEIVED or PARTIALLY_RECEIVED
     */
    async receivePurchaseOrder(
        purchaseOrderId: string,
        payload: ReceivePurchaseOrderPayload
    ): Promise<PurchaseOrder> {
        return api
            .post<PurchaseOrderResponse>(
                endpoints.receive(purchaseOrderId),
                payload as any
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /purchase-orders/:id/cancel - Cancel purchase order
     * Only allowed if not yet received
     */
    async cancelPurchaseOrder(
        purchaseOrderId: string,
        payload: CancelPurchaseOrderPayload
    ): Promise<PurchaseOrder> {
        return api
            .post<PurchaseOrderResponse>(
                endpoints.cancel(purchaseOrderId),
                payload as any
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /purchase-orders/:id/lock - Lock purchase order
     * Prevents further modifications
     */
    async lockPurchaseOrder(
        purchaseOrderId: string,
        tenantId: string,
        branchId: string
    ): Promise<PurchaseOrder> {
        return api
            .post<PurchaseOrderResponse>(
                endpoints.lock(purchaseOrderId),
                { tenantId, branchId } as any
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /purchase-orders/:id/unlock - Unlock purchase order
     */
    async unlockPurchaseOrder(
        purchaseOrderId: string,
        tenantId: string,
        branchId: string
    ): Promise<PurchaseOrder> {
        return api
            .post<PurchaseOrderResponse>(
                endpoints.unlock(purchaseOrderId),
                { tenantId, branchId } as any
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * DELETE /purchase-orders/:id - Delete purchase order
     * Only allowed if status is DRAFT
     */
    async deletePurchaseOrder(
        purchaseOrderId: string,
        tenantId: string,
        branchId: string
    ): Promise<void> {
        return api
            .delete(`${endpoints.delete}/${purchaseOrderId}`, { tenantId, branchId })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /purchase-orders/stats - Get purchase order statistics
     */
    async getPurchaseOrderStats(
        tenantId?: string,
        branchId?: string,
        startDate?: string,
        endDate?: string
    ): Promise<PurchaseOrderStats> {
        const params: any = {};
        if (tenantId) params.tenantId = tenantId;
        if (branchId) params.branchId = branchId;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        return api
            .get<ApiResponse<PurchaseOrderStats>>(endpoints.stats, params)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /purchase-orders/by-supplier/:supplierId - Get POs by supplier
     */
    async getPurchaseOrdersBySupplier(
        supplierId: string,
        tenantId: string,
        branchId: string,
        status?: PurchaseOrderStatus
    ): Promise<PurchaseOrder[]> {
        return api
            .get<ApiResponse<PurchaseOrder[]>>(`${endpoints.bySupplier}/${supplierId}`, { tenantId, branchId, status })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default purchaseOrderService;
