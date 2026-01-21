import api from './http.service';

/**
 * Transaction to Sale Migration Service
 * 
 * Uses the zonse247-pos-api endpoints:
 * - GET  /sales/migration/status         - Check migration status
 * - POST /sales/migration/run            - Run migration
 * - GET  /sales/migration/unified        - Get unified sales data
 * - GET  /sales/migration/unified/summary - Get unified summary
 */

interface MigrationStatus {
	totalTransactions: number;
	migratedCount: number;
	pendingCount: number;
	failedCount: number;
	lastMigrationDate?: string;
	isComplete: boolean;
}

interface MigrationRunConfig {
	dryRun?: boolean;
	batchSize?: number;
}

interface MigrationRunResult {
	success: boolean;
	message: string;
	migratedCount: number;
	failedCount: number;
	skippedCount: number;
	errors?: { id: string; error: string }[];
	dryRun: boolean;
}

interface UnifiedSalesQuery {
	page?: number;
	perPage?: number;
	startDate?: string;
	endDate?: string;
	status?: string;
	search?: string;
	includeItems?: boolean;
}

interface UnifiedSalesResponse {
	sales: (Sale | Transaction)[];
	pagination: {
		page: number;
		perPage: number;
		total: number;
		totalPages: number;
	};
	source: {
		salesCount: number;
		transactionsCount: number;
	};
}

interface UnifiedSummaryResponse {
	totalSales: number;
	totalAmount: number;
	salesFromNewApi: number;
	salesFromLegacy: number;
	migrationProgress: number; // percentage
}

const endpoints = {
	status: 'sales/migration/status',
	run: 'sales/migration/run',
	unified: 'sales/migration/unified',
	unifiedSummary: 'sales/migration/unified/summary',
};

class TransactionMigrationService {
	/**
	 * Get migration status - check how many transactions have been migrated
	 * GET /sales/migration/status
	 */
	async getStatus(): Promise<MigrationStatus> {
		try {
			const response = await api.get<ApiResponse<MigrationStatus>>(endpoints.status);
			return response.data.data;
		} catch (error: any) {
			console.error('Error fetching migration status:', error);
			throw new Error(error?.response?.data?.message || 'Failed to fetch migration status');
		}
	}

	/**
	 * Run migration - migrate transactions to sales
	 * POST /sales/migration/run
	 * 
	 * @param config.dryRun - If true, simulates migration without making changes
	 * @param config.batchSize - Number of records to process per batch (default: 100)
	 */
	async runMigration(config: MigrationRunConfig = {}): Promise<MigrationRunResult> {
		try {
			const response = await api.post<ApiResponse<MigrationRunResult>>(
				endpoints.run,
				{
					dryRun: config.dryRun ?? false,
					batchSize: config.batchSize ?? 100,
				} as any
			);
			return response.data.data;
		} catch (error: any) {
			console.error('Error running migration:', error);
			throw new Error(error?.response?.data?.message || 'Migration failed');
		}
	}

	/**
	 * Get unified sales data - combines both sales and legacy transactions
	 * GET /sales/migration/unified
	 */
	async getUnifiedSales(query: UnifiedSalesQuery = {}): Promise<UnifiedSalesResponse> {
		try {
			const response = await api.get<ApiResponse<UnifiedSalesResponse>>(
				endpoints.unified,
				query
			);
			return response.data.data;
		} catch (error: any) {
			console.error('Error fetching unified sales:', error);
			throw new Error(error?.response?.data?.message || 'Failed to fetch unified sales');
		}
	}

	/**
	 * Get unified summary - summary statistics combining both sources
	 * GET /sales/migration/unified/summary
	 */
	async getUnifiedSummary(): Promise<UnifiedSummaryResponse> {
		try {
			const response = await api.get<ApiResponse<UnifiedSummaryResponse>>(endpoints.unifiedSummary);
			return response.data.data;
		} catch (error: any) {
			console.error('Error fetching unified summary:', error);
			throw new Error(error?.response?.data?.message || 'Failed to fetch unified summary');
		}
	}
}

export const migrationService = new TransactionMigrationService();

// Export types for use in components
export type {
	MigrationStatus,
	MigrationRunConfig,
	MigrationRunResult,
	UnifiedSalesQuery,
	UnifiedSalesResponse,
	UnifiedSummaryResponse,
};
