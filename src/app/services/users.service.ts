import api from './http.service';

const endpoints: Record<string, string> = {
	all: 'users/list',
	store: 'users',
	update: 'users/update',
	show: 'users',
	delete: 'users',
	changePassword: 'users/change-password',
	resetPassword: 'users/reset-password',
	toggleStatus: 'users/toggle-status',
	stats: 'users/stats',
};

const usersService = {
	endpoints,

	async list(query: UserQueryParams = {}): Promise<User[]> {
		try {
			const response = await api.get<ApiResponse<User[]>>(endpoints.all, query);
			return response.data.data || [];
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
			return response.data;
		} catch (err) {
			console.error('Error fetching paginated users:', err);
			throw err;
		}
	},

	async store(data: CreateUserRequest): Promise<User> {
		try {
			const response = await api.post<ApiResponse<User>>(endpoints.store, data as any);
			return response.data.data!;
		} catch (err) {
			console.error('Error creating user:', err);
			throw err;
		}
	},

	async update(id: string, data: UpdateUserRequest): Promise<User> {
		try {
			const response = await api.put<ApiResponse<User>>(`${endpoints.update}/${id}`, data as any);
			return response.data.data!;
		} catch (err) {
			console.error('Error updating user:', err);
			throw err;
		}
	},

	async show(id: string): Promise<User> {
		try {
			const response = await api.get<ApiResponse<User>>(`${endpoints.show}/${id}`);
			return response.data.data!;
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
			const response = await api.post<ApiResponse<{ success: boolean }>>(`${endpoints.changePassword}/${userId}`, data as any);
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
