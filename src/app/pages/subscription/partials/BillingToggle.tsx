import { FunctionComponent } from 'react';

interface BillingToggleProps {
    billingCycle: 'monthly' | 'yearly';
    onBillingCycleChange: (cycle: 'monthly' | 'yearly') => void;
}

const BillingToggle: FunctionComponent<BillingToggleProps> = ({
    billingCycle,
    onBillingCycleChange,
}) => {
    return (
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
                onClick={() => onBillingCycleChange('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${billingCycle === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
            >
                Monthly
            </button>
            <button
                onClick={() => onBillingCycleChange('yearly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${billingCycle === 'yearly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
            >
                Yearly
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Save up to 17%
                </span>
            </button>
        </div>
    );
};

export default BillingToggle;