/**
 * Terminal activation request parameters
 */
interface TerminalActivationParams {
    activationCode: string;
}

/**
 * Legacy params for backward compatibility
 */
interface TerminalVerificationParams {
    verificationToken: string;
    os: string;
    hostname: string;
    macAddress: string;
}

type ValidationParams = {
    tenantId: string;
    branchId: string;
    terminalId: string;
    verificationKey: string;
}

/**
 * Branch with subscription data
 */
interface BranchWithSubscription extends Branch {
    branchSubscription?: BranchSubscription | null;
}

/**
 * Terminal with all relations from activation response
 */
interface TerminalWithRelations extends Terminal {
    tenant: Tenant;
    branch: BranchWithSubscription;
}

/**
 * Terminal activation response
 */
interface TerminalActivationResponse {
    success: boolean;
    message: string;
    data?: TerminalWithRelations;
}

/**
 * Save terminal details result
 */
interface SaveTerminalDetailsResult {
    tenant: { saved: boolean; exists: boolean; data?: Tenant };
    subscriptionPlan: { saved: boolean; exists: boolean; data?: SubscriptionPlan };
    branchSubscription: { saved: boolean; exists: boolean; data?: BranchSubscription };
    branch: { saved: boolean; exists: boolean; data?: Branch };
    terminal: { saved: boolean; exists: boolean; data?: Terminal };
}

/**
 * Onboarding step types for tracking progress
 */
type OnboardingStepType =
    | 'TERMINAL_ACTIVATION'
    | 'TERMINAL_DETAILS_SAVE'
    | 'MRA_SETUP'
    | 'CUSTOMERS_SYNC'
    | 'CATEGORIES_SYNC'
    | 'SUBSCRIPTION_PLANS_SYNC'
    | 'PAYMENT_METHODS_SYNC'
    | 'PAYMENT_PROVIDERS_SYNC'
    | 'PRODUCTS_SYNC'
    | 'INVENTORY_SYNC'
    | 'USERS_SYNC'
    | 'SETTINGS_SYNC';

/**
 * Status of an onboarding step
 */
type OnboardingStepStatus =
    | 'NOT_STARTED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'FAILED'
    | 'SKIPPED';

/**
 * Individual onboarding step progress
 */
interface OnboardingStep {
    stepType: OnboardingStepType;
    status: OnboardingStepStatus;
    order: number;
    startedAt?: Date | string | null;
    completedAt?: Date | string | null;
    errorMessage?: string | null;
    retryCount: number;
    metadata?: Record<string, any> | null;
}

/**
 * Complete onboarding progress for a terminal
 */
interface OnboardingProgress {
    progressId: string;
    terminalId: string;
    tenantId?: string | null;
    branchId?: string | null;
    currentStep: OnboardingStepType;
    overallStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    steps: OnboardingStep[];
    completedSteps: number;
    totalSteps: number;
    completionPercentage: number;
    lastUpdatedAt: Date | string;
    createdAt: Date | string;
}

/**
 * Request to update onboarding step progress
 */
interface UpdateOnboardingStepRequest {
    terminalId: string;
    stepType: OnboardingStepType;
    status: OnboardingStepStatus;
    errorMessage?: string;
    metadata?: Record<string, any>;
}

/**
 * Request to initialize onboarding progress
 */
interface InitOnboardingProgressRequest {
    terminalId: string;
    tenantId?: string;
    branchId?: string;
}

/**
 * Default onboarding steps configuration
 */
type OnboardingStepConfig = {
    stepType: OnboardingStepType;
    order: number;
    required: boolean;
    label: string;
    description: string;
};

/**
 * Legacy OnboardingStatus for backward compatibility
 */
interface OnboardingStatus {
    tenant: Omit<Tenant, 'verificationToken'>;
    subscription: any;
    branches: any[];
    terminals: any[];
    onboarding: {
        steps: {
            tenantRegistered: boolean;
            subscriptionActive: boolean;
            branchCreated: boolean;
            terminalSetup: boolean;
        };
        completedSteps: number;
        totalSteps: number;
        completionPercentage: number;
        isComplete: boolean;
    };
}

