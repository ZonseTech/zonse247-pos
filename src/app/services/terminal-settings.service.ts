import api from './http.service';

const endpoints: Record<string, string> = {
    all: 'terminal-settings',
    defaults: 'terminal-settings/defaults',
    configured: 'terminal-settings/configured',
    getOrCreate: 'terminal-settings/get-or-create',
    show: 'terminal-settings',
    store: 'terminal-settings',
    update: 'terminal-settings',
    updateGroup: 'terminal-settings',
    deactivate: 'terminal-settings',
    reset: 'terminal-settings',
    delete: 'terminal-settings',
};

const terminalSettingsService = {
    endpoints,

    /**
     * Get all terminal settings
     */
    async list(): Promise<Array<TerminalSettings>> {
        try {
            const response = await api.get<ApiResponse<Array<TerminalSettings>>>(endpoints.all);
            return response.data.data || [];
        } catch (err) {
            console.error('Error fetching terminal settings:', err);
            throw err;
        }
    },

    /**
     * Get default settings without persisting
     */
    async getDefaults(): Promise<TerminalDisplaySettings> {
        try {
            const response = await api.get<ApiResponse<TerminalDisplaySettings>>(endpoints.defaults);
            return response.data.data!;
        } catch (err) {
            console.error('Error fetching default settings:', err);
            throw err;
        }
    },

    /**
     * Check if terminal is configured
     */
    async isConfigured(): Promise<boolean> {
        try {
            const response = await api.get<ApiResponse<{ configured: boolean }>>(endpoints.configured);
            return response.data.data?.configured || false;
        } catch (err) {
            console.error('Error checking configuration:', err);
            throw err;
        }
    },

    /**
     * Get or create terminal settings
     */
    async getOrCreate(terminalId: string): Promise<TerminalDisplaySettings> {
        try {
            const response = await api.post<ApiResponse<TerminalDisplaySettings>>(
                endpoints.getOrCreate,
                { terminalId } as any
            );
            return response.data.data!;
        } catch (err) {
            console.error('Error getting or creating settings:', err);
            throw err;
        }
    },

    /**
     * Get settings by terminal ID
     */
    async show(terminalId: string): Promise<TerminalDisplaySettings> {
        try {
            const response = await api.get<ApiResponse<TerminalDisplaySettings>>(`${endpoints.show}/${terminalId}`);
            return response.data.data!;
        } catch (err) {
            console.error('Error fetching terminal settings:', err);
            throw err;
        }
    },

    /**
     * Create terminal settings
     */
    async store(data: CreateTerminalSettingsRequest): Promise<TerminalSettings> {
        try {
            const response = await api.post<ApiResponse<TerminalSettings>>(endpoints.store, data as any);
            return response.data.data!;
        } catch (err) {
            console.error('Error creating terminal settings:', err);
            throw err;
        }
    },

    /**
     * Update terminal settings
     */
    async update(terminalId: string, data: UpdateTerminalSettingsRequest): Promise<TerminalDisplaySettings> {
        try {
            const response = await api.put<ApiResponse<TerminalDisplaySettings>>(
                `${endpoints.update}/${terminalId}`,
                data as any
            );
            return response.data.data!;
        } catch (err) {
            console.error('Error updating terminal settings:', err);
            throw err;
        }
    },

    /**
     * Update a specific settings group
     */
    async updateGroup(
        terminalId: string,
        groupName: SettingsGroupName,
        data: Partial<GeneralSettings | ReceiptDisplaySettings | BusinessSettings | SecurityDisplaySettings>
    ): Promise<TerminalDisplaySettings> {
        try {
            const response = await api.patch<ApiResponse<TerminalDisplaySettings>>(
                `${endpoints.updateGroup}/${terminalId}/group/${groupName}`,
                data as any
            );
            return response.data.data!;
        } catch (err) {
            console.error(`Error updating ${groupName} settings:`, err);
            throw err;
        }
    },

    /**
     * Deactivate terminal settings (soft delete)
     */
    async deactivate(terminalId: string): Promise<boolean> {
        try {
            const response = await api.patch<ApiResponse<{ success: boolean }>>(
                `${endpoints.deactivate}/${terminalId}/deactivate`,
                {} as any
            );
            return response.data.data?.success || true;
        } catch (err) {
            console.error('Error deactivating terminal settings:', err);
            throw err;
        }
    },

    /**
     * Reset settings to defaults
     */
    async reset(terminalId: string): Promise<TerminalDisplaySettings> {
        try {
            const response = await api.post<ApiResponse<TerminalDisplaySettings>>(
                `${endpoints.reset}/${terminalId}/reset`,
                {} as any
            );
            return response.data.data!;
        } catch (err) {
            console.error('Error resetting terminal settings:', err);
            throw err;
        }
    },

    /**
     * Delete terminal settings (hard delete)
     */
    async delete(terminalId: string): Promise<boolean> {
        try {
            const response = await api.delete<ApiResponse<{ success: boolean }>>(`${endpoints.delete}/${terminalId}`);
            return response.data.data?.success || true;
        } catch (err) {
            console.error('Error deleting terminal settings:', err);
            throw err;
        }
    },

    /**
     * Helper: Get default general settings
     */
    getDefaultGeneralSettings(): GeneralSettings {
        return {
            dateFormat: 'DD/MM/YYYY',
            showProductImages: true,
            productDisplayMode: 'GRID',
            barcodeScanMode: 'AUTO',
            enableStockAlerts: true,
            enableVirtualKeyboard: false,
            virtualKeyboardLayout: 'qwerty',
            virtualKeyboardTheme: 'default',
            virtualKeyboardSound: true,
            virtualKeyboardHaptic: true,
        };
    },

    /**
     * Helper: Get default receipt settings
     */
    getDefaultReceiptSettings(): ReceiptDisplaySettings {
        return {
            storeName: '',
            storePhone: '',
            storeAddress: '',
            storeWebsite: '',
            taxTitle: 'VAT',
            businessTaxId: '',
            logoUrl: '',
            receiptHeader: '',
            showPhoneOnReceipt: true,
            showAddressOnReceipt: true,
            showTaxOnReceipt: true,
            showWebsiteOnReceipt: false,
            showStoreLogo: true,
            showListPrice: false,
            showRateInReceipt: true,
            showTotalMoneySaved: false,
            showCashierName: true,
            showCustomerPhone: false,
            showCustomerAddress: false,
            thankYouNote: 'Thank you for your purchase!',
            useAppLanguage: true,
            showTotalItemCount: true,
            showChangeReturn: true,
            showPaymentDetails: true,
            showPoweredBy: true,
            orderItemsBy: 'orderAdded',
            messageTemplate: '',
            whatsappShareApp: 'whatsapp',
        };
    },

    /**
     * Helper: Get default business settings
     */
    getDefaultBusinessSettings(): BusinessSettings {
        return {
            receiptNumberPrefix: 'RCP',
            autoApplyTax: true,
            taxInclusivePricing: true,
            taxRate: 15,
            enableDiscounts: true,
            requirePinForDiscount: false,
            maxDiscountPercentage: 100,
            roundingEnabled: false,
            tableManagementEnabled: false,
            inventoryHealthScoreEnabled: true,
        };
    },

    /**
     * Helper: Get default security settings
     */
    getDefaultSecuritySettings(): SecurityDisplaySettings {
        return {
            autoSyncOnReconnect: true,
            requirePinForVoid: false,
            requirePinForReturn: false,
            enableNotifications: true,
            apiBaseUrl: '',
        };
    },
};

export default terminalSettingsService;
