import api from './http.service';

/**
 * Printer Service
 * Handles all printer-related API calls for POS system
 */

const endpoints = {
	// Base
	root: 'printers',

	// Printer Management
	all: 'printers/all',
	default: 'printers/default',
	discover: 'printers/discover',
	byTerminal: 'printers/terminal',
	create: 'printers/create',
	update: 'printers/update',
	setDefault: 'printers/default',
	updateStatus: 'printers/status',
	updateConfiguration: 'printers/configuration',
	delete: 'printers',
	get: 'printers',

	// Printer Testing
	test: 'printers/test',
	testPage: 'printers/test-page',

	// Printing
	printReceipt: 'printers/print/receipt',
	printLabel: 'printers/print/label',

	// Print Jobs
	pendingJobs: 'printers/jobs/pending',
	jobHistory: 'printers/jobs',
	cancelJob: 'printers/jobs',
	cleanupJobs: 'printers/jobs/cleanup',
};

const printerService = {
	endpoints,

	// ============================================
	// PRINTER MANAGEMENT
	// ============================================

	/**
	 * GET /printers/all - Get all printers
	 * Retrieves all printers with optional filtering
	 */
	async getAll(query: PrinterQueryParams = {}): Promise<Printer[]> {
		const params: Record<string, any> = {};
		Object.keys(query).forEach((key) => {
			const value = (query as any)[key];
			if (value !== undefined && value !== null && value !== '') {
				params[key] = value;
			}
		});

		return api
			.get<PrinterListResponse>(endpoints.all, params)
			.then((res) => res.data.data || [])
			.catch((err) => {
				console.error('Error fetching printers:', err);
				throw err;
			});
	},

	/**
	 * GET /printers/all - Get all printers with pagination
	 */
	async getAllPaginated(query: PrinterQueryParams = {}): Promise<PrinterPaginatedResponse['data']> {
		const params: Record<string, any> = { ...query, paginated: true };

		return api
			.get<PrinterPaginatedResponse>(endpoints.all, params)
			.then((res) => res.data.data)
			.catch((err) => {
				console.error('Error fetching paginated printers:', err);
				throw err;
			});
	},

	/**
	 * GET /printers/default - Get default printer
	 * Optionally specify printer use type: 'receipt', 'label', 'kitchen', 'report'
	 */
	async getDefault(printerUse?: 'receipt' | 'label' | 'kitchen' | 'report'): Promise<Printer | null> {
		const params: Record<string, any> = {};
		if (printerUse) {
			params.printerUse = printerUse;
		}

		return api
			.get<PrinterResponse>(endpoints.default, params)
			.then((res) => res.data.data || null)
			.catch((err) => {
				// Return null if no default printer found
				if (err?.response?.status === 404) {
					return null;
				}
				console.error('Error fetching default printer:', err);
				throw err;
			});
	},

	/**
	 * GET /printers/discover - Discover available printers
	 * Scans for available printers on the network and USB
	 */
	async discover(connectionType?: PrinterConnectionType): Promise<DiscoveredPrinter[]> {
		const params: Record<string, any> = {};
		if (connectionType) {
			params.connectionType = connectionType;
		}

		return api
			.get<DiscoveredPrinterResponse>(endpoints.discover, params)
			.then((res) => res.data.data || [])
			.catch((err) => {
				console.error('Error discovering printers:', err);
				throw err;
			});
	},

	/**
	 * GET /printers/terminal/:terminalId - Get printers by terminal
	 */
	async getByTerminal(terminalId: string): Promise<Printer[]> {
		return api
			.get<PrinterListResponse>(`${endpoints.byTerminal}/${terminalId}`)
			.then((res) => res.data.data || [])
			.catch((err) => {
				console.error('Error fetching printers by terminal:', err);
				throw err;
			});
	},

	/**
	 * GET /printers/:id - Get printer by ID
	 */
	async getById(printerId: string): Promise<Printer> {
		return api
			.get<PrinterResponse>(`${endpoints.get}/${printerId}`)
			.then((res) => res.data.data)
			.catch((err) => {
				console.error('Error fetching printer:', err);
				throw err;
			});
	},

	/**
	 * POST /printers/create - Create a new printer
	 */
	async create(data: CreatePrinterRequest): Promise<Printer> {
		return api
			.post<PrinterResponse>(endpoints.create, data as any)
			.then((res) => res.data.data)
			.catch((err) => {
				console.error('Error creating printer:', err);
				throw err;
			});
	},

	/**
	 * PUT /printers/update/:id - Update printer
	 */
	async update(printerId: string, data: UpdatePrinterRequest): Promise<Printer> {
		return api
			.put<PrinterResponse>(`${endpoints.update}/${printerId}`, data as any)
			.then((res) => res.data.data)
			.catch((err) => {
				console.error('Error updating printer:', err);
				throw err;
			});
	},

	/**
	 * PUT /printers/default/:id - Set as default printer
	 */
	async setDefault(printerId: string): Promise<Printer> {
		return api
			.put<PrinterResponse>(`${endpoints.setDefault}/${printerId}`, {} as any)
			.then((res) => res.data.data)
			.catch((err) => {
				console.error('Error setting default printer:', err);
				throw err;
			});
	},

	/**
	 * PUT /printers/status/:id - Update printer status
	 */
	async updateStatus(printerId: string, data: PrinterStatusUpdateRequest): Promise<Printer> {
		return api
			.put<PrinterResponse>(`${endpoints.updateStatus}/${printerId}`, data as any)
			.then((res) => res.data.data)
			.catch((err) => {
				console.error('Error updating printer status:', err);
				throw err;
			});
	},

	/**
	 * PUT /printers/configuration/:id - Update printer configuration
	 */
	async updateConfiguration(printerId: string, configuration: Partial<PrinterConfiguration>): Promise<Printer> {
		return api
			.put<PrinterResponse>(`${endpoints.updateConfiguration}/${printerId}`, configuration as any)
			.then((res) => res.data.data)
			.catch((err) => {
				console.error('Error updating printer configuration:', err);
				throw err;
			});
	},

	/**
	 * DELETE /printers/:id - Delete printer
	 */
	async delete(printerId: string): Promise<{ status: boolean }> {
		return api
			.delete<ApiResponse<{ status: boolean }>>(`${endpoints.delete}/${printerId}`)
			.then((res) => res.data.data || { status: true })
			.catch((err) => {
				console.error('Error deleting printer:', err);
				throw err;
			});
	},

	// ============================================
	// PRINTER TESTING
	// ============================================

	/**
	 * POST /printers/test/:id - Test printer connection
	 */
	async testConnection(printerId: string): Promise<PrinterTestResult> {
		return api
			.post<PrinterTestResponse>(`${endpoints.test}/${printerId}`, {} as any)
			.then((res) => res.data.data)
			.catch((err) => {
				console.error('Error testing printer:', err);
				throw err;
			});
	},

	/**
	 * POST /printers/test-page/:id - Print test page
	 */
	async printTestPage(printerId: string): Promise<PrintJob> {
		return api
			.post<PrintJobResponse>(`${endpoints.testPage}/${printerId}`, {} as any)
			.then((res) => res.data.data)
			.catch((err) => {
				console.error('Error printing test page:', err);
				throw err;
			});
	},

	// ============================================
	// PRINTING
	// ============================================

	/**
	 * POST /printers/print/receipt - Print a receipt
	 */
	async printReceipt(data: PrintReceiptRequest): Promise<PrintJob> {
		return api
			.post<PrintJobResponse>(endpoints.printReceipt, data as any)
			.then((res) => res.data.data)
			.catch((err) => {
				console.error('Error printing receipt:', err);
				throw err;
			});
	},

	/**
	 * POST /printers/print/label - Print a label
	 */
	async printLabel(data: PrintLabelRequest): Promise<PrintJob> {
		return api
			.post<PrintJobResponse>(endpoints.printLabel, data as any)
			.then((res) => res.data.data)
			.catch((err) => {
				console.error('Error printing label:', err);
				throw err;
			});
	},

	// ============================================
	// PRINT JOBS
	// ============================================

	/**
	 * GET /printers/jobs/pending - Get pending print jobs
	 */
	async getPendingJobs(): Promise<PrintJob[]> {
		return api
			.get<PrintJobListResponse>(endpoints.pendingJobs)
			.then((res) => res.data.data || [])
			.catch((err) => {
				console.error('Error fetching pending print jobs:', err);
				throw err;
			});
	},

	/**
	 * GET /printers/jobs/:id/history - Get print job history for a printer
	 */
	async getJobHistory(printerId: string): Promise<PrintJob[]> {
		return api
			.get<PrintJobListResponse>(`${endpoints.jobHistory}/${printerId}/history`)
			.then((res) => res.data.data || [])
			.catch((err) => {
				console.error('Error fetching print job history:', err);
				throw err;
			});
	},

	/**
	 * POST /printers/jobs/:jobId/cancel - Cancel a print job
	 */
	async cancelJob(jobId: string): Promise<PrintJob> {
		return api
			.post<PrintJobResponse>(`${endpoints.cancelJob}/${jobId}/cancel`, {} as any)
			.then((res) => res.data.data)
			.catch((err) => {
				console.error('Error cancelling print job:', err);
				throw err;
			});
	},

	/**
	 * DELETE /printers/jobs/cleanup - Clean up old print jobs
	 * @param daysOld - Number of days old jobs to delete (default: 30)
	 */
	async cleanupJobs(daysOld: number = 30): Promise<{ deletedCount: number }> {
		return api
			.delete<CleanupJobsResponse>(endpoints.cleanupJobs, { daysOld })
			.then((res) => res.data.data || { deletedCount: 0 })
			.catch((err) => {
				console.error('Error cleaning up print jobs:', err);
				throw err;
			});
	},

	// ============================================
	// HELPER METHODS
	// ============================================

	/**
	 * Get all receipt printers
	 */
	async getReceiptPrinters(): Promise<Printer[]> {
		return this.getAll({ isReceiptPrinter: true, isActive: true });
	},

	/**
	 * Get all label printers
	 */
	async getLabelPrinters(): Promise<Printer[]> {
		return this.getAll({ isLabelPrinter: true, isActive: true });
	},

	/**
	 * Get all kitchen printers
	 */
	async getKitchenPrinters(): Promise<Printer[]> {
		return this.getAll({ isKitchenPrinter: true, isActive: true });
	},

	/**
	 * Get all report printers
	 */
	async getReportPrinters(): Promise<Printer[]> {
		return this.getAll({ isReportPrinter: true, isActive: true });
	},

	/**
	 * Get printers by type
	 */
	async getByType(printerType: PrinterType): Promise<Printer[]> {
		return this.getAll({ printerType, isActive: true });
	},

	/**
	 * Get printers by connection type
	 */
	async getByConnectionType(connectionType: PrinterConnectionType): Promise<Printer[]> {
		return this.getAll({ connectionType, isActive: true });
	},

	/**
	 * Get printers by status
	 */
	async getByStatus(status: PrinterStatus): Promise<Printer[]> {
		return this.getAll({ status });
	},

	/**
	 * Get online printers
	 */
	async getOnlinePrinters(): Promise<Printer[]> {
		return this.getAll({ status: 'ONLINE', isActive: true });
	},

	/**
	 * Activate a printer
	 */
	async activate(printerId: string): Promise<Printer> {
		return this.update(printerId, { isActive: true });
	},

	/**
	 * Deactivate a printer
	 */
	async deactivate(printerId: string): Promise<Printer> {
		return this.update(printerId, { isActive: false });
	},

	/**
	 * Search printers by name
	 */
	async search(searchTerm: string, filters: Omit<PrinterQueryParams, 'search'> = {}): Promise<Printer[]> {
		return this.getAll({
			...filters,
			search: searchTerm,
		});
	},

	/**
	 * Quick print receipt using default printer
	 */
	async quickPrintReceipt(saleId: string, copies: number = 1): Promise<PrintJob> {
		return this.printReceipt({
			saleId,
			copies,
			includeHeader: true,
			includeFooter: true,
			includeLogo: true,
		});
	},

	/**
	 * Quick print labels for a product
	 */
	async quickPrintLabels(productId: string, quantity: number): Promise<PrintJob> {
		return this.printLabel({
			productId,
			quantity,
			includePrice: true,
			includeBarcode: true,
		});
	},
};

export default printerService;
