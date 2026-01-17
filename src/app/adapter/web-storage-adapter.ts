class WebStorageAdapter implements DataStoreAdapter {
    private readonly SETUP_KEY = 'user';
    private readonly SIGNATURE_KEY = 'app_signature';
    private readonly ACTIVE_BRANCH_KEY = 'active_branch';

    async hasSetup(): Promise<{ data: boolean; success: boolean }> {
        try {
            const data = sessionStorage.getItem(this.SETUP_KEY);
            return { data: data !== null, success: true };
        } catch (error) {
            return { data: false, success: false };
        }
    }

    async getSetup(): Promise<{ data: SetupData | null; success: boolean; error?: string }> {
        try {
            const data = sessionStorage.getItem(this.SETUP_KEY);
            if (!data) {
                return { data: null, success: true };
            }
            return { data: JSON.parse(data), success: true };
        } catch (error) {
            return { data: null, success: false, error: String(error) };
        }
    }

    async saveSetup(data: SetupData): Promise<{ success: boolean; error?: string }> {
        try {
            sessionStorage.setItem(this.SETUP_KEY, JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    async updateSetup(updates: Partial<SetupData>): Promise<{ success: boolean; error?: string }> {
        try {
            const current = await this.getSetup();
            if (!current.success || !current.data) {
                return { success: false, error: 'No existing setup to update' };
            }
            const updated = { ...current.data, ...updates };
            return this.saveSetup(updated);
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    async clearSetup(): Promise<{ success: boolean; error?: string }> {
        try {
            sessionStorage.removeItem(this.SETUP_KEY);
            sessionStorage.removeItem(this.SIGNATURE_KEY);
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    async getSignature(): Promise<{ data: string | null; success: boolean; error?: string }> {
        try {
            const data = sessionStorage.getItem(this.SIGNATURE_KEY);
            return { data, success: true };
        } catch (error) {
            return { data: null, success: false, error: String(error) };
        }
    }

    async getActiveBranch(): Promise<ApiResponse<{
        branchId: string;
        tenantId: string;
        terminalId: string;
        branch: Branch | null;
    } | null>> {
        try {
            const data = sessionStorage.getItem(this.ACTIVE_BRANCH_KEY);
            if (!data) {
                return { data: null, success: true };
            }
            const parsed = JSON.parse(data);
            return { data: parsed, success: true };
        } catch (error) {
            return { data: null, success: false, error: String(error) };
        }
    }

    async setActiveBranch(branchId: string): Promise<ApiResponse<{
        branchId: string;
        tenantId: string;
        terminalId: string;
        branch: Branch | null;
    }>> {
        try {
            // For web, we store a minimal branch info structure
            // The actual branch switching is handled by the API via BranchContext
            const data = {
                branchId,
                tenantId: '',
                terminalId: '',
                branch: null
            };
            sessionStorage.setItem(this.ACTIVE_BRANCH_KEY, JSON.stringify(data));
            return { data, success: true };
        } catch (error) {
            return { data: { branchId, tenantId: '', terminalId: '', branch: null }, success: false, error: String(error) };
        }
    }

    async getAvailableBranches(): Promise<ApiResponse<Branch[]>> {
        // For web, branches are fetched from the API via BranchContext
        // This is just a placeholder - web apps should use the API directly
        return { data: [], success: true };
    }
}

export default WebStorageAdapter