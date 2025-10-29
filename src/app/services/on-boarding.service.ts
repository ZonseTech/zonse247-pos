import { AxiosError } from "axios";
import api from "./http.service";

export default {

    async verify(credentials: TerminalVerificationParams): Promise<Tenant> {
        try {
            const response = await api.post<ApiResponse<Tenant>>('on-boarding/verify-tenant', credentials as any);
            return response.data.data!;
        } catch (err) {
            throw err;
        }
    },

    async listByTenantId(tenantId: string): Promise<ApiResponse> {
        return api
            .get<ApiResponse>(`on-boarding/tenant/${tenantId}/branches`)
            .then((res) => res.data)
            .catch((err: AxiosError) => {
                throw err?.response?.data;
            });
    },

    async listByBranchId(branchId: string): Promise<Array<Terminal>> {
        return api
            .get<ApiResponse<Array<Terminal>>>(`on-boarding/branch/${branchId}/terminals`)
            .then((res) => res.data.data)
            .catch((err: AxiosError) => {
                throw err?.response?.data;
            });
    },

}