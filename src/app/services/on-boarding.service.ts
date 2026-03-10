import axios, { AxiosError } from "axios";
import api from "./http.service";

/**
 * Live server API URL for onboarding activation
 * This bypasses the local API and calls the remote server directly
 */
const LIVE_API_URL = import.meta.env.VITE_LIVE_API_URL;

/**
 * LocalStorage key for storing the activated terminal ID during onboarding
 */
const ONBOARDING_TERMINAL_ID_KEY = 'onboarding_terminal_id';

/**
 * LocalStorage key for storing validation params during onboarding
 */
const ONBOARDING_VALIDATION_PARAMS_KEY = 'onboarding_validation_params';

/**
 * Store activated terminal ID in localStorage
 */
const storeTerminalId = (terminalId: string): void => {
    try {
        localStorage.setItem(ONBOARDING_TERMINAL_ID_KEY, terminalId);
    } catch (err) {
        console.warn('Failed to store terminal ID:', err);
    }
};

/**
 * Store validation params from terminal activation
 */
const storeValidationParams = (params: ValidationParams): void => {
    try {
        localStorage.setItem(ONBOARDING_VALIDATION_PARAMS_KEY, JSON.stringify(params));
    } catch (err) {
        console.warn('Failed to store validation params:', err);
    }
};

/**
 * Get stored validation params from localStorage
 */
const getStoredValidationParams = (): ValidationParams | null => {
    try {
        const params = localStorage.getItem(ONBOARDING_VALIDATION_PARAMS_KEY);
        return params ? JSON.parse(params) : null;
    } catch (err) {
        console.warn('Failed to get stored validation params:', err);
        return null;
    }
};

/**
 * Get stored terminal ID from localStorage
 */
const getStoredTerminalId = (): string | null => {
    try {
        return localStorage.getItem(ONBOARDING_TERMINAL_ID_KEY);
    } catch (err) {
        console.warn('Failed to get stored terminal ID:', err);
        return null;
    }
};

/**
 * Clear terminal ID from localStorage (call after onboarding completes)
 */
const clearStoredTerminalId = (): void => {
    try {
        localStorage.removeItem(ONBOARDING_TERMINAL_ID_KEY);
        localStorage.removeItem(ONBOARDING_VALIDATION_PARAMS_KEY);
    } catch (err) {
        console.warn('Failed to clear terminal ID:', err);
    }
};

/**
 * Map step types to FETCH endpoint paths (relative to /onboarding/)
 * These endpoints are called on LIVE_API_URL to get data from the cloud
 */
const STEP_TO_FETCH_ENDPOINT_MAP: Record<OnboardingStepType, string | null> = {
    'TERMINAL_ACTIVATION': null,
    'TERMINAL_DETAILS_SAVE': null,
    'MRA_SETUP': null,
    'CUSTOMERS_SYNC': 'fetch/customers',
    'CATEGORIES_SYNC': 'fetch/categories',
    'SUBSCRIPTION_PLANS_SYNC': 'fetch/subscription-plans',
    'PAYMENT_METHODS_SYNC': 'fetch/payment-methods',
    'PAYMENT_PROVIDERS_SYNC': 'fetch/payment-providers',
    'PRODUCTS_SYNC': null,
    'INVENTORY_SYNC': null,
    'USERS_SYNC': null,
    'SETTINGS_SYNC': null
};

/**
 * Map step types to SYNC endpoint paths (relative to /onboarding/)
 * These endpoints are called on LOCAL API to save data to local database
 */
const STEP_TO_SYNC_ENDPOINT_MAP: Record<OnboardingStepType, string | null> = {
    'TERMINAL_ACTIVATION': null,
    'TERMINAL_DETAILS_SAVE': null,
    'MRA_SETUP': null,
    'CUSTOMERS_SYNC': 'sync/customers',
    'CATEGORIES_SYNC': 'sync/categories',
    'SUBSCRIPTION_PLANS_SYNC': 'sync/subscription-plans',
    'PAYMENT_METHODS_SYNC': 'sync/payment-methods',
    'PAYMENT_PROVIDERS_SYNC': 'sync/payment-providers',
    'PRODUCTS_SYNC': null,
    'INVENTORY_SYNC': null,
    'USERS_SYNC': null,
    'SETTINGS_SYNC': null
};

/**
 * Map step types to their expected payload data key
 * The local API expects data wrapped in specific keys (e.g., { plans: [...] })
 */
const STEP_TO_DATA_KEY_MAP: Record<OnboardingStepType, string | null> = {
    'TERMINAL_ACTIVATION': null,
    'TERMINAL_DETAILS_SAVE': null,
    'MRA_SETUP': null,
    'CUSTOMERS_SYNC': 'customers',
    'CATEGORIES_SYNC': 'categories',
    'SUBSCRIPTION_PLANS_SYNC': 'plans',
    'PAYMENT_METHODS_SYNC': 'paymentMethods',
    'PAYMENT_PROVIDERS_SYNC': 'providers',
    'PRODUCTS_SYNC': 'products',
    'INVENTORY_SYNC': 'inventory',
    'USERS_SYNC': 'users',
    'SETTINGS_SYNC': 'settings'
};

