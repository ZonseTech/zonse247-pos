class WebStorageAdapter implements DataStoreAdapter {
    private readonly SETUP_KEY = 'app_setup';
    private readonly SIGNATURE_KEY = 'app_signature';

    async hasSetup(): Promise<{ data: boolean; success: boolean }> {
        try {
            const data = localStorage.getItem(this.SETUP_KEY);
            return { data: data !== null, success: true };
        } catch (error) {
            return { data: false, success: false };
        }
    }

    async getSetup(): Promise<{ data: SetupData | null; success: boolean; error?: string }> {
        try {
            const data = localStorage.getItem(this.SETUP_KEY);
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
            localStorage.setItem(this.SETUP_KEY, JSON.stringify(data));
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
            localStorage.removeItem(this.SETUP_KEY);
            localStorage.removeItem(this.SIGNATURE_KEY);
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    async getSignature(): Promise<{ data: string | null; success: boolean; error?: string }> {
        try {
            const data = localStorage.getItem(this.SIGNATURE_KEY);
            return { data, success: true };
        } catch (error) {
            return { data: null, success: false, error: String(error) };
        }
    }
}

export default WebStorageAdapter