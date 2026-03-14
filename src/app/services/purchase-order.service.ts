import api from './http.service';

/**
 * Purchase Order Service
 * Aligned with zonse247-pos-api module
 * Core of the inventory workflow: "Orders show intent, receipts confirm reality"
 */

const endpoints = {
    root: 'purchase-orders',
    create: 'purchase-orders',
    list: 'purchase-orders',
    get: (id: string) => `purchase-orders/${id}`,
    receive: (id: string) => `purchase-orders/${id}/receive`,
    cancel: (id: string) => `purchase-orders/${id}/cancel`,
};

const purchaseOrderService = {
    endpoints,

    /**
     * POST /purchase-orders - Create a new purchase order
     * IMPORTANT: This does NOT change inventory until received
     */
    async createPurchaseOrder(payload: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
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
        const params: Record<string, any> = {};
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
    async getPurchaseOrder(purchaseOrderId: string): Promise<PurchaseOrder> {
        return api
            .get<PurchaseOrderResponse>(endpoints.get(purchaseOrderId))
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
        payload: ReceivePurchaseOrderInput
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
    async cancelPurchaseOrder(purchaseOrderId: string): Promise<void> {
        return api
            .post(
                endpoints.cancel(purchaseOrderId),
                {}
            )
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },
};

export default purchaseOrderService;
