import axios from 'axios';
import { getLiveApiUrl, getTenantId, getAuthHeaders } from './live-api.service';

/**
 * MRA Compliance Service
 * 
 * Handles MRA (Malawi Revenue Authority) compliance management for tenants.
 * Supports both MRA-compliant and non-MRA-compliant workflows.
 * 
 * API Reference: MRA_COMPLIANCE_FRONTEND_GUIDE.md
 */

const LIVE_API_URL = getLiveApiUrl();

/**
 * MRA Configuration Input
 */
interface MraConfigInput {
    tenantId: string;
    tin: string;
    deviceSerialNumber: string;
    apiKey: string;
    apiSecret: string;
}

/**
 * MRA Enable/Disable Response
 */
interface MraComplianceResponse {
    success: boolean;
    message: string;
    data?: {
        tenantId: string;
        isMraEnabled: boolean;
        mraEnvironment?: MraEnvironment;
    };
}

/**
 * MRA Environment Switch Response
 */
interface MraEnvironmentSwitchResponse {
    success: boolean;
    message: string;
    data?: {
        tenantId: string;
        previousEnvironment: MraEnvironment;
        newEnvironment: MraEnvironment;
    };
}

/**
 * MRA Test Connection Response
 */
interface MraTestConnectionResponse {
    success: boolean;
    message: string;
}

const mraComplianceService = {
    /**
     * Check MRA setup requirements for a tenant
     * GET /onboarding/mra-check/:tenantId
     */
    async checkMraSetup(tenantId: string): Promise<MraCheckResponse> {
        const response = await axios.get<ApiResponse<MraCheckResponse>>(
            `${LIVE_API_URL}/onboarding/mra-check/${tenantId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
                timeout: 30000,
            }
        );
        return response.data.data;
    },

    /**
     * Get MRA compliance status for a tenant
     * GET /mra/compliance/tenants/:tenantId/status
     */
    async getComplianceStatus(tenantId?: string): Promise<MraComplianceStatusResponse> {
        const tid = tenantId || (await getTenantId());
        if (!tid) {
            throw new Error('Tenant ID is required');
        }

        const response = await axios.get<ApiResponse<MraComplianceStatusResponse>>(
            `${LIVE_API_URL}/mra/compliance/tenants/${tid}/status`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
                timeout: 30000,
            }
        );
        return response.data.data;
    },

    /**
     * Enable MRA compliance for a tenant
     * PUT /mra/compliance/tenants/:tenantId/enable
     * 
     * @param tenantId - The tenant ID
     * @param environment - Initial environment (defaults to SANDBOX)
     */
    async enableCompliance(
        tenantId?: string,
        environment: MraEnvironment = 'SANDBOX'
    ): Promise<MraComplianceResponse> {
        const tid = tenantId || (await getTenantId());
        if (!tid) {
            throw new Error('Tenant ID is required');
        }

        const response = await axios.put<MraComplianceResponse>(
            `${LIVE_API_URL}/mra/compliance/tenants/${tid}/enable`,
            { environment },
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
                timeout: 30000,
            }
        );
        return response.data;
    },

    /**
     * Disable MRA compliance for a tenant
     * PUT /mra/compliance/tenants/:tenantId/disable
     */
    async disableCompliance(tenantId?: string): Promise<MraComplianceResponse> {
        const tid = tenantId || (await getTenantId());
        if (!tid) {
            throw new Error('Tenant ID is required');
        }

        const response = await axios.put<MraComplianceResponse>(
            `${LIVE_API_URL}/mra/compliance/tenants/${tid}/disable`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
                timeout: 30000,
            }
        );
        return response.data;
    },

    /**
     * Switch MRA environment (SANDBOX <-> PRODUCTION)
     * PUT /mra/compliance/tenants/:tenantId/environment
     */
    async switchEnvironment(
        environment: MraEnvironment,
        tenantId?: string
    ): Promise<MraEnvironmentSwitchResponse> {
        const tid = tenantId || (await getTenantId());
        if (!tid) {
            throw new Error('Tenant ID is required');
        }

        const response = await axios.put<MraEnvironmentSwitchResponse>(
            `${LIVE_API_URL}/mra/compliance/tenants/${tid}/environment`,
            { environment },
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
                timeout: 30000,
            }
        );
        return response.data;
    },

    /**
     * Configure MRA API credentials
     * POST /mra/config
     */
    async configureCredentials(config: MraConfigInput): Promise<{ success: boolean; message: string }> {
        const response = await axios.post<{ success: boolean; message: string }>(
            `${LIVE_API_URL}/mra/config`,
            config,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
                timeout: 30000,
            }
        );
        return response.data;
    },

    /**
     * Test MRA connection
     * POST /mra/test-connection
     */
    async testConnection(tenantId?: string): Promise<MraTestConnectionResponse> {
        const tid = tenantId || (await getTenantId());
        if (!tid) {
            throw new Error('Tenant ID is required');
        }

        const response = await axios.post<MraTestConnectionResponse>(
            `${LIVE_API_URL}/mra/test-connection`,
            { tenantId: tid },
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
                timeout: 30000,
            }
        );
        return response.data;
    },

    /**
     * Get onboarding steps for a tenant (includes MRA setup if enabled)
     * GET /onboarding/steps/:tenantId
     */
    async getOnboardingSteps(tenantId: string): Promise<OnboardingStepsResponse> {
        const response = await axios.get<ApiResponse<OnboardingStepsResponse>>(
            `${LIVE_API_URL}/onboarding/steps/${tenantId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
                timeout: 30000,
            }
        );
        return response.data.data;
    },
};

export default mraComplianceService;
