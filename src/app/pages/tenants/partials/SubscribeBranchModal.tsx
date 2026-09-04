import { Notify } from 'notiflix';
import * as Dialog from '@radix-ui/react-dialog';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { Box, Button, Checkbox, Flex, Select, Skeleton, Text } from '@radix-ui/themes';
import FormModal from '../../../components/FormModal';
import branchService from '../../../services/branch.service';
import { FunctionComponent, useState, useEffect } from 'react';
import subscriptionPlanService from '../../../services/subscription-plan.service';
import subscriptionService from '../../../services/subscriptions.service';
import { getErrorMessage } from '../../../utils/api-error-handler';

interface SubscribeBranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
    onSuccess?: () => void;
}

const SubscribeBranchModal: FunctionComponent<SubscribeBranchModalProps> = ({
    isOpen,
    onClose,
    tenantId,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [subscriptionMonths, setSubscriptionMonths] = useState<number>(1);
    const [autoRenew, setAutoRenew] = useState<boolean>(true);

    useEffect(() => {
        if (isOpen && tenantId) {
            loadData();
        }
    }, [isOpen, tenantId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [branchesData, plansData] = await Promise.all([
                branchService.list({ tenantId, isAdminMode: true }),
                subscriptionPlanService.list(),
            ]);
            setBranches(branchesData);
            setPlans(plansData.filter(p => p.isActive));
        } catch (error) {
            console.error('Error loading data:', error);
            Notify.failure('Failed to load branches and plans');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedBranchId('');
        setSelectedPlanId('');
        setSubscriptionMonths(1);
        setAutoRenew(true);
        onClose();
    };

    const handleSubmit = async () => {
        if (!selectedBranchId) {
            Notify.warning('Please select a branch');
            return;
        }
        if (!selectedPlanId) {
            Notify.warning('Please select a subscription plan');
            return;
        }

        setSubmitting(true);
        try {
            await subscriptionService.subscribeBranch({
                branchId: selectedBranchId,
                subscriptionPlanId: selectedPlanId,
                subscriptionMonths,
                autoRenew,
            });
            Notify.success('Branch subscribed successfully');
            onSuccess?.();
            handleClose();
        } catch (error: any) {
            console.error('Error subscribing branch:', error);
            const message = getErrorMessage(error, 'Failed to subscribe branch');
            Notify.failure(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const selectedPlan = plans.find(p => p.planId === selectedPlanId || p.subscriptionPlanId === selectedPlanId);
    const totalPrice = selectedPlan ? selectedPlan.monthlyPrice * subscriptionMonths : 0;

    return (
        <FormModal
            open
            onOpenChange={(open) => { if (!open) handleClose(); }}
            title="Subscribe Branch"
            size="lg"
            footer={
                <Flex justify="end" gap="3" width="100%">
                    <Dialog.Close asChild>
                        <Button type="button" variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || !selectedBranchId || !selectedPlanId}
                        loading={submitting}
                    >
                        <CreditCard className="w-4 h-4" />
                        Subscribe
                    </Button>
                </Flex>
            }
        >
            <Flex direction="column" gap="5">
                {loading ? (
                    <Flex direction="column" gap="4">
                        <Skeleton>
                            <Box height="40px" />
                        </Skeleton>
                        <Skeleton>
                            <Box height="40px" />
                        </Skeleton>
                        <Skeleton>
                            <Box height="40px" />
                        </Skeleton>
                    </Flex>
                ) : (
                    <>
                        <Box>
                            <Text as="label" size="2" weight="medium" mb="2" className="block text-gray-700 dark:text-gray-300">
                                Select Branch <Text color="red">*</Text>
                            </Text>
                            <Select.Root
                                value={selectedBranchId || undefined}
                                onValueChange={setSelectedBranchId}
                            >
                                <Select.Trigger placeholder="Select a branch..." className="w-full" />
                                <Select.Content position="popper">
                                    {branches.map((branch) => (
                                        <Select.Item key={branch.branchId} value={branch.branchId}>
                                            {branch.branchName} ({branch.branchCode})
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>
                        </Box>

                        <Box>
                            <Text as="label" size="2" weight="medium" mb="2" className="block text-gray-700 dark:text-gray-300">
                                Subscription Plan <Text color="red">*</Text>
                            </Text>
                            <Flex direction="column" gap="3" className="max-h-48 overflow-y-auto">
                                {plans.map((plan) => {
                                    const planId = plan.planId || plan.subscriptionPlanId || '';
                                    const isSelected = selectedPlanId === plan.planId || selectedPlanId === plan.subscriptionPlanId;
                                    return (
                                        <button
                                            key={planId}
                                            type="button"
                                            onClick={() => setSelectedPlanId(planId)}
                                            className={`relative p-4 border rounded-lg text-left transition-all ${isSelected
                                                ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 ring-2 ring-sky-500'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                }`}
                                        >
                                            <Flex justify="between" align="center">
                                                <Box>
                                                    <Text as="p" weight="medium">{plan.displayName || plan.name}</Text>
                                                    <Text as="p" size="2" color="gray">{plan.description}</Text>
                                                </Box>
                                                <Box className="text-right">
                                                    <Text as="p" size="4" weight="bold">${plan.monthlyPrice}</Text>
                                                    <Text as="p" size="1" color="gray">per month</Text>
                                                </Box>
                                            </Flex>
                                            {isSelected && (
                                                <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-sky-500" />
                                            )}
                                        </button>
                                    );
                                })}
                            </Flex>
                        </Box>

                        <Box>
                            <Text as="label" size="2" weight="medium" mb="2" className="block text-gray-700 dark:text-gray-300">
                                Duration (months)
                            </Text>
                            <Select.Root
                                value={String(subscriptionMonths)}
                                onValueChange={(val) => setSubscriptionMonths(Number(val))}
                            >
                                <Select.Trigger className="w-full" />
                                <Select.Content position="popper">
                                    <Select.Item value="1">1 month</Select.Item>
                                    <Select.Item value="3">3 months</Select.Item>
                                    <Select.Item value="6">6 months</Select.Item>
                                    <Select.Item value="12">12 months (1 year)</Select.Item>
                                </Select.Content>
                            </Select.Root>
                        </Box>

                        <Text as="label" size="2">
                            <Flex align="center" gap="2">
                                <Checkbox checked={autoRenew} onCheckedChange={(checked) => setAutoRenew(checked === true)} />
                                Auto-renew subscription
                            </Flex>
                        </Text>

                        {selectedPlan && (
                            <Box className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Text as="p" size="2" color="gray" mb="2">Summary</Text>
                                <Flex justify="between" align="center">
                                    <Text size="2">
                                        {selectedPlan.displayName || selectedPlan.name} × {subscriptionMonths} month(s)
                                    </Text>
                                    <Text size="5" weight="bold">${totalPrice.toFixed(2)}</Text>
                                </Flex>
                            </Box>
                        )}
                    </>
                )}
            </Flex>
        </FormModal>
    );
};

export default SubscribeBranchModal;
