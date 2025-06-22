import api from './http.service';

const endpoints = {
	all: 'transactions/all',
	by_date: 'transactions/by-date',
	store: 'transactions/post',
	update: 'transactions/update',
	delete: 'transactions/transaction',
	show: 'transactions/transaction',
	summary: 'transactions/transaction',
	root: 'transactions',
};

const transactionService = {
	endpoints,

	async list(query = {}): Promise<Transaction[]> {
		return api
			.get<Transaction[]>(endpoints.all, query)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async store(data: Transaction): Promise<Transaction> {
		return api
			.post<ApiResponse<Transaction>>(endpoints.store, data as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	async update(
		id: string,
		data: Record<string, DataTypes>
	): Promise<Record<string, DataTypes>> {
		return api
			.put(`${endpoints.update}/${id}`, data)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async delete(id: string): Promise<DataTypes> {
		return api
			.delete(`${endpoints.delete}/${id}`)
			.then(() => true)
			.catch((err) => {
				throw err;
			});
	},

	async show(id: string): Promise<Transaction> {
		return api
			.get<Transaction>(`${endpoints.show}/${id}`)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async getSummary(id: string): Promise<any> {
		return api
			.get(`${endpoints.summary}/${id}/summary`)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async byDate(query = {}): Promise<Transaction[]> {
		return api
			.get<Transaction[]>(endpoints.by_date, query)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async getRoot(): Promise<string> {
		return api
			.get<string>(endpoints.root)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
};

export default transactionService;