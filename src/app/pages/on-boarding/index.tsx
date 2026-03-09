import { FunctionComponent, useEffect } from 'react';
import { useOnboarding, useStepExecution } from './hooks';
import {
    ActivationView,
    LoadingView,
    StepDetailView,
    StepListView,
    TerminalDetailsView,
} from './views';
import type { OnboardingFlowProps } from './types';

const OnboardingFlow: FunctionComponent<OnboardingFlowProps> = ({
    onComplete,
}) => {
    const {
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
    } = useOnboarding({ onComplete });

    const {
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
    } = useStepExecution({
        progress,
        activeStep,
        onStepComplete: handleCloseStepDetail,
        refreshProgress,
    });

    useEffect(() => {
        if (viewMode === 'step-detail') {
            resetExecutionState();
            if (isSyncable && activeStep) {
                fetchData();
            }
        }
    }, [viewMode, activeStep, resetExecutionState, isSyncable, fetchData]);

    const displayError = localError;

    const handleDoneAndNext = async () => {
        if (!progress) return;

        if (progress.overallStatus === 'COMPLETED') {
            await handleComplete();
        } else {
            handleCloseStepDetail();
        }
    };

    if (initializing) {
        return <LoadingView />;
    }

    if (viewMode === 'activation') {
        return (
            <ActivationView
                error={displayError}
                loading={loading}
                onSubmit={handleActivateTerminal}
            />
        );
    }

    if (viewMode === 'fetched-details' && fetchedTerminal) {
        return (
            <TerminalDetailsView
                terminal={fetchedTerminal}
                error={displayError}
                loading={loading}
                onSave={handleSaveAndInitProgress}
                onBack={goToActivation}
            />
        );
    }

    if (viewMode === 'step-detail' && activeStep && progress) {
        return (
            <StepDetailView
                step={activeStep}
                progress={progress}
                executionState={executionState}
                syncedData={syncedData}
                fetchedData={fetchedData}
                selectedIds={selectedIds}
                error={stepError}
                isSyncable={isSyncable}
                onFetch={fetchData}
                onToggleItem={toggleItem}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
                onSync={syncSelected}
                onCompleteWithoutSync={completeWithoutSync}
                onExecute={executeStep}
                onSkip={skipStep}
                onDone={handleDoneAndNext}
                onBack={handleCloseStepDetail}
            />
        );
    }

    if (viewMode === 'list' && progress) {
        return (
            <StepListView
                progress={progress}
                error={displayError}
                onStepClick={handleOpenStepDetail}
                onComplete={handleComplete}
            />
        );
    }

    return (
        <ActivationView
            error={displayError}
            loading={loading}
            onSubmit={handleActivateTerminal}
        />
    );
};

export default OnboardingFlow;
