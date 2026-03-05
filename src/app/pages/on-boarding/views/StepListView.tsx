import { FunctionComponent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import ErrorAlert from '../partials/ErrorAlert';
import ProgressBar from '../partials/ProgressBar';
import StepListItem from '../partials/StepListItem';
import { SYNCABLE_STEPS } from '../partials/step-list.utils';
import { getCurrentStepFromProgress } from '../hooks';
import type { StepListViewProps } from '../types';

/**
 * Step list view - main view showing all steps
 */
const StepListView: FunctionComponent<StepListViewProps> = ({
    progress,
    error,
    onStepClick,
    onComplete,
}) => {
    const nextStep = getCurrentStepFromProgress(progress);
    const sortedSteps = [...progress.steps].sort((a, b) => a.order - b.order);

    return (
        <AuthLayout className="">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Setup Progress</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Complete each step to finish setting up your terminal
                    </p>
                </div>

                {error && <ErrorAlert message={error} />}

                <ProgressBar progress={progress} />

                <div className="space-y-2">
                    {sortedSteps.map((step) => (
                        <StepListItem
                            key={step.stepType}
                            step={step}
                            isCurrentStep={nextStep?.stepType === step.stepType}
                            isSyncable={SYNCABLE_STEPS.includes(step.stepType)}
                            onClick={() => onStepClick(step)}
                        />
                    ))}
                </div>

                {progress.overallStatus === 'COMPLETED' && (
                    <button
                        onClick={onComplete}
                        className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Complete Setup
                    </button>
                )}
            </div>
        </AuthLayout>
    );
};

export default StepListView;
