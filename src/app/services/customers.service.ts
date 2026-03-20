import api from './http.service';

const endpoints: Record<string, string> = {
	all: 'customers',
	store: 'customers',
	update: 'customers',
	delete: 'customers',
};

const customerSerive = {
	endpoints,
	async list(query = {}): Promise<Customer[]> {
		return api
			.get<ApiResponse<{ customers: Customer[]; pagination?: any }>>(endpoints.all, query)
			.then((res) => res.data.data?.customers || [])
			.catch((err) => {
				throw err;
			});
	},
	async listPaginated(query: Record<string, any> = {}): Promise<{ data: Customer[]; pagination: { total: number; page: number; limit: number; pages: number } }> {
		return api
			.get<ApiResponse<{ customers: Customer[]; pagination?: any }>>(endpoints.all, { ...query, paginated: true })
			.then((res) => ({
				data: res.data.data?.customers || [],
				pagination: res.data.data?.pagination || { total: 0, page: 1, limit: 10, pages: 1 },
			}))
			.catch((err) => {
				throw err;
			});
	},
	async store(data: Customer): Promise<Customer> {
		return api
			.post<ApiResponse<Customer>>(endpoints.store, data as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},
	async update(
		id: string,
		data: Record<string, any>
	): Promise<Record<string, any>> {
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

export default customerSerive;
