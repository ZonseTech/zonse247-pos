import { FunctionComponent } from 'react';
import { Check } from 'lucide-react';

export type ProcessingStep = 'validating' | 'processing' | 'saving' | 'completed';

interface ProcessingStepIndicatorProps {
    step: ProcessingStep;
    currentStep: ProcessingStep;
    label: string;
}

const ProcessingStepIndicator: FunctionComponent<ProcessingStepIndicatorProps> = ({
    step,
    currentStep,
    label,
}) => {
    const stepOrder: ProcessingStep[] = ['validating', 'processing', 'saving', 'completed'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);

    const isCompleted = currentIndex > stepIndex;
    const isActive = currentStep === step;

    return (
        <div className="flex flex-col items-center">
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isActive
                        ? 'bg-sky-500 text-white animate-pulse'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
            >
                {isCompleted ? (
                    <Check className="w-4 h-4" />
                ) : (
                    <span className="text-xs font-medium">{stepIndex + 1}</span>
                )}
            </div>
            <span className={`text-xs mt-1 ${isActive || isCompleted
                ? 'text-gray-900 dark:text-white font-medium'
                : 'text-gray-400'
                }`}>
                {label}
            </span>
        </div>
    );
};

export default ProcessingStepIndicator;
