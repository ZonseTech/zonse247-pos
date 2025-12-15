interface TerminalVerificationParams {
    tenantCode: string;
    verificationToken: string;
    os: string;
    hostname: string;
    macAddress: string;
}

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
    terminalConfigVersion?: string | null;
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
    synced?: number;
    registeredAt?: string | Date;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface TerminalQueryParams {
    search?: string;
    tenantId?: string;
    branchId?: string;
    activationStatus?: TerminalActivationStatus;
    mraApplicationStatus?: TerminalMraStatus;
    isPrimary?: boolean;
    isBlocked?: boolean;
    paginated?: boolean;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface CreateTerminalRequest {
    tenantId: string;
    branchId: string;
    terminalLabel: string;
    terminalPosition?: number;
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
    terminalPosition?: number;
    deviceId?: string;
    osName?: string;
    osVersion?: string;
    osBuild?: string;
    macAddress?: string;
    posProductId?: string;
    posProductVersion?: string;
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