import { Check, X } from 'lucide-react';
import type { FunctionComponent } from 'react';

interface FeatureComparisonProps {
    plans: Array<SubscriptionPlan>;
    featureCategories: Array<{ title: string; features: string[] }>;
    isFeatureIncluded: (plan: SubscriptionPlan, featureName: string) => boolean;
}

const FeatureComparison: FunctionComponent<FeatureComparisonProps> = ({
    plans,
    featureCategories,
    isFeatureIncluded,
}) => {
    return (
        <div className="overflow-hidden">
            {featureCategories.map((category) => (
                <div key={category.title} className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200 last:border-b-0">
                    <div className="hidden md:block p-6 bg-gray-50 border-r border-gray-200">
                        <h4 className="font-semibold text-gray-900">{category.title}</h4>
                    </div>

                    <div className="md:hidden p-4 bg-gray-50 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-900">{category.title}</h4>
                    </div>

                    {plans.map((plan, planIndex) => (
                        <div
                            key={`${category.title}-${plan.name}`}
                            className={`p-6 ${plan.isPopular ? 'bg-sky-50' : 'bg-white'} ${planIndex > 0 ? 'border-l border-gray-200' : ''
                                }`}
                        >
                            <div className="space-y-3">
                                {category.features.map((feature, featureIndex) => {
                                    const isIncluded = isFeatureIncluded(plan, feature);
                                    return (
                                        <div key={featureIndex} className="flex items-center justify-center md:justify-start">
                                            {isIncluded ? (
                                                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                            ) : (
                                                <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" />
                                            )}
                                            <span className={isIncluded ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>
                                                {feature}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default FeatureComparison;