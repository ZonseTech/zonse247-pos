import type { AxiosResponse } from 'axios';
import api from './http.service';
import settingsService from './settings.service';

// Cached after first resolution. Sync endpoints require X-Terminal-Id but the
// global request interceptor doesn't attach it, so we resolve once and reuse.
let terminalIdCache: string | null = null;
async function resolveTerminalId(): Promise<string | undefined> {
	if (terminalIdCache) return terminalIdCache;
	try {
		const id = await settingsService.getTerminalId();
		if (id) {
			terminalIdCache = id;
			return id;
		}
	} catch {
		/* fall through */
	}
	return undefined;
}

async function syncHeaders(): Promise<Record<string, string>> {
	const terminalId = await resolveTerminalId();
	return terminalId ? { 'X-Terminal-Id': terminalId } : {};
}

// ─────────────────────────────────────────────────────────────────────────────
// Force Data Sync — server limits & defaults
// ref: docs/FORCE_DATA_SYNC_FRONTEND_GUIDE.md §2 §5 §7
// ─────────────────────────────────────────────────────────────────────────────
export const FORCE_RESYNC_LIMITS = Object.freeze({
	MAX_RECORDS_PER_TABLE: 2_000,
	MAX_BATCH_TOTAL: 5_000,
	REQUEST_TIMEOUT_MS: 30_000,
	DEFAULT_CHUNK_SIZE: 500,
	MIN_CHUNK_SIZE: 50,
	MAX_CHUNK_SIZE: 1_500,
	MAX_ATTEMPTS: 5,
	BASE_BACKOFF_MS: 500,
	MAX_BACKOFF_MS: 30_000,
});

/** Tables in dependency order (parents first). */
export const FORCE_RESYNC_TABLE_ORDER: ForceResyncTable[] = [
	'customers',
	'sales',
	'saleItems',
	'salePayments',
	'returns',
	'returnItems',
	'stockMovements',
	'orders',
	'users',
];

/** Map our local camelCase keys to the kebab-case URL segments. */
export const FORCE_RESYNC_ENDPOINT: Record<ForceResyncTable, string> = {
	customers: 'customers',
	sales: 'sales',
	saleItems: 'sale-items',
	salePayments: 'sale-payments',
	returns: 'returns',
	returnItems: 'return-items',
	stockMovements: 'stock-movements',
	orders: 'orders',
	users: 'users',
};

class SyncService {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	// Get all sync tables
	async getTables(): Promise<SyncTable[]> {
		try {
			const response: AxiosResponse<{ tables: SyncTable[] }> = await api.get(
				`${this.baseURL}/tables`
			);
			return response.data.tables || [];
		} catch (error) {
			console.error('Error fetching tables:', error);
			throw new Error('Failed to fetch tables data');
		}
	}

	// Get sync status for a specific table
	async getSyncStatus(tableName: string): Promise<SyncStatusResponse> {
		try {
			const response: AxiosResponse<SyncStatusResponse> = await api.get(
				`${this.baseURL}/status/${tableName}`
			);
			return response.data;
		} catch (error) {
			console.error('Error fetching sync status:', error);
			throw new Error('Failed to fetch sync status');
		}
	}

	// Get statistics for a specific table
	async getTableStats(tableName: string): Promise<TableStatsResponse> {
		try {
			const response: AxiosResponse<TableStatsResponse> = await api.get(
				`${this.baseURL}/stats/${tableName}`
			);
			return response.data;
		} catch (error) {
			console.error('Error fetching table stats:', error);
			throw new Error('Failed to fetch table statistics');
		}
	}

	// Get all records from a table
	async getAllRecords<T = any>(
		tableName: string,
		page: number = 1,
		pageSize: number = 100
	): Promise<RecordsResponse<T>> {
		try {
			const response: AxiosResponse<RecordsResponse<T>> = await api.get(
				`${this.baseURL}/records/${tableName}`,
				{ params: { page, pageSize } }
			);
			return response.data;
		} catch (error) {
			console.error('Error fetching records:', error);
			throw new Error('Failed to fetch records');
		}
	}

