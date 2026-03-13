import { liveApi, getAuthHeaders } from './live-api.service';

interface MraComplianceResponse {
    success: boolean;
    message: string;
    data?: {
        tenantId: string;
        isMraEnabled: boolean;
        mraEnvironment?: MraEnvironment;
    };
}

const mraComplianceService = {
    /**
     * Get MRA compliance status for a tenant/terminal
     * GET /mra/compliance/status
     * 
     * @param terminalId - Optional terminal ID for terminal-specific status
     */
    async getComplianceStatus(terminalId?: string): Promise<MraComplianceStatusResponse> {
        const response = await liveApi.get<ApiResponse<MraComplianceStatusResponse>>(
            `/mra/compliance/status`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
                params: terminalId ? { terminalId } : undefined,
            }
        );
        return response.data.data;
    },

    /**
     * Enable MRA compliance for a tenant
     * POST /mra/compliance/enable
     * 
     * @param environment - Initial environment (defaults to SANDBOX)
     * @param tac - Terminal Activation Code (optional, for combined enable + activate)
     * @param terminalId - Terminal ID (optional, required if tac is provided)
     */
    async enableCompliance(
        environment: MraEnvironment = 'SANDBOX',
        tac?: string,
        terminalId?: string
    ): Promise<MraComplianceResponse> {
        const payload: { environment: MraEnvironment; tac?: string; terminalId?: string } = { environment };
        if (tac) {
            payload.tac = tac;
        }
        if (terminalId) {
            payload.terminalId = terminalId;
        }
        const response = await liveApi.post<MraComplianceResponse>(
            `/mra/compliance/enable`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
            }
        );
        return response.data;
    },

    /**
     * Disable MRA compliance for a tenant
     * POST /mra/compliance/disable
     */
    async disableCompliance(): Promise<MraComplianceResponse> {
        const response = await liveApi.post<MraComplianceResponse>(
            `/mra/compliance/disable`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
            }
        );
        return response.data;
    },
};

export default mraComplianceService;
