/**
 * View modes for the onboarding flow
 * - 'activation': Show terminal activation form
 * - 'fetched-details': Show fetched terminal details with save button
 * - 'list': Main view showing all steps
 * - 'step-detail': Detailed view for executing a specific step
 */
export type ViewMode = 'activation' | 'fetched-details' | 'list' | 'step-detail';

/**
 * Step execution state for sync operations
 * - 'idle': Ready to start
 * - 'fetching': Loading data from LIVE API
 * - 'preview': Data fetched, showing checklist for user selection
 * - 'syncing': Syncing selected data to local
 * - 'success': Sync completed successfully
 * - 'error': An error occurred
 */
export type StepExecutionState = 'idle' | 'fetching' | 'preview' | 'syncing' | 'success' | 'error';

/**
 * Props for OnboardingFlow component
 */
export interface OnboardingFlowProps {
    onComplete: (setupData: OnboardingCompleteData) => void;
    error?: string | null;
}

/**
 * Data passed when onboarding completes
 */
export interface OnboardingCompleteData {
    terminalId: string;
    tenantId: string;
    branchId: string;
    verificationKey: string;
}

/**
 * Activation form values
 */
export interface ActivationFormValues {
    activationCode: string;
}

/**
 * Props for ActivationView component
 */
export interface ActivationViewProps {
    error?: string | null;
    loading: boolean;
    onSubmit: (values: ActivationFormValues) => Promise<void>;
}

/**
 * Props for TerminalDetailsView component
 */
export interface TerminalDetailsViewProps {
    terminal: TerminalWithRelations;
    error?: string | null;
    loading: boolean;
    onSave: () => Promise<void>;
    onBack: () => void;
}

/**
 * Props for StepListView component
 */
export interface StepListViewProps {
    progress: OnboardingProgress;
    error?: string | null;
    onStepClick: (step: OnboardingStep) => void;
    onComplete: () => void;
}

/**
 * Props for StepDetailView component
 */
export interface StepDetailViewProps {
    step: OnboardingStep;
    progress: OnboardingProgress;
    executionState: StepExecutionState;
    syncedData: unknown;
    fetchedData: any[];
    selectedIds: Set<string>;
    error: string;
    isSyncable: boolean;
    onFetch: () => Promise<void>;
    onToggleItem: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onSync: () => Promise<void>;
    onCompleteWithoutSync: () => Promise<void>;
    onExecute: () => Promise<void>;
    onSkip: () => Promise<void>;
    onDone: () => void;
    onBack: () => void;
}

/**
 * Props for SyncedDataPreview component
 */
export interface SyncedDataPreviewProps {
    data: unknown;
}
