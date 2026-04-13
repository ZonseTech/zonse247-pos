import api from './http.service';

const BASE = 'service-orders';

const serviceOrderService = {
    // ─── CRUD ──────────────────────────────────────────────────────────────────

    async create(payload: CreateServiceOrderInput): Promise<ServiceOrderWithItems> {
        return api
            .post<ApiResponse<ServiceOrderWithItems>>(BASE, payload as any)
            .then((res) => res.data.data);
    },

    async list(query: ServiceOrderListQuery = {}): Promise<ServiceOrderListResponse> {
        return api
            .get<ApiResponse<ServiceOrderListResponse>>(BASE, query)
            .then((res) => res.data.data);
    },

    async get(serviceOrderId: string): Promise<ServiceOrderWithItems> {
        return api
            .get<ApiResponse<ServiceOrderWithItems>>(`${BASE}/${serviceOrderId}`)
            .then((res) => res.data.data);
    },

    async update(serviceOrderId: string, payload: UpdateServiceOrderInput): Promise<ServiceOrderWithItems> {
        return api
            .put<ApiResponse<ServiceOrderWithItems>>(`${BASE}/${serviceOrderId}`, payload as any)
            .then((res) => res.data.data);
    },

    // ─── Order lifecycle ───────────────────────────────────────────────────────

    async startOrder(serviceOrderId: string): Promise<ServiceOrderWithItems> {
        return api
            .post<ApiResponse<ServiceOrderWithItems>>(`${BASE}/${serviceOrderId}/start`)
            .then((res) => res.data.data);
    },

    async cancelOrder(serviceOrderId: string): Promise<ServiceOrderWithItems> {
        return api
            .post<ApiResponse<ServiceOrderWithItems>>(`${BASE}/${serviceOrderId}/cancel`)
            .then((res) => res.data.data);
    },

    // ─── Item lifecycle ────────────────────────────────────────────────────────

    async startItem(serviceOrderId: string, itemId: string): Promise<ServiceOrderWithItems> {
        return api
            .post<ApiResponse<ServiceOrderWithItems>>(`${BASE}/${serviceOrderId}/items/${itemId}/start`)
            .then((res) => res.data.data);
    },

    async completeItem(serviceOrderId: string, itemId: string, data?: CompleteItemInput): Promise<ServiceOrderWithItems> {
        return api
            .post<ApiResponse<ServiceOrderWithItems>>(`${BASE}/${serviceOrderId}/items/${itemId}/complete`, (data || {}) as any)
            .then((res) => res.data.data);
    },

    async cancelItem(serviceOrderId: string, itemId: string): Promise<ServiceOrderWithItems> {
        return api
            .post<ApiResponse<ServiceOrderWithItems>>(`${BASE}/${serviceOrderId}/items/${itemId}/cancel`)
            .then((res) => res.data.data);
    },

    // ─── Payments ──────────────────────────────────────────────────────────────

    async recordPayment(serviceOrderId: string, payments: ServiceOrderPaymentInput[]): Promise<ServiceOrderWithItems> {
        return api
            .post<ApiResponse<ServiceOrderWithItems>>(`${BASE}/${serviceOrderId}/payments`, { payments } as any)
            .then((res) => res.data.data);
    },

    async listPayments(serviceOrderId: string): Promise<SalePayment[]> {
        return api
            .get<ApiResponse<ServiceOrderPaymentListResponse>>(`${BASE}/${serviceOrderId}/payments`)
            .then((res) => res.data.data.payments || []);
    },

};

export default serviceOrderService;
