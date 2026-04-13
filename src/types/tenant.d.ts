type BusinessType =
    | 'PRODUCT_BASED'
    | 'SERVICE_BASED'
    | 'HYBRID'
    | 'SALON'
    | 'REPAIR'
    | 'TATTOO'
    | 'MED_SPA'
    | 'FITNESS';

type MsonkhoOnlineStatus = 'VERIFIED' | 'PENDING' | 'FAILED';
type SubscriptionStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'TRIAL';
type TenantStatus = 'pending' | 'active' | 'suspended' | 'cancelled';

/**
 * MRA Environment - Sandbox for testing, Production for live submissions
 */
type MraEnvironment = 'SANDBOX' | 'PRODUCTION';

interface BaseTimestamps {
    createdAt?: Date | null;
    updatedAt?: Date | null;
}

interface Tenant extends BaseTimestamps {
    tenantId?: string;
    tenantCode: string;
    businessName: string;
    tradingName?: string | null;
    tin: string;
    businessType: BusinessType;
    ownerName: string;
    phoneNumber: string;
    email: string;
    mraPortalUsername?: string | null;
    isVatRegistered?: boolean;
    taxOfficeCode?: string | null;
    msonkhoOnlineStatus: MsonkhoOnlineStatus;
    subscriptionPlan?: string | null;
    subscriptionStatus: SubscriptionStatus;
    address?: string | null;
    country?: string | null;
    trialEndsAt?: Date | null;
    verificationToken: string;
    status: TenantStatus;
    registeredAt?: Date | null;
    activatedAt?: Date | null;
    synced?: boolean;

    // MRA Compliance Fields
    isMraEnabled?: boolean;           // Whether MRA integration is enabled
    mraEnvironment?: MraEnvironment;  // Current MRA environment (SANDBOX/PRODUCTION)
    mraDeviceSerialNumber?: string | null;  // MRA device serial number
    mraApiConfigured?: boolean;       // Whether MRA API credentials are set up
}

type TenantFormValues = Omit<
    Tenant,
    'tenantId' | 'createdAt' | 'updatedAt' | 'activatedAt' | 'trialEndsAt' | 'registeredAt' | 'synced'
> & {
    trialEndsAt?: string;
    registeredAt?: string;
    activatedAt?: string;
};

interface VerifyTenantRequest {
    verificationToken: string;
}
