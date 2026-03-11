import { FunctionComponent, useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import onboardingService from '../../services/on-boarding.service';
import { useSyncPull } from './hooks';
import {
    ActivationView,
    LoadingView,
    SyncProgressView,
    TerminalDetailsView,
} from './views';
import type { OnboardingFlowProps, ViewMode, ActivationFormValues } from './types';

/**
 * Simplified Onboarding Flow
 * 
 * Flow:
 * 1. Terminal Activation → Register terminal with cloud
 * 2. Initial Pull → Call POST /sync/pull with since: null to get all master data
 * 3. Store Locally → Save received data to local SQLite database
 * 4. Complete → Navigate to main app
 * 
 * Ongoing Sync → Subsequent calls use since: lastSyncTimestamp for delta updates
 */
const OnboardingFlow: FunctionComponent<OnboardingFlowProps> = ({
    onComplete,
}) => {
    const [initializing, setInitializing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('activation');
    const [fetchedTerminal, setFetchedTerminal] = useState<TerminalWithRelations | null>(null);

    // Sync pull hook
    const { progress: syncProgress, startSync, retrySync } = useSyncPull({
        terminal: fetchedTerminal,
        onComplete: () => {
            // Sync completed - will trigger completion
        },
    });

    /**
     * Initialize: Check if terminal was already activated
     */
    useEffect(() => {
        const initializeOnboarding = async () => {
            try {
                const status = onboardingService.checkOnboardingStatus();

                // Check if we have stored validation params (terminal was activated)
                if (status.hasTerminal && status.validationParams) {
                    // Try to get terminal details and resume sync
                    try {
                        const terminalData = await onboardingService.activateTerminal(
                            '' // Empty code will fail, but we check localStorage first
                        );
                        setFetchedTerminal(terminalData);
                        setViewMode('sync-progress');
                    } catch {
                        // If resume fails, start fresh
                        setViewMode('activation');
                    }
                } else {
                    setViewMode('activation');
                }
            } catch (err) {
                setViewMode('activation');
            } finally {
                setInitializing(false);
            }
        };

        initializeOnboarding();
    }, [onComplete]);

    /**
     * Handle terminal activation
     */
    const handleActivateTerminal = useCallback(async (values: ActivationFormValues) => {
        setLocalError('');
        setLoading(true);

        try {
            const terminalData = await onboardingService.activateTerminal(values.activationCode);
            setFetchedTerminal(terminalData);
            setViewMode('fetched-details');
            toast.success('Terminal activated successfully!');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to activate terminal.';
            setLocalError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Handle save terminal details and start sync
     */
    const handleSaveAndStartSync = useCallback(async () => {
        if (!fetchedTerminal) return;

        setLocalError('');
        setLoading(true);

        try {
            // Save terminal details to local DB first
            await onboardingService.saveTerminalDetails(fetchedTerminal);

            // Switch to sync progress view
            setViewMode('sync-progress');

            // Start the sync process
            await startSync();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save terminal details.';
            setLocalError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [fetchedTerminal, startSync]);

    /**
     * Handle sync completion
     */
    const handleComplete = useCallback(async () => {
        if (!fetchedTerminal) return;

        try {
            // Set terminal as activated on the server
            const terminal = await onboardingService.setTerminalActivated(fetchedTerminal.terminalId);

            // Clear onboarding storage
            onboardingService.clearOnboardingStorage();

            // Navigate to main app
            await onComplete({
                terminalId: terminal?.terminalId || fetchedTerminal.terminalId,
                tenantId: terminal?.tenantId || fetchedTerminal.tenantId,
                branchId: terminal?.branchId || fetchedTerminal.branchId,
                verificationKey: terminal?.activationCode || fetchedTerminal.terminalCode,
            });

            toast.success('Setup completed successfully!');
        } catch (err) {
            toast.error('Setup completed but failed to finalize activation. Please contact support.');
        }
    }, [fetchedTerminal, onComplete]);

    /**
     * Handle go back to activation
     */
    const goToActivation = useCallback(() => {
        setFetchedTerminal(null);
        setViewMode('activation');
    }, []);

    // Loading state
    if (initializing) {
        return <LoadingView />;
    }

    // Activation view
    if (viewMode === 'activation') {
        return (
            <ActivationView
                error={localError}
                loading={loading}
                onSubmit={handleActivateTerminal}
            />
        );
    }

    // Fetched terminal details view
    if (viewMode === 'fetched-details' && fetchedTerminal) {
        return (
            <TerminalDetailsView
                terminal={fetchedTerminal}
                error={localError}
                loading={loading}
                onSave={handleSaveAndStartSync}
                onBack={goToActivation}
            />
        );
    }

    // Sync progress view
    if (viewMode === 'sync-progress' && fetchedTerminal) {
        return (
            <SyncProgressView
                terminal={fetchedTerminal}
                progress={syncProgress}
                onComplete={handleComplete}
                onRetry={retrySync}
            />
        );
    }

    // Fallback to activation
    return (
        <ActivationView
            error={localError}
            loading={loading}
            onSubmit={handleActivateTerminal}
        />
    );
};

export default OnboardingFlow;
