interface SubscriptionResponse {
	data: Array<TenantSubscription>;
	message: string;
	success: boolean;
}

interface TenantSubscription {
	subscriptionPlanId: string;
	tenantSubscriptionId: string;
	tenantId: string;
	tenantDetails?: {
		tenantCode: string;
		companyName: string;
		ownerName: string;
	};
	planId: string;
	planName: string;
	billingCycle: string;
	referenceNumber: string;
	status: 'active' | 'cancelled' | 'expired' | 'past_due';
	startsAt: string;
	endsAt?: string;
	autoRenew?: boolean;
	maxBranches: number;
	paymentMethod?: string;
	lastPaymentDate?: string;
	nextPaymentDate?: string;
	createdAt?: string;
	updatedAt?: string;
	synced?: 0 | 1;
}

interface CreateSubscriptionRequest {
	tenantId: string;
	tenantSubscriptionId: string;
	subscriptionPlanId: string;
	planName: string;
	referenceNumber: string;
	autoRenew?: boolean;
	billingCycle: 'monthly' | 'yearly'
}

interface SubscriptionPlan {
	subscriptionPlanId: string;
	name: string;
	displayName: string;
	description: string;
	monthlyPrice: number;
	yearlyPrice: number;
	maxBranches: number;
	color: 'blue' | 'green' | 'purple' | 'gray';
	isPopular?: boolean;
	features: PlanFeature[];
	limits: PlanLimits;
	notes?: string;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

type TenantInfo = Pick<Tenant, 'tenantId' | 'businessName' | 'email' | 'phoneNumber' | 'address' | 'subscriptionPlan'>

interface PaymentInfo {
	referenceNumber: string;
	paymentMethodId: string;
}

interface CreateSubscriptionPlanRequest {
	name: string;
	description?: string;
	price: number;
	billingCycle: 'monthly' | 'yearly' | 'lifetime';
	features: PlanFeature[];
	isActive?: boolean;
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

interface FeatureCategory {
	featureCategoryId?: number;
	title: string;
	features: string[];
	displayOrder?: number;
	createdAt?: Date;
	updatedAt?: Date;
}

interface Feature {
	featureId: string;
	name: string;
	displayName: string;
	description?: string;
	isActive: boolean;
}

interface CreateFeatureCategoryRequest {
	name: string;
	displayName: string;
	description?: string;
	features: Omit<Feature, 'featureId'>[];
	isActive?: boolean;
	order?: number;
}

interface UpdateFeatureCategoryRequest {
	name?: string;
	displayName?: string;
	description?: string;
	features?: Omit<Feature, 'featureId'>[];
	isActive?: boolean;
	order?: number;
}

/**
 * Branch subscription from zonse247-pos-api
 */
interface BranchSubscription {
	branchSubscriptionId: string;
	subscriptionPlanId: string;
	planName?: string;
	status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'active' | 'cancelled' | 'expired' | 'past_due';
	startsAt: string | Date;
	endsAt?: string | Date | null;
	autoRenew?: boolean;
	paymentMethod?: string | null;
	synced?: number;
	lastPaymentDate?: string | Date | null;
	nextPaymentDate?: string | Date | null;
	createdAt?: string | Date;
	updatedAt?: string | Date;
	subscriptionPlan?: SubscriptionPlan | null;
}

