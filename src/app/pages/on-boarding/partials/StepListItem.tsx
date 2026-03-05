import { FunctionComponent } from 'react';
import { ChevronRight } from 'lucide-react';
import StatusIcon from './StatusIcon';
import { getStepLabel, isStepOptional } from '../constants';

/**
 * Step list item props
 */
interface StepListItemProps {
    step: OnboardingStep;
    isCurrentStep: boolean;
    isSyncable: boolean;
    onClick: () => void;
}

/**
 * Individual step list item button
 */
const StepListItem: FunctionComponent<StepListItemProps> = ({
    step,
    isCurrentStep,
    isSyncable,
    onClick,
}) => {
    const isCompleted = step.status === 'COMPLETED' || step.status === 'SKIPPED';
    // Allow clicking current step or failed steps (both syncable and non-syncable)
    const isClickable = isCurrentStep || step.status === 'FAILED';

    const getButtonClasses = () => {
        if (isCurrentStep) {
            return 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 cursor-pointer';
        }
        if (isCompleted) {
            return 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30';
        }
        if (step.status === 'FAILED') {
            return 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer';
        }
        return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-60 cursor-not-allowed';
    };

    const getLabelClasses = () => {
        if (isCurrentStep) return 'text-sky-700 dark:text-sky-300';
        if (isCompleted) return 'text-green-700 dark:text-green-300';
        if (step.status === 'FAILED') return 'text-red-700 dark:text-red-300';
        return 'text-gray-600 dark:text-gray-400';
    };

    return (
        <button
            onClick={() => isClickable && onClick()}
            disabled={!isClickable}
            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${getButtonClasses()}`}
        >
            <div className="flex items-center gap-3">
                <StatusIcon status={step.status} />
                <div className="text-left">
                    <span className={`text-sm font-medium ${getLabelClasses()}`}>
                        {getStepLabel(step.stepType)}
                    </span>
                    {isStepOptional(step.stepType) && (
                        <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                    )}
                    {step.status === 'FAILED' && step.errorMessage && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 truncate max-w-[250px]">
                            {step.errorMessage}
                        </p>
                    )}
                </div>
            </div>
            {isClickable && (
                <ChevronRight
                    className={`w-5 h-5 ${isCurrentStep ? 'text-sky-500' : 'text-red-500'}`}
                />
            )}
        </button>
    );
};

export default StepListItem;
