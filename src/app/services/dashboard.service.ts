import api from './http.service';

const endpoints = {
	monthlySales: 'analytics/monthly-sales',
	topProducts: 'analytics/top-products',
	counts: 'analytics/counts',
	transactions: 'analytics/transactions',
	transactionItems: 'analytics/transaction',
	transactionDetails: 'analytics/transaction',
};

const dashboardService = {
	endpoints,

	async monthlySales(monthYear: string): Promise<MonthlySales[]> {
		return api
			.get<MonthlySales[]>(`${endpoints.monthlySales}/${monthYear}`)
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

	async counts(): Promise<DashboardCounts> {
		return api
			.get<DashboardCounts>(endpoints.counts)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async transactions(limit: number, offset = 0) {
		return api
			.get<{
				total: number;
				hasMore: boolean;
				transactions: Array<Transaction>;
			}>(`${endpoints.transactions}/${limit}/${offset}`)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async transactionItems(transactionId: string) {
		return api
			.get<Array<CartItem>>(
				`${endpoints.transactionItems}/${transactionId}/items`
			)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},

	async transactionDetails(transactionId: string) {
		return api
			.get<Transaction>(
				`${endpoints.transactionDetails}/${transactionId}/details`
			)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
};

export default dashboardService;
