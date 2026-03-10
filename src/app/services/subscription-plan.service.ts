import axios from 'axios';

const LIVE_API_URL = import.meta.env.VITE_LIVE_API_URL;

/**
 * Subscription Plan Service
 * Handles subscription plans aligned with zonse247-pos-api v1.6.0
 * Uses LIVE API for all requests
 */
class SubscriptionPlanService {
	private readonly endpoint = '/subscription-plans';

	private liveApi = axios.create({
		baseURL: LIVE_API_URL,
		timeout: 30000,
		headers: {
			'X-Client-Type': 'web'
		}
	});

	/**
	 * Get tenant signature from electron settings or session storage
	 */
	private async getTenantSignature(): Promise<string | undefined> {
		try {
			if (typeof window !== 'undefined' && window.electronAPI?.settings) {
				const result = await window.electronAPI.settings.getSignature();
				if (result.success && result.data) return result.data;
			}

			const user = sessionStorage?.getItem('user');
			if (user) return JSON.parse(user).tenantId;
		} catch (error) {
			console.warn('[SubscriptionPlanService] Error getting tenant signature:', error);
		}
		return undefined;
	}

	private async getAuthHeaders() {
		const token = sessionStorage.getItem('token');
		const tenantSignature = await this.getTenantSignature();
		return {
			...(token && { Authorization: `Bearer ${JSON.parse(token)}` }),
			...(tenantSignature && { 'X-Tenant-Id': tenantSignature })
		};
	}

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
			const response = await this.liveApi.get<ApiResponse<SubscriptionPlan[]>>(this.endpoint, {
				headers: await this.getAuthHeaders()
			});
			return this.normalizePlans(response.data.data || []);
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
			const response = await this.liveApi.get<ApiResponse<SubscriptionPlan>>(
				`${this.endpoint}/${id}`,
				{ headers: await this.getAuthHeaders() }
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
			const response = await this.liveApi.post<ApiResponse<SubscriptionPlan>>(
				this.endpoint,
				planData,
				{ headers: await this.getAuthHeaders() }
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
			const response = await this.liveApi.put<ApiResponse<SubscriptionPlan>>(
				`${this.endpoint}/${id}`,
				planData,
				{ headers: await this.getAuthHeaders() }
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
			await this.liveApi.delete(`${this.endpoint}/${id}`, {
				headers: await this.getAuthHeaders()
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
			const response = await this.liveApi.get<ApiResponse<SubscriptionPlan[]>>(
				`${this.endpoint}/active`,
				{ headers: await this.getAuthHeaders() }
			);

			const plans = this.normalizePlans(response.data.data || []);

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
			const response = await this.liveApi.patch<ApiResponse<SubscriptionPlan>>(
				`${this.endpoint}/${id}/toggle-status`,
				{},
				{ headers: await this.getAuthHeaders() }
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
			const response = await this.liveApi.get<ApiResponse<{ valid: boolean; message: string }>>(
				`${this.endpoint}/${id}/validate`,
				{ headers: await this.getAuthHeaders() }
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