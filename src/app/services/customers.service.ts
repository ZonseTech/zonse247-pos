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
			.get<ApiResponse<Customer[]>>(endpoints.all, query)
			.then((res) => res.data.data)
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
