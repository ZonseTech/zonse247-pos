import { FunctionComponent } from 'react';
import { createPortal } from 'react-dom';
import ProcessingStepIndicator, { ProcessingStep } from './ProcessingStepIndicator';

interface ProcessingViewProps {
    processingStep: ProcessingStep;
}

const getProcessingMessage = (step: ProcessingStep) => {
    switch (step) {
        case 'validating':
            return 'Validating transaction...';
        case 'processing':
            return 'Processing payment...';
        case 'saving':
            return 'Saving transaction...';
        case 'completed':
            return 'Transaction complete!';
        default:
            return 'Processing...';
    }
};

const ProcessingView: FunctionComponent<ProcessingViewProps> = ({ processingStep }) => {
    return createPortal(
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[70] flex flex-col safe-area-top-android">
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full border-4 border-sky-200 dark:border-sky-800" />
                    <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-sky-500 animate-spin" />
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {getProcessingMessage(processingStep)}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    Please wait while we process your transaction
                </p>

                <div className="mt-8 w-full max-w-xs">
                    <div className="flex items-center justify-between">
                        <ProcessingStepIndicator
                            step="validating"
                            currentStep={processingStep}
                            label="Validate"
                        />
                        <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2">
                            <div
                                className={`h-full bg-sky-500 transition-all duration-500 ${processingStep === 'validating' ? 'w-0' : 'w-full'
                                    }`}
                            />
                        </div>
                        <ProcessingStepIndicator
                            step="processing"
                            currentStep={processingStep}
                            label="Process"
                        />
                        <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2">
                            <div
                                className={`h-full bg-sky-500 transition-all duration-500 ${processingStep === 'validating' || processingStep === 'processing' ? 'w-0' : 'w-full'
                                    }`}
                            />
                        </div>
                        <ProcessingStepIndicator
                            step="saving"
                            currentStep={processingStep}
                            label="Save"
                        />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProcessingView;
