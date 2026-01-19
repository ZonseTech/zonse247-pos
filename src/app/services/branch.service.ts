import api from './http.service';
import { decodeObjectStrings, decodeArrayStrings } from '../utils/text-encoding';

// Fields to decode for branch items
const BRANCH_DECODE_FIELDS = ['branchName', 'siteName', 'description', 'addressLine1', 'addressLine2', 'addressLine3', 'district', 'city', 'state', 'receiptFooter'] as const;

const endpoints: Record<string, string> = {
    all: 'branches/all',
    store: 'branches/post',
    update: 'branches/update',
    show: 'branches',
    delete: 'branches',
};

const branchService = {
    endpoints,

    async list(query: BranchQueryParams = {}): Promise<Array<Branch>> {
        try {
            const response = await api.get<ApiResponse<Array<Branch>>>(endpoints.all, query);
            return decodeArrayStrings<Branch>(response.data.data || [], BRANCH_DECODE_FIELDS);
        } catch (err) {
            console.error('Error fetching branches:', err);
            throw err;
        }
    },

    async listPaginated(query: BranchQueryParams = {}): Promise<PaginatedResponse<Branch>> {
        try {
            const response = await api.get<PaginatedResponse<Branch>>(endpoints.all, {
                ...query,
                paginated: true
            });
            return {
                ...response.data,
                data: decodeArrayStrings<Branch>(response.data.data || [], BRANCH_DECODE_FIELDS)
            };
        } catch (err) {
            console.error('Error fetching paginated branches:', err);
            throw err;
        }
    },

    async store(data: CreateBranchRequest): Promise<Branch> {
        try {
            const response = await api.post<ApiResponse<Branch>>(endpoints.store, data as any);
            return decodeObjectStrings<Branch>(response.data.data!, BRANCH_DECODE_FIELDS);
        } catch (err) {
            console.error('Error creating branch:', err);
            throw err;
        }
    },

    async update(id: string, data: UpdateBranchRequest): Promise<Branch> {
        try {
            const response = await api.put<ApiResponse<Branch>>(`${endpoints.update}/${id}`, data as any);
            return decodeObjectStrings<Branch>(response.data.data!, BRANCH_DECODE_FIELDS);
        } catch (err) {
            console.error('Error updating branch:', err);
            throw err;
        }
    },

    async show(id: string): Promise<Branch> {
        try {
            const response = await api.get<ApiResponse<Branch>>(`${endpoints.show}/${id}`);
            return decodeObjectStrings<Branch>(response.data.data!, BRANCH_DECODE_FIELDS);
        } catch (err) {
            console.error('Error fetching branch:', err);
            throw err;
        }
    },

    async delete(id: string): Promise<{ status: boolean }> {
        try {
            const response = await api.delete<ApiResponse<{ status: boolean }>>(`${endpoints.delete}/${id}`);
            return response.data.data || { status: true };
        } catch (err) {
            console.error('Error deleting branch:', err);
            throw err;
        }
    },

    async search(searchTerm: string, filters: Omit<BranchQueryParams, 'search'> = {}): Promise<Branch[]> {
        return this.list({
            ...filters,
            search: searchTerm
        });
    },

    async getByStatus(status: BranchStatus): Promise<Branch[]> {
        return this.list({ status });
    },

    async getByTenant(tenantId: string): Promise<Branch[]> {
        return this.list({ tenantId });
    },

    async getByDistrict(district: string): Promise<Branch[]> {
        return this.list({ district });
    },

    async getByCity(city: string): Promise<Branch[]> {
        return this.list({ city });
    },

    async getActiveBranches(): Promise<Branch[]> {
        return this.list({ isActive: true, status: 'active' });
    },

    async getVirtualWarehouses(): Promise<Branch[]> {
        return this.list({ isVirtualWarehouse: true });
    },

    async checkBranchCodeExists(branchCode: string, excludeBranchId?: string): Promise<boolean> {
        try {
            const branches = await this.list({ search: branchCode });
            return branches.some(branch =>
                branch.branchCode.toLowerCase() === branchCode.toLowerCase() &&
                branch.branchId !== excludeBranchId
            );
        } catch (err) {
            console.error('Error checking branch code existence:', err);
            return false;
        }
    },

    async checkEmailExists(email: string, excludeBranchId?: string): Promise<boolean> {
        try {
            const branches = await this.search(email);
            return branches.some(branch =>
                branch.email?.toLowerCase() === email.toLowerCase() &&
                branch.branchId !== excludeBranchId
            );
        } catch (err) {
            console.error('Error checking email existence:', err);
            return false;
        }
    },

    validateBranchData(data: Partial<CreateBranchRequest>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.branchName?.trim()) {
            errors.push('Branch name is required');
        }

        if (!data.branchCode?.trim()) {
            errors.push('Branch code is required');
        } else if (!/^[A-Z0-9_-]+$/.test(data.branchCode)) {
            errors.push('Branch code can only contain uppercase letters, numbers, hyphens and underscores');
        }

        if (!data.tenantId?.trim()) {
            errors.push('Tenant ID is required');
        }

        if (data.email && !this.isValidEmail(data.email)) {
            errors.push('Invalid email format');
        }

        if (data.phoneNumber && !this.isValidPhone(data.phoneNumber)) {
            errors.push('Invalid phone number format');
        }

        if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 100)) {
            errors.push('Tax rate must be between 0 and 100');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidPhone(phone: string): boolean {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]*$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
    },

    formatBranchForDisplay(branch: Branch): Record<string, any> {
        return {
            id: branch.id,
            branchId: branch.branchId,
            tenantId: branch.tenantId,
            branchName: branch.branchName,
            branchCode: branch.branchCode,
            siteId: branch.siteId,
            siteName: branch.siteName,
            description: branch.description,
            address: [branch.addressLine1, branch.addressLine2, branch.addressLine3]
                .filter(Boolean)
                .join(', '),
            fullAddress: [
                branch.addressLine1,
                branch.addressLine2,
                branch.addressLine3,
                branch.district,
                branch.city,
                branch.state,
                branch.postalCode
            ].filter(Boolean).join(', '),
            district: branch.district,
            city: branch.city,
            state: branch.state,
            postalCode: branch.postalCode,
            phoneNumber: branch.phoneNumber,
            email: branch.email,
            currencyCode: branch.currencyCode,
            currencySymbol: branch.currencySymbol,
            taxRate: typeof branch.taxRate === 'string' ? parseFloat(branch.taxRate) : branch.taxRate,
            chargeTax: branch.chargeTax,
            receiptFooter: branch.receiptFooter,
            logoUrl: branch.logoUrl,
            isVirtualWarehouse: branch.isVirtualWarehouse,
            isActive: branch.isActive,
            synced: branch.synced,
            mraApprovalStatus: branch.mraApprovalStatus,
            mraApprovalDate: branch.mraApprovalDate ? new Date(branch.mraApprovalDate) : null,
            status: branch.status,
            createdAt: new Date(branch.createdAt),
            updatedAt: new Date(branch.updatedAt)
        };
    },

    async bulkDelete(ids: string[]): Promise<{ success: string[]; failed: string[] }> {
        const results = { success: [], failed: [] };

        for (const id of ids) {
            try {
                await this.delete(id);
                results.success.push(id);
            } catch (err) {
                results.failed.push(id);
                console.error(`Failed to delete branch ${id}:`, err);
            }
        }

        return results;
    },

    async bulkUpdate(updates: Array<{ id: string; data: UpdateBranchRequest }>): Promise<{ success: string[]; failed: string[] }> {
        const results = { success: [], failed: [] };

        for (const update of updates) {
            try {
                await this.update(update.id, update.data);
                results.success.push(update.id);
            } catch (err) {
                results.failed.push(update.id);
                console.error(`Failed to update branch ${update.id}:`, err);
            }
        }

        return results;
    },

    async exportBranches(format: 'json' | 'csv' = 'json', filters: BranchQueryParams = {}): Promise<string> {
        try {
            const branches = await this.list(filters);

            if (format === 'json') {
                return JSON.stringify(branches, null, 2);
            } else {
                return this.convertToCSV(branches);
            }
        } catch (err) {
            console.error('Error exporting branches:', err);
            throw err;
        }
    },

    convertToCSV(branches: Branch[]): string {
        if (branches.length === 0) return '';

        const headers = [
            'id', 'branchId', 'tenantId', 'branchName', 'branchCode', 'siteId', 'siteName',
            'description', 'addressLine1', 'addressLine2', 'addressLine3', 'district', 'city',
            'state', 'postalCode', 'phoneNumber', 'email', 'currencyCode', 'currencySymbol',
            'taxRate', 'chargeTax', 'receiptFooter', 'logoUrl', 'isVirtualWarehouse',
            'isActive', 'synced', 'mraApprovalStatus', 'mraApprovalDate', 'status',
            'createdAt', 'updatedAt'
        ];

        const csvContent = [
            headers.join(','),
            ...branches.map(branch =>
                headers.map(header => {
                    const value = (branch as any)[header];
                    if (value === null || value === undefined) return '';
                    return typeof value === 'string' && value.includes(',')
                        ? `"${value}"`
                        : value;
                }).join(',')
            )
        ].join('\n');

        return csvContent;
    },

    async getBranchStats(tenantId?: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byDistrict: Record<string, number>;
        byCity: Record<string, number>;
        byCurrency: Record<string, number>;
        activeCount: number;
        virtualWarehouseCount: number;
        taxEnabledCount: number;
        mraApprovalStats: Record<string, number>;
        recentlyCreated: number;
    }> {
        try {
            const query: BranchQueryParams = tenantId ? { tenantId } : {};
            const allBranches = await this.list(query);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            return {
                total: allBranches.length,
                byStatus: this.groupBy(allBranches, 'status'),
                byDistrict: this.groupBy(allBranches, 'district'),
                byCity: this.groupBy(allBranches, 'city'),
                byCurrency: this.groupBy(allBranches, 'currencyCode'),
                activeCount: allBranches.filter(b => b.isActive).length,
                virtualWarehouseCount: allBranches.filter(b => b.isVirtualWarehouse).length,
                taxEnabledCount: allBranches.filter(b => b.chargeTax).length,
                mraApprovalStats: this.groupBy(allBranches, 'mraApprovalStatus'),
                recentlyCreated: allBranches.filter(branch =>
                    new Date(branch.createdAt) >= thirtyDaysAgo
                ).length
            };
        } catch (err) {
            console.error('Error fetching branch stats:', err);
            throw err;
        }
    },

    groupBy(array: any[], key: string): Record<string, number> {
        return array.reduce((groups, item) => {
            const value = item[key] || 'Unknown';
            groups[value] = (groups[value] || 0) + 1;
            return groups;
        }, {});
    },

    generateBranchCode(branchName: string): string {
        const prefix = 'BR';
        const nameCode = branchName
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 3);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${prefix}${nameCode}${random}`;
    },

    async toggleBranchStatus(branchId: string): Promise<Branch> {
        try {
            const branch = await this.show(branchId);
            const newStatus: BranchStatus = branch.status === 'active' ? 'inactive' : 'active';
            return await this.update(branchId, { status: newStatus, isActive: newStatus === 'active' });
        } catch (err) {
            console.error('Error toggling branch status:', err);
            throw err;
        }
    },

    async getBranchOptions(tenantId?: string): Promise<BranchOptions[]> {
        try {
            const query: BranchQueryParams = tenantId
                ? { tenantId, isActive: true, status: 'active' }
                : { isActive: true, status: 'active' };
            const branches = await this.list(query);
            return branches.map(branch => ({
                branchId: branch.branchId,
                branchName: branch.branchName,
                branchCode: branch.branchCode
            }));
        } catch (err) {
            console.error('Error fetching branch options:', err);
            throw err;
        }
    }
};

export default branchService;