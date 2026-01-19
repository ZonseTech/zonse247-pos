import api from './http.service';
import { decodeObjectStrings, decodeArrayStrings } from '../utils/text-encoding';

// Fields to decode for terminal items
const TERMINAL_DECODE_FIELDS = ['terminalLabel', 'terminalType', 'branchName', 'tenantName', 'location', 'notes'] as const;

const endpoints: Record<string, string> = {
    all: 'terminals/all',
    store: 'terminals/post',
    update: 'terminals/update',
    show: 'terminals',
    delete: 'terminals',
    sync: 'terminals/sync',
    activate: 'terminals/activate',
    deactivate: 'terminals/deactivate',
    block: 'terminals/block',
    unblock: 'terminals/unblock',
    setPrimary: 'terminals/set-primary',
    stats: 'terminals/stats',
};

const terminalService = {
    endpoints,

    async list(query: TerminalQueryParams = {}): Promise<Array<Terminal>> {
        try {
            const response = await api.get<ApiResponse<Array<Terminal>>>(endpoints.all, query);
            return decodeArrayStrings<Terminal>(response.data.data || [], TERMINAL_DECODE_FIELDS);
        } catch (err) {
            console.error('Error fetching terminals:', err);
            throw err;
        }
    },

    async listPaginated(query: TerminalQueryParams = {}): Promise<PaginatedResponse<Terminal>> {
        try {
            const response = await api.get<PaginatedResponse<Terminal>>(endpoints.all, {
                ...query,
                paginated: true
            });
            return {
                ...response.data,
                data: decodeArrayStrings<Terminal>(response.data.data || [], TERMINAL_DECODE_FIELDS)
            };
        } catch (err) {
            console.error('Error fetching paginated terminals:', err);
            throw err;
        }
    },

    async store(data: CreateTerminalRequest): Promise<Terminal> {
        try {
            const response = await api.post<ApiResponse<Terminal>>(endpoints.store, data as any);
            return decodeObjectStrings<Terminal>(response.data.data!, TERMINAL_DECODE_FIELDS);
        } catch (err) {
            console.error('Error creating terminal:', err);
            throw err;
        }
    },

    async update(id: string, data: UpdateTerminalRequest): Promise<Terminal> {
        try {
            const response = await api.put<ApiResponse<Terminal>>(`${endpoints.update}/${id}`, data as any);
            return decodeObjectStrings<Terminal>(response.data.data!, TERMINAL_DECODE_FIELDS);
        } catch (err) {
            console.error('Error updating terminal:', err);
            throw err;
        }
    },

    async show(id: string): Promise<Terminal> {
        try {
            const response = await api.get<ApiResponse<Terminal>>(`${endpoints.show}/${id}`);
            return decodeObjectStrings<Terminal>(response.data.data!, TERMINAL_DECODE_FIELDS);
        } catch (err) {
            console.error('Error fetching terminal:', err);
            throw err;
        }
    },

    async delete(id: string): Promise<{ status: boolean }> {
        try {
            const response = await api.delete<ApiResponse<{ status: boolean }>>(`${endpoints.delete}/${id}`);
            return response.data.data || { status: true };
        } catch (err) {
            console.error('Error deleting terminal:', err);
            throw err;
        }
    },

    async search(searchTerm: string, filters: Omit<TerminalQueryParams, 'search'> = {}): Promise<Terminal[]> {
        return this.list({
            ...filters,
            search: searchTerm
        });
    },

    async getByTenant(tenantId: string): Promise<Terminal[]> {
        return this.list({ tenantId });
    },

    async getByBranch(branchId: string): Promise<Terminal[]> {
        return this.list({ branchId });
    },

    async getByActivationStatus(activationStatus: TerminalActivationStatus): Promise<Terminal[]> {
        return this.list({ activationStatus });
    },

    async getPrimaryTerminals(): Promise<Terminal[]> {
        return this.list({ isPrimary: true });
    },

    async getBlockedTerminals(): Promise<Terminal[]> {
        return this.list({ isBlocked: true });
    },

    async syncTerminal(id: string): Promise<{ status: boolean; lastSync: string }> {
        try {
            const response = await api.post<ApiResponse<{ status: boolean; lastSync: string }>>(`${endpoints.sync}/${id}`, {} as any);
            return response.data.data!;
        } catch (err) {
            console.error('Error syncing terminal:', err);
            throw err;
        }
    },

    async activate(id: string, activationCode?: string): Promise<Terminal> {
        try {
            const response = await api.post<ApiResponse<Terminal>>(`${endpoints.activate}/${id}`, { activationCode } as any);
            return decodeObjectStrings<Terminal>(response.data.data!, TERMINAL_DECODE_FIELDS);
        } catch (err) {
            console.error('Error activating terminal:', err);
            throw err;
        }
    },

    async deactivate(id: string, reason?: string): Promise<Terminal> {
        try {
            const response = await api.post<ApiResponse<Terminal>>(`${endpoints.deactivate}/${id}`, { reason } as any);
            return decodeObjectStrings<Terminal>(response.data.data!, TERMINAL_DECODE_FIELDS);
        } catch (err) {
            console.error('Error deactivating terminal:', err);
            throw err;
        }
    },

    async block(id: string, reason: string): Promise<Terminal> {
        try {
            const response = await api.post<ApiResponse<Terminal>>(`${endpoints.block}/${id}`, { reason } as any);
            return decodeObjectStrings<Terminal>(response.data.data!, TERMINAL_DECODE_FIELDS);
        } catch (err) {
            console.error('Error blocking terminal:', err);
            throw err;
        }
    },

    async unblock(id: string): Promise<Terminal> {
        try {
            const response = await api.post<ApiResponse<Terminal>>(`${endpoints.unblock}/${id}`, {} as any);
            return decodeObjectStrings<Terminal>(response.data.data!, TERMINAL_DECODE_FIELDS);
        } catch (err) {
            console.error('Error unblocking terminal:', err);
            throw err;
        }
    },

    async setPrimary(id: string, branchId: string): Promise<Terminal> {
        try {
            const response = await api.post<ApiResponse<Terminal>>(`${endpoints.setPrimary}/${id}`, { branchId } as any);
            return decodeObjectStrings<Terminal>(response.data.data!, TERMINAL_DECODE_FIELDS);
        } catch (err) {
            console.error('Error setting primary terminal:', err);
            throw err;
        }
    },

    async getStats(query: Omit<TerminalQueryParams, 'paginated' | 'page' | 'perPage'> = {}): Promise<TerminalStats> {
        try {
            const response = await api.get<ApiResponse<TerminalStats>>(endpoints.stats, query);
            return response.data.data!;
        } catch (err) {
            console.error('Error fetching terminal stats:', err);
            throw err;
        }
    },

    async bulkDelete(ids: string[]): Promise<{ success: boolean; deletedCount: number }> {
        try {
            const response = await api.post<ApiResponse<{ success: boolean; deletedCount: number }>>(`${endpoints.delete}/bulk`, { ids } as any);
            return response.data.data!;
        } catch (err) {
            console.error('Error bulk deleting terminals:', err);
            throw err;
        }
    },

    async bulkUpdateActivationStatus(ids: string[], status: TerminalActivationStatus): Promise<{ success: boolean; updatedCount: number }> {
        try {
            const response = await api.put<ApiResponse<{ success: boolean; updatedCount: number }>>(`${endpoints.update}/bulk-status`, { ids, status } as any);
            return response.data.data!;
        } catch (err) {
            console.error('Error bulk updating terminal status:', err);
            throw err;
        }
    },

    validateTerminalLabel(label: string): boolean {
        return label.trim().length >= 3 && label.trim().length <= 100;
    },

    validateMacAddress(mac: string): boolean {
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        return macRegex.test(mac);
    },

    formatMacAddress(mac: string): string {
        return mac.toUpperCase().replace(/[:-]/g, ':');
    },

    generateDeviceId(prefix: string = 'DEVICE'): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9).toUpperCase();
        return `${prefix}_${timestamp}_${random}`;
    },

    getActivationStatusColor(status?: TerminalActivationStatus): string {
        switch (status) {
            case 'ACTIVATED':
                return 'green';
            case 'PENDING':
                return 'yellow';
            case 'DEACTIVATED':
                return 'gray';
            case 'SUSPENDED':
                return 'orange';
            case 'BLOCKED':
                return 'red';
            default:
                return 'gray';
        }
    },

    getMraStatusColor(status?: TerminalMraStatus): string {
        switch (status) {
            case 'APPROVED':
                return 'green';
            case 'APPLIED':
                return 'blue';
            case 'REJECTED':
                return 'red';
            default:
                return 'gray';
        }
    }
};

export default terminalService;
