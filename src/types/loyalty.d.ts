/* ─── Loyalty Program ────────────────────────────────────────────── */

interface LoyaltyProgram {
    loyaltyProgramId: string;
    tenantId: string;  // Tenant-scoped loyalty program
    name: string;
    description?: string;
    pointsPerCurrency: number;
    currencyPerPoint: number;
    minRedeemPoints: number;
    pointsExpiryDays: number | null;
    autoEnroll: boolean;
    isActive: boolean;
    tiers?: LoyaltyTier[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

interface CreateLoyaltyProgramInput {
    name: string;
    description?: string;
    pointsPerCurrency?: number;
    currencyPerPoint?: number;
    minRedeemPoints?: number;
    pointsExpiryDays?: number | null;
    autoEnroll?: boolean;
}

interface UpdateLoyaltyProgramInput {
    name?: string;
    description?: string;
    pointsPerCurrency?: number;
    currencyPerPoint?: number;
    minRedeemPoints?: number;
    pointsExpiryDays?: number | null;
    autoEnroll?: boolean;
    isActive?: boolean;
}

/* ─── Tiers ──────────────────────────────────────────────────────── */

interface LoyaltyTier {
    loyaltyTierId: string;
    loyaltyProgramId: string;
    name: string;
    minPoints: number;
    pointsMultiplier: number;
    discountPercentage: number;
    benefits?: string;
    sortOrder: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

interface CreateLoyaltyTierInput {
    name: string;
    minPoints: number;
    pointsMultiplier?: number;
    discountPercentage?: number;
    benefits?: string;
    sortOrder?: number;
}

interface UpdateLoyaltyTierInput {
    name?: string;
    minPoints?: number;
    pointsMultiplier?: number;
    discountPercentage?: number;
    benefits?: string;
    sortOrder?: number;
}

/* ─── Members ────────────────────────────────────────────────────── */

interface LoyaltyMember {
    loyaltyMemberId: string;
    tenantId: string;  // Tenant-scoped membership (inherited from customer)
    membershipNumber: string;
    availablePoints: number;
    lifetimePoints: number;
    redeemedPoints: number;
    isActive: boolean;
    enrolledAt: Date | string;
    customer: {
        customerId: string;
        tenantId: string;  // Include tenant context in customer reference
        name: string;
        phone?: string;
        email?: string;
    };
    tier: {
        name: string;
        pointsMultiplier: number;
        discountPercentage: number;
    };
    program?: LoyaltyProgram;
}

interface LoyaltyMemberListResponse {
    members: LoyaltyMember[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/* ─── Transactions ───────────────────────────────────────────────── */

type LoyaltyTransactionType = 'EARN' | 'REDEEM' | 'ADJUST' | 'EXPIRE';

interface LoyaltyTransaction {
    loyaltyTransactionId: string;
    type: LoyaltyTransactionType;
    points: number;
    balanceAfter: number;
    saleId?: string;
    description?: string;
    expiresAt?: Date | string | null;
    createdAt: Date | string;
}

interface LoyaltyTransactionListResponse {
    transactions: LoyaltyTransaction[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/* ─── Dashboard ──────────────────────────────────────────────────── */

interface LoyaltyMemberDashboard {
    member: LoyaltyMember;
    recentTransactions: LoyaltyTransaction[];
    pointsValue: number;
    nextTier: { name: string; minPoints: number } | null;
    pointsToNextTier: number;
}

/* ─── Redemption ─────────────────────────────────────────────────── */

interface RedeemPreviewResponse {
    points: number;
    monetaryValue: number;
    canRedeem: boolean;
    availablePoints: number;
    minRedeemPoints: number;
    currencyPerPoint: number;
    balanceAfterRedeem: number;
}

interface RedeemPointsInput {
    points: number;
    saleId?: string;
    description?: string;
}

interface RedeemPointsResponse {
    member: LoyaltyMember;
    transaction: LoyaltyTransaction;
    monetaryValue: number;
}

/* ─── Sale Loyalty Info ──────────────────────────────────────────── */

interface SaleLoyaltyInfo {
    pointsEarned: number;
    totalPoints: number;
    membershipNumber: string;
}

/* ─── Adjustment ─────────────────────────────────────────────────── */

interface AdjustPointsInput {
    points: number;
    description: string;
}
