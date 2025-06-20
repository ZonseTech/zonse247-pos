const StepIndicator = ({ currentStep, totalSteps = 4 }) => (
    <div className="flex items-center justify-center space-x-4 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                    {step < currentStep ? '✓' : step}
                </div>
                {step < totalSteps && (
                    <div className={`w-12 h-0.5 mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                )}
            </div>
        ))}
    </div>
);

export default StepIndicator;