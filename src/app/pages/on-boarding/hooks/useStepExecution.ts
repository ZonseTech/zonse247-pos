import { toast } from 'react-toastify';
import { getStepLabel } from '../constants';
import { useState, useCallback } from 'react';
import type { StepExecutionState } from '../types';
import onboardingService from '../../../services/on-boarding.service';
import { SYNCABLE_STEPS, getItemId } from '../partials/step-list.utils';

interface UseStepExecutionOptions {
    progress: OnboardingProgress | null;
    activeStep: OnboardingStep | null;
    onStepComplete: () => void;
    refreshProgress: (terminalId: string) => Promise<boolean>;
}

interface UseStepExecutionReturn {
    executionState: StepExecutionState;
    syncedData: unknown;
    fetchedData: any[];
    selectedIds: Set<string>;
    stepError: string;
    isSyncable: boolean;
    resetExecutionState: () => void;
    fetchData: () => Promise<void>;
    toggleItem: (id: string) => void;
    selectAll: () => void;
    deselectAll: () => void;
    syncSelected: () => Promise<void>;
    completeWithoutSync: () => Promise<void>;
    executeStep: () => Promise<void>;
    skipStep: () => Promise<void>;
}

/**
 * Hook for managing step execution state and actions
 */
export function useStepExecution({
    progress,
    activeStep,
    onStepComplete,
    refreshProgress,
}: UseStepExecutionOptions): UseStepExecutionReturn {
    const [stepError, setStepError] = useState('');
    const [fetchedData, setFetchedData] = useState<any[]>([]);
    const [syncedData, setSyncedData] = useState<unknown>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [executionState, setExecutionState] = useState<StepExecutionState>('idle');
    const isSyncable = activeStep ? SYNCABLE_STEPS.includes(activeStep.stepType) : false;

    /**
     * Reset execution state when changing steps
     */
    const resetExecutionState = useCallback(() => {
        setExecutionState('idle');
        setSyncedData(null);
        setFetchedData([]);
        setSelectedIds(new Set());
        setStepError('');
    }, []);

    /**
     * Fetch data from LIVE API for preview
     */
    const fetchData = useCallback(async () => {
        if (!progress || !activeStep) return;

        setStepError('');
        setExecutionState('fetching');
        setFetchedData([]);
        setSelectedIds(new Set());

        try {
            await onboardingService.startStep(progress.terminalId, activeStep.stepType);
            const data = await onboardingService.fetchFromLiveApi(activeStep.stepType);
            const dataArray = Array.isArray(data) ? data : data?.items || data?.data || [data];
            setFetchedData(dataArray);
            const allIds = new Set<string>(dataArray.map((item: any) => getItemId(item, activeStep.stepType)));
            setSelectedIds(allIds);
            setExecutionState('preview');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            setStepError(errorMessage);
            setExecutionState('error');
            toast.error(errorMessage);
        }
    }, [progress, activeStep]);

    /**
     * Toggle item selection
     */
    const toggleItem = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    /**
     * Select all items
     */
    const selectAll = useCallback(() => {
        if (!activeStep) return;
        const allIds = new Set<string>(fetchedData.map((item) => getItemId(item, activeStep.stepType)));
        setSelectedIds(allIds);
    }, [activeStep, fetchedData]);

    /**
     * Deselect all items
     */
    const deselectAll = useCallback(() => {
        setSelectedIds(new Set<string>());
    }, []);

    /**
     * Sync only selected items to local API
     */
    const syncSelected = useCallback(async () => {
        if (!progress || !activeStep || selectedIds.size === 0) return;

        setExecutionState('syncing');

        try {
            const selectedData = fetchedData.filter((item) =>
                selectedIds.has(getItemId(item, activeStep.stepType))
            );

            await onboardingService.syncToLocalApi(activeStep.stepType, selectedData);
            await onboardingService.completeStep(progress.terminalId, activeStep.stepType);
            await refreshProgress(progress.terminalId);

            resetExecutionState();
            onStepComplete();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sync data';
            setStepError(errorMessage);
            setExecutionState('error');
            toast.error(errorMessage);

            try {
                await onboardingService.failStep(progress.terminalId, activeStep.stepType, errorMessage);
                await refreshProgress(progress.terminalId);
            } catch {
                // Ignore
            }
        }
    }, [progress, activeStep, selectedIds, fetchedData, refreshProgress, resetExecutionState, onStepComplete]);

    /**
     * Complete step without syncing (for empty data scenarios)
     */
    const completeWithoutSync = useCallback(async () => {
        if (!progress || !activeStep) return;

        setExecutionState('syncing');

        try {
            await onboardingService.completeStep(progress.terminalId, activeStep.stepType);
            await refreshProgress(progress.terminalId);

            resetExecutionState();
            onStepComplete();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to complete step';
            setStepError(errorMessage);
            setExecutionState('error');
            toast.error(errorMessage);
        }
    }, [progress, activeStep, refreshProgress, resetExecutionState, onStepComplete]);

    /**
     * Execute the active step (for non-syncable steps)
     */
    const executeStep = useCallback(async () => {
        if (!progress || !activeStep) return;

        setStepError('');
        setExecutionState('fetching');
        setSyncedData(null);

        try {
            await onboardingService.startStep(progress.terminalId, activeStep.stepType);

            const result = await onboardingService.executeSyncStep(activeStep.stepType);
            setSyncedData(result);

            await onboardingService.completeStep(progress.terminalId, activeStep.stepType);

            await refreshProgress(progress.terminalId);

            setExecutionState('success');
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : `Failed to execute ${activeStep.stepType}`;
            setStepError(errorMessage);
            setExecutionState('error');

            try {
                await onboardingService.failStep(progress.terminalId, activeStep.stepType, errorMessage);
                await refreshProgress(progress.terminalId);
            } catch {
                // Ignore
            }
        }
    }, [progress, activeStep, refreshProgress]);

    /**
     * Skip the active step
     */
    const skipStep = useCallback(async () => {
        if (!progress || !activeStep) return;

        setExecutionState('fetching');
        try {
            await onboardingService.skipStep(progress.terminalId, activeStep.stepType, 'Skipped by user');
            await refreshProgress(progress.terminalId);
            onStepComplete();
            toast.info(`${getStepLabel(activeStep.stepType)} skipped`);
        } catch (err) {
            setExecutionState('idle');
        }
    }, [progress, activeStep, refreshProgress, onStepComplete]);

    return {
        executionState,
        syncedData,
        fetchedData,
        selectedIds,
        stepError,
        isSyncable,
        resetExecutionState,
        fetchData,
        toggleItem,
        selectAll,
        deselectAll,
        syncSelected,
        completeWithoutSync,
        executeStep,
        skipStep,
    };
}
