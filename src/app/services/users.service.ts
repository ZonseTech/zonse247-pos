import axios from 'axios';
import api from './http.service';
import { decodeObjectStrings, decodeArrayStrings } from '../utils/text-encoding';

const LIVE_API_URL = import.meta.env.VITE_LIVE_API_URL;
const USER_DECODE_FIELDS = ['fullname', 'username', 'email', 'roleName', 'branchName', 'tenantName'] as const;

const liveApi = axios.create({
	baseURL: LIVE_API_URL,
	timeout: 30000,
	headers: {
		'X-Client-Type': 'web'
	}
});

/**
 * Get tenant ID from electron setup or session storage
 */
async function getTenantId(): Promise<string | undefined> {
	try {
		if (typeof window !== 'undefined' && (window as any).electronAPI?.settings) {
			const result = await (window as any).electronAPI.settings.getSetup();
			if (result.success && result.data?.tenantId) return result.data.tenantId;
		}

		const user = sessionStorage?.getItem('user');
		if (user) return JSON.parse(user).tenantId;
	} catch (error) {
		console.warn('[UsersService] Error getting tenant ID:', error);
	}
	return undefined;
}

/**
 * Get auth token from session storage
 */
function getAuthToken(): string | undefined {
	try {
		return sessionStorage?.getItem('token') || undefined;
	} catch {
		return undefined;
	}
}

const endpoints: Record<string, string> = {
	all: 'users',
	store: 'users',
	update: 'users',
	show: 'users',
	delete: 'users',
	changePassword: 'auth/change-password',
	resetPassword: 'auth/reset-password',
	toggleStatus: 'users/status',
	stats: 'users/stats',
};

