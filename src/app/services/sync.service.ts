import type { AxiosResponse } from 'axios';
import api from './http.service';

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
}

export const syncService = new SyncService('sync');