// =============================================
// SYNC PULL TYPES - Initial data synchronization
// Based on zonse247-pos-api: InitialSyncService & MasterDataFetchService
// =============================================

/**
 * Master data tables in dependency order (matching API INITIAL_SYNC_TABLES)
 */
type InitialSyncTable =
    | 'districts'
    | 'roles'
    | 'permissions'
    | 'rolePermissions'
    | 'subscriptionPlans'
    | 'planFeatures'
    | 'paymentMethods'
    | 'paymentServiceProviders'
    | 'categories'
    | 'suppliers'
    | 'customers'
    | 'products'
    | 'productVariants'
    | 'productBarcodes'
    | 'variantBarcodes'
    | 'inventory'
    | 'users';

/**
 * Status of individual table sync
 */
type SyncTableStatus = 'pending' | 'fetching' | 'saving' | 'completed' | 'failed' | 'skipped';

/**
 * Progress tracking for a single table during sync
 */
interface SyncTableProgress {
    table: InitialSyncTable;
    label: string;
    status: SyncTableStatus;
    totalCount: number;
    fetchedCount: number;
    savedCount: number;
    error?: string | null;
}

/**
 * Request body for POST /onboarding/master-data/counts
 */
interface MasterDataCountsRequest {
    tenantId: string;
    branchId: string;
    tables?: InitialSyncTable[];
}

/**
 * Response from POST /onboarding/master-data/counts
 */
interface MasterDataCountsResponse {
    success: boolean;
    counts: Record<InitialSyncTable, number>;
    total: number;
}

/**
 * Request body for POST /onboarding/master-data/all
 */
interface MasterDataFetchAllRequest {
    tenantId: string;
    branchId: string;
    tables?: InitialSyncTable[];
    batchSize?: number;
    since?: string | null;
}

/**
 * Response from fetching a single table batch
 */
interface MasterDataTableResponse<T = any> {
    data: T[];
    pagination: {
        nextCursor: string | null;
        hasMore: boolean;
        total: number;
        fetched: number;
    };
}

/**
 * Response from POST /onboarding/master-data/all
 */
interface MasterDataFetchAllResponse {
    success: boolean;
    data: Record<string, any[]>;
    counts: Record<string, number>;
    syncedAt: string;
    errors?: string[];
}

/**
 * Request body for POST /onboarding/sync/initial
 */
interface InitialSyncRequest {
    tenantId: string;
    branchId: string;
    terminalId: string;
    data: Record<string, any[]>;
}

/**
 * Result for single table sync
 */
interface TableSyncResult {
    table: string;
    success: boolean;
    inserted: number;
    updated: number;
    skipped: number;
    failed: number;
    errors: string[];
}

/**
 * Response from POST /onboarding/sync/initial
 */
interface InitialSyncResponse {
    success: boolean;
    tables: TableSyncResult[];
    summary: {
        totalTables: number;
        successfulTables: number;
        failedTables: number;
        totalRecords: number;
        insertedRecords: number;
        skippedRecords: number;
        failedRecords: number;
    };
    errors: string[];
    completedAt: string;
}

/**
 * Overall sync progress state for UI
 */
interface SyncPullProgress {
    status: 'idle' | 'counting' | 'fetching' | 'saving' | 'completed' | 'failed';
    currentTable?: InitialSyncTable;
    tables: SyncTableProgress[];
    totalTables: number;
    completedTables: number;
    totalRecords: number;
    fetchedRecords: number;
    savedRecords: number;
    lastSyncTimestamp?: string | null;
    error?: string | null;
}

// Legacy types for backward compatibility
type SyncEntityType = InitialSyncTable;
type SyncEntityStatus = SyncTableStatus;
interface SyncEntityProgress extends SyncTableProgress {
    entity: InitialSyncTable;
    count?: number;
}