/**
 * Onboarding status response
 * Returns data from local backend - UI derives the view from progress steps
 */
interface OnboardingStatusResponse {
    hasProgress: boolean;
    terminalId?: string;
    progress?: OnboardingProgress;
}

export default {
    /**
     * Check onboarding status from local backend
     * First checks localStorage for terminal ID, then fetches progress
     * @returns Onboarding status with progress data if found
     */
    async checkOnboardingStatus(): Promise<OnboardingStatusResponse> {
        try {
            // Step 1: Check localStorage for stored terminal ID
            const terminalId = getStoredTerminalId();

            if (!terminalId) {
                // No terminal ID found - fresh start, show activation
                return { hasProgress: false };
            }

            // Step 2: Try to get onboarding progress for this terminal
            try {
                const progressResponse = await api.get<ApiResponse<OnboardingProgress>>(
                    `onboarding/progress/${terminalId}`
                );
                const progress = progressResponse.data.data;

                if (progress) {
                    return {
                        hasProgress: true,
                        terminalId,
                        progress
                    };
                }
            } catch (err: any) {
                // Progress not found is OK - terminal ID exists but no progress yet
                if (err.response?.status === 404) {
                    return {
                        hasProgress: false,
                        terminalId
                    };
                }
            }

            return {
                hasProgress: false,
                terminalId
            };
        } catch (err: any) {
            console.warn('Failed to check onboarding status:', err);
            return { hasProgress: false };
        }
    },

    /**
     * Activate a terminal using an activation code
     * Calls the LIVE server API directly to activate the terminal
     * Stores the terminal ID in localStorage for onboarding persistence
     * @param activationCode - The activation code provided by admin
     * @returns Terminal with relations (tenant, branch, subscription)
     */
    async activateTerminal(activationCode: string): Promise<TerminalWithRelations> {
        try {
            // Call live server directly for terminal activation
            const response = await axios.post<ApiResponse<TerminalWithRelations>>(
                `${LIVE_API_URL}/onboarding/terminal/activate`,
                { activationCode },
                {
                    timeout: 30000,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-client-type': 'web',
                    }
                }
            );

            const terminalData = response.data.data!;

            // Store terminal ID in localStorage for onboarding persistence
            storeTerminalId(terminalData.terminalId);

            // Store validation params from activation data
            const validationParams: ValidationParams = {
                terminalId: terminalData.terminalId,
                tenantId: terminalData.tenantId,
                branchId: terminalData.branchId,
                verificationKey: terminalData.terminalCode
            };
            storeValidationParams(validationParams);

            return terminalData;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to activate terminal'
            );
        }
    },

    /**
     * Save terminal details to local database
     * @param terminalData - Terminal data with relations
     * @returns Save result with status for each entity
     */
    async saveTerminalDetails(terminalData: TerminalWithRelations): Promise<SaveTerminalDetailsResult> {
        try {
            const response = await api.post<ApiResponse<SaveTerminalDetailsResult>>(
                'onboarding/terminal/save',
                terminalData as any
            );

            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to save terminal details'
            );
        }
    },

    /**
     * Set terminal activation status to ACTIVATED
     * 1. POST /onboarding/terminal/set-activated (LIVE API)
     * 2. Sync result to LOCAL API
     * @param terminalId - Terminal ID to activate
     * @returns Updated terminal
     */
    async setTerminalActivated(terminalId: string): Promise<Terminal> {
        try {
            const response = await axios.post<ApiResponse<Terminal>>(
                `${LIVE_API_URL}/onboarding/terminal/set-activated`,
                { terminalId },
                {
                    timeout: 30000,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-client-type': 'web',
                    }
                }
            );

            const updatedTerminal = response.data.data!;

            try {
                await api.post<ApiResponse<Terminal>>(
                    'onboarding/terminal/set-activated',
                    { terminalId } as any
                );
            } catch (localErr) {
                console.warn('Failed to sync terminal status to local API:', localErr);
            }

            return updatedTerminal;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to set terminal as activated'
            );
        }
    },

    /**
     * Initialize onboarding progress for a terminal
     * @param request - Init request with terminal ID
     * @returns Initialized progress
     */
    async initializeProgress(request: InitOnboardingProgressRequest): Promise<OnboardingProgress> {
        try {
            const response = await api.post<ApiResponse<OnboardingProgress>>(
                'onboarding/progress/init',
                request as any
            );
            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to initialize onboarding progress'
            );
        }
    },

    /**
     * Get onboarding progress for a terminal
     * @param terminalId - Terminal ID
     * @returns Progress data or null
     */
    async getProgress(terminalId: string): Promise<OnboardingProgress | null> {
        try {
            const response = await api.get<ApiResponse<OnboardingProgress>>(
                `onboarding/progress/${terminalId}`
            );
            return response.data.data || null;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            if (axiosError?.response?.status === 404) {
                return null;
            }
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to get onboarding progress'
            );
        }
    },

    /**
     * Start an onboarding step
     * @param terminalId - Terminal ID
     * @param stepType - Step type to start
     * @returns Updated progress
     */
    async startStep(terminalId: string, stepType: OnboardingStepType): Promise<OnboardingProgress> {
        try {
            const response = await api.post<ApiResponse<OnboardingProgress>>(
                'onboarding/progress/step/start',
                { terminalId, stepType } as any
            );
            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to start step'
            );
        }
    },

    /**
     * Complete an onboarding step
     * @param terminalId - Terminal ID
     * @param stepType - Step type to complete
     * @param metadata - Optional metadata to store
     * @returns Updated progress
     */
    async completeStep(
        terminalId: string,
        stepType: OnboardingStepType,
        metadata?: Record<string, any>
    ): Promise<OnboardingProgress> {
        try {
            const response = await api.post<ApiResponse<OnboardingProgress>>(
                'onboarding/progress/step/complete',
                { terminalId, stepType, metadata } as any
            );
            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to complete step'
            );
        }
    },

    /**
     * Mark an onboarding step as failed
     * @param terminalId - Terminal ID
     * @param stepType - Step type that failed
     * @param errorMessage - Error description
     * @returns Updated progress
     */
    async failStep(
        terminalId: string,
        stepType: OnboardingStepType,
        errorMessage: string
    ): Promise<OnboardingProgress> {
        try {
            const response = await api.post<ApiResponse<OnboardingProgress>>(
                'onboarding/progress/step/fail',
                { terminalId, stepType, errorMessage } as any
            );
            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to mark step as failed'
            );
        }
    },

    /**
     * Skip an onboarding step
     * @param terminalId - Terminal ID
     * @param stepType - Step type to skip
     * @param reason - Optional reason for skipping
     * @returns Updated progress
     */
    async skipStep(
        terminalId: string,
        stepType: OnboardingStepType,
        reason?: string
    ): Promise<OnboardingProgress> {
        try {
            const response = await api.post<ApiResponse<OnboardingProgress>>(
                'onboarding/progress/step/skip',
                { terminalId, stepType, reason } as any
            );
            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to skip step'
            );
        }
    },

    /**
     * Reset onboarding progress
     * @param terminalId - Terminal ID
     * @returns Reset progress
     */
    async resetProgress(terminalId: string): Promise<OnboardingProgress> {
        try {
            const response = await api.post<ApiResponse<OnboardingProgress>>(
                `onboarding/progress/${terminalId}/reset`,
                {} as any
            );
            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to reset progress'
            );
        }
    },

    /**
     * Get the next step to complete
     * @param terminalId - Terminal ID
     * @returns Next step type or null if complete
     */
    async getNextStep(terminalId: string): Promise<OnboardingStepType | null> {
        try {
            const response = await api.get<ApiResponse<{ nextStep: OnboardingStepType | null }>>(
                `onboarding/progress/${terminalId}/next-step`
            );
            return response.data.data?.nextStep || null;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to get next step'
            );
        }
    },

    /**
     * Configure terminal settings
     * POST /onboarding/settings/configure
     * @param terminalId - Terminal ID
     * @param settings - Settings configuration
     * @returns Created settings
     */
    async configureSettings(terminalId: string, settings: any): Promise<any> {
        try {
            const response = await api.post<ApiResponse<any>>(
                'onboarding/settings/configure',
                { terminalId, ...settings }
            );
            return response.data.data;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to configure settings'
            );
        }
    },

    /**
     * Get all settings
     * GET /onboarding/settings
     * @returns All settings
     */
    async getAllSettings(): Promise<any[]> {
        try {
            const response = await api.get<ApiResponse<any[]>>('onboarding/settings');
            return response.data.data || [];
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to get settings'
            );
        }
    },

    /**
     * Update step status
     * PUT /onboarding/progress/step
     * @param terminalId - Terminal ID
     * @param stepType - Step type
     * @param status - New status
     * @param metadata - Optional metadata
     * @returns Updated progress
     */
    async updateStepStatus(
        terminalId: string,
        stepType: OnboardingStepType,
        status: OnboardingStepStatus,
        metadata?: Record<string, any>
    ): Promise<OnboardingProgress> {
        try {
            const response = await api.put<ApiResponse<OnboardingProgress>>(
                'onboarding/progress/step',
                { terminalId, stepType, status, metadata } as any
            );
            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to update step status'
            );
        }
    },

    /**
     * Delete onboarding progress
     * DELETE /onboarding/progress/:terminalId
     * @param terminalId - Terminal ID
     * @returns Deletion result
     */
    async deleteProgress(terminalId: string): Promise<void> {
        try {
            await api.delete<ApiResponse<void>>(`onboarding/progress/${terminalId}`);
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to delete progress'
            );
        }
    },

    /**
     * Fetch data from LIVE API (cloud server)
     * Uses stored validation params from terminal activation
     * @param stepType - The step type being executed
     * @returns Fetched data from cloud
     */
    async fetchFromLiveApi(stepType: OnboardingStepType): Promise<any> {
        const fetchEndpoint = STEP_TO_FETCH_ENDPOINT_MAP[stepType];

        if (!fetchEndpoint) {
            throw new Error(`Step type ${stepType} does not have a fetch endpoint`);
        }

        // Get stored validation params from terminal activation
        const params = getStoredValidationParams();
        if (!params) {
            throw new Error('No validation params found. Please activate terminal first.');
        }

        try {
            const response = await axios.post<ApiResponse<any>>(
                `${LIVE_API_URL}/onboarding/${fetchEndpoint}`,
                params,
                {
                    timeout: 60000,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-client-type': 'web',
                    }
                }
            );
            return response.data.data;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                `Failed to fetch ${stepType} from cloud`
            );
        }
    },

    /**
     * Sync data to LOCAL API (local database)
     * Uses stored validation params from terminal activation
     * @param stepType - The step type being executed
     * @param data - Data to sync to local database
     * @returns Sync result
     */
    async syncToLocalApi(stepType: OnboardingStepType, data: any): Promise<any> {
        const syncEndpoint = STEP_TO_SYNC_ENDPOINT_MAP[stepType];
        const dataKey = STEP_TO_DATA_KEY_MAP[stepType];

        if (!syncEndpoint) {
            throw new Error(`Step type ${stepType} does not have a sync endpoint`);
        }

        // Get stored validation params from terminal activation
        const params = getStoredValidationParams();
        if (!params) {
            throw new Error('No validation params found. Please activate terminal first.');
        }

        try {
            // Build payload with data wrapped in expected key (e.g., { plans: [...] })
            const payload = dataKey
                ? { ...params, [dataKey]: data }
                : { ...params, data };

            const response = await api.post<ApiResponse<any>>(
                `onboarding/${syncEndpoint}`,
                payload as any
            );
            return response.data.data;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                `Failed to sync ${stepType} to local database`
            );
        }
    },

    /**
     * Execute a sync step: fetch from LIVE API then sync to LOCAL API
     * 1. Fetches data from cloud server (LIVE_API_URL)
     * 2. Syncs the fetched data to local database (LOCAL API)
     * Uses stored validation params from terminal activation
     * @param stepType - The step type being executed
     * @returns Sync result
     */
    async executeSyncStep(stepType: OnboardingStepType): Promise<any> {
        const fetchEndpoint = STEP_TO_FETCH_ENDPOINT_MAP[stepType];
        const syncEndpoint = STEP_TO_SYNC_ENDPOINT_MAP[stepType];

        if (!fetchEndpoint || !syncEndpoint) {
            throw new Error(`Step type ${stepType} does not have fetch/sync endpoints`);
        }

        // Get stored validation params from terminal activation
        const params = getStoredValidationParams();
        if (!params) {
            throw new Error('No validation params found. Please activate terminal first.');
        }

        try {
            // Step 1: Fetch data from LIVE API (cloud)
            const fetchedData = await axios.post<ApiResponse<any>>(
                `${LIVE_API_URL}/onboarding/${fetchEndpoint}`,
                params,
                {
                    timeout: 60000,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-client-type': 'web',
                    }
                }
            );

            const cloudData = fetchedData.data.data;

            // Step 2: Sync fetched data to LOCAL API (local database)
            const syncResponse = await api.post<ApiResponse<any>>(
                `onboarding/${syncEndpoint}`,
                { ...params, data: cloudData } as any
            );

            return syncResponse.data.data;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                `Failed to sync ${stepType}`
            );
        }
    },

    /**
     * Get fetch endpoint for a step type (LIVE API)
     * Returns the endpoint path relative to /onboarding/
     */
    getFetchEndpoint(stepType: OnboardingStepType): string | null {
        return STEP_TO_FETCH_ENDPOINT_MAP[stepType];
    },

    /**
     * Get sync endpoint for a step type (LOCAL API)
     * Returns the endpoint path relative to /onboarding/
     */
    getSyncEndpoint(stepType: OnboardingStepType): string | null {
        return STEP_TO_SYNC_ENDPOINT_MAP[stepType];
    },

    /**
     * Check if a step type has both fetch and sync endpoints
     */
    hasSyncEndpoints(stepType: OnboardingStepType): boolean {
        return !!(STEP_TO_FETCH_ENDPOINT_MAP[stepType] && STEP_TO_SYNC_ENDPOINT_MAP[stepType]);
    },

    /**
     * Get stored validation params from terminal activation
     * Returns null if not found (terminal not activated)
     */
    getValidationParams(): ValidationParams | null {
        return getStoredValidationParams();
    },

    /**
     * @deprecated Use getSyncEndpoint instead
     * Get metadata endpoint for a step type (legacy method for backwards compatibility)
     */
    getMetadataEndpoint(stepType: OnboardingStepType): string | null {
        return STEP_TO_SYNC_ENDPOINT_MAP[stepType];
    },

    // =====================================
    // LEGACY METHODS (for backward compat)
    // =====================================

    /**
     * @deprecated Use activateTerminal instead
     */
    async verify(credentials: TerminalVerificationParams): Promise<Tenant> {
        try {
            const response = await api.post<ApiResponse<Tenant>>('on-boarding/verify-tenant', credentials as any);
            return response.data.data!;
        } catch (err) {
            throw err;
        }
    },

    /**
     * @deprecated Use activateTerminal instead
     */
    async listByTenantId(tenantId: string): Promise<ApiResponse> {
        return api
            .get<ApiResponse>(`on-boarding/tenant/${tenantId}/branches`)
            .then((res) => res.data)
            .catch((err: AxiosError) => {
                throw err?.response?.data;
            });
    },

    /**
     * @deprecated Use activateTerminal instead
     */
    async listByBranchId(branchId: string): Promise<Array<Terminal>> {
        return api
            .get<ApiResponse<Array<Terminal>>>(`on-boarding/branch/${branchId}/terminals`)
            .then((res) => res.data.data)
            .catch((err: AxiosError) => {
                throw err?.response?.data;
            });
    },

    /**
     * Clear onboarding data from localStorage
     * Call this after onboarding is completed successfully
     */
    clearOnboardingStorage(): void {
        clearStoredTerminalId();
    },

    // =============================================
    // INITIAL SYNC API - Based on zonse247-pos-api
    // Uses: MasterDataFetchService & InitialSyncService
    // =============================================

    /**
     * Master data tables in dependency order (matching API INITIAL_SYNC_TABLES)
     */
    INITIAL_SYNC_TABLES: [
        'districts',
        'roles',
        'permissions',
        'rolePermissions',
        'subscriptionPlans',
        'planFeatures',
        'paymentMethods',
        'paymentServiceProviders',
        'categories',
        'suppliers',
        'customers',
        'products',
        'productVariants',
        'productBarcodes',
        'variantBarcodes',
        'inventory',
        'users',
    ] as InitialSyncTable[],

    /**
     * Get human-readable labels for sync tables
     */
    getTableLabel(table: InitialSyncTable): string {
        const labels: Record<InitialSyncTable, string> = {
            districts: 'Districts',
            roles: 'User Roles',
            permissions: 'Permissions',
            rolePermissions: 'Role Permissions',
            subscriptionPlans: 'Subscription Plans',
            planFeatures: 'Plan Features',
            paymentMethods: 'Payment Methods',
            paymentServiceProviders: 'Payment Providers',
            categories: 'Product Categories',
            suppliers: 'Suppliers',
            customers: 'Customers',
            products: 'Products',
            productVariants: 'Product Variants',
            productBarcodes: 'Product Barcodes',
            variantBarcodes: 'Variant Barcodes',
            inventory: 'Inventory',
            users: 'Users',
        };
        return labels[table] || table;
    },

    /**
     * Get default table progress list for UI initialization
     * @returns Array of table progress objects with pending status
     */
    getDefaultTableProgress(): SyncTableProgress[] {
        return this.INITIAL_SYNC_TABLES.map(table => ({
            table,
            label: this.getTableLabel(table),
            status: 'pending' as SyncTableStatus,
            totalCount: 0,
            fetchedCount: 0,
            savedCount: 0,
            error: null,
        }));
    },

    /**
     * GET /onboarding/sync/tables
     * Get list of tables for initial sync (in dependency order)
     */
    async getInitialSyncTables(): Promise<InitialSyncTable[]> {
        try {
            const response = await axios.get<ApiResponse<{ tables: InitialSyncTable[] }>>(
                `${LIVE_API_URL}/onboarding/sync/tables`,
                {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-client-type': 'web',
                    }
                }
            );
            return response.data.data?.tables || this.INITIAL_SYNC_TABLES;
        } catch (err) {
            // Fallback to default tables
            return this.INITIAL_SYNC_TABLES;
        }
    },

    /**
     * POST /onboarding/master-data/counts
     * Get record counts for tables (for progress estimation)
     * @param request - Request with tenantId, branchId
     * @returns Table counts for progress tracking
     */
    async getMasterDataCounts(request: MasterDataCountsRequest): Promise<MasterDataCountsResponse> {
        try {
            const response = await axios.post<ApiResponse<MasterDataCountsResponse>>(
                `${LIVE_API_URL}/onboarding/master-data/counts`,
                request,
                {
                    timeout: 30000,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-client-type': 'web',
                    }
                }
            );
            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to get data counts'
            );
        }
    },

    /**
     * POST /onboarding/master-data/all
     * Fetch all master data for initial sync from cloud
     * @param request - Request with tenantId, branchId, optional tables and batchSize
     * @returns All master data from cloud server
     */
    async fetchAllMasterData(request: MasterDataFetchAllRequest): Promise<MasterDataFetchAllResponse> {
        try {
            const response = await axios.post<ApiResponse<MasterDataFetchAllResponse>>(
                `${LIVE_API_URL}/onboarding/master-data/all`,
                request,
                {
                    timeout: 300000, // 5 minutes for large data pulls
                    headers: {
                        'Content-Type': 'application/json',
                        'x-client-type': 'web',
                    }
                }
            );
            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to fetch master data from cloud'
            );
        }
    },

    /**
     * POST /onboarding/master-data/table
     * Fetch data from a specific table with pagination (for large tables)
     * @param table - Table name
     * @param tenantId - Tenant ID
     * @param branchId - Branch ID
     * @param cursor - Pagination cursor (optional)
     * @param limit - Records per page (default: 500, max: 1000)
     * @param since - Delta sync timestamp (optional)
     */
    async fetchMasterDataTable<T = any>(
        table: InitialSyncTable,
        tenantId: string,
        branchId: string,
        cursor?: string,
        limit: number = 500,
        since?: string
    ): Promise<MasterDataTableResponse<T>> {
        try {
            const params = new URLSearchParams();
            params.set('table', table);
            if (cursor) params.set('cursor', cursor);
            if (limit) params.set('limit', String(limit));
            if (since) params.set('since', since);

            const response = await axios.post<ApiResponse<MasterDataTableResponse<T>>>(
                `${LIVE_API_URL}/onboarding/master-data/table?${params.toString()}`,
                { tenantId, branchId },
                {
                    timeout: 60000,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-client-type': 'web',
                    }
                }
            );
            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                `Failed to fetch ${table} from cloud`
            );
        }
    },

    /**
     * POST /onboarding/sync/initial
     * Sync all master data to local SQLite database
     * @param request - Request with terminalId, tenantId, branchId, and data
     * @returns Sync result with counts and errors
     * @deprecated Use syncTableBatch for better performance with large datasets
     */
    async syncInitialMasterData(request: InitialSyncRequest): Promise<InitialSyncResponse> {
        try {
            const response = await api.post<ApiResponse<InitialSyncResponse>>(
                'onboarding/sync/initial',
                request as any
            );
            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                'Failed to save master data locally'
            );
        }
    },

    /**
     * Sync a single table's batch of data to local database
     * This method enables incremental syncing - save data as it's fetched
     * instead of waiting for all data to complete.
     * 
     * Uses the same /sync/initial endpoint but with only one table's data,
     * which the API handles gracefully (processes only provided tables).
     * 
     * @param table - Table name to sync
     * @param terminalId - Terminal ID
     * @param tenantId - Tenant ID
     * @param branchId - Branch ID
     * @param data - Array of records to save
     * @returns Sync result for this table
     */
    async syncTableBatch(
        table: InitialSyncTable,
        terminalId: string,
        tenantId: string,
        branchId: string,
        data: any[]
    ): Promise<TableSyncResult> {
        if (data.length === 0) {
            return {
                table,
                success: true,
                inserted: 0,
                updated: 0,
                skipped: 0,
                failed: 0,
                errors: [],
            };
        }

        try {
            const response = await api.post<ApiResponse<InitialSyncResponse>>(
                'onboarding/sync/initial',
                {
                    terminalId,
                    tenantId,
                    branchId,
                    data: { [table]: data },
                } as any
            );

            // Extract this table's result from the response
            const result = response.data.data!;
            const tableResult = result.tables.find(t => t.table === table);

            if (tableResult) {
                return tableResult;
            }

            // If table not in response, assume success (empty or all skipped)
            return {
                table,
                success: result.success,
                inserted: data.length,
                updated: 0,
                skipped: 0,
                failed: 0,
                errors: [],
            };
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            return {
                table,
                success: false,
                inserted: 0,
                updated: 0,
                skipped: 0,
                failed: data.length,
                errors: [
                    axiosError?.response?.data?.message ||
                    axiosError?.message ||
                    `Failed to sync ${table} batch`
                ],
            };
        }
    },

    /**
     * POST /onboarding/sync/step
     * Sync data for a specific onboarding step
     * @param stepType - Step type
     * @param terminalId - Terminal ID
     * @param tenantId - Tenant ID
     * @param branchId - Branch ID
     * @param data - Data to sync
     */
    async syncStepData(
        stepType: OnboardingStepType,
        terminalId: string,
        tenantId: string,
        branchId: string,
        data: Record<string, any[]>
    ): Promise<InitialSyncResponse> {
        try {
            const response = await api.post<ApiResponse<InitialSyncResponse>>(
                'onboarding/sync/step',
                { stepType, terminalId, tenantId, branchId, data } as any
            );
            return response.data.data!;
        } catch (err: any) {
            const axiosError = err as AxiosError<ApiResponse>;
            throw new Error(
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                `Failed to sync ${stepType}`
            );
        }
    },

    /**
     * Update last sync timestamp for the terminal
     * 
     * During onboarding: Skipped - no authenticated endpoint available.
     * The sync timestamp is tracked via SyncPullProgress.lastSyncTimestamp
     * and will be properly set on first authenticated delta sync.
     * 
     * Post-onboarding (after login): Uses authenticated terminal update endpoint.
     * 
     * @param terminalId - Terminal ID
     * @param timestamp - ISO timestamp from sync response
     */
    async updateLastSyncTimestamp(terminalId: string, timestamp: string): Promise<void> {
        // Check if we're in onboarding mode (no auth available)
        const validationParams = getStoredValidationParams();

        if (validationParams) {
            // During onboarding - skip update, no authenticated endpoint available
            // The timestamp will be set on first delta sync after login
            console.info(
                `[Onboarding] Skipping lastSyncTimestamp update - will be set on first authenticated sync. ` +
                `Terminal: ${terminalId}, Timestamp: ${timestamp}`
            );
            return;
        }

        // Post-onboarding - use authenticated local API
        try {
            await api.patch<ApiResponse<Terminal>>(
                `terminals/${terminalId}`,
                { lastSyncTimestamp: timestamp } as any
            );
        } catch (err) {
            console.warn('Failed to update last sync timestamp:', err);
        }
    },

    /**
     * Batch size for fetching and syncing data
     * Sweet spot between too many requests (small) and memory issues (large)
     */
    BATCH_SIZE: 500,

    /**
     * Sync a single table completely (all batches) with progress tracking
     * Fetches in batches via cursor pagination, saves each batch immediately.
     * 
     * @param table - Table name
     * @param terminalId - Terminal ID
     * @param tenantId - Tenant ID
     * @param branchId - Branch ID
     * @param totalCount - Expected total count (for progress)
     * @param onBatchComplete - Callback after each batch is saved
     * @returns Final sync counts for this table
     */
    async syncTableFully(
        table: InitialSyncTable,
        terminalId: string,
        tenantId: string,
        branchId: string,
        totalCount: number,
        onBatchComplete?: (progress: {
            table: InitialSyncTable;
            fetchedCount: number;
            savedCount: number;
            batchNumber: number;
            hasMore: boolean;
        }) => void
    ): Promise<TableSyncResult> {
        // Skip empty tables
        if (totalCount === 0) {
            return {
                table,
                success: true,
                inserted: 0,
                updated: 0,
                skipped: 0,
                failed: 0,
                errors: [],
            };
        }

        let cursor: string | undefined;
        let hasMore = true;
        let batchNumber = 0;
        let totalFetched = 0;
        let totalInserted = 0;
        let totalUpdated = 0;
        let totalSkipped = 0;
        let totalFailed = 0;
        const allErrors: string[] = [];

        while (hasMore) {
            batchNumber++;

            // Fetch batch from cloud
            const fetchResponse = await this.fetchMasterDataTable(
                table,
                tenantId,
                branchId,
                cursor,
                this.BATCH_SIZE
            );

            totalFetched += fetchResponse.data.length;

            // Save batch to local database immediately
            const syncResult = await this.syncTableBatch(
                table,
                terminalId,
                tenantId,
                branchId,
                fetchResponse.data
            );

            // Accumulate results
            totalInserted += syncResult.inserted;
            totalUpdated += syncResult.updated;
            totalSkipped += syncResult.skipped;
            totalFailed += syncResult.failed;
            if (syncResult.errors.length > 0) {
                allErrors.push(...syncResult.errors);
            }

            // Update cursor for next batch
            cursor = fetchResponse.pagination.nextCursor || undefined;
            hasMore = fetchResponse.pagination.hasMore;

            // Report progress
            onBatchComplete?.({
                table,
                fetchedCount: totalFetched,
                savedCount: totalInserted + totalUpdated,
                batchNumber,
                hasMore,
            });
        }

        return {
            table,
            success: allErrors.length === 0 && totalFailed === 0,
            inserted: totalInserted,
            updated: totalUpdated,
            skipped: totalSkipped,
            failed: totalFailed,
            errors: allErrors,
        };
    },

    /**
     * Professional-grade initial sync flow:
     * Processes one table at a time, fetching and saving in batches.
     * This approach:
     * - Prevents memory issues with large datasets
     * - Provides real-time progress per batch
     * - Allows recovery if interrupted (resume from failed table)
     * - Is production-ready for thousands of records
     * 
     * @param terminalId - Terminal ID
     * @param tenantId - Tenant ID
     * @param branchId - Branch ID
     * @param onProgress - Progress callback for UI updates
     */
    async performTableByTableSync(
        terminalId: string,
        tenantId: string,
        branchId: string,
        onProgress?: (update: {
            phase: 'counting' | 'syncing' | 'completed' | 'failed';
            currentTable?: InitialSyncTable;
            currentTableIndex?: number;
            totalTables?: number;
            counts?: Record<string, number>;
            tableProgress?: {
                table: InitialSyncTable;
                fetchedCount: number;
                savedCount: number;
                totalCount: number;
                batchNumber: number;
                hasMore: boolean;
            };
            result?: {
                success: boolean;
                tables: TableSyncResult[];
                syncedAt: string;
            };
            error?: string;
        }) => void
    ): Promise<{ success: boolean; syncedAt: string; tables: TableSyncResult[] }> {
        const tables = this.INITIAL_SYNC_TABLES;
        const tableResults: TableSyncResult[] = [];
        let syncedAt = new Date().toISOString();

        try {
            // =============================================
            // Phase 1: Get table counts for progress estimation
            // =============================================
            onProgress?.({ phase: 'counting' });

            const countsResponse = await this.getMasterDataCounts({
                tenantId,
                branchId,
            });

            onProgress?.({
                phase: 'counting',
                counts: countsResponse.counts,
                totalTables: tables.length,
            });

            // =============================================
            // Phase 2: Sync each table sequentially
            // Each table: fetch all batches → save each batch immediately
            // =============================================
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                const totalCount = countsResponse.counts[table] || 0;

                onProgress?.({
                    phase: 'syncing',
                    currentTable: table,
                    currentTableIndex: i,
                    totalTables: tables.length,
                    tableProgress: {
                        table,
                        fetchedCount: 0,
                        savedCount: 0,
                        totalCount,
                        batchNumber: 0,
                        hasMore: totalCount > 0,
                    },
                });

                // Sync this table completely (all batches)
                const tableResult = await this.syncTableFully(
                    table,
                    terminalId,
                    tenantId,
                    branchId,
                    totalCount,
                    (batchProgress) => {
                        onProgress?.({
                            phase: 'syncing',
                            currentTable: table,
                            currentTableIndex: i,
                            totalTables: tables.length,
                            tableProgress: {
                                ...batchProgress,
                                totalCount,
                            },
                        });
                    }
                );

                tableResults.push(tableResult);

                // If table failed completely, we might want to stop
                // But for resilience, we continue and report all failures at end
            }

            // =============================================
            // Phase 3: Update terminal sync timestamp
            // =============================================
            syncedAt = new Date().toISOString();
            await this.updateLastSyncTimestamp(terminalId, syncedAt);

            // Calculate overall success
            const failedTables = tableResults.filter(t => !t.success);
            const success = failedTables.length === 0;

            onProgress?.({
                phase: success ? 'completed' : 'failed',
                result: {
                    success,
                    tables: tableResults,
                    syncedAt,
                },
            });

            return {
                success,
                syncedAt,
                tables: tableResults,
            };

        } catch (err: any) {
            const errorMessage = err instanceof Error ? err.message : 'Sync failed';

            onProgress?.({
                phase: 'failed',
                error: errorMessage,
            });

            throw err;
        }
    },

    /**
     * @deprecated Use performTableByTableSync for production workloads
     * 
     * Full initial sync flow (legacy - fetches all at once):
     * 1. Get table counts for progress estimation
     * 2. Fetch all master data from cloud
     * 3. Save to local database
     * 4. Update terminal sync timestamp
     * 
     * @param terminalId - Terminal ID
     * @param tenantId - Tenant ID
     * @param branchId - Branch ID
     * @param onProgress - Progress callback
     */
    async performInitialSync(
        terminalId: string,
        tenantId: string,
        branchId: string,
        onProgress?: (update: {
            phase: 'counting' | 'fetching' | 'saving';
            currentTable?: InitialSyncTable;
            counts?: Record<string, number>;
            fetchedData?: Record<string, any[]>;
            syncResult?: InitialSyncResponse;
        }) => void
    ): Promise<{ success: boolean; syncedAt: string; result: InitialSyncResponse }> {
        // Phase 1: Get counts for progress estimation
        onProgress?.({ phase: 'counting' });

        const countsResponse = await this.getMasterDataCounts({
            tenantId,
            branchId,
        });

        onProgress?.({ phase: 'counting', counts: countsResponse.counts });

        // Phase 2: Fetch all master data from cloud
        onProgress?.({ phase: 'fetching' });

        const fetchResponse = await this.fetchAllMasterData({
            tenantId,
            branchId,
            batchSize: 500,
            since: null,
        });

        onProgress?.({ phase: 'fetching', fetchedData: fetchResponse.data });

        // Phase 3: Save to local database
        onProgress?.({ phase: 'saving' });

        const syncResult = await this.syncInitialMasterData({
            terminalId,
            tenantId,
            branchId,
            data: fetchResponse.data,
        });

        onProgress?.({ phase: 'saving', syncResult });

        // Phase 4: Update terminal sync timestamp
        await this.updateLastSyncTimestamp(terminalId, fetchResponse.syncedAt);

        return {
            success: syncResult.success,
            syncedAt: fetchResponse.syncedAt,
            result: syncResult,
        };
    },

}