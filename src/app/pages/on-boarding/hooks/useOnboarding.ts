import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import onboardingService from '../../../services/on-boarding.service';
import type {
    ViewMode,
    ActivationFormValues,
    OnboardingCompleteData
} from '../types';

interface UseOnboardingOptions {
    onComplete: (data: OnboardingCompleteData) => void;
}

interface UseOnboardingReturn {
    initializing: boolean;
    loading: boolean;
    localError: string;
    viewMode: ViewMode;
    fetchedTerminal: TerminalWithRelations | null;
    progress: OnboardingProgress | null;
    activeStep: OnboardingStep | null;
    handleActivateTerminal: (values: ActivationFormValues) => Promise<void>;
    handleSaveAndInitProgress: () => Promise<void>;
    handleOpenStepDetail: (step: OnboardingStep) => void;
    handleCloseStepDetail: () => void;
    handleComplete: () => Promise<void>;
    refreshProgress: (terminalId: string) => Promise<boolean>;
    goToActivation: () => void;
}

export const getCurrentStepFromProgress = (progress: OnboardingProgress): OnboardingStep | null => {
    if (!progress.steps || progress.steps.length === 0) return null;
    const sortedSteps = [...progress.steps].sort((a, b) => a.order - b.order);
    return sortedSteps.find(s => s.status !== 'COMPLETED' && s.status !== 'SKIPPED') || null;
};

export const getStepIndex = (progress: OnboardingProgress, stepType: OnboardingStepType): number => {
    const sortedSteps = [...progress.steps].sort((a, b) => a.order - b.order);
    const index = sortedSteps.findIndex(s => s.stepType === stepType);
    return index >= 0 ? index + 1 : 1;
};

export function useOnboarding({ onComplete }: UseOnboardingOptions): UseOnboardingReturn {
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [initializing, setInitializing] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('activation');
    const [activeStep, setActiveStep] = useState<OnboardingStep | null>(null);
    const [progress, setProgress] = useState<OnboardingProgress | null>(null);
    const [fetchedTerminal, setFetchedTerminal] = useState<TerminalWithRelations | null>(null);

    /**
     * Initialize: Check local backend for existing progress
     */
    useEffect(() => {
        const initializeOnboarding = async () => {
            try {
                const status = await onboardingService.checkOnboardingStatus();

                if (status.hasProgress && status.progress) {
                    setProgress(status.progress);

                    if (status.progress.overallStatus === 'COMPLETED') {
                        onboardingService.clearOnboardingStorage();

                        await onComplete({
                            terminalId: status.progress.terminalId,
                            tenantId: status.progress.tenantId || '',
                            branchId: status.progress.branchId || '',
                            verificationKey: status.progress.terminalId || '',
                        });

                        return;
                    }

                    setViewMode('list');
                    toast.info('Resuming onboarding...');
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
     * Refresh progress from API
     */
    const refreshProgress = useCallback(async (terminalId: string): Promise<boolean> => {
        try {
            const updatedProgress = await onboardingService.getProgress(terminalId);
            if (updatedProgress) {
                setProgress(updatedProgress);
                return updatedProgress.overallStatus === 'COMPLETED';
            }
            return false;
        } catch (err) {
            return false;
        }
    }, []);

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
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to activate terminal.';
            setLocalError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Save terminal details and initialize progress
     */
    const handleSaveAndInitProgress = useCallback(async () => {
        if (!fetchedTerminal) return;

        setLocalError('');
        setLoading(true);

        try {
            await onboardingService.saveTerminalDetails(fetchedTerminal);

            let progressData = await onboardingService.initializeProgress({
                terminalId: fetchedTerminal.terminalId,
                tenantId: fetchedTerminal.tenantId,
                branchId: fetchedTerminal.branchId,
            });

            try {
                await onboardingService.completeStep(fetchedTerminal.terminalId, 'TERMINAL_ACTIVATION');
            } catch (err) {
                // Ignore
            }

            try {
                progressData = await onboardingService.completeStep(
                    fetchedTerminal.terminalId,
                    'TERMINAL_DETAILS_SAVE'
                );
            } catch (err) {
                // Ignore
            }

            setProgress(progressData);
            setViewMode('list');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save terminal details.';
            setLocalError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [fetchedTerminal]);

    /**
     * Open step detail view
     */
    const handleOpenStepDetail = useCallback((step: OnboardingStep) => {
        setActiveStep(step);
        setViewMode('step-detail');
    }, []);

    /**
     * Close step detail view and return to list
     */
    const handleCloseStepDetail = useCallback(() => {
        setViewMode('list');
        setActiveStep(null);
    }, []);

    /**
     * Complete onboarding and navigate away
     */
    const handleComplete = useCallback(async () => {
        if (!progress) return;

        let terminal: Terminal | null = null;
        try {
            terminal = await onboardingService.setTerminalActivated(progress.terminalId);
        } catch (err) {
            toast.error('Setup completed but failed to finalize activation. Please contact support.');
            return;
        }

        onboardingService.clearOnboardingStorage();
        await onComplete({
            terminalId: terminal?.terminalId || '',
            tenantId: terminal?.tenantId || '',
            branchId: terminal?.branchId || '',
            verificationKey: terminal?.activationCode || '',
        });
        toast.success('Setup completed successfully!');
    }, [progress, onComplete]);

    /**
     * Go back to activation view
     */
    const goToActivation = useCallback(() => {
        setFetchedTerminal(null);
        setViewMode('activation');
    }, []);

    return {
        initializing,
        loading,
        localError,
        viewMode,
        fetchedTerminal,
        progress,
        activeStep,
        handleActivateTerminal,
        handleSaveAndInitProgress,
        handleOpenStepDetail,
        handleCloseStepDetail,
        handleComplete,
        refreshProgress,
        goToActivation,
    };
}
