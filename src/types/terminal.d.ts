type TerminalActivationStatus = 'PENDING' | 'ACTIVATED' | 'DEACTIVATED' | 'SUSPENDED' | 'BLOCKED';
type TerminalMraStatus = 'APPLIED' | 'APPROVED' | 'REJECTED';

interface Terminal {
    id?: number;
    terminalId: string;
    tenantId: string;
    branchId: string;
    mraTerminalId?: string | null;
    terminalCode: string;
    terminalLabel: string;
    terminalPosition?: number | null;
    deviceId?: string | null;
    osName?: string | null;
    osVersion?: string | null;
    osBuild?: string | null;
    macAddress?: string | null;
    posProductId?: string | null;
    posProductVersion?: string | null;
    terminalConfigVersion?: number | null;
    offlineMaxTransactionAgeHours?: number | null;
    offlineMaxCumulativeAmount?: number | null;
    activationCode?: string | null;
    activationStatus?: TerminalActivationStatus;
    activationDate?: string | Date | null;
    isPrimary?: boolean;
    isBlocked?: boolean;
    blockingReason?: string | null;
    blockedAt?: string | Date | null;
    mraApplicationStatus?: TerminalMraStatus;
    mraApprovalDate?: string | Date | null;
    lastActivity?: string | Date | null;
    lastSync?: string | Date | null;
    lastSyncTimestamp?: string | Date | null;
    lastSyncAt?: string | Date | null;
    lastSeenAt?: string | Date | null;
    lastSyncedAt?: string | Date | null;
    synced?: number;
    version?: number;
    deletedAt?: string | Date | null;
    registeredAt?: string | Date;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface TerminalWithRelations extends Terminal {
    tenant?: Tenant;
    branch?: Branch & {
        branchSubscription?: BranchSubscription | null;
    };
}

interface TerminalQueryParams {
    search?: string;
    tenantId?: string;
    branchId?: string;
    terminalCode?: string;
    activationStatus?: TerminalActivationStatus;
    mraApplicationStatus?: TerminalMraStatus;
    isPrimary?: boolean;
    isBlocked?: boolean;
    synced?: number;
    paginated?: boolean;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isAdminMode?: boolean;
}

interface CreateTerminalRequest {
    terminalId?: string;
    tenantId: string;
    branchId: string;
    terminalCode: string;
    terminalLabel: string;
    terminalPosition?: number;
    activationCode?: string;
    deviceId?: string;
    osName?: string;
    osVersion?: string;
    osBuild?: string;
    macAddress?: string;
    posProductId?: string;
    posProductVersion?: string;
    isPrimary?: boolean;
}

interface UpdateTerminalRequest {
    terminalLabel?: string;
    terminalCode?: string;
    terminalPosition?: number;
    deviceId?: string;
    osName?: string;
    osVersion?: string;
    osBuild?: string;
    macAddress?: string;
    posProductId?: string;
    posProductVersion?: string;
    terminalConfigVersion?: number;
    offlineMaxTransactionAgeHours?: number;
    offlineMaxCumulativeAmount?: number;
    isPrimary?: boolean;
    isBlocked?: boolean;
    blockingReason?: string;
    activationStatus?: TerminalActivationStatus;
    mraApplicationStatus?: TerminalMraStatus;
}

interface TerminalStats {
    total: number;
    active: number;
    pending: number;
    blocked: number;
    primary: number;
}