	// Pull data from server
	async pullData(tableName: string): Promise<SyncResponse> {
		try {
			const response: AxiosResponse<SyncResponse> = await api.post(
				`${this.baseURL}/pull`,
				{ tableName }
			);
			return response.data;
		} catch (error) {
			console.error('Error pulling data:', error);
			throw new Error('Failed to pull data');
		}
	}

	// Push data to server
	async pushData(tableName: string): Promise<SyncResponse> {
		try {
			const response: AxiosResponse<SyncResponse> = await api.post(
				`${this.baseURL}/push`,
				{ tableName }
			);
			return response.data;
		} catch (error) {
			console.error('Error pushing data:', error);
			throw new Error('Failed to push data');
		}
	}

	// Bidirectional sync
	async bidirectionalSync(tableName: string): Promise<SyncResponse> {
		try {
			const response: AxiosResponse<SyncResponse> = await api.post(
				`${this.baseURL}/bidirectional`,
				{ tableName }
			);
			return response.data;
		} catch (error) {
			console.error('Error in bidirectional sync:', error);
			throw new Error('Failed to perform bidirectional sync');
		}
	}

	// Bulk sync multiple tables
	async bulkSync(
		tableNames: string[],
		action: SyncAction
	): Promise<BulkSyncResponse> {
		try {
			const response: AxiosResponse<BulkSyncResponse> = await api.post(
				`${this.baseURL}/bulk`,
				{ tableNames, action }
			);
			return response.data;
		} catch (error) {
			console.error('Error in bulk sync:', error);
			throw new Error('Failed to perform bulk sync');
		}
	}

	// Configure sync settings for a table
	async configureTable(
		tableName: string,
		config: Partial<TableConfig>
	): Promise<ApiResponse<TableConfig>> {
		try {
			const response: AxiosResponse<ApiResponse<TableConfig>> = await api.put(
				`${this.baseURL}/configure/${tableName}`,
				config
			);
			return response.data;
		} catch (error) {
			console.error('Error configuring table:', error);
			throw new Error('Failed to configure table');
		}
	}

	// Start auto-sync
	async startAutoSync(
		tableNames?: string[],
		interval?: number
	): Promise<ApiResponse<AutoSyncStatus>> {
		try {
			const response: AxiosResponse<ApiResponse<AutoSyncStatus>> = await api.post(
				`${this.baseURL}/auto-sync/start`,
				{ tableNames, interval }
			);
			return response.data;
		} catch (error) {
			console.error('Error starting auto-sync:', error);
			throw new Error('Failed to start auto-sync');
		}
	}

	// Stop auto-sync
	async stopAutoSync(): Promise<ApiResponse<{ stopped: boolean }>> {
		try {
			const response: AxiosResponse<ApiResponse<{ stopped: boolean }>> = await api.post(
				`${this.baseURL}/auto-sync/stop`
			);
			return response.data;
		} catch (error) {
			console.error('Error stopping auto-sync:', error);
			throw new Error('Failed to stop auto-sync');
		}
	}

	// Helper method to get auto-sync status
	async getAutoSyncStatus(): Promise<AutoSyncStatus | null> {
		try {
			const response: AxiosResponse<AutoSyncStatus> = await api.get(
				`${this.baseURL}/auto-sync/status`
			);
			return response.data;
		} catch {
			// Return null when endpoint is unavailable (expected in desktop/offline mode)
			return null;
		}
	}

	// ─────────────────────────────────────────────────────────────────────
	// Force Data Sync — direct endpoints (see docs/FORCE_DATA_SYNC_FRONTEND_GUIDE.md)
	// ─────────────────────────────────────────────────────────────────────

