/**
 * Transaction to Sale Migration Types
 * 
 * These types are used for migrating legacy transaction records to the new Sale format.
 * API Endpoints:
 * - GET  /sales/migration/status         - Check migration status
 * - POST /sales/migration/run            - Run migration
 * - GET  /sales/migration/unified        - Get unified sales data
 * - GET  /sales/migration/unified/summary - Get unified summary
 */

/** Migration status response */
interface MigrationStatus {
	totalTransactions: number;
	migratedCount: number;
	pendingCount: number;
	failedCount: number;
	lastMigrationDate?: string;
	isComplete: boolean;
}

/** Configuration for running a migration */
interface MigrationRunConfig {
	/** If true, simulates migration without making changes */
	dryRun?: boolean;
	/** Number of records to process per batch (default: 100) */
	batchSize?: number;
}

/** Result of a migration run */
interface MigrationRunResult {
	success: boolean;
	message: string;
	migratedCount: number;
	failedCount: number;
	skippedCount: number;
	errors?: MigrationError[];
	dryRun: boolean;
}

/** Migration error details */
interface MigrationError {
	id: string;
	error: string;
	details?: string;
}

/** Query parameters for unified sales data */
interface UnifiedSalesQuery {
	page?: number;
	perPage?: number;
	startDate?: string;
	endDate?: string;
	status?: string;
	search?: string;
	includeItems?: boolean;
}

/** Response for unified sales data */
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

/** Summary of unified sales data */
interface UnifiedSummaryResponse {
	totalSales: number;
	totalAmount: number;
	salesFromNewApi: number;
	salesFromLegacy: number;
	migrationProgress: number; // percentage
}

/** Status mapping from legacy transaction status to new sale status */
interface TransactionStatusToSaleStatusMap {
	completed: 'COMPLETED';
	pending: 'PENDING';
	failed: 'VOIDED';
	cancelled: 'VOIDED';
	refunded: 'RETURNED';
	void: 'VOIDED';
}
