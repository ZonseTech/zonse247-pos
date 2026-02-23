import { FunctionComponent } from 'react';
import { createPortal } from 'react-dom';
import { Check, Loader2, CircleDot } from 'lucide-react';

export type ProcessingStep = 'validating' | 'saving' | 'printing' | 'completed';

interface DesktopProcessingViewProps {
    processingStep: ProcessingStep;
}

interface StepIndicatorProps {
    step: ProcessingStep;
    currentStep: ProcessingStep;
    label: string;
    description: string;
}

const StepIndicator: FunctionComponent<StepIndicatorProps> = ({
    step,
    currentStep,
    label,
    description,
}) => {
    const stepOrder: ProcessingStep[] = ['validating', 'saving', 'printing', 'completed'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);

    const isCompleted = currentIndex > stepIndex;
    const isActive = currentStep === step;

    return (
        <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            : isActive
                                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                        }`}
                >
                    {isCompleted ? (
                        <Check className="w-5 h-5" />
                    ) : isActive ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <CircleDot className="w-5 h-5" />
                    )}
                </div>
                {step !== 'printing' && (
                    <div className={`w-0.5 h-8 transition-colors duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                )}
            </div>
            <div className="flex-1 pb-8">
                <h4 className={`font-semibold transition-colors duration-300 ${isActive || isCompleted
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                    {label}
                </h4>
                <p className={`text-sm mt-0.5 transition-colors duration-300 ${isActive
                        ? 'text-sky-600 dark:text-sky-400'
                        : isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-400 dark:text-gray-500'
                    }`}>
                    {isCompleted ? 'Completed' : isActive ? description : 'Pending'}
                </p>
            </div>
        </div>
    );
};

const getMainMessage = (step: ProcessingStep): string => {
    switch (step) {
        case 'validating':
            return 'Validating Transaction';
        case 'saving':
            return 'Saving Sale';
        case 'printing':
            return 'Printing Receipt';
        case 'completed':
            return 'Transaction Complete!';
        default:
            return 'Processing...';
    }
};

const getSubMessage = (step: ProcessingStep): string => {
    switch (step) {
        case 'validating':
            return 'Checking inventory and validating items...';
        case 'saving':
            return 'Recording your transaction securely...';
        case 'printing':
            return 'Sending receipt to printer...';
        case 'completed':
            return 'Your sale has been completed successfully!';
        default:
            return 'Please wait...';
    }
};

const DesktopProcessingView: FunctionComponent<DesktopProcessingViewProps> = ({ processingStep }) => {
    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* Header with animated gradient */}
                <div className="relative bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-cyan-400/20 animate-pulse" />
                    <div className="relative flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                </div>
                            </div>
                            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-white/50 animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {getMainMessage(processingStep)}
                            </h2>
                            <p className="text-white/80 text-sm mt-1">
                                {getSubMessage(processingStep)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="px-8 py-6">
                    <div className="space-y-0">
                        <StepIndicator
                            step="validating"
                            currentStep={processingStep}
                            label="Validate Transaction"
                            description="Checking items and inventory..."
                        />
                        <StepIndicator
                            step="saving"
                            currentStep={processingStep}
                            label="Save Sale Record"
                            description="Recording transaction..."
                        />
                        <StepIndicator
                            step="printing"
                            currentStep={processingStep}
                            label="Print Receipt"
                            description="Sending to printer..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 pb-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Please do not close this window or navigate away until the process is complete.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DesktopProcessingView;
