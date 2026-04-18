import api from './http.service';

const loyaltyService = {
    // ─── Program ───────────────────────────────────────────────────────
    async getProgram(): Promise<LoyaltyProgram | null> {
        return api.get<ApiResponse<LoyaltyProgram | null>>('loyalty/program')
            .then((res) => res.data.data ?? null);
    },

    async createProgram(data: CreateLoyaltyProgramInput): Promise<LoyaltyProgram> {
        return api.post<ApiResponse<LoyaltyProgram>>('loyalty/program', data as any)
            .then((res) => res.data.data);
    },

    async updateProgram(programId: string, data: UpdateLoyaltyProgramInput): Promise<LoyaltyProgram> {
        return api.put<ApiResponse<LoyaltyProgram>>(`loyalty/program/${programId}`, data as any)
            .then((res) => res.data.data);
    },

    // ─── Tiers ─────────────────────────────────────────────────────────
    async listTiers(programId: string): Promise<LoyaltyTier[]> {
        return api.get<ApiResponse<LoyaltyTier[]>>(`loyalty/program/${programId}/tiers`)
            .then((res) => res.data.data);
    },

    async createTier(programId: string, data: CreateLoyaltyTierInput): Promise<LoyaltyTier> {
        return api.post<ApiResponse<LoyaltyTier>>(`loyalty/program/${programId}/tiers`, data as any)
            .then((res) => res.data.data);
    },

    async updateTier(tierId: string, data: UpdateLoyaltyTierInput): Promise<LoyaltyTier> {
        return api.put<ApiResponse<LoyaltyTier>>(`loyalty/tiers/${tierId}`, data as any)
            .then((res) => res.data.data);
    },

    async deleteTier(tierId: string): Promise<void> {
        return api.delete(`loyalty/tiers/${tierId}`)
            .then(() => undefined);
    },

    // ─── Members ───────────────────────────────────────────────────────
    async enrollMember(customerId: string): Promise<LoyaltyMember> {
        return api.post<ApiResponse<LoyaltyMember>>('loyalty/members', { customerId } as any)
            .then((res) => res.data.data);
    },

    async getMember(memberId: string): Promise<LoyaltyMember> {
        return api.get<ApiResponse<LoyaltyMember>>(`loyalty/members/${memberId}`)
            .then((res) => res.data.data);
    },

    async getMemberByCustomerId(customerId: string): Promise<LoyaltyMember> {
        return api.get<ApiResponse<LoyaltyMember>>(`loyalty/customers/${customerId}/membership`)
            .then((res) => res.data.data);
    },

    async listMembers(programId: string, query: Record<string, any> = {}): Promise<LoyaltyMemberListResponse> {
        return api.get<ApiResponse<LoyaltyMemberListResponse>>(`loyalty/program/${programId}/members`, query)
            .then((res) => res.data.data);
    },

    // ─── Dashboard ─────────────────────────────────────────────────────
    async getMemberDashboard(memberId: string): Promise<LoyaltyMemberDashboard> {
        return api.get<ApiResponse<LoyaltyMemberDashboard>>(`loyalty/members/${memberId}/dashboard`)
            .then((res) => res.data.data);
    },

    // ─── Transactions ──────────────────────────────────────────────────
    async listTransactions(memberId: string, query: Record<string, any> = {}): Promise<LoyaltyTransactionListResponse> {
        return api.get<ApiResponse<LoyaltyTransactionListResponse>>(`loyalty/members/${memberId}/transactions`, query)
            .then((res) => res.data.data);
    },

    // ─── Redeem ────────────────────────────────────────────────────────
    async previewRedeem(memberId: string, points: number): Promise<RedeemPreviewResponse> {
        return api.get<ApiResponse<RedeemPreviewResponse>>(`loyalty/members/${memberId}/redeem/preview`, { points })
            .then((res) => res.data.data);
    },

    async redeemPoints(memberId: string, data: RedeemPointsInput): Promise<RedeemPointsResponse> {
        return api.post<ApiResponse<RedeemPointsResponse>>(`loyalty/members/${memberId}/redeem`, data as any)
            .then((res) => res.data.data);
    },

    // ─── Adjust ────────────────────────────────────────────────────────
    async adjustPoints(memberId: string, data: AdjustPointsInput): Promise<{ member: LoyaltyMember; transaction: LoyaltyTransaction }> {
        return api.post<ApiResponse<{ member: LoyaltyMember; transaction: LoyaltyTransaction }>>(`loyalty/members/${memberId}/adjust`, data as any)
            .then((res) => res.data.data);
    },
};

export default loyaltyService;