	/** GET /v1/sync/status — terminal sync state. */
	async getTerminalStatus(signal?: AbortSignal): Promise<TerminalSyncStatusResponse> {
		const response: AxiosResponse<TerminalSyncStatusResponse> = await api.get(
			`${this.baseURL}/status`,
			{ signal, timeout: FORCE_RESYNC_LIMITS.REQUEST_TIMEOUT_MS }
		);
		return response.data;
	}

	/** POST /v1/sync/<table> — push a chunk of records. */
	async pushTableRecords<T = any>(
		table: ForceResyncTable,
		records: T[],
		signal?: AbortSignal
	): Promise<ForceResyncOperationResult<T>> {
		if (records.length > FORCE_RESYNC_LIMITS.MAX_RECORDS_PER_TABLE) {
			throw new Error(
				`Chunk too large: ${records.length} > ${FORCE_RESYNC_LIMITS.MAX_RECORDS_PER_TABLE}`
			);
		}
		const endpoint = FORCE_RESYNC_ENDPOINT[table];
		const headers = await syncHeaders();
		const response: AxiosResponse<ForceResyncOperationResult<T>> = await api.post(
			`${this.baseURL}/${endpoint}`,
			{ records } as ForceResyncPushRequest<T>,
			{ signal, timeout: FORCE_RESYNC_LIMITS.REQUEST_TIMEOUT_MS, headers }
		);
		return response.data;
	}

	/** POST /v1/sync/pull — pull changed rows for one or more tables. */
	async pullChanges<T = any>(
		body: ForceResyncPullRequest,
		signal?: AbortSignal
	): Promise<Record<string, ForceResyncOperationResult<T>> & { serverTime?: string }> {
		const headers = await syncHeaders();
		const response: AxiosResponse<
			Record<string, ForceResyncOperationResult<T>> & { serverTime?: string }
		> = await api.post(`${this.baseURL}/pull`, body, {
			signal,
			timeout: FORCE_RESYNC_LIMITS.REQUEST_TIMEOUT_MS,
			headers,
		});
		return response.data;
	}

	/** POST /v1/sync/pull/:tableName — pull a single table. */
	async pullTable<T = any>(
		table: ForceResyncTable,
		body: { since?: string | null; limit?: number },
		signal?: AbortSignal
	): Promise<ForceResyncOperationResult<T>> {
		const endpoint = FORCE_RESYNC_ENDPOINT[table];
		const headers = await syncHeaders();
		const response: AxiosResponse<ForceResyncOperationResult<T>> = await api.post(
			`${this.baseURL}/pull/${endpoint}`,
			body,
			{ signal, timeout: FORCE_RESYNC_LIMITS.REQUEST_TIMEOUT_MS, headers }
		);
		return response.data;
	}

	/** POST /v1/sync/bidirectional — push + pull in one round-trip. */
	async bidirectional<T = any>(
		body: ForceResyncBidirectionalRequest<T>,
		signal?: AbortSignal
	): Promise<{
		push?: Record<string, ForceResyncOperationResult<T>>;
		pull?: Record<string, ForceResyncOperationResult<T>>;
		serverTime?: string;
	}> {
		const headers = await syncHeaders();
		const response = await api.post(`${this.baseURL}/bidirectional`, body, {
			signal,
			timeout: FORCE_RESYNC_LIMITS.REQUEST_TIMEOUT_MS,
			headers,
		});
		return response.data;
	}
}

/**
 * Sleep that honours an AbortSignal so cancellation is immediate.
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
		const t = setTimeout(resolve, ms);
		signal?.addEventListener(
			'abort',
			() => {
				clearTimeout(t);
				reject(new DOMException('Aborted', 'AbortError'));
			},
			{ once: true }
		);
	});
}

/**
 * Decide whether an error is worth retrying.
 * Network failures, HTTP 5xx and 429 are retried; other 4xx are not.
 */
