import { formatCurrency } from '../../../utils';
import { FunctionComponent, useEffect, useState } from 'react';
import subscriptionPlanService from '../../../services/subscription-plan.service';
import { Box, Flex, SegmentedControl, Skeleton, Text } from '@radix-ui/themes';

interface SubscriptionPlanSelectorProps {
    selectedPlanId: string;
    onPlanChange: (planId: string) => void;
    error?: string;
    touched?: boolean;
}

const SubscriptionPlanSelector: FunctionComponent<SubscriptionPlanSelectorProps> = ({
    selectedPlanId,
    onPlanChange,
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
        <Box p="4" className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/30">
            <Text as="label" size="2" weight="medium" mb="2" className="block text-gray-700 dark:text-gray-300">
                Subscription Plan <Text color="red">*</Text>
            </Text>
            {loading ? (
                <Skeleton>
                    <Box height="40px" />
                </Skeleton>
            ) : (
                <>
                    <SegmentedControl.Root
                        value={selectedPlanId}
                        onValueChange={onPlanChange}
                        className="w-full"
                    >
                        {plans.map((plan) => {
                            const planId = plan.planId || plan.subscriptionPlanId || '';
                            return (
                                <SegmentedControl.Item key={planId} value={planId} >
                                    <Flex direction="column" align="center">
                                        <Text size="1">{plan.displayName || plan.name}</Text>
                                        <Text size="1" color="gray">{formatCurrency(plan.monthlyPrice, true)}/mo</Text>
                                    </Flex>
                                </SegmentedControl.Item>
                            );
                        })}
                    </SegmentedControl.Root>
                    {error && touched && (
                        <Text as="p" size="1" color="red" mt="1">{error}</Text>
                    )}
                </>
            )}
            {selectedPlan && (
                <Text as="p" size="2" color="gray" mt="3">{selectedPlan.description}</Text>
            )}
        </Box>
    );
};

export default SubscriptionPlanSelector;
