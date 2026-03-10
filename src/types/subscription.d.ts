// Response types
interface SubscriptionResponse {
	data: Array<BranchSubscription>;
	message: string;
	success: boolean;
}

// Branch Subscription - Primary subscription model
interface BranchSubscription {
	branchSubscriptionId: string;
	branchId?: string;
	subscriptionPlanId: string;
	planName?: string;
	status: 'active' | 'cancelled' | 'expired' | 'past_due';
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
	// Branch details for display
	branchDetails?: {
		branchCode?: string;
		branchName: string;
		tenantName?: string;
	};
}

interface BranchSubscriptionInfo {
	branchId: string;
	branchName: string;
	branchSubscriptionId?: string | null;
}

// Subscription Plan - Updated to align with API v1.6.0
interface SubscriptionPlan {
	planId: string;
	subscriptionPlanId?: string;
	name: string;
	displayName: string;
	description: string;
	monthlyPrice: number;
	yearlyPrice: number;
	maxBranches: number;
	color: 'blue' | 'green' | 'purple' | 'gray';
	popular?: boolean;
	isPopular?: boolean;
	features: PlanFeature[];
	limits: PlanLimits;
	notes?: string;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

// Request types
interface CreateBranchSubscriptionRequest {
	subscriptionPlanId: string;
	subscriptionMonths?: number;
	autoRenew?: boolean;
	paymentMethod?: string;
}

interface UpdateBranchSubscriptionRequest {
	status?: BranchSubscription['status'];
	endsAt?: string;
	autoRenew?: boolean;
	paymentMethod?: string;
	nextPaymentDate?: string;
}

interface CreateSubscriptionPlanRequest {
	name: string;
	displayName?: string;
	description?: string;
	monthlyPrice: number;
	yearlyPrice?: number;
	maxBranches?: number;
	features?: PlanFeature[];
	limits?: PlanLimits;
	isActive?: boolean;
}

interface BulkUpdateRequest {
	ids: string[];
	data: Partial<BranchSubscription>;
	amount?: number;
	paymentMethod?: string;
}

interface ProcessPaymentRequest {
	amount: number;
	paymentMethod: string;
}

// Stats
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
// Plan Features & Limits
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

// Feature Categories
interface PlanFeatureCategory {
	featureCategoryId?: number;
	title: string;
	features: string[];
	displayOrder?: number;
	createdAt?: Date;
	updatedAt?: Date;
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

// Tenant Info for billing display
type TenantInfo = Pick<Tenant, 'tenantId' | 'businessName' | 'email' | 'phoneNumber' | 'address'> & {
	subscriptionPlan?: string;
}

// Branch Info for subscription billing
interface BranchInfo {
	branchId: string;
	branchName: string;
	branchCode?: string;
	subscriptionPlanId?: string;
}

interface PaymentInfo {
	referenceNumber: string;
	paymentMethodId?: string;
}

// API Aligned PaymentInfo (with required paymentMethodId)
interface PaymentInfoRequest {
	referenceNumber: string;
	paymentMethodId: string;
}

// Legacy types for backward compatibility (deprecated)
/** @deprecated Use BranchSubscription instead */
type TenantSubscription = BranchSubscription;
/** @deprecated Use CreateBranchSubscriptionRequest instead */
type CreateSubscriptionRequest = CreateBranchSubscriptionRequest;
/** @deprecated Use UpdateBranchSubscriptionRequest instead */
type UpdateSubscriptionRequest = UpdateBranchSubscriptionRequest;

