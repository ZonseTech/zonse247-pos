import api from './http.service';

const endpoints: Record<string, string> = {
	all: 'payment-methods/all',
	store: 'payment-methods/payment-method',
	update: 'payment-methods/payment-method',
	delete: 'payment-methods/payment-method',
};

const paymentMethodService = {
	endpoints,
	async list(query = {}): Promise<Array<PaymentMethod>> {
		return api
			.get<ApiResponse<{ paymentMethods: Array<PaymentMethod> }>>(endpoints.all, query)
			.then((res) => res.data.data?.paymentMethods || [])
			.catch((err) => {
				throw err;
			});
	},
	async store(data: PaymentMethod): Promise<PaymentMethod> {
		return api
			.post(endpoints.store, data)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async update(id: string, data: PaymentMethod): Promise<PaymentMethod> {
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

export default paymentMethodService;
