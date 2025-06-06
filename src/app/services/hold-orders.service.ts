import api from './http.service';

const endpoints = {
	all: 'hold-orders/all',
	store: 'hold-orders/new',
	till: 'hold-orders/till',
	user: 'hold-orders/user',
	show: 'hold-orders',
	delete: 'hold-orders/delete',
	update: 'hold-orders',
};

const holdOrderService = {
	endpoints,

	async list(query = {}): Promise<HoldOrder[]> {
		return api
			.get<HoldOrder[]>(endpoints.all, query)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async store(data: HoldOrder): Promise<HoldOrder> {
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

	async delete(id: string): Promise<boolean> {
		return api
			.delete(`${endpoints.update}/${id}`)
			.then(() => true)
			.catch((err) => {
				throw err;
			});
	},

	async show(id: string): Promise<HoldOrder> {
		return api
			.get<HoldOrder>(`${endpoints.show}/${id}`)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async byUser(userId: string): Promise<HoldOrder[]> {
		return api
			.get<HoldOrder[]>(`${endpoints.user}/${userId}`)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async byTill(tillId: string): Promise<HoldOrder[]> {
		return api
			.get<HoldOrder[]>(`${endpoints.till}/${tillId}`)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
};

export default holdOrderService;
