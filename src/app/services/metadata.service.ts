import type { AxiosResponse } from 'axios';
import api from './http.service';

class MetadataService {
    private readonly baseEndpoint = '/metadata';

    /**
     * Load specific metadata type from external API and sync to local SQLite
     */
    async loadMetadata(type: MetadataType, params: ValidationParams): Promise<MetadataResponse> {
        try {
            const response: AxiosResponse<MetadataResponse> = await api.post(
                `${this.baseEndpoint}/${type}`,
                params,
            );

            if (!response.data.success) {
                throw new Error(response.data.message || `Failed to sync ${type}`);
            }

            return response.data;
        } catch (error: any) {
            console.error(`Error loading metadata ${type}:`, error);
            throw new Error(error?.error?.message || error?.message || `Failed to load ${type}`);
        }
    }

    /**
     * Load all metadata types
     */
    async loadAllMetadata(types: Array<MetadataType>, params: ValidationParams): Promise<Record<MetadataType, MetadataResponse>> {
        const results: Record<string, MetadataResponse> = {};

        for (const type of types) {
            try {
                results[type] = await this.loadMetadata(type, params);
            } catch (error) {
                results[type] = {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to load',
                };
            }
        }

        return results as Record<MetadataType, MetadataResponse>;
    }

    /**
     * Sync all metadata at once (backend handles sequential sync)
     */
    async syncAllMetadata(): Promise<SyncAllResponse> {
        try {
            const response: AxiosResponse<SyncAllResponse> = await api.post(
                `${this.baseEndpoint}/sync-all`,
                {}
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to sync all metadata');
            }

            return response.data;
        } catch (error: any) {
            console.error('Error syncing all metadata:', error);
            throw new Error(error?.error?.message || error?.message || 'Failed to sync all metadata');
        }
    }

    /**
     * Get metadata sync status
     */
    async getSyncStatus(): Promise<any> {
        try {
            const response: AxiosResponse<any> = await api.get(
                `${this.baseEndpoint}/status`
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to get sync status');
            }

            return response.data.data;
        } catch (error: any) {
            console.error('Error getting sync status:', error);
            throw new Error(error?.error?.message || error?.message || 'Failed to get sync status');
        }
    }
}

export default new MetadataService();