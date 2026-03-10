import { Check, X } from 'lucide-react';
import { useMemo, type FunctionComponent } from 'react';

interface FeatureComparisonProps {
    plans: Array<SubscriptionPlan>;
}

const FeatureComparison: FunctionComponent<FeatureComparisonProps> = ({ plans }) => {
    // Extract all unique feature names from all plans
    const allFeatures = useMemo(() => {
        const featureSet = new Set<string>();
        plans.forEach(plan => {
            plan.features?.forEach(feature => {
                featureSet.add(feature.name);
            });
        });
        return Array.from(featureSet);
    }, [plans]);

    // Check if a feature is included in a specific plan
    const isFeatureIncluded = (plan: SubscriptionPlan, featureName: string): boolean => {
        return plan.features?.some(
            feature => feature.name === featureName && feature.included
        ) || false;
    };

    // Helper to check if plan is popular (handles both field names)
    const isPlanPopular = (plan: SubscriptionPlan): boolean => {
        return plan.isPopular || plan.popular || false;
    };

    // Helper to get plan ID (handles both field names)
    const getPlanId = (plan: SubscriptionPlan): string => {
        return plan.subscriptionPlanId || plan.planId;
    };

    // Dynamically determine grid columns based on number of plans
    const gridCols = plans.length + 1; // +1 for the feature name column
    const gridClass = `grid grid-cols-1 md:grid-cols-${gridCols}`;

    return (
        <div className="overflow-hidden">
            <div className={`${gridClass} border-b border-gray-200`}>
                <div className="hidden md:block p-6 bg-gray-50 border-r border-gray-200">
                    <h4 className="font-semibold text-gray-900">Features</h4>
                </div>
                <div className="md:hidden p-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900">Features</h4>
                </div>

                {plans.map((plan, planIndex) => (
                    <div
                        key={`header-${getPlanId(plan)}`}
                        className={`hidden md:block p-6 ${isPlanPopular(plan) ? 'bg-sky-50' : 'bg-white'} ${planIndex > 0 ? 'border-l border-gray-200' : ''}`}
                    >
                        <h4 className="font-semibold text-gray-900 text-center">{plan.displayName || plan.name}</h4>
                    </div>
                ))}
            </div>

            {allFeatures.map((featureName, featureIndex) => (
                <div key={featureIndex} className={`${gridClass} border-b border-gray-200 last:border-b-0`}>
                    <div className="hidden md:flex p-4 bg-gray-50 border-r border-gray-200 items-center">
                        <span className="text-sm text-gray-700">{featureName}</span>
                    </div>

                    <div className="md:hidden p-3 bg-gray-50 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-700">{featureName}</span>
                    </div>

                    {plans.map((plan, planIndex) => {
                        const isIncluded = isFeatureIncluded(plan, featureName);
                        return (
                            <div
                                key={`${featureName}-${getPlanId(plan)}`}
                                className={`p-4 flex items-center justify-center ${isPlanPopular(plan) ? 'bg-sky-50' : 'bg-white'} ${planIndex > 0 ? 'border-l border-gray-200' : ''}`}
                            >
                                {isIncluded ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <X className="w-5 h-5 text-gray-300" />
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default FeatureComparison;