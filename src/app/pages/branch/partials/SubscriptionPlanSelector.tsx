import { Select } from '../../../components';
import { formatCurrency } from '../../../utils';
import { FunctionComponent, useEffect, useState } from 'react';
import subscriptionPlanService from '../../../services/subscription-plan.service';

interface SubscriptionPlanSelectorProps {
    selectedPlanId: string;
    subscriptionMonths: number;
    onPlanChange: (planId: string) => void;
    onDurationChange: (months: number) => void;
    error?: string;
    touched?: boolean;
}

const SubscriptionPlanSelector: FunctionComponent<SubscriptionPlanSelectorProps> = ({
    selectedPlanId,
    subscriptionMonths,
    onPlanChange,
    onDurationChange,
    error,
    touched,
}) => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            setLoading(true);
            try {
                const plansData = await subscriptionPlanService.list();
                setPlans(plansData.filter(p => p.isActive));
            } catch (error) {
                console.error('Error fetching subscription plans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const selectedPlan = plans.find(p => (p.planId || p.subscriptionPlanId) === selectedPlanId);

    return (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subscription Plan <span className="text-red-500">*</span>
                    </label>
                    {loading ? (
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ) : (
                        <>
                            <div className="flex">
                                {plans.map((plan, index) => {
                                    const planId = plan.planId || plan.subscriptionPlanId || '';
                                    const isActive = selectedPlanId === planId;
                                    const isFirst = index === 0;
                                    const isLast = index === plans.length - 1;

                                    let roundedClass = '';
                                    if (isFirst) roundedClass = 'rounded-l-md';
                                    if (isLast) roundedClass = 'rounded-r-md';
                                    if (plans.length === 1) roundedClass = 'rounded-md';

                                    const borderClass = isFirst ? 'border' : 'border border-l-0';

                                    return (
                                        <button
                                            key={planId}
                                            type="button"
                                            onClick={() => onPlanChange(planId)}
                                            className={`flex-1 py-2.5 px-3 ${roundedClass} font-medium transition-all ${isActive
                                                ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border border-sky-500'
                                                : `bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ${borderClass} border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700`
                                                }`}
                                        >
                                            <div className="text-center">
                                                <div className="text-sm">{plan.displayName || plan.name}</div>
                                                <div className={`text-xs ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {formatCurrency(plan.monthlyPrice, true)}/mo
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {error && touched && (
                                <p className="mt-1 text-sm text-red-500">{error}</p>
                            )}
                        </>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subscription Duration
                    </label>
                    <Select
                        value={subscriptionMonths}
                        onChange={(e) => onDurationChange(Number(e.target.value))}
                    >
                        <option value={1}>1 month</option>
                        <option value={3}>3 months</option>
                        <option value={6}>6 months</option>
                        <option value={12}>12 months (1 year)</option>
                    </Select>
                </div>
            </div>
            {selectedPlan && (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {selectedPlan.description}
                </p>
            )}
        </div>
    );
};

export default SubscriptionPlanSelector;