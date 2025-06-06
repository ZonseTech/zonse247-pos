import type { AxiosResponse } from 'axios';
import api from './http.service';

class SyncService {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	async getTables(): Promise<Table[]> {
		try {
			const response: AxiosResponse<{ tables: Table[] }> = await api.get(
				`${this.baseURL}/tables`
			);

			return response.data.tables || [];
		} catch (error) {
			console.error('Error fetching tables:', error);
			throw new Error('Failed to fetch tables data');
		}
	}

	async pullData(tableId: string | number): Promise<SyncResponse> {
		try {
			const response = await api.post<SyncResponse>(`${this.baseURL}/pull`, {
				tableName: tableId,
			} as any);

			return response.data;
		} catch (error) {
			console.error('Error pulling data:', error);
			throw new Error('Failed to pull data');
		}
	}

	async pushData(tableId: string | number): Promise<SyncResponse> {
		try {
			const response = await api.post<SyncResponse>(`${this.baseURL}/push`, {
				tableName: tableId,
			} as any);

			return response.data;
		} catch (error) {
			console.error('Error pushing data:', error);
			throw new Error('Failed to push data');
		}
	}

	async getSyncStatus(
		tableId: string | number
	): Promise<{ status: string; lastSync: string; syncedDocs: number }> {
		try {
			const response: AxiosResponse<{
				status: string;
				lastSync: string;
				syncedDocs: number;
			}> = await api.get(`${this.baseURL}/status/${tableId}`);

			return response.data;
		} catch (error) {
			console.error('Error fetching sync status:', error);
			throw new Error('Failed to fetch sync status');
		}
	}

	async bulkSync(tableIds: (string | number)[], action: 'pull' | 'push') {
		try {
			const response = await api.post<Array<SyncResponse>>(
				`${this.baseURL}/bulk`,
				{ tableIds, action } as any
			);

			return response.data;
		} catch (error) {
			console.error('Error in bulk sync:', error);
			throw new Error('Failed to perform bulk sync');
		}
	}
}

export const syncService = new SyncService('sync');
