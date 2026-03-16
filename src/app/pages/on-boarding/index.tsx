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

const OnboardingFlow: FunctionComponent<OnboardingFlowProps> = ({
    onComplete,
}) => {
    const [initializing, setInitializing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('activation');
    const [fetchedTerminal, setFetchedTerminal] = useState<TerminalWithRelations | null>(null);

    const { progress: syncProgress, startSync, retrySync } = useSyncPull({
        terminal: fetchedTerminal,
        onComplete: () => {
            // Sync completed - will trigger completion
        },
    });

    useEffect(() => {
        const initializeOnboarding = async () => {
            try {
                const status = onboardingService.checkOnboardingStatus();

                if (status.hasTerminal && status.validationParams) {
                    try {
                        const terminalData = await onboardingService.activateTerminal(
                            ''
                        );
                        setFetchedTerminal(terminalData);
                        setViewMode('sync-progress');
                    } catch {
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

    const handleSaveAndStartSync = useCallback(async () => {
        if (!fetchedTerminal) return;

        setLocalError('');
        setLoading(true);

        try {
            await onboardingService.saveTerminalDetails(fetchedTerminal);

            setViewMode('sync-progress');

            await startSync();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save terminal details.';
            setLocalError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [fetchedTerminal, startSync]);

    const handleComplete = useCallback(async () => {
        if (!fetchedTerminal) return;

        try {
            const terminal = await onboardingService.setTerminalActivated(fetchedTerminal.terminalId);

            onboardingService.clearOnboardingStorage();

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

    const goToActivation = useCallback(() => {
        setFetchedTerminal(null);
        setViewMode('activation');
    }, []);

    if (initializing) {
        return <LoadingView />;
    }

    if (viewMode === 'activation') {
        return (
            <ActivationView
                error={localError}
                loading={loading}
                onSubmit={handleActivateTerminal}
            />
        );
    }

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

    return (
        <ActivationView
            error={localError}
            loading={loading}
            onSubmit={handleActivateTerminal}
        />
    );
};

export default OnboardingFlow;
