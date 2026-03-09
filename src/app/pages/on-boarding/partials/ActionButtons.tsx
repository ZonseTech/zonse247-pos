import { FunctionComponent } from 'react';
import {
    CheckCircle2,
    Database,
    Loader,
    Loader2,
    RefreshCw,
    Upload,
} from 'lucide-react';
import { isStepOptional } from '../constants';
import type { StepExecutionState } from '../types';

/**
 * Action buttons props
 */
export interface ActionButtonsProps {
    step: OnboardingStep;
    executionState: StepExecutionState;
    selectedIds: Set<string>;
    fetchedDataCount: number;
    isSyncable: boolean;
    onFetch: () => Promise<void>;
    onSync: () => Promise<void>;
    onCompleteWithoutSync: () => Promise<void>;
    onExecute: () => Promise<void>;
    onSkip: () => Promise<void>;
    onDone: () => void;
}

/**
 * Action buttons for step execution - renders different buttons based on execution state
 */
const ActionButtons: FunctionComponent<ActionButtonsProps> = ({
    step,
    executionState,
    selectedIds,
    fetchedDataCount,
    isSyncable,
    onFetch,
    onSync,
    onCompleteWithoutSync,
    onExecute,
    onSkip,
    onDone,
}) => {
    const isOptional = isStepOptional(step.stepType);

    // For syncable steps, idle shows loading since fetch starts automatically
    if (executionState === 'idle') {
        if (isSyncable) {
            return (
                <button
                    disabled
                    className="flex-1 py-3 px-4 bg-gray-300 dark:bg-gray-700 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                >
                    <Loader className="w-5 h-5 animate-spin mx-auto" />
                </button>
            );
        }
        return (
            <>
                <button
                    onClick={onExecute}
                    className="flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                    {step.status === 'FAILED' ? (
                        <>
                            <RefreshCw className="w-5 h-5" />
                            Retry
                        </>
                    ) : (
                        <>
                            <Database className="w-5 h-5" />
                            Start Sync
                        </>
                    )}
                </button>
                {isOptional && (
                    <button
                        onClick={onSkip}
                        className="py-3 px-4 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                    >
                        Skip
                    </button>
                )}
            </>
        );
    }

    if (executionState === 'fetching') {
        return (
            <button
                disabled
                className="flex-1 py-3 px-4 bg-gray-300 dark:bg-gray-700 text-gray-500 rounded-lg font-medium cursor-not-allowed"
            >
                <Loader className="w-5 h-5 animate-spin mx-auto" />
            </button>
        );
    }

    if (executionState === 'preview') {
        const hasSelected = selectedIds.size > 0;
        const isEmpty = fetchedDataCount === 0;

        // Show "Complete" button when no data to sync
        if (isEmpty) {
            return (
                <>
                    <button
                        onClick={onCompleteWithoutSync}
                        className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Complete (No Data)
                    </button>
                    {isOptional && (
                        <button
                            onClick={onSkip}
                            className="py-3 px-4 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                        >
                            Skip
                        </button>
                    )}
                </>
            );
        }

        return (
            <>
                <button
                    onClick={onSync}
                    disabled={!hasSelected}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${hasSelected
                        ? 'bg-sky-500 hover:bg-sky-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <Upload className="w-5 h-5" />
                    Sync {selectedIds.size} Item{selectedIds.size !== 1 ? 's' : ''}
                </button>
                {isOptional && (
                    <button
                        onClick={onSkip}
                        className="py-3 px-4 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                    >
                        Skip
                    </button>
                )}
            </>
        );
    }

    if (executionState === 'syncing') {
        return (
            <button
                disabled
                className="flex-1 py-3 px-4 bg-gray-300 dark:bg-gray-700 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Loader2 className="w-5 h-5 animate-spin" />
                Syncing...
            </button>
        );
    }

    if (executionState === 'success') {
        return (
            <button
                onClick={onDone}
                className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
                <CheckCircle2 className="w-5 h-5" />
                Done
            </button>
        );
    }

    if (executionState === 'error') {
        return (
            <>
                <button
                    onClick={isSyncable ? onFetch : onExecute}
                    className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Retry
                </button>
                {isOptional && (
                    <button
                        onClick={onSkip}
                        className="py-3 px-4 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                    >
                        Skip
                    </button>
                )}
            </>
        );
    }

    return null;
};

export default ActionButtons;
