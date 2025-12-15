import api from './http.service';

const endpoints: Record<string, string> = {
    all: 'tenants/all',
    store: 'tenants/post',
    update: 'tenants/update',
    show: 'tenants',
    delete: 'tenants/tenant',
    register: 'tenants/register-tenant',
    updateClient: 'tenants/update-tenant',
    onboarding: 'tenants/onboarding-status'
};

const tenantsService = {
    endpoints,
    async list(query: ClientQueryParams = {}): Promise<Array<Tenant>> {
        try {
            const response = await api.get<ApiResponse<Array<Tenant>>>(endpoints.all, query);
            return response.data.data || [];
        } catch (err) {
            console.error('Error fetching tenants:', err);
            throw err;
        }
    },

    async listPaginated(query: ClientQueryParams = {}): Promise<PaginatedResponse<Client>> {
        try {
            const response = await api.get<PaginatedResponse<Client>>(endpoints.all, {
                ...query,
                paginated: true
            });
            return response.data;
        } catch (err) {
            console.error('Error fetching paginated clients:', err);
            throw err;
        }
    },

    async store(data: TenantFormValues): Promise<Tenant> {
        try {
            const response = await api.post<ApiResponse<Tenant>>(endpoints.store, data as any);
            return response.data.data!;
        } catch (err) {
            throw err;
        }
    },

    async update(id: string, data: Partial<TenantFormValues>): Promise<Tenant> {
        try {
            const response = await api.put<ApiResponse<Tenant>>(`${endpoints.update}/${id}`, data as any);
            return response.data.data!;
        } catch (err) {
            console.error('Error updating tenant:', err);
            throw err;
        }
    },

    async show(id: string): Promise<Tenant> {
        try {
            const response = await api.get<ApiResponse<Tenant>>(`${endpoints.show}/${id}`);
            return response.data.data!;
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
            console.error('Error deleting client:', err);
            throw err;
        }
    },

    async register(data: RegisterClientRequest): Promise<Client> {
        try {
            const response = await api.post<ApiResponse<Client>>(endpoints.register, data as any);
            return response.data.data!;
        } catch (err) {
            console.error('Error registering client:', err);
            throw err;
        }
    },

    async updateClient(clientUuid: string, data: Partial<RegisterClientRequest>): Promise<Client> {
        try {
            const response = await api.put<ApiResponse<Client>>(`${endpoints.updateClient}/${clientUuid}`, data as any);
            return response.data.data!;
        } catch (err) {
            console.error('Error updating client:', err);
            throw err;
        }
    },

    async getOnboardingStatus(clientUuid: string): Promise<OnboardingStatus> {
        try {
            const response = await api.get<ApiResponse<OnboardingStatus>>(`${endpoints.onboarding}/${clientUuid}`);
            return response.data.data!;
        } catch (err) {
            console.error('Error fetching onboarding status:', err);
            throw err;
        }
    },

    async search(searchTerm: string, filters: Omit<ClientQueryParams, 'search'> = {}): Promise<Client[]> {
        return this.list({
            ...filters,
            search: searchTerm
        });
    },

    async getByStatus(status: string): Promise<Client[]> {
        return this.list({ status });
    },

    async getBySubscriptionStatus(subscriptionStatus: string): Promise<Client[]> {
        return this.list({ subscriptionStatus });
    },

    async getByCountry(country: string): Promise<Client[]> {
        return this.list({ country });
    },

    async checkEmailExists(email: string): Promise<boolean> {
        try {
            const clients = await this.search(email);
            return clients.some(client => client.email.toLowerCase() === email.toLowerCase());
        } catch (err) {
            console.error('Error checking email existence:', err);
            return false;
        }
    },

    validateClientData(data: Partial<RegisterClientRequest>): { isValid: boolean; errors: string[] } {
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

    formatClientForDisplay(client: Client): Record<string, any> {
        return {
            id: client.uuid,
            clientCode: client.clientCode,
            companyName: client.companyName,
            ownerName: client.ownerName,
            email: client.email,
            phone: client.phone,
            address: client.address,
            country: client.country,
            timezone: client.timezone,
            subscriptionStatus: client.subscriptionStatus,
            status: client.status,
            trialEndsAt: client.trialEndsAt ? new Date(client.trialEndsAt) : null,
            registeredAt: new Date(client.registeredAt),
            createdAt: client.createdAt ? new Date(client.createdAt) : null,
            updatedAt: client.updatedAt ? new Date(client.updatedAt) : null
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
                console.error(`Failed to delete client ${id}:`, err);
            }
        }

        return results;
    },

    async bulkUpdate(updates: Array<{ id: string; data: Partial<RegisterClientRequest> }>): Promise<{ success: string[]; failed: string[] }> {
        const results = { success: [], failed: [] };

        for (const update of updates) {
            try {
                await this.update(update.id, update.data);
                results.success.push(update.id);
            } catch (err) {
                results.failed.push(update.id);
                console.error(`Failed to update client ${update.id}:`, err);
            }
        }

        return results;
    },

    async exportClients(format: 'json' | 'csv' = 'json', filters: ClientQueryParams = {}): Promise<string> {
        try {
            const clients = await this.list(filters);

            if (format === 'json') {
                return JSON.stringify(clients, null, 2);
            } else {
                return this.convertToCSV(clients);
            }
        } catch (err) {
            console.error('Error exporting clients:', err);
            throw err;
        }
    },

    convertToCSV(clients: Client[]): string {
        if (clients.length === 0) return '';

        const headers = Object.keys(clients[0]).filter(key => key !== '_id');
        const csvContent = [
            headers.join(','),
            ...clients.map(client =>
                headers.map(header => {
                    const value = (client as any)[header];
                    return typeof value === 'string' && value.includes(',')
                        ? `"${value}"`
                        : value;
                }).join(',')
            )
        ].join('\n');

        return csvContent;
    },

    async getClientStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        bySubscriptionStatus: Record<string, number>;
        byCountry: Record<string, number>;
        recentRegistrations: number;
    }> {
        try {
            const allClients = await this.list();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            return {
                total: allClients.length,
                byStatus: this.groupBy(allClients, 'status'),
                bySubscriptionStatus: this.groupBy(allClients, 'subscriptionStatus'),
                byCountry: this.groupBy(allClients, 'country'),
                recentRegistrations: allClients.filter(client =>
                    new Date(client.registeredAt) >= thirtyDaysAgo
                ).length
            };
        } catch (err) {
            console.error('Error fetching client stats:', err);
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