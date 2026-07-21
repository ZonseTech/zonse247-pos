import api from './http.service';

const endpoints: Record<string, string> = {
    all: 'payment-service-providers/all',
    byMethod: 'payment-service-providers/by-method',
    store: 'payment-service-providers/payment-service-provider',
    update: 'payment-service-providers/payment-service-provider',
    delete: 'payment-service-providers/payment-service-provider',
};

const paymentServiceProviderService = {
    endpoints,
    async list(query = {}): Promise<Array<PaymentServiceProvider>> {
        return api
            .get<ApiResponse<{ paymentServiceProviders: Array<PaymentServiceProvider> }>>(endpoints.all, query)
            .then((res) => res.data.data?.paymentServiceProviders || [])
            .catch((err) => {
                throw err;
            });
    },
    /** Providers for a payment method - the backend resolves channel leaves (e.g. POS, Bank Transfer) to their root (Bank) automatically. */
    async listByMethod(methodId: string): Promise<Array<PaymentServiceProvider>> {
        return api
            .get<ApiResponse<Array<PaymentServiceProvider>>>(`${endpoints.byMethod}/${methodId}`)
            .then((res) => res.data.data || [])
            .catch((err) => {
                throw err;
            });
    },
    async store(data: PaymentServiceProvider): Promise<PaymentServiceProvider> {
        return api
            .post(endpoints.store, data)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },
    async update(id: string, data: PaymentServiceProvider): Promise<PaymentServiceProvider> {
        return api
            .put(`${endpoints.update}/${id}`, data)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },
    async delete(id: string): Promise<any> {
        return api
            .delete(`${endpoints.delete}/${id}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default paymentServiceProviderService;