const usersService = {
	endpoints,

	async list(query: UserQueryParams = {}): Promise<User[]> {
		try {
			const response = await api.get<ApiResponse<User[]>>(endpoints.all, query);
			return decodeArrayStrings(response.data.data || [], USER_DECODE_FIELDS);
		} catch (err) {
			console.error('Error fetching users:', err);
			throw err;
		}
	},

	async listPaginated(query: UserQueryParams = {}): Promise<PaginatedResponse<User>> {
		try {
			const response = await api.get<PaginatedResponse<User>>(endpoints.all, {
				...query,
				paginated: true
			});
			if (response.data.data) {
				response.data.data = decodeArrayStrings(response.data.data, USER_DECODE_FIELDS);
			}
			return response.data;
		} catch (err) {
			console.error('Error fetching paginated users:', err);
			throw err;
		}
	},

	async store(data: CreateUserRequest): Promise<CreateUserResponse> {
		try {
			const response = await api.post<ApiResponse<CreateUserResponse>>(endpoints.store, data as any);
			return { ...decodeObjectStrings(response.data.data!, USER_DECODE_FIELDS), generatedPassword: response.data.data?.generatedPassword };
		} catch (err) {
			console.error('Error creating user:', err);
			throw err;
		}
	},

	/**
	 * Create user via Live API (for online-first scenarios)
	 */
	async storeLive(data: CreateUserRequest): Promise<CreateUserResponse> {
		if (!LIVE_API_URL) {
			throw new Error('Live server URL not configured');
		}

		try {
			const tenantId = await getTenantId();
			const token = getAuthToken();

			const response = await liveApi.post<ApiResponse<CreateUserResponse>>(
				endpoints.store,
				data,
				{
					headers: {
						...(token && { 'Authorization': `Bearer ${token}` }),
						...(tenantId && { 'X-Tenant-Id': tenantId })
					}
				}
			);

			return {
				...decodeObjectStrings(response.data.data!, USER_DECODE_FIELDS),
				generatedPassword: response.data.data?.generatedPassword
			};
		} catch (err: any) {
			console.error('Error creating user via live API:', err);
			throw {
				error: err,
				response: err.response
			};
		}
	},

	async update(id: string, data: UpdateUserRequest): Promise<User> {
		try {
			const response = await api.put<ApiResponse<User>>(`${endpoints.update}/${id}`, data as any);
			return decodeObjectStrings(response.data.data!, USER_DECODE_FIELDS);
		} catch (err) {
			console.error('Error updating user:', err);
			throw err;
		}
	},

	async show(id: string): Promise<User> {
		try {
			const response = await api.get<ApiResponse<User>>(`${endpoints.show}/${id}`);
			return decodeObjectStrings(response.data.data!, USER_DECODE_FIELDS);
		} catch (err) {
			console.error('Error fetching user:', err);
			throw err;
		}
	},

	async delete(id: string): Promise<{ status: boolean }> {
		try {
			const response = await api.delete<ApiResponse<{ status: boolean }>>(`${endpoints.delete}/${id}`);
			return response.data.data || { status: true };
		} catch (err) {
			console.error('Error deleting user:', err);
			throw err;
		}
	},

	async search(searchTerm: string, filters: Omit<UserQueryParams, 'search'> = {}): Promise<User[]> {
		return this.list({
			...filters,
			search: searchTerm
		});
	},

	async getByTenant(tenantId: string): Promise<User[]> {
		return this.list({ tenantId });
	},

	async getByBranch(branchId: string): Promise<User[]> {
		return this.list({ branchId });
	},

	async getByRole(roleId: string): Promise<User[]> {
		return this.list({ roleId });
	},

	async getByStatus(status: UserStatus): Promise<User[]> {
		return this.list({ status });
	},

	async changePassword(userId: string, data: ChangePasswordRequest): Promise<{ success: boolean }> {
		try {
			const response = await api.put<ApiResponse<{ success: boolean }>>(`${endpoints.changePassword}/${userId}`, data as any);
			return response.data.data!;
		} catch (err) {
			console.error('Error changing password:', err);
			throw err;
		}
	},

	async resetPassword(userId: string, data: ResetPasswordRequest): Promise<{ success: boolean; temporaryPassword?: string }> {
		try {
			const response = await api.post<ApiResponse<{ success: boolean; temporaryPassword?: string }>>(`${endpoints.resetPassword}/${userId}`, data as any);
			return response.data.data!;
		} catch (err) {
			console.error('Error resetting password:', err);
			throw err;
		}
	},

	async toggleStatus(userId: string, status: UserStatus): Promise<User> {
		try {
			const response = await api.put<ApiResponse<User>>(`${endpoints.toggleStatus}/${userId}`, { status } as any);
			return response.data.data!;
		} catch (err) {
			console.error('Error toggling user status:', err);
			throw err;
		}
	},

	async getStats(query: Omit<UserQueryParams, 'paginated' | 'page' | 'perPage'> = {}): Promise<UserStats> {
		try {
			const response = await api.get<ApiResponse<UserStats>>(endpoints.stats, query);
			return response.data.data!;
		} catch (err) {
			console.error('Error fetching user stats:', err);
			throw err;
		}
	},

	async bulkDelete(ids: string[]): Promise<{ success: boolean; deletedCount: number }> {
		try {
			const response = await api.post<ApiResponse<{ success: boolean; deletedCount: number }>>(`${endpoints.delete}/bulk`, { ids } as any);
			return response.data.data!;
		} catch (err) {
			console.error('Error bulk deleting users:', err);
			throw err;
		}
	},

	async bulkUpdateStatus(ids: string[], status: UserStatus): Promise<{ success: boolean; updatedCount: number }> {
		try {
			const response = await api.put<ApiResponse<{ success: boolean; updatedCount: number }>>(`${endpoints.update}/bulk-status`, { ids, status } as any);
			return response.data.data!;
		} catch (err) {
			console.error('Error bulk updating user status:', err);
			throw err;
		}
	},

	validateUsername(username: string): boolean {
		return username.trim().length >= 3 && username.trim().length <= 50 && /^[a-zA-Z0-9_-]+$/.test(username);
	},

	validateEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	},

	validatePassword(password: string): { valid: boolean; message?: string } {
		if (password.length < 8) {
			return { valid: false, message: 'Password must be at least 8 characters long' };
		}
		if (!/[A-Z]/.test(password)) {
			return { valid: false, message: 'Password must contain at least one uppercase letter' };
		}
		if (!/[a-z]/.test(password)) {
			return { valid: false, message: 'Password must contain at least one lowercase letter' };
		}
		if (!/[0-9]/.test(password)) {
			return { valid: false, message: 'Password must contain at least one number' };
		}
		return { valid: true };
	},

	validatePinCode(pin: string): boolean {
		return /^\d{4,6}$/.test(pin);
	},

	getStatusColor(status?: UserStatus): string {
		switch (status) {
			case 'active':
				return 'green';
			case 'inactive':
				return 'gray';
			case 'suspended':
				return 'red';
			default:
				return 'gray';
		}
	},

	formatPermissions(permissions?: string[] | null): string {
		if (!permissions || permissions.length === 0) return 'No permissions';
		if (permissions.length <= 3) return permissions.join(', ');
		return `${permissions.slice(0, 3).join(', ')} +${permissions.length - 3} more`;
	}
};

export default usersService;
