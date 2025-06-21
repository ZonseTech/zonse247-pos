import api from './http.service';

const endpoints = {
	monthlySales: 'dashboard/monthly-sales',
	topProducts: 'dashboard/top-products',
	counts: 'dashboard/counts',
	transactions: 'dashboard/transactions',
};

const dashboardService = {
	endpoints,

	async monthlySales(
		userId: string,
		monthYear: string
	): Promise<MonthlySales[]> {
		return api
			.get<MonthlySales[]>(
				endpoints.monthlySales + '/' + userId + '/' + monthYear
			)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async topProducts(): Promise<TopProduct[]> {
		return api
			.get<TopProduct[]>(endpoints.topProducts)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async counts(userId: string): Promise<DashboardCounts> {
		return api
			.get<DashboardCounts>(endpoints.counts + '/' + userId)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async transactions(userId: string, limit: number, offset = 0) {
		return api
			.get<{
				total: number;
				hasMore: boolean;
				transactions: Array<Transaction>;
			}>(`${endpoints.transactions}/${userId}/${limit}/${offset}`, {
				includeItems: true,
			})
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
};

export default dashboardService;
