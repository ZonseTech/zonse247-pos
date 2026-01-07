import { toast } from 'react-toastify';
import PlanCard from './partials/PlanCard';
import { formatCurrency } from '../../utils';
import AppLayout from '../../layouts/AppLayout';
import CheckoutModal from './partials/CheckoutModal';
import BillingToggle from './partials/BillingToggle';
import { useAuth } from '../../context/AuthProvider';
import tenantsService from '../../services/tenant.service';
import FeatureComparison from './partials/FeatureComparison';
import { FormEvent, FunctionComponent, useEffect, useState, useCallback, useMemo } from 'react';
import subscriptionsService from '../../services/subscriptions.service';
import subscriptionPlanService from '../../services/subscription-plan.service';
import planFeaturesService from '../../services/plan-features.service';
import PlanCardSkeleton from '../../components/loader/PlanCardSkeleton';
import FeatureRowSkeleton from '../../components/loader/FeatureRowSkeleton';
import MobilePlanSkeleton from '../../components/loader/MobilePlanSkeleton';

const SubscriptionBilling: FunctionComponent = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [showCheckout, setShowCheckout] = useState(false);
	const [plans, setPlans] = useState<Array<SubscriptionPlan>>([]);
	const [featureCategories, setFeatureCategories] = useState<Array<FeatureCategory>>([]);
	const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
	const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
	const [tenantInfo, setTenantInfo] = useState<TenantInfo>({} as TenantInfo);
	const [currentSubscription, setCurrentSubscription] = useState<TenantSubscription | null>(null);
	const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
		referenceNumber: '',
		paymentMethodId: ''
	});

	useEffect(() => {
		const loadInitialData = async () => {
			setLoading(true);
			try {
				const [plansData, categoriesData] = await Promise.all([
					subscriptionPlanService.getActive(),
					planFeaturesService.list()
				]);

				setPlans(plansData);
				setFeatureCategories(categoriesData);
			} catch (error) {
				toast.error('Failed to load subscription data');
			} finally {
				setLoading(false);
			}
		};

		loadInitialData();
	}, []);

	useEffect(() => {
		const loadTenantData = async () => {
			if (!user.tenantId) return;

			try {
				const [tenantData, activeSubscription] = await Promise.all([
					tenantsService.show(user.tenantId),
					subscriptionsService.getActiveSubscriptionByTenantId(user.tenantId)
				]);

				setTenantInfo({
					tenantId: tenantData.tenantId,
					businessName: tenantData.businessName,
					email: tenantData.email,
					phoneNumber: tenantData.phoneNumber,
					address: tenantData.address,
					subscriptionPlan: activeSubscription?.subscriptionPlanId
				});

				setCurrentSubscription(activeSubscription);
			} catch (error) {
				console.error('Failed to load tenant data:', error);
			}
		};

		loadTenantData();
	}, [user.tenantId]);

	const getPrice = useCallback((plan: SubscriptionPlan) => {
		return formatCurrency(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice);
	}, [billingCycle]);

	const isFeatureIncluded = useCallback((plan: SubscriptionPlan, featureName: string) => {
		return plan.features.some(feature =>
			feature.name.toLowerCase().includes(featureName.toLowerCase()) && feature.included
		);
	}, []);

	const isCurrentPlan = useCallback((planId: string) => {
		return currentSubscription?.status === 'active' && planId === tenantInfo.subscriptionPlan;
	}, [currentSubscription?.status, tenantInfo.subscriptionPlan]);

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

		const isFreePlan = selectedPlan.name === 'offline';

		if (!paymentInfo.referenceNumber && !isFreePlan) {
			toast.error('Please fill in all required fields');
			return;
		}

		const price = getPrice(selectedPlan);

		try {
			await subscriptionsService.store({
				tenantId: tenantInfo.tenantId,
				subscriptionPlanId: selectedPlan.subscriptionPlanId,
				planName: selectedPlan.name,
				referenceNumber: paymentInfo.referenceNumber,
				billingCycle,
				tenantSubscriptionId: currentSubscription?.tenantSubscriptionId,
			});

			toast.success(
				`Subscription ${isFreePlan ? 'Started' : 'Confirmed'}!\n\n` +
				`Plan: ${selectedPlan.name}\n` +
				`Business: ${tenantInfo.businessName}\n` +
				`${!isFreePlan ? `Billing: ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}\n` : ''}` +
				`${!isFreePlan ? `Amount: ${price}${billingCycle === 'monthly' ? '/mo' : '/yr'}\n` : ''}` +
				`\nYou will receive a confirmation email shortly.`
			);

			setShowCheckout(false);
			setTenantInfo(prev => ({ ...prev, subscriptionPlan: selectedPlan.subscriptionPlanId }));
			setCurrentSubscription(prev => prev ? { ...prev, subscriptionPlanId: selectedPlan.subscriptionPlanId } : null);
			setPaymentInfo({ referenceNumber: '', paymentMethodId: '' });
		} catch (error) {
			if (error?.error?.response) {
				const { data } = error.error.response;
				toast.error(data.message);
			} else {
				toast.error('Failed to process subscription');
			}
		}
	}, [selectedPlan, paymentInfo, billingCycle, tenantInfo, currentSubscription, getPrice]);

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

	return (
		<AppLayout>
			<div className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
				<div className="max-w-7xl mx-auto p-6">
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
				</div>
			</div>

			<div className="max-w-7xl mx-auto p-6 pt-8">
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
								<FeatureComparison
									plans={plans}
									featureCategories={featureCategories}
									isFeatureIncluded={isFeatureIncluded}
								/>
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
					tenantInfo={tenantInfo}
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