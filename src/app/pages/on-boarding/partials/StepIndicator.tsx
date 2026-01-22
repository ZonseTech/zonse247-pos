import { FunctionComponent, PropsWithChildren } from "react";
import { ChevronLeft } from "lucide-react";

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    onBack?: () => void;
}

const StepIndicator: FunctionComponent<PropsWithChildren<StepIndicatorProps>> = ({
    currentStep,
    totalSteps,
    children,
    onBack
}) => (
    <div className="">
        <div className="flex items-center justify-between w-full mb-6">
            {onBack ? (
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Back</span>
                </button>
            ) : <div className="w-20" />}
            <div className="flex-1 flex justify-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-100">
                    <span className="text-sky-600 font-semibold">{currentStep}</span>
                </div>
            </div>
            <div className="w-20" />
        </div>
        {children}
        <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                <div
                    key={s}
                    className={`w-2 h-2 rounded-full ${s <= currentStep ? 'bg-sky-600' : 'bg-gray-300'
                        }`}
                />
            ))}
        </div>
    </div>
);

export default StepIndicator;