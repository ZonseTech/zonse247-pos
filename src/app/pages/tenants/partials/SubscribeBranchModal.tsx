import { Notify } from 'notiflix';
import { CreditCard, CheckCircle } from 'lucide-react';
import { Modal, Button, Select } from '../../../components';
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

    const handleClose = () => {
        setSelectedBranchId('');
        setSelectedPlanId('');
        setSubscriptionMonths(1);
        setAutoRenew(true);
        onClose();
    };

    const selectedPlan = plans.find(p => p.planId === selectedPlanId || p.subscriptionPlanId === selectedPlanId);
    const totalPrice = selectedPlan ? selectedPlan.monthlyPrice * subscriptionMonths : 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Subscribe Branch"
            size="lg"
        >
            <div className="space-y-5">
                {loading ? (
                    <div className="space-y-4">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Branch <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={selectedBranchId}
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                            >
                                <option value="">Select a branch...</option>
                                {branches.map((branch) => (
                                    <option key={branch.branchId} value={branch.branchId}>
                                        {branch.branchName} ({branch.branchCode})
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Subscription Plan <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                                {plans.map((plan) => (
                                    <button
                                        key={plan.planId || plan.subscriptionPlanId}
                                        type="button"
                                        onClick={() => setSelectedPlanId(plan.planId || plan.subscriptionPlanId || '')}
                                        className={`relative p-4 border rounded-lg text-left transition-all ${(selectedPlanId === plan.planId || selectedPlanId === plan.subscriptionPlanId)
                                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 ring-2 ring-sky-500'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {plan.displayName || plan.name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {plan.description}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    ${plan.monthlyPrice}
                                                </div>
                                                <div className="text-xs text-gray-500">per month</div>
                                            </div>
                                        </div>
                                        {(selectedPlanId === plan.planId || selectedPlanId === plan.subscriptionPlanId) && (
                                            <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-sky-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Duration (months)
                            </label>
                            <Select
                                value={subscriptionMonths}
                                onChange={(e) => setSubscriptionMonths(Number(e.target.value))}
                            >
                                <option value={1}>1 month</option>
                                <option value={3}>3 months</option>
                                <option value={6}>6 months</option>
                                <option value={12}>12 months (1 year)</option>
                            </Select>
                        </div>

                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoRenew}
                                    onChange={(e) => setAutoRenew(e.target.checked)}
                                    className="w-4 h-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Auto-renew subscription
                                </span>
                            </label>
                        </div>

                        {selectedPlan && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Summary</div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {selectedPlan.displayName || selectedPlan.name} × {subscriptionMonths} month(s)
                                    </span>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        ${totalPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                    layout="outline"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <Button
                    theme="primary"
                    onClick={handleSubmit}
                    disabled={submitting || !selectedBranchId || !selectedPlanId}
                    loading={submitting}
                >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscribe
                </Button>
            </div>
        </Modal>
    );
};

export default SubscribeBranchModal;
