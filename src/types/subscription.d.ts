interface SubscriptionResponse {
	data: Array<TenantSubscription>;
	message: string;
	success: boolean;
}

interface SubscriptionPlan {
	planId: string;
	name: string;
	description?: string;
	price: number;
	maxBranches: number;
	billingCycle: 'monthly' | 'yearly' | 'lifetime';
	features?: string[];
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface TenantSubscription {
	subscriptionId: string;
	tenantId: string;
	tenantDetails?: {
		clientCode: string;
		companyName: string;
		ownerName: string;
	};
	planId: string;
	status: 'active' | 'cancelled' | 'expired' | 'past_due';
	startsAt: string;
	endsAt?: string;
	autoRenew: boolean;
	maxShops: number;
	paymentMethod?: string;
	lastPaymentDate?: string;
	nextPaymentDate?: string;
	createdAt?: string;
	updatedAt?: string;
	synced?: 0 | 1;
}

interface CreateSubscriptionRequest {
	tenantId: string;
	planId: string;
	paymentMethod?: string;
	autoRenew?: boolean;
	startsAt?: string;
}

interface UpdateSubscriptionRequest {
	status?: TenantSubscription['status'];
	endsAt?: string;
	autoRenew?: boolean;
	paymentMethod?: string;
	nextPaymentDate?: string;
}

interface BulkUpdateRequest {
	ids: string[];
	data: Partial<TenantSubscription>;
}

interface ProcessPaymentRequest {
	amount: number;
	paymentMethod: string;
}

interface SubscriptionStats {
	total: number;
	active: number;
	cancelled: number;
	expired: number;
	pastDue: number;
	monthlyRevenue: number;
	annualRevenue: number;
}

// ----------------------------------------------------------------------------------------- //
interface PlanFeature {
	name: string;
	included: boolean;
	tooltip?: string;
}

interface PlanLimits {
	terminals: number;
	users: number;
	products: number;
	storage: string;
}

interface PricingPlan {
	id: string;
	name: string;
	description: string;
	monthlyPrice: number;
	yearlyPrice: number;
	color: 'blue' | 'green' | 'purple' | 'gray';
	popular?: boolean;
	features: PlanFeature[];
	limits: PlanLimits;
	notes?: string;
}

interface TenantInfo {
	businessName: string;
	email: string;
	phone: string;
	address: string;
}

interface PaymentInfo {
	referenceNumber?: string;
}
