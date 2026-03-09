import { FunctionComponent, PropsWithChildren } from "react";
import { ChevronLeft, Check } from "lucide-react";

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    onBack?: (() => void) | null;
}

const STEP_TITLES: Record<number, string> = {
    1: 'Terminal Setup',
    2: 'Review Details',
    3: 'Sync Data'
};

const StepIndicator: FunctionComponent<PropsWithChildren<StepIndicatorProps>> = ({
    currentStep,
    totalSteps,
    children,
    onBack
}) => {
    const stepTitle = STEP_TITLES[currentStep] || `Step ${currentStep}`;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between w-full mb-2">
                {onBack ? (
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 -ml-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="text-sm">Back</span>
                    </button>
                ) : <div className="w-16" />}

                <div className="text-center" />

                <div className="w-16" />
            </div>

            <div className="text-center mb-6 uppercase tracking-wide text-sm font-medium text-gray-500 dark:text-gray-400">
                <h2 className="text-xl font-semibold text-sky-500 dark:text-sky-200">
                    {stepTitle}
                </h2>
            </div>

            <div className="min-h-[450px]">
                {children}
            </div>
        </div>
    );
};

export default StepIndicator;