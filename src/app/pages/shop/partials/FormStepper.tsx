import type { FunctionComponent } from "react";

interface StepperProps {
    steps: string[];
    currentStep: number;
    completedSteps: number[];
    onStepClick: (step: number) => void;
}

const FormStepper: FunctionComponent<StepperProps> = ({ steps, currentStep, completedSteps, onStepClick }) => {
    return (
        <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <button
                            type="button"
                            onClick={() => onStepClick(index)}
                            disabled={!completedSteps.includes(index) && index !== currentStep}
                            className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                                ${index === currentStep
                                    ? 'bg-blue-600 text-white dark:text-gray-100 ring-2 ring-blue-200'
                                    : completedSteps.includes(index)
                                        ? 'bg-green-600 text-white dark:text-gray-100 cursor-pointer hover:bg-green-700'
                                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }
                            `}
                        >
                            {completedSteps.includes(index) ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                index + 1
                            )}
                        </button>
                        <span className={`mt-2 text-xs font-medium ${index === currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                            {step}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`w-12 h-0.5 mx-4 ${completedSteps.includes(index) ? 'bg-green-600' : 'bg-gray-300'}`} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default FormStepper