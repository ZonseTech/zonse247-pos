import { FunctionComponent } from 'react';
import { ArrowLeft } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import ExecutionStateDisplay from '../partials/ExecutionStateDisplay';
import ActionButtons from '../partials/ActionButtons';
import { getStepLabel, getStepDescription } from '../constants';
import { getStepIndex } from '../hooks';
import type { StepDetailViewProps } from '../types';

/**
 * Step detail view - detailed view for executing a specific step
 */
const StepDetailView: FunctionComponent<StepDetailViewProps> = ({
    step,
    progress,
    executionState,
    syncedData,
    fetchedData,
    selectedIds,
    error,
    isSyncable,
    onFetch,
    onToggleItem,
    onSelectAll,
    onDeselectAll,
    onSync,
    onCompleteWithoutSync,
    onExecute,
    onSkip,
    onDone,
    onBack,
}) => {
    return (
        <AuthLayout className="">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={executionState === 'fetching' || executionState === 'syncing'}
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {getStepLabel(step.stepType)}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Step {getStepIndex(progress, step.stepType)} of {progress.totalSteps}
                        </p>
                    </div>
                </div>

                <div className="min-h-[450px] flex flex-col justify-center">
                    <ExecutionStateDisplay
                        step={step}
                        executionState={executionState}
                        syncedData={syncedData}
                        fetchedData={fetchedData}
                        selectedIds={selectedIds}
                        error={error}
                        isSyncable={isSyncable}
                        onToggleItem={onToggleItem}
                        onSelectAll={onSelectAll}
                        onDeselectAll={onDeselectAll}
                        onRefetch={onFetch}
                    />
                </div>

                <div className="flex gap-3">
                    <ActionButtons
                        step={step}
                        executionState={executionState}
                        selectedIds={selectedIds}
                        fetchedDataCount={fetchedData.length}
                        isSyncable={isSyncable}
                        onFetch={onFetch}
                        onSync={onSync}
                        onCompleteWithoutSync={onCompleteWithoutSync}
                        onExecute={onExecute}
                        onSkip={onSkip}
                        onDone={onDone}
                    />
                </div>
            </div>
        </AuthLayout>
    );
};

export default StepDetailView;
