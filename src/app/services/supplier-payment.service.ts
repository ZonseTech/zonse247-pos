import { liveApi, getAuthHeaders } from './live-api.service';

/**
 * Supplier Payment Service
 * Aligned with zonse247-pos-api v1.6.1
 *
 * Payments are allocated across one or more invoices.
 * Constraint: payment.amount === sum(allocations.allocatedAmount)
 */

const endpoints = {
    root: 'supplier-payments',
    create: 'supplier-payments',
    list: 'supplier-payments',
    get: (id: string) => `supplier-payments/${id}`,
    byInvoice: (invoiceId: string) => `supplier-payments/invoice/${invoiceId}`,
    void: (id: string) => `supplier-payments/${id}/void`,
};

const supplierPaymentService = {
    endpoints,

    /**
     * POST /supplier-payments — Create a payment with invoice allocations
     */
    async createPayment(
        payload: CreateSupplierPaymentInput
    ): Promise<SupplierPaymentWithAllocations> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<SupplierPaymentResponse>(endpoints.create, payload, { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /supplier-payments — List payments with filters
     */
    async listPayments(
        query: SupplierPaymentListQuery
    ): Promise<SupplierPaymentListResponse['data']> {
        const params: Record<string, any> = {};
        Object.keys(query).forEach((key) => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });

        const headers = await getAuthHeaders();
        return liveApi
            .get<SupplierPaymentListResponse>(endpoints.list, { headers, params })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /supplier-payments/:id — Get single payment with allocations
     */
    async getPayment(
        paymentId: string
    ): Promise<SupplierPaymentWithAllocations> {
        const headers = await getAuthHeaders();
        return liveApi
            .get<SupplierPaymentResponse>(endpoints.get(paymentId), { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /supplier-payments/invoice/:invoiceId — Get payments for a specific invoice
     */
    async getPaymentsForInvoice(
        invoiceId: string
    ): Promise<SupplierPaymentWithAllocations[]> {
        const headers = await getAuthHeaders();
        return liveApi
            .get<ApiResponse<{ payments?: SupplierPaymentWithAllocations[] }>>(
                endpoints.byInvoice(invoiceId),
                { headers }
            )
            .then((res) => {
                const data = res.data.data;
                return Array.isArray(data) ? data : (data?.payments || []);
            })
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /supplier-payments/:id/void — Void/cancel a COMPLETED payment
     * Reverses all allocations and restores invoice balances.
     */
    async voidPayment(
        paymentId: string,
        reason?: string
    ): Promise<void> {
        const headers = await getAuthHeaders();
        return liveApi
            .post(endpoints.void(paymentId), { reason }, { headers })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },
};

export default supplierPaymentService;
