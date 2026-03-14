/**
 * View modes for the onboarding flow
 * - 'activation': Show terminal activation form
 * - 'fetched-details': Show fetched terminal details with save button
 * - 'sync-progress': Show sync pull progress (loading/saving data)
 */
export type ViewMode = 'activation' | 'fetched-details' | 'sync-progress';

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
 * Props for SyncProgressView component
 */
export interface SyncProgressViewProps {
    terminal: TerminalWithRelations;
    progress: SyncPullProgress;
    onComplete: () => void;
    onRetry: () => void;
}
