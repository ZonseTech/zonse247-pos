import api from './http.service';

/**
 * Tenant Registration Detail Service
 * Handles all tenant registration detail API calls
 * 
 * Routes:
 * - GET /tenant-registration-details                           - List all registration details
 * - GET /tenant-registration-details?processed=false           - List unprocessed only
 * - GET /tenant-registration-details?tenantId=xxx              - Filter by tenant ID
 * - GET /tenant-registration-details?email=xxx                 - Filter by email
 * - GET /tenant-registration-details/:detailId                 - View single detail
 * - PUT /tenant-registration-details/:detailId/mark-processed  - Mark as processed
 * - DELETE /tenant-registration-details/:detailId              - Delete a detail
 */

const BASE_PATH = 'tenant-registration-details';

const endpoints = {
    root: BASE_PATH,
    list: BASE_PATH,
    show: BASE_PATH,
    markProcessed: BASE_PATH,
    delete: BASE_PATH,
};

const tenantRegistrationDetailService = {
    endpoints,

    /**
     * GET /tenant-registration-details - List all registration details
     * Supports filtering by processed status, tenantId, and email
     * @param query Query parameters for filtering
     * @returns Array of tenant registration details
     */
    async list(query: TenantRegistrationDetailQueryParams = {}): Promise<TenantRegistrationDetail[]> {
        try {
            const response = await api.get<ApiResponse<TenantRegistrationDetail[]>>(endpoints.list, query);
            return response.data.data || [];
        } catch (err) {
            console.error('Error fetching tenant registration details:', err);
            throw err;
        }
    },

    /**
     * GET /tenant-registration-details - List with pagination
     * @param query Query parameters including pagination
     * @returns Paginated response of tenant registration details
     */
    async listPaginated(query: TenantRegistrationDetailQueryParams = {}): Promise<PaginatedResponse<TenantRegistrationDetail>> {
        try {
            const response = await api.get<PaginatedResponse<TenantRegistrationDetail>>(endpoints.list, {
                ...query,
                paginated: true
            });
            return response.data;
        } catch (err) {
            console.error('Error fetching paginated tenant registration details:', err);
            throw err;
        }
    },

    /**
     * GET /tenant-registration-details?processed=false - List unprocessed only
     * @returns Array of unprocessed tenant registration details
     */
    async listUnprocessed(): Promise<TenantRegistrationDetail[]> {
        return this.list({ processed: false });
    },

    /**
     * GET /tenant-registration-details?tenantId=xxx - Filter by tenant ID
     * @param tenantId The tenant ID to filter by
     * @returns Array of tenant registration details for the tenant
     */
    async getByTenantId(tenantId: string): Promise<TenantRegistrationDetail[]> {
        return this.list({ tenantId });
    },

    /**
     * GET /tenant-registration-details?email=xxx - Filter by email
     * @param email The email to filter by
     * @returns Array of tenant registration details for the email
     */
    async getByEmail(email: string): Promise<TenantRegistrationDetail[]> {
        return this.list({ email });
    },

    /**
     * GET /tenant-registration-details/:detailId - View single detail
     * @param detailId The detail ID to fetch
     * @returns Single tenant registration detail
     */
    async show(detailId: string): Promise<TenantRegistrationDetail> {
        try {
            const response = await api.get<ApiResponse<TenantRegistrationDetail>>(`${endpoints.show}/${detailId}`);
            return response.data.data!;
        } catch (err) {
            console.error('Error fetching tenant registration detail:', err);
            throw err;
        }
    },

    /**
     * PUT /tenant-registration-details/:detailId/mark-processed - Mark as processed
     * @param detailId The detail ID to mark as processed
     * @returns Updated tenant registration detail
     */
    async markProcessed(detailId: string): Promise<MarkProcessedResponse> {
        try {
            const response = await api.put<ApiResponse<MarkProcessedResponse>>(
                `${endpoints.markProcessed}/${detailId}/mark-processed`,
                {} as any
            );
            return response.data.data!;
        } catch (err) {
            console.error('Error marking tenant registration detail as processed:', err);
            throw err;
        }
    },

    /**
     * DELETE /tenant-registration-details/:detailId - Delete a detail
     * @param detailId The detail ID to delete
     * @returns Success status
     */
    async delete(detailId: string): Promise<{ status: boolean }> {
        try {
            const response = await api.delete<ApiResponse<{ status: boolean }>>(`${endpoints.delete}/${detailId}`);
            return response.data.data || { status: true };
        } catch (err) {
            console.error('Error deleting tenant registration detail:', err);
            throw err;
        }
    },

    /**
     * Search tenant registration details by various criteria
     * @param searchTerm The search term
     * @param filters Additional filters
     * @returns Array of matching tenant registration details
     */
    async search(searchTerm: string, filters: Omit<TenantRegistrationDetailQueryParams, 'search'> = {}): Promise<TenantRegistrationDetail[]> {
        return this.list({
            ...filters,
            search: searchTerm
        });
    },

    /**
     * Bulk delete multiple tenant registration details
     * @param detailIds Array of detail IDs to delete
     * @returns Results of bulk delete operation
     */
    async bulkDelete(detailIds: string[]): Promise<{ success: string[]; failed: string[] }> {
        const results = { success: [] as string[], failed: [] as string[] };

        for (const detailId of detailIds) {
            try {
                await this.delete(detailId);
                results.success.push(detailId);
            } catch {
                results.failed.push(detailId);
            }
        }

        return results;
    },

    /**
     * Bulk mark multiple tenant registration details as processed
     * @param detailIds Array of detail IDs to mark as processed
     * @returns Results of bulk mark processed operation
     */
    async bulkMarkProcessed(detailIds: string[]): Promise<{ success: string[]; failed: string[] }> {
        const results = { success: [] as string[], failed: [] as string[] };

        for (const detailId of detailIds) {
            try {
                await this.markProcessed(detailId);
                results.success.push(detailId);
            } catch {
                results.failed.push(detailId);
            }
        }

        return results;
    },

    /**
     * Get statistics about tenant registration details
     * @returns Statistics object
     */
    async getStats(): Promise<{
        total: number;
        processed: number;
        unprocessed: number;
    }> {
        try {
            const [all, unprocessed] = await Promise.all([
                this.list(),
                this.listUnprocessed()
            ]);

            return {
                total: all.length,
                processed: all.length - unprocessed.length,
                unprocessed: unprocessed.length
            };
        } catch (err) {
            console.error('Error fetching tenant registration detail stats:', err);
            throw err;
        }
    },

    /**
     * Validate email format
     * @param email Email to validate
     * @returns Boolean indicating if email is valid
     */
    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Format tenant registration detail for display
     * @param detail The detail to format
     * @returns Formatted detail object
     */
    formatForDisplay(detail: TenantRegistrationDetail): Record<string, any> {
        return {
            id: detail.detailId,
            tenantId: detail.tenantId,
            businessName: detail.businessName,
            ownerName: detail.ownerName,
            email: detail.email,
            tenantCode: detail.tenantCode,
            username: detail.username,
            isProcessed: detail.isProcessed,
            processedAt: detail.processedAt ? new Date(detail.processedAt) : null,
            createdAt: new Date(detail.createdAt),
            updatedAt: new Date(detail.updatedAt)
        };
    }
};

export default tenantRegistrationDetailService;
