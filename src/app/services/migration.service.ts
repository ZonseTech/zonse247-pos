import type { AxiosResponse } from 'axios';
import api from './http.service';

class MigrationService {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	async uploadFile(
		file: File,
		tableName: string
	): Promise<MigrationUploadResponse> {
		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('tableName', tableName);

			const response: AxiosResponse<MigrationUploadResponse> = await api.post(
				`${this.baseURL}/upload`,
				formData as any,
				{
					'Content-Type': 'multipart/form-data',
				}
			);

			return response.data;
		} catch (error: any) {
			console.error('Error uploading file:', error);
			const errorMessage =
				error?.error?.response?.data?.message || 'Upload failed';
			throw new Error(errorMessage);
		}
	}

	async startMigration(fileName: string, tableName: string): Promise<void> {
		try {
			const requestData: MigrationStartRequest = {
				fileName,
				tableName,
			};

			await api.post<void>(`${this.baseURL}/migrate`, requestData as any);
		} catch (error: any) {
			console.error('Error starting migration:', error);
			const errorMessage =
				error?.error?.response?.data?.message || 'Migration failed to start';
			throw new Error(errorMessage);
		}
	}

	async getMigrationProgress(): Promise<MigrationProgressResponse> {
		try {
			const response: AxiosResponse<MigrationProgressResponse> = await api.get(
				`${this.baseURL}/progress`
			);

			return response.data;
		} catch (error: any) {
			console.error('Error fetching migration progress:', error);
			throw new Error('Failed to fetch migration progress');
		}
	}
}

export const migrationService = new MigrationService('migration');
