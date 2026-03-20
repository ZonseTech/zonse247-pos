import { toast } from 'react-toastify';
import PlanCard from './partials/PlanCard';
import { formatCurrency } from '../../utils';
import AppLayout from '../../layouts/AppLayout';
import CheckoutModal from './partials/CheckoutModal';
import BillingToggle from './partials/BillingToggle';
import { useAuth } from '../../context/AuthProvider';
import FeatureComparison from './partials/FeatureComparison';
import { FormEvent, FunctionComponent, useEffect, useState, useCallback, useMemo } from 'react';
import subscriptionsService from '../../services/subscriptions.service';
import subscriptionPlanService from '../../services/subscription-plan.service';
import PlanCardSkeleton from '../../components/loader/PlanCardSkeleton';
import FeatureRowSkeleton from '../../components/loader/FeatureRowSkeleton';
import MobilePlanSkeleton from '../../components/loader/MobilePlanSkeleton';
import { OfflinePlaceholder } from '../../components';
import { useConnectivity } from '../../hooks/useConnectivity';
import { getErrorMessage } from '../../utils/api-error-handler';

const SubscriptionBilling: FunctionComponent = () => {
	const { user } = useAuth();
	const { isOnline } = useConnectivity();
	const branch = user?.branch;
	const [loading, setLoading] = useState(true);
	const [showCheckout, setShowCheckout] = useState(false);
	const [plans, setPlans] = useState<Array<SubscriptionPlan>>([]);
	const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
	const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
	const [branchInfo, setBranchInfo] = useState<BranchInfo>({} as BranchInfo);
	const [currentSubscription, setCurrentSubscription] = useState<BranchSubscription | null>(null);
	const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
		referenceNumber: ''
	});

	useEffect(() => {
		const loadInitialData = async () => {
			setLoading(true);
			try {
				const plansData = await subscriptionPlanService.getActive();
				setPlans(plansData);
			} catch (error) {
				toast.error('Failed to load subscription data');
			} finally {
				setLoading(false);
			}
		};

		loadInitialData();
	}, []);

	useEffect(() => {
		const loadBranchData = async () => {
			if (!branch?.branchId) return;

			try {
				const activeSubscription = await subscriptionsService.getActiveBranchSubscription();

				setBranchInfo({
					branchId: branch.branchId,
					branchName: branch.branchName,
					branchCode: branch.branchCode,
					subscriptionPlanId: activeSubscription?.subscriptionPlanId
				});

				setCurrentSubscription(activeSubscription);
			} catch (error) {
				console.error('Failed to load branch subscription data:', error);
			}
		};

		loadBranchData();
	}, [branch?.branchId]);

	const getPrice = useCallback((plan: SubscriptionPlan) => {
		return formatCurrency(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice);
	}, [billingCycle]);

	const isCurrentPlan = useCallback((planId: string) => {
		return currentSubscription?.status === 'active' && planId === branchInfo.subscriptionPlanId;
	}, [currentSubscription?.status, branchInfo.subscriptionPlanId]);

	const handleSelectPlan = useCallback((plan: SubscriptionPlan) => {
		setSelectedPlan(plan);
		setShowCheckout(true);
	}, []);

	const handleCloseCheckout = useCallback(() => {
		setShowCheckout(false);
	}, []);

	const handleSubmitSubscription = useCallback(async (e: FormEvent) => {
		e.preventDefault();

		if (!selectedPlan) return;

		const isFreePlan = selectedPlan.name === 'BASIC' || selectedPlan.monthlyPrice === 0;
		const subscriptionMonths = billingCycle === 'yearly' ? 12 : 1;

		if (!paymentInfo.referenceNumber && !isFreePlan) {
			toast.error('Please fill in all required fields');
			return;
		}

		const price = getPrice(selectedPlan);

		try {
			await subscriptionsService.store({
				subscriptionPlanId: selectedPlan.subscriptionPlanId,
				subscriptionMonths,
				autoRenew: true,
				paymentMethod: paymentInfo.referenceNumber
			});

			toast.success(
				`Subscription ${isFreePlan ? 'Started' : 'Confirmed'}!\n\n` +
				`Plan: ${selectedPlan.displayName || selectedPlan.name}\n` +
				`Branch: ${branchInfo.branchName}\n` +
				`${!isFreePlan ? `Billing: ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}\n` : ''}` +
				`${!isFreePlan ? `Amount: ${price}${billingCycle === 'monthly' ? '/mo' : '/yr'}\n` : ''}` +
				`\nYou will receive a confirmation email shortly.`
			);

			setShowCheckout(false);
			setBranchInfo(prev => ({ ...prev, subscriptionPlanId: selectedPlan.subscriptionPlanId }));
			setCurrentSubscription(prev => prev ? { ...prev, subscriptionPlanId: selectedPlan.subscriptionPlanId, status: 'active' } : null);
			setPaymentInfo({ referenceNumber: '' });
		} catch (error: any) {
			toast.error(getErrorMessage(error, 'Failed to process subscription'));
		}
	}, [selectedPlan, paymentInfo, billingCycle, branchInfo, getPrice]);

	const skeletonLoader = useMemo(() => (
		<>
			<div className="hidden md:block">
				<div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200">
					<div className="hidden md:block p-8 border-r border-gray-200" />
					<PlanCardSkeleton />
					<PlanCardSkeleton />
					<PlanCardSkeleton />
				</div>
				<div className="space-y-0">
					{[1, 2, 3, 4, 5].map((i) => (
						<FeatureRowSkeleton key={i} />
					))}
				</div>
			</div>

			<div className="md:hidden space-y-6 mt-8">
				<MobilePlanSkeleton />
				<MobilePlanSkeleton />
				<MobilePlanSkeleton />
			</div>
		</>
	), []);

	const hasPlans = plans.length > 0;

	// Show offline placeholder when not connected
	if (!isOnline) {
		return (
			<AppLayout>
				<div className="max-w-7xl mx-auto p-6 pt-8">
					<OfflinePlaceholder
						title="Billing Unavailable Offline"
						description="The billing and subscription page requires an internet connection to load pricing plans and process payments. Please connect to the internet and try again."
						variant="cloud"
					/>
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout>
			<div className="max-w-7xl mx-auto p-6 pt-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-gray-900 mb-3">
						PRICING PLANS
					</h1>
					<p className="text-lg text-gray-600 mb-6">
						Select the perfect subscription for your business needs
					</p>
					<BillingToggle
						billingCycle={billingCycle}
						onBillingCycleChange={setBillingCycle}
					/>
				</div>

				{loading ? skeletonLoader : (
					<>
						<div className="hidden md:block">
							<div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200">
								<div className="hidden md:block p-8 border-r border-gray-200" />
								{hasPlans && plans.map((plan) => (
									<PlanCard
										key={plan.subscriptionPlanId}
										plan={plan}
										billingCycle={billingCycle}
										onSelectPlan={handleSelectPlan}
										getPrice={getPrice}
										isCurrentPlan={isCurrentPlan(plan.subscriptionPlanId)}
									/>
								))}
							</div>
							{hasPlans && (
								<FeatureComparison plans={plans} />
							)}
						</div>

						<div className="md:hidden space-y-6 mt-8">
							{hasPlans && plans.map((plan) => (
								<div key={plan.subscriptionPlanId} className="bg-white rounded-2xl shadow-lg overflow-hidden">
									<PlanCard
										plan={plan}
										billingCycle={billingCycle}
										onSelectPlan={handleSelectPlan}
										getPrice={getPrice}
										isCurrentPlan={isCurrentPlan(plan.subscriptionPlanId)}
									/>
								</div>
							))}
						</div>
					</>
				)}
			</div>

			{showCheckout && selectedPlan && (
				<CheckoutModal
					selectedPlan={selectedPlan}
					billingCycle={billingCycle}
					branchInfo={branchInfo}
					paymentInfo={paymentInfo}
					onClose={handleCloseCheckout}
					onPaymentInfoChange={setPaymentInfo}
					onSubmit={handleSubmitSubscription}
					getPrice={getPrice}
				/>
			)}
		</AppLayout>
	);
};

export default SubscriptionBilling;