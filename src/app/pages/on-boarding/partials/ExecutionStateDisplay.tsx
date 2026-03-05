import { FunctionComponent } from 'react';
import { Loader, Loader2, XCircle } from 'lucide-react';
import StatusIcon from './StatusIcon';
import SyncedDataPreview from './SyncedDataPreview';
import DataPreviewList from './DataPreviewList';
import type { StepExecutionState } from '../types';

/**
 * Execution state display props
 */
export interface ExecutionStateDisplayProps {
    step: OnboardingStep;
    executionState: StepExecutionState;
    syncedData: unknown;
    fetchedData: any[];
    selectedIds: Set<string>;
    error: string;
    isSyncable: boolean;
    onToggleItem: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onRefetch: () => void;
}

/**
 * Execution state display component - shows different UI based on execution state
 */
const ExecutionStateDisplay: FunctionComponent<ExecutionStateDisplayProps> = ({
    step,
    executionState,
    syncedData,
    fetchedData,
    selectedIds,
    error,
    isSyncable,
    onToggleItem,
    onSelectAll,
    onDeselectAll,
    onRefetch,
}) => {
    if (executionState === 'idle') {
        if (isSyncable) {
            return (
                <div className="text-center space-y-4">
                    <Loader className="w-12 h-12 text-sky-500 animate-spin mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading data from cloud...</p>
                </div>
            );
        }
        return (
            <div className="text-center space-y-4">
                <StatusIcon status={step.status} size="lg" />
                <p className="text-gray-600 dark:text-gray-400">
                    {step.status === 'FAILED'
                        ? 'Previous attempt failed. Click retry to try again.'
                        : 'Click the button below to start this step.'}
                </p>
                {step.status === 'FAILED' && step.errorMessage && (
                    <p className="text-sm text-red-500 dark:text-red-400">{step.errorMessage}</p>
                )}
            </div>
        );
    }

    if (executionState === 'fetching') {
        return (
            <div className="text-center space-y-4">
                <Loader className="w-12 h-12 text-sky-500 animate-spin mx-auto" />
                <p className="text-gray-600 dark:text-gray-400">Fetching data from server...</p>
            </div>
        );
    }

    if (executionState === 'preview') {
        return (
            <DataPreviewList
                step={step}
                data={fetchedData}
                selectedIds={selectedIds}
                onToggleItem={onToggleItem}
                onSelectAll={onSelectAll}
                onDeselectAll={onDeselectAll}
                onRefetch={onRefetch}
                isFetching={false}
            />
        );
    }

    if (executionState === 'syncing') {
        return (
            <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto" />
                <p className="text-gray-600 dark:text-gray-400">Syncing {selectedIds.size} item(s) to local...</p>
            </div>
        );
    }

    if (executionState === 'success') {
        return (
            <div className="space-y-4">
                <SyncedDataPreview data={syncedData} />
            </div>
        );
    }

    if (executionState === 'error') {
        return (
            <div className="text-center space-y-4">
                <XCircle className="w-12 h-12 text-red-500 mx-auto" />
                <div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">Sync Failed</p>
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return null;
};

export default ExecutionStateDisplay;