export function isRetriableError(err: any): boolean {
	const e = err?.error ?? err;
	if (e?.name === 'AbortError' || e?.name === 'CanceledError') return false;
	const status = e?.response?.status;
	if (!status) return true; // network / timeout
	if (status === 429) return true;
	return status >= 500;
}

/**
 * Extract a human-readable error message from an Axios / fetch / generic
 * error, looking through every shape the zonse247 POS API uses:
 *   { message }                — standard
 *   { error }                  — legacy
 *   { error: { message } }     — nested
 *   { errors: [{ message }] }  — validation list
 *   { errors: { field: [..] } }— class-validator
 *   plain string body          — raw 4xx/5xx
 * Falls back to the HTTP status text or the original Error.message.
 */
export function extractApiErrorMessage(err: any): string {
	if (!err) return 'Unknown error';

	// Unwrap the { error } envelope produced by our http.service response
	// interceptor (Promise.reject({ error })). Repeatedly so nested wrappers
	// also resolve.
	let cur: any = err;
	for (let i = 0; i < 4; i += 1) {
		if (
			cur &&
			typeof cur === 'object' &&
			!cur.isAxiosError &&
			!cur.response &&
			!cur.config &&
			cur.error &&
			typeof cur.error === 'object'
		) {
			cur = cur.error;
		} else {
			break;
		}
	}

	if (cur?.name === 'AbortError' || cur?.name === 'CanceledError') {
		return 'Cancelled';
	}

	const data = cur?.response?.data;
	if (data) {
		if (typeof data === 'string' && data.trim()) return data.trim();
		if (typeof data === 'object') {
			if (typeof data.message === 'string' && data.message) return data.message;
			if (Array.isArray(data.message) && data.message.length) {
				return data.message.join('; ');
			}
			if (typeof data.error === 'string' && data.error) return data.error;
			if (data.error && typeof data.error === 'object') {
				if (typeof data.error.message === 'string') return data.error.message;
			}
			if (Array.isArray(data.errors) && data.errors.length) {
				return data.errors
					.map((e: any) =>
						typeof e === 'string' ? e : e?.message ?? JSON.stringify(e)
					)
					.join('; ');
			}
			if (data.errors && typeof data.errors === 'object') {
				const flat = Object.entries(data.errors)
					.map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
					.join('; ');
				if (flat) return flat;
			}
		}
	}

	const status = cur?.response?.status;
	const statusText = cur?.response?.statusText;
	if (status) {
		const base = statusText ? `${status} ${statusText}` : `HTTP ${status}`;
		return cur?.message && cur.message !== 'Network Error'
			? `${base}: ${cur.message}`
			: base;
	}

	if (typeof cur?.message === 'string' && cur.message) return cur.message;
	if (typeof cur === 'string') return cur;
	return 'Unknown error';
}

/**
 * Run an async operation with exponential backoff + jitter.
 * Matches the policy in §7 of the guide: 0, 0.5s, 2s, 8s, 30s (cap), ±25% jitter.
 */
export async function withRetry<T>(
	op: (attempt: number) => Promise<T>,
	options: { signal?: AbortSignal; maxAttempts?: number; onRetry?: (attempt: number, err: any, delayMs: number) => void } = {}
): Promise<T> {
	const max = options.maxAttempts ?? FORCE_RESYNC_LIMITS.MAX_ATTEMPTS;
	let attempt = 1;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		try {
			if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
			return await op(attempt);
		} catch (err: any) {
			if (!isRetriableError(err) || attempt >= max) throw err;
			const base = Math.min(
				FORCE_RESYNC_LIMITS.MAX_BACKOFF_MS,
				FORCE_RESYNC_LIMITS.BASE_BACKOFF_MS * 2 ** (attempt - 1)
			);
			const jitter = 0.75 + Math.random() * 0.5; // ±25%
			const delay = Math.round(base * jitter);
			options.onRetry?.(attempt, err, delay);
			await sleep(delay, options.signal);
			attempt += 1;
		}
	}
}

export const syncService = new SyncService('sync');


