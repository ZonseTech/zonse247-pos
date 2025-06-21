import api from './http.service';

const endpoints: Record<string, string> = {
	all: 'categories/all',
	store: 'categories/category',
	update: 'categories/category',
	delete: 'categories/category',
};

const categoriesSerive = {
	endpoints,
	async list(query = {}): Promise<Category[]> {
		return api
			.get<ApiResponse<Category[]>>(endpoints.all, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},
	async store(data: Record<string, any>): Promise<Record<string, any>> {
		return api
			.post(endpoints.store, data)
			.then((res) => res.data)
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

export default categoriesSerive;
