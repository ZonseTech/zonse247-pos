import { liveApi, getAuthHeaders } from './live-api.service';

/**
 * Subscription Plan Service
 * Handles subscription plans aligned with zonse247-pos-api v1.6.0
 * Uses LIVE API for all requests
 */
class SubscriptionPlanService {
	private readonly endpoint = '/subscription-plans';

	/**
	 * Normalize plan data to ensure consistent ID field usage
	 * API returns planId as primary, we normalize to subscriptionPlanId for frontend consistency
	 */
	private normalizePlan(plan: any): SubscriptionPlan {
		return {
			...plan,
			subscriptionPlanId: plan.subscriptionPlanId || plan.planId,
			planId: plan.planId || plan.subscriptionPlanId,
			isPopular: plan.isPopular ?? plan.popular ?? false,
			popular: plan.popular ?? plan.isPopular ?? false,
		};
	}

	private normalizePlans(plans: any[]): SubscriptionPlan[] {
		return plans.map(plan => this.normalizePlan(plan));
	}

	/**
	 * List all subscription plans
	 */
	async list(): Promise<SubscriptionPlan[]> {
		try {
			const response = await liveApi.get<ApiResponse<any>>(this.endpoint, {
				headers: await getAuthHeaders()
			});
			const data = response.data.data;
			const plans = Array.isArray(data) ? data : (data?.subscriptionPlans || data?.plans || []);
			return this.normalizePlans(plans);
		} catch (error) {
			console.error('Error fetching subscription plans:', error);
			throw error;
		}
	}

	/**
	 * Get a single subscription plan by ID
	 */
	async show(id: string): Promise<SubscriptionPlan> {
		try {
			const response = await liveApi.get<ApiResponse<SubscriptionPlan>>(
				`${this.endpoint}/${id}`,
				{ headers: await getAuthHeaders() }
			);
			return this.normalizePlan(response.data.data);
		} catch (error) {
			console.error('Error fetching subscription plan:', error);
			throw error;
		}
	}

	/**
	 * Create a new subscription plan
	 */
	async store(planData: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
		try {
			const response = await liveApi.post<ApiResponse<SubscriptionPlan>>(
				this.endpoint,
				planData,
				{ headers: await getAuthHeaders() }
			);
			return this.normalizePlan(response.data.data);
		} catch (error) {
			console.error('Error creating subscription plan:', error);
			throw error;
		}
	}

	/**
	 * Update an existing subscription plan
	 */
	async update(
		id: string,
		planData: Partial<SubscriptionPlan>
	): Promise<SubscriptionPlan> {
		try {
			const response = await liveApi.put<ApiResponse<SubscriptionPlan>>(
				`${this.endpoint}/${id}`,
				planData,
				{ headers: await getAuthHeaders() }
			);
			return this.normalizePlan(response.data.data);
		} catch (error) {
			console.error('Error updating subscription plan:', error);
			throw error;
		}
	}

	/**
	 * Delete a subscription plan
	 */
	async delete(id: string): Promise<void> {
		try {
			await liveApi.delete(`${this.endpoint}/${id}`, {
				headers: await getAuthHeaders()
			});
		} catch (error) {
			console.error('Error deleting subscription plan:', error);
			throw error;
		}
	}

	/**
	 * Get active subscription plans (sorted: offline left, popular middle, others right)
	 */
	async getActive(): Promise<SubscriptionPlan[]> {
		try {
			const response = await liveApi.get<ApiResponse<any>>(
				`${this.endpoint}/active`,
				{ headers: await getAuthHeaders() }
			);

			const data = response.data.data;
			const rawPlans = Array.isArray(data) ? data : (data?.subscriptionPlans || data?.plans || []);
			const plans = this.normalizePlans(rawPlans);

			// Sort: Offline/Free (left) -> Popular (middle) -> Others (right)
			const sortedPlans = plans.sort((a, b) => {
				const getOrder = (plan: SubscriptionPlan): number => {
					// Free/Offline plan goes first (left)
					if (plan.planId === 'offline' || plan.subscriptionPlanId === 'offline' || Number(plan.monthlyPrice) === 0) return 1;
					// Popular plan goes in the middle
					if (plan.isPopular || plan.popular) return 2;
					// Other plans go last (right)
					return 3;
				};
				return getOrder(a) - getOrder(b);
			});

			return sortedPlans;
		} catch (error) {
			console.error('Error fetching active subscription plans:', error);
			throw error;
		}
	}

	/**
	 * Toggle plan active status
	 */
	async toggleStatus(id: string): Promise<SubscriptionPlan> {
		try {
			const response = await liveApi.patch<ApiResponse<SubscriptionPlan>>(
				`${this.endpoint}/${id}/toggle-status`,
				{},
				{ headers: await getAuthHeaders() }
			);
			return this.normalizePlan(response.data.data);
		} catch (error) {
			console.error('Error toggling subscription plan status:', error);
			throw error;
		}
	}

	/**
	 * Validate a subscription plan
	 */
	async validatePlan(id: string): Promise<{ valid: boolean; message: string }> {
		try {
			const response = await liveApi.get<ApiResponse<{ valid: boolean; message: string }>>(
				`${this.endpoint}/${id}/validate`,
				{ headers: await getAuthHeaders() }
			);
			return response.data.data;
		} catch (error) {
			console.error('Error validating subscription plan:', error);
			throw error;
		}
	}
}

const subscriptionPlanService = new SubscriptionPlanService();
export default subscriptionPlanService;