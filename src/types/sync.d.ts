// Sync Table Types
interface SyncTable {
	id: string;
	name: string;
	displayName: string;
	description: string;
	recordCount: number;
	syncedCount: number;
	pendingCount: number;
	lastSyncAt: string | null;
	status: SyncStatus;
	syncDirection: SyncDirection;
	autoSyncEnabled: boolean;
	syncInterval: number;
}

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'pending' | 'error' | 'paused';
type SyncDirection = 'pull' | 'push' | 'bidirectional';
type SyncAction = 'pull' | 'push' | 'bidirectional';

// Sync Status Response
interface SyncStatusResponse {
	tableName: string;
	status: SyncStatus;
	lastSyncAt: string | null;
	syncedRecords: number;
	pendingRecords: number;
	errorCount: number;
	lastError?: string;
}

// Table Stats Response
interface TableStatsResponse {
	tableName: string;
	totalRecords: number;
	syncedRecords: number;
	unsyncedRecords: number;
	lastModified: string | null;
	size: string;
}

// Sync Operation Response
interface SyncResponse {
	success: boolean;
	message: string;
	tableName?: string;
	syncedCount?: number;
	failedCount?: number;
	errors?: string[];
	timestamp?: string;
	duration?: number;
	syncedDocs?: number;
	lastSync?: string;
}

// Bulk Sync Response
interface BulkSyncResponse {
	success: boolean;
	message: string;
	results: Array<{
		tableName: string;
		success: boolean;
		syncedCount: number;
		failedCount: number;
		errors?: string[];
	}>;
	totalSynced: number;
	totalFailed: number;
	duration: number;
}

// Records Response
interface RecordsResponse<T = any> {
	success: boolean;
	tableName: string;
	records: T[];
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

// Table Configuration
interface TableConfig {
	tableName: string;
	syncDirection: SyncDirection;
	autoSyncEnabled: boolean;
	syncInterval: number;
	conflictResolution: 'server_wins' | 'client_wins' | 'latest_wins' | 'manual';
	priority: number;
}

// Auto Sync Status
interface AutoSyncStatus {
	isRunning: boolean;
	startedAt: string | null;
	nextSyncAt: string | null;
	tablesInQueue: string[];
	currentTable: string | null;
	progress: number;
}

// Sync Log Entry
interface SyncLogEntry {
	id: string;
	tableName: string;
	action: SyncAction;
	status: 'success' | 'failed' | 'partial';
	startedAt: string;
	completedAt: string;
	recordsSynced: number;
	recordsFailed: number;
	errors?: string[];
	duration: number;
}

// Sync Progress Event
interface SyncProgressEvent {
	tableName: string;
	action: SyncAction;
	progress: number;
	currentRecord: number;
	totalRecords: number;
	status: SyncStatus;
}

// API Response Wrapper
interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

// Legacy Support - keeping old interfaces for backward compatibility
interface Table {
	id: number | string;
	name: string;
	syncedDocs: number;
	lastSync: string;
	status: 'synced' | 'pending' | 'error' | 'syncing';
	description: string;
}

interface SyncJobStatus {
	id: string;
	tableId: string | number;
	status: 'pending' | 'running' | 'completed' | 'failed';
	progress: number;
	startTime: string;
	endTime?: string;
	errorMessage?: string;
}

interface SyncMetrics {
	totalRows: number;
	processedRows: number;
	errorRows: number;
	duration: number;
}

interface SyncResult {
	success: boolean;
	recordCount: number;
	errors: string[];
	timestamp: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Force Data Sync types (see docs/FORCE_DATA_SYNC_FRONTEND_GUIDE.md)
// ─────────────────────────────────────────────────────────────────────────────

/** A logical table key the force resync iterates over (in dependency order). */
type ForceResyncTable =
	| 'customers'
	| 'sales'
	| 'saleItems'
	| 'salePayments'
	| 'returns'
	| 'returnItems'
	| 'stockMovements'
	| 'orders'
	| 'users';

/** Direction of a force resync run. */
type ForceResyncMode = 'pull' | 'push' | 'bidirectional';

/** High-level state of a force resync run. */
type ForceResyncStatus =
	| 'idle'
	| 'confirming'
	| 'running'
	| 'cancelling'
	| 'completed'
	| 'failed';

/** Per-table progress entry surfaced to the UI. */
interface ForceResyncTableProgress {
	table: ForceResyncTable;
	processed: number;
	accepted: number;
	rejected: number;
	deferred: number;
	status: 'pending' | 'running' | 'done' | 'deferred' | 'failed';
	message?: string;
	errors: string[];
}

/** Snapshot of overall progress. */
interface ForceResyncProgress {
	status: ForceResyncStatus;
	mode: ForceResyncMode;
	startedAt: string | null;
	finishedAt: string | null;
	currentTable: ForceResyncTable | null;
	totalProcessed: number;
	totalAccepted: number;
	totalRejected: number;
	totalDeferred: number;
	tables: ForceResyncTableProgress[];
	error?: string;
}

/** Body for `POST /v1/sync/<table>` push. */
interface ForceResyncPushRequest<T = any> {
	records: T[];
}

/** Body for `POST /v1/sync/pull`. */
interface ForceResyncPullRequest {
	since?: string | null;
	tables?: ForceResyncTable[];
	limit?: number;
}

/** Body for `POST /v1/sync/bidirectional`. */
interface ForceResyncBidirectionalRequest<T = any> {
	push?: Partial<Record<ForceResyncTable, T[]>>;
	pullSince?: string | null;
	pullTables?: ForceResyncTable[];
	pullLimit?: number;
}

/** Generic per-table push/pull response shape. */
interface ForceResyncOperationResult<T = any> {
	tableName?: string;
	accepted?: number;
	rejected?: number;
	records?: T[];
	errors?: Array<{ id?: string; index?: number; message: string }>;
	serverTime?: string;
	lastSequence?: string;
}

/** Response from `GET /v1/sync/status`. */
interface TerminalSyncStatusResponse {
	terminalId: string;
	tenantId: string;
	branchId: string;
	lastPushedAt: string | null;
	lastPulledAt: string | null;
	pending: Partial<Record<ForceResyncTable, number>>;
}
