import api from './http.service';

const endpoints: Record<string, string> = {
	all: 'users/list',
	store: 'users',
	update: 'users',
	show: 'users/user',
	delete: 'users',
};

const usersService = {
	endpoints,
	async list(query = {}): Promise<User[]> {
		return api
			.get<ApiResponse<User[]>>(endpoints.all, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},
	async store(data: User): Promise<User> {
		return api
			.post(endpoints.store, data)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async update(id: string, data: Record<string, any>) {
		return api
			.put(`${endpoints.update}/${id}`, data)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async show(id: string): Promise<User> {
		return api
			.get<User>(`${endpoints.show}/${id}`)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async delete(id: string): Promise<{ status: boolean }> {
		return api
			.delete(`${endpoints.delete}/${id}`)
			.then((res) => res.data as { status: boolean })
			.catch((err) => {
				throw err;
			});
	},
};

export default usersService;
