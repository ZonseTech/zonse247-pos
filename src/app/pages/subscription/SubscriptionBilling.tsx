import PlanCard from './partials/PlanCard';
import { formatCurrency } from '../../utils';
import AppLayout from '../../layouts/AppLayout';
import { plans, featureCategories } from './data';
import { FunctionComponent, useEffect, useState } from 'react';
import CheckoutModal from './partials/CheckoutModal';
import BillingToggle from './partials/BillingToggle';
import { useAuth } from '../../context/AuthProvider';
import FeatureComparison from './partials/FeatureComparison';

const SubscriptionBilling: FunctionComponent = () => {
	const { user } = useAuth()
	const [showCheckout, setShowCheckout] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
	const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
	const [tenantInfo, setTenantInfo] = useState<TenantInfo>({
		businessName: '',
		email: '',
		phone: '',
		address: '',
	});
	const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
		referenceNumber: '',
	});

	useEffect(() => {
		console.log('====================================');
		console.log(user.tenantId);
		console.log('====================================');
	}, [user.tenantId])

	const getPrice = (plan: PricingPlan) => {
		return formatCurrency(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice);
	};

	const handleSelectPlan = (plan: PricingPlan) => {
		setSelectedPlan(plan);
		setShowCheckout(true);
	};

	const handleSubmitSubscription = (e: React.FormEvent) => {
		e.preventDefault();

		if (!tenantInfo.businessName || !tenantInfo.email || !paymentInfo.referenceNumber || !selectedPlan) {
			alert('Please fill in all required fields');
			return;
		}

		const price = getPrice(selectedPlan);
		const isFreePlan = selectedPlan.id === 'free';

		alert(
			`Subscription ${isFreePlan ? 'Started' : 'Confirmed'}!\n\n` +
			`Plan: ${selectedPlan.name}\n` +
			`Business: ${tenantInfo.businessName}\n` +
			`${!isFreePlan ? `Billing: ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}\n` : ''}` +
			`${!isFreePlan ? `Amount: $${price}${billingCycle === 'monthly' ? '/mo' : '/yr'}\n` : ''}` +
			`\nYou will receive a confirmation email shortly.`
		);

		setShowCheckout(false);
		setSelectedPlan(null);
		setTenantInfo({ businessName: '', email: '', phone: '', address: '' });
		setPaymentInfo({ referenceNumber: '' });
	};

	const isFeatureIncluded = (plan: PricingPlan, featureName: string) => {
		return plan.features.some(feature =>
			feature.name.toLowerCase().includes(featureName.toLowerCase()) && feature.included
		);
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
				<div className="hidden md:block">
					<div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200">
						<div className="hidden md:block p-8 border-r border-gray-200" />
						{plans.map((plan, index) => (
							<PlanCard
								key={plan.id}
								plan={plan}
								billingCycle={billingCycle}
								onSelectPlan={handleSelectPlan}
								formatPrice={formatCurrency}
								getPrice={getPrice}
								isCurrentPlan={plan.id === 'free'}
							/>
						))}
					</div>
					<FeatureComparison
						plans={plans}
						featureCategories={featureCategories}
						isFeatureIncluded={isFeatureIncluded}
					/>
				</div>

				<div className="md:hidden space-y-6 mt-8">
					{plans.map((plan) => (
						<div key={plan.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
							<PlanCard
								plan={plan}
								billingCycle={billingCycle}
								onSelectPlan={handleSelectPlan}
								formatPrice={formatCurrency}
								getPrice={getPrice}
								isCurrentPlan={plan.id === 'free'}
							/>
						</div>
					))}
				</div>
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