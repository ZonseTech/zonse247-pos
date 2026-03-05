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

}