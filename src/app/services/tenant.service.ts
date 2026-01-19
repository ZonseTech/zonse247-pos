import api from './http.service';
import { decodeObjectStrings, decodeArrayStrings } from '../utils/text-encoding';

// Fields to decode for tenants
const TENANT_DECODE_FIELDS: (keyof Tenant)[] = ['companyName', 'ownerName', 'address', 'city', 'state', 'country'];

const endpoints: Record<string, string> = {
    all: 'tenants/all',
    store: 'tenants/post',
    update: 'tenants/update',
    show: 'tenants',
    delete: 'tenants/tenant',
    register: 'tenants/register-tenant',
    updateTenant: 'tenants/update-tenant',
    onboarding: 'tenants/onboarding-status'
};

const tenantsService = {
    endpoints,
    async list(query: TenantQueryParams = {}): Promise<Array<Tenant>> {
        try {
            const response = await api.get<ApiResponse<Array<Tenant>>>(endpoints.all, query);
            return decodeArrayStrings(response.data.data || [], TENANT_DECODE_FIELDS);
        } catch (err) {
            console.error('Error fetching tenants:', err);
            throw err;
        }
    },

    async listPaginated(query: TenantQueryParams = {}): Promise<PaginatedResponse<Tenant>> {
        try {
            const response = await api.get<PaginatedResponse<Tenant>>(endpoints.all, {
                ...query,
                paginated: true
            });
            if (response.data.data) {
                response.data.data = decodeArrayStrings(response.data.data, TENANT_DECODE_FIELDS);
            }
            return response.data;
        } catch (err) {
            console.error('Error fetching paginated tenants:', err);
            throw err;
        }
    },

    async store(data: TenantFormValues): Promise<Tenant> {
        try {
            const response = await api.post<ApiResponse<Tenant>>(endpoints.store, data as any);
            return decodeObjectStrings(response.data.data!, TENANT_DECODE_FIELDS);
        } catch (err) {
            throw err;
        }
    },

    async update(id: string, data: Partial<TenantFormValues>): Promise<Tenant> {
        try {
            const response = await api.put<ApiResponse<Tenant>>(`${endpoints.update}/${id}`, data as any);
            return decodeObjectStrings(response.data.data!, TENANT_DECODE_FIELDS);
        } catch (err) {
            console.error('Error updating tenant:', err);
            throw err;
        }
    },

    async show(id: string): Promise<Tenant> {
        try {
            const response = await api.get<ApiResponse<Tenant>>(`${endpoints.show}/${id}`);
            return decodeObjectStrings(response.data.data!, TENANT_DECODE_FIELDS);
        } catch (err) {
            console.error('Error fetching tenant:', err);
            throw err;
        }
    },

    async delete(id: string): Promise<{ status: boolean }> {
        try {
            const response = await api.delete<ApiResponse<{ status: boolean }>>(`${endpoints.delete}/${id}`);
            return response.data.data || { status: true };
        } catch (err) {
            console.error('Error deleting tenant:', err);
            throw err;
        }
    },

    async register(data: RegisterTenantRequest): Promise<Tenant> {
        try {
            const response = await api.post<ApiResponse<Tenant>>(endpoints.register, data as any);
            return decodeObjectStrings(response.data.data!, TENANT_DECODE_FIELDS);
        } catch (err) {
            console.error('Error registering tenant:', err);
            throw err;
        }
    },

    async updateTenant(tenantUuid: string, data: Partial<RegisterTenantRequest>): Promise<Tenant> {
        try {
            const response = await api.put<ApiResponse<Tenant>>(`${endpoints.updateTenant}/${tenantUuid}`, data as any);
            return decodeObjectStrings(response.data.data!, TENANT_DECODE_FIELDS);
        } catch (err) {
            console.error('Error updating tenant:', err);
            throw err;
        }
    },

    async getOnboardingStatus(tenantUuid: string): Promise<OnboardingStatus> {
        try {
            const response = await api.get<ApiResponse<OnboardingStatus>>(`${endpoints.onboarding}/${tenantUuid}`);
            return response.data.data!;
        } catch (err) {
            console.error('Error fetching onboarding status:', err);
            throw err;
        }
    },

    async search(searchTerm: string, filters: Omit<TenantQueryParams, 'search'> = {}): Promise<Tenant[]> {
        return this.list({
            ...filters,
            search: searchTerm
        });
    },

    async getByStatus(status: string): Promise<Tenant[]> {
        return this.list({ status });
    },

    async getBySubscriptionStatus(subscriptionStatus: string): Promise<Tenant[]> {
        return this.list({ subscriptionStatus });
    },

    async getByCountry(country: string): Promise<Tenant[]> {
        return this.list({ country });
    },

    async checkEmailExists(email: string): Promise<boolean> {
        try {
            const tenants = await this.search(email);
            return tenants.some(tenant => tenant.email.toLowerCase() === email.toLowerCase());
        } catch (err) {
            console.error('Error checking email existence:', err);
            return false;
        }
    },

    validateTenantData(data: Partial<RegisterTenantRequest>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.companyName?.trim()) {
            errors.push('Company name is required');
        }

        if (!data.ownerName?.trim()) {
            errors.push('Owner name is required');
        }

        if (!data.email?.trim()) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(data.email)) {
            errors.push('Invalid email format');
        }

        if (!data.phone?.trim()) {
            errors.push('Phone number is required');
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

    formatTenantForDisplay(tenant: Tenant): Record<string, any> {
        return {
            id: tenant.uuid,
            tenantCode: tenant.tenantCode,
            companyName: tenant.companyName,
            ownerName: tenant.ownerName,
            email: tenant.email,
            phone: tenant.phone,
            address: tenant.address,
            country: tenant.country,
            timezone: tenant.timezone,
            subscriptionStatus: tenant.subscriptionStatus,
            status: tenant.status,
            trialEndsAt: tenant.trialEndsAt ? new Date(tenant.trialEndsAt) : null,
            registeredAt: new Date(tenant.registeredAt),
            createdAt: tenant.createdAt ? new Date(tenant.createdAt) : null,
            updatedAt: tenant.updatedAt ? new Date(tenant.updatedAt) : null
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
                console.error(`Failed to delete tenant ${id}:`, err);
            }
        }

        return results;
    },

    async bulkUpdate(updates: Array<{ id: string; data: Partial<RegisterTenantRequest> }>): Promise<{ success: string[]; failed: string[] }> {
        const results = { success: [], failed: [] };

        for (const update of updates) {
            try {
                await this.update(update.id, update.data);
                results.success.push(update.id);
            } catch (err) {
                results.failed.push(update.id);
                console.error(`Failed to update tenant ${update.id}:`, err);
            }
        }

        return results;
    },

    async exportTenants(format: 'json' | 'csv' = 'json', filters: TenantQueryParams = {}): Promise<string> {
        try {
            const tenants = await this.list(filters);

            if (format === 'json') {
                return JSON.stringify(tenants, null, 2);
            } else {
                return this.convertToCSV(tenants);
            }
        } catch (err) {
            console.error('Error exporting tenants:', err);
            throw err;
        }
    },

    convertToCSV(tenants: Tenant[]): string {
        if (tenants.length === 0) return '';

        const headers = Object.keys(tenants[0]).filter(key => key !== '_id');
        const csvContent = [
            headers.join(','),
            ...tenants.map(tenant =>
                headers.map(header => {
                    const value = (tenant as any)[header];
                    return typeof value === 'string' && value.includes(',')
                        ? `"${value}"`
                        : value;
                }).join(',')
            )
        ].join('\n');

        return csvContent;
    },

    async getTenantStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        bySubscriptionStatus: Record<string, number>;
        byCountry: Record<string, number>;
        recentRegistrations: number;
    }> {
        try {
            const allTenants = await this.list();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            return {
                total: allTenants.length,
                byStatus: this.groupBy(allTenants, 'status'),
                bySubscriptionStatus: this.groupBy(allTenants, 'subscriptionStatus'),
                byCountry: this.groupBy(allTenants, 'country'),
                recentRegistrations: allTenants.filter(tenant =>
                    new Date(tenant.registeredAt) >= thirtyDaysAgo
                ).length
            };
        } catch (err) {
            console.error('Error fetching tenant stats:', err);
            throw err;
        }
    },

    groupBy(array: any[], key: string): Record<string, number> {
        return array.reduce((groups, item) => {
            const value = item[key] || 'Unknown';
            groups[value] = (groups[value] || 0) + 1;
            return groups;
        }, {});
    }
};


export default tenantsService;