import api from './http.service';

const endpoints = {
	all: 'transactions/all',
	hold: 'transactions/hold',
	on_hold: 'transactions/on-hold',
	customer_orders: 'transactions/customer-orders',
	by_date: 'transactions/by-date',
	store: 'transactions/new',
	update: 'transactions',
	delete: 'transactions/delete',
	show: 'transactions',
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
			.post(endpoints.store, data)
			.then((res) => res.data)
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
	async byDate(query = {}): Promise<Transaction[]> {
		return api
			.get<Transaction[]>(endpoints.by_date, query)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
};

export default transactionService;
