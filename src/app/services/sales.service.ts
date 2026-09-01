import api from './http.service';

export interface DayCloseReportRow {
	date: string;
	unitsSold: number;
	revenue: number;
	costOfSales: number;
	grossProfit: number;
	expenses: number;
	netProfit: number;
}

export interface DayCloseReportQuery {
	startDate?: string;
	endDate?: string;
}

export interface DayCloseReportSummary {
	revenue: number;
	costOfSales: number;
	grossProfit: number;
	expenses: number;
	netProfit: number;
}

export interface DayCloseReportSaleEntry {
	id: string;
	saleNumber: string;
	saleDate: string;
	status: string;
	itemCount: number;
	totalAmount: number;
	discountAmount: number;
}

export interface DayCloseReportExpenseEntry {
	id: string;
	expenseNumber: string;
	categoryName: string;
	amount: number;
	expenseDate: string;
	status: string;
}

export interface DayCloseReportPaymentMethodEntry {
	methodId: string;
	methodName: string;
	amount: number;
}

export interface DayCloseReportItemEntry {
	variantId: string;
	name: string;
	code: string;
	unitPrice: number;
	openingBalance: number;
	goodsReceived: number;
	bookBalance: number;
	physicalCount: number;
	quantitySold: number;
	salesValue: number;
}

export interface DayCloseReportDetails extends DayCloseReportRow {
	sales: DayCloseReportSaleEntry[];
	items: DayCloseReportItemEntry[];
	expenseRecords: DayCloseReportExpenseEntry[];
	paymentMethods: DayCloseReportPaymentMethodEntry[];
}

export interface BatchVoidResult {
	voidedCount: number;
	sales: { id: string; saleNumber: string }[];
}

/**
 * Sales Service (migrated from transactions)
 * 
 * API Migration Notes:
 * - The API has migrated from 'transactions' to 'sales' endpoints
 * - Sale model replaces Transaction model with enhanced features
 * - Supports multiple payment methods per sale
 * - Integrated inventory reduction on sale creation
 */

const endpoints = {
	// New sales endpoints
	list: 'sales',
	create: 'sales',
	show: 'sales',
	void: 'sales',
	summary: 'sales/summaries',
	dayCloseReport: 'sales/day-close-report',
	dayCloseReportSummary: 'sales/day-close-report/summary',
	dayCloseReportDetails: (date: string) => `sales/day-close-report/${date}`,
	voidBatch: 'sales/void-batch',

	// Legacy endpoint mappings (for backward compatibility)
	all: 'sales',
	store: 'sales',
	root: 'sales',
};

const transactionService = {
	endpoints,

	/**
	 * List all sales with pagination and filters
	 * GET /sales
	 */
	async list(query: SaleQueryParams = {}): Promise<{ sales: Sale[]; pagination: any }> {
		return api
			.get<ApiResponse<{ sales: Sale[]; pagination: any }>>(endpoints.list, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Create a new sale
	 * POST /sales
	 * 
	 * What happens behind the scenes:
	 * 1. Stock availability is checked
	 * 2. Inventory is reduced (availableQuantity -= quantity)
	 * 3. Stock movement is created (type: SALE)
	 * 4. Sale is marked as COMPLETED
	 */
	async store(data: CreateSalePayload): Promise<Sale> {
		return api
			.post<ApiResponse<Sale>>(endpoints.create, data as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Get sale by ID
	 * GET /sales/:saleId
	 */
	async show(id: string): Promise<Sale> {
		return api
			.get<ApiResponse<Sale>>(`${endpoints.show}/${id}`)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Void a sale (reverses inventory)
	 * POST /sales/:saleId/void
	 * 
	 * What happens:
	 * 1. Sale status is set to VOIDED
	 * 2. Inventory is reversed (stock added back)
	 * 3. Stock movements created with type RETURN
	 */
	async voidSale(saleId: string, data: VoidSalePayload): Promise<Sale> {
		return api
			.post<ApiResponse<Sale>>(`${endpoints.void}/${saleId}/void`, data as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Get sale summary/details
	 * GET /sales/:saleId
	 */
	async getSaleSummary(id: string): Promise<Sale> {
		return api
			.get<ApiResponse<Sale>>(`${endpoints.show}/${id}`)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Get sales summary statistics
	 * GET /sales/summaries
	 */
	async getSummary(query: SaleQueryParams = {}): Promise<SaleSummaryResponse> {
		return api
			.get<ApiResponse<SaleSummaryResponse>>(endpoints.summary, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Get the day close report (units sold, revenue, cost of sales, gross
	 * profit, expenses, net profit per day)
	 * GET /sales/day-close-report
	 */
	async getDayCloseReport(query: DayCloseReportQuery = {}): Promise<DayCloseReportRow[]> {
		return api
			.get<ApiResponse<DayCloseReportRow[]>>(endpoints.dayCloseReport, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Get the day close report totals (Total Revenue, Cost of Sales, Gross
	 * Profit, Net Profit) across the requested date range
	 * GET /sales/day-close-report/summary
	 */
	async getDayCloseReportSummary(query: DayCloseReportQuery = {}): Promise<DayCloseReportSummary> {
		return api
			.get<ApiResponse<DayCloseReportSummary>>(endpoints.dayCloseReportSummary, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Get the full day close details for a single date: the day's totals
	 * plus every sale and expense that made up those totals
	 * GET /sales/day-close-report/:date
	 */
	async getDayCloseReportDetails(date: string): Promise<DayCloseReportDetails> {
		return api
			.get<ApiResponse<DayCloseReportDetails>>(endpoints.dayCloseReportDetails(date))
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Void every sale posted through the Day-end Close form for a given date
	 * POST /sales/day-close-report/:date/void
	 */
	/**
	 * Void a batch of sales by id
	 * POST /sales/void-batch
	 */
	async voidSalesByIds(saleIds: string[], voidReason: string): Promise<BatchVoidResult> {
		return api
			.post<ApiResponse<BatchVoidResult>>(endpoints.voidBatch, { saleIds, voidReason } as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	// ==========================================
	// Legacy method aliases for backward compatibility
	// ==========================================

	/** @deprecated Use getSaleSummary instead */
	async getTransactionSummary(id: string): Promise<Sale> {
		return this.getSaleSummary(id);
	},

	/** @deprecated Use list with date filters instead */
	async byDate(query: SaleQueryParams = {}): Promise<Sale[]> {
		return api
			.get<ApiResponse<any>>(endpoints.list, query)
			.then((res) => {
				const data = res.data.data;
				if (Array.isArray(data)) return data;
				return data?.sales || data?.data || [];
			})
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