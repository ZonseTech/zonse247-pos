import { toast } from 'react-toastify';
import PlanCard from './partials/PlanCard';
import { formatCurrency } from '../../utils';
import AppLayout from '../../layouts/AppLayout';
import CheckoutModal from './partials/CheckoutModal';
import BillingToggle from './partials/BillingToggle';
import { useAuth } from '../../context/AuthProvider';
import tenantsService from '../../services/tenant.service';
import FeatureComparison from './partials/FeatureComparison';
import { FormEvent, FunctionComponent, useEffect, useState } from 'react';
import subscriptionsService from '../../services/subscriptions.service';
import subscriptionPlanService from '../../services/subscription-plan.service';
import planFeaturesService from '../../services/plan-features.service';
import PlanCardSkeleton from '../../components/loader/PlanCardSkeleton';
import FeatureRowSkeleton from '../../components/loader/FeatureRowSkeleton';
import MobilePlanSkeleton from '../../components/loader/MobilePlanSkeleton';

const SubscriptionBilling: FunctionComponent = () => {
	const { user } = useAuth()
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
		const loadPlans = async () => {
			setLoading(true);
			try {
				const data = await subscriptionPlanService.getActive()
				setPlans(data)
			} catch (error) {
				toast.error('Failed to load subscription plans');
			} finally {
				setLoading(false);
			}
		}

		loadPlans()
	}, [])

	useEffect(() => {
		const loadFeatureCategories = async () => {
			try {
				const categories = await planFeaturesService.list();
				setFeatureCategories(categories);
			} catch (error) {
				toast.error('Failed to load feature categories');
			}
		};

		loadFeatureCategories();
	}, []);

	useEffect(() => {
		const loadTenantData = async () => {
			if (!user.tenantId) return;

			try {
				const data = await tenantsService.show(user.tenantId);

				setTenantInfo({
					tenantId: data.tenantId,
					businessName: data.businessName,
					email: data.email,
					phoneNumber: data.phoneNumber,
					address: data.address,
				});

				const activeSubscription = await subscriptionsService.getActiveSubscriptionByTenantId(user.tenantId);

				if (activeSubscription) {
					setCurrentSubscription(activeSubscription);
					setTenantInfo(prev => ({
						...prev,
						subscriptionPlan: activeSubscription.subscriptionPlanId
					}));
				}
			} catch (error) {
				console.error('Failed to load tenant data:', error);
			}
		};

		loadTenantData();
	}, [user.tenantId]);

	const getPrice = (plan: SubscriptionPlan) => {
		return formatCurrency(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice);
	};

	const isFeatureIncluded = (plan: SubscriptionPlan, featureName: string) => {
		return plan.features.some(feature =>
			feature.name.toLowerCase().includes(featureName.toLowerCase()) && feature.included
		);
	};

	const handleSelectPlan = (plan: SubscriptionPlan) => {
		setSelectedPlan(plan);
		setShowCheckout(true);
	};

	const handleSubmitSubscription = async (e: FormEvent) => {
		e.preventDefault();

		const isFreePlan = selectedPlan.name === 'offline';

		if (!paymentInfo.referenceNumber && !selectedPlan && !isFreePlan) {
			alert('Please fill in all required fields');
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
			})

			alert(
				`Subscription ${isFreePlan ? 'Started' : 'Confirmed'}!\n\n` +
				`Plan: ${selectedPlan.name}\n` +
				`Business: ${tenantInfo.businessName}\n` +
				`${!isFreePlan ? `Billing: ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}\n` : ''}` +
				`${!isFreePlan ? `Amount: ${price}${billingCycle === 'monthly' ? '/mo' : '/yr'}\n` : ''}` +
				`\nYou will receive a confirmation email shortly.`
			);

			setShowCheckout(false);
			setTenantInfo(prev => ({ ...prev, subscriptionPlan: selectedPlan.name }));
			setPaymentInfo({ referenceNumber: '', paymentMethodId: 'free' });
		} catch (error) {
			if (error?.error?.response) {
				const { data } = error.error.response;

				toast.error(data.message)
			}
		}
	};

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
				{loading ? (
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
				) : (
					<>
						<div className="hidden md:block">
							<div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200">
								<div className="hidden md:block p-8 border-r border-gray-200" />
								{plans.length > 0 && plans.map((plan, index) => (
									<PlanCard
										key={plan.subscriptionPlanId}
										plan={plan}
										billingCycle={billingCycle}
										onSelectPlan={handleSelectPlan}
										getPrice={getPrice}
										isCurrentPlan={currentSubscription?.status === 'active' && plan.subscriptionPlanId === tenantInfo.subscriptionPlan}
									/>
								))}
							</div>
							{plans.length > 0 && <FeatureComparison
								plans={plans}
								featureCategories={featureCategories}
								isFeatureIncluded={isFeatureIncluded}
							/>}
						</div>

						<div className="md:hidden space-y-6 mt-8">
							{plans.length > 0 && plans.map((plan) => (
								<div key={plan.subscriptionPlanId} className="bg-white rounded-2xl shadow-lg overflow-hidden">
									<PlanCard
										plan={plan}
										billingCycle={billingCycle}
										onSelectPlan={handleSelectPlan}
										getPrice={getPrice}
										isCurrentPlan={plan.name === tenantInfo.subscriptionPlan}
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
					onClose={() => setShowCheckout(false)}
					onPaymentInfoChange={setPaymentInfo}
					onSubmit={handleSubmitSubscription}
					getPrice={getPrice}
				/>
			)}
		</AppLayout>
	);
};

export default SubscriptionBilling;