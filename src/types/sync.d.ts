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
