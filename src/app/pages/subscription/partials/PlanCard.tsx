import { Button } from '../../../components';
import type { FunctionComponent } from 'react';

interface PlanCardProps {
    plan: SubscriptionPlan;
    billingCycle: 'monthly' | 'yearly';
    onSelectPlan: (plan: SubscriptionPlan) => void;
    getPrice: (plan: SubscriptionPlan) => string;
    isCurrentPlan?: boolean;
}

const PlanCard: FunctionComponent<PlanCardProps> = ({
    plan,
    billingCycle,
    onSelectPlan,
    getPrice,
    isCurrentPlan = false,
}) => {
    return (
        <div className={`p-8 text-center ${plan.isPopular
            ? 'bg-blue-50 border-l border-r border-blue-200'
            : 'bg-white'
            }`}
        >
            {plan.isPopular && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                    Most Popular
                </span>
            )}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="flex items-baseline justify-center mb-2">
                <span className="text-4xl font-bold text-gray-900">
                    {getPrice(plan)}
                </span>
                {(
                    <span className="text-lg text-gray-600 ml-1">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                )}
            </div>
            <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

            <Button
                onClick={() => onSelectPlan(plan)}
                disabled={isCurrentPlan}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${isCurrentPlan
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : plan.isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : plan.subscriptionPlanId === 'free'
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
            >
                {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
            </Button>
        </div>
    );
};

export default PlanCard;