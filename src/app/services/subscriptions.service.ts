import axios from 'axios';

const LIVE_API_URL = import.meta.env.VITE_LIVE_API_URL;

/**
 * Subscription Service
 * Uses LIVE API for all requests
 */
class SubscriptionService {
	private readonly endpoint = '/subscriptions';

	private liveApi = axios.create({
		baseURL: LIVE_API_URL,
		timeout: 30000,
		headers: {
			'X-Client-Type': 'web'
		}
	});

	/**
	 * Get tenant ID from electron setup or session storage
	 */
	private async getTenantId(): Promise<string | undefined> {
		try {
			if (typeof window !== 'undefined' && window.electronAPI?.settings) {
				const result = await window.electronAPI.settings.getSetup();
				if (result.success && result.data?.tenantId) return result.data.tenantId;
			}

			const user = sessionStorage?.getItem('user');
			if (user) return JSON.parse(user).tenantId;
		} catch (error) {
			console.warn('[SubscriptionService] Error getting tenant ID:', error);
		}
		return undefined;
	}

	private async getAuthHeaders() {
		const token = sessionStorage.getItem('token');
		const tenantId = await this.getTenantId();
		return {
			...(token && { Authorization: `Bearer ${JSON.parse(token)}` }),
			...(tenantId && { 'X-Tenant-Id': tenantId })
		};
	}

	/**
	 * Normalize subscription plan data for consistency
	 */
	private normalizeSubscriptionPlan(plan: any): SubscriptionPlan | null {
		if (!plan) return null;
		return {
			...plan,
			subscriptionPlanId: plan.subscriptionPlanId || plan.planId,
			planId: plan.planId || plan.subscriptionPlanId,
			isPopular: plan.isPopular ?? plan.popular ?? false,
			popular: plan.popular ?? plan.isPopular ?? false,
		};
	}

	/**
	 * Normalize branch subscription data
	 */
	private normalizeSubscription(subscription: any): BranchSubscription {
		return {
			...subscription,
			subscriptionPlan: this.normalizeSubscriptionPlan(subscription.subscriptionPlan),
		};
	}

	/**
	 * List all branch subscriptions
	 */
	async list(): Promise<SubscriptionResponse> {
		try {
			const response = await this.liveApi.get<SubscriptionResponse>(this.endpoint, {
				headers: await this.getAuthHeaders()
			});
			return response.data;
		} catch (error) {
			console.error('Error fetching subscriptions:', error);
			throw error;
		}
	}

	/**
	 * Get a single branch subscription by ID
	 */
	async show(id: string): Promise<BranchSubscription> {
		try {
			const response = await this.liveApi.get<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/${id}`,
				{ headers: await this.getAuthHeaders() }
			);
			return response.data.data;
		} catch (error) {
			console.error('Error fetching subscription:', error);
			throw error;
		}
	}

	/**
	 * Create a new branch subscription
	 */
	async store(
		subscriptionData: CreateBranchSubscriptionRequest
	): Promise<BranchSubscription> {
		try {
			const response = await this.liveApi.post<ApiResponse<BranchSubscription>>(
				this.endpoint,
				subscriptionData,
				{ headers: await this.getAuthHeaders() }
			);
			return response.data.data;
		} catch (error) {
			console.error('Error creating subscription:', error);
			throw error;
		}
	}

	/**
	 * Update an existing branch subscription
	 */
	async update(
		id: string,
		subscriptionData: UpdateBranchSubscriptionRequest
	): Promise<BranchSubscription> {
		try {
			const response = await this.liveApi.put<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/${id}`,
				subscriptionData,
				{ headers: await this.getAuthHeaders() }
			);
			return response.data.data;
		} catch (error) {
			console.error('Error updating subscription:', error);
			throw error;
		}
	}

	/**
	 * Delete a branch subscription
	 */
	async delete(id: string): Promise<void> {
		try {
			await this.liveApi.delete(`${this.endpoint}/${id}`, {
				headers: await this.getAuthHeaders()
			});
		} catch (error) {
			console.error('Error deleting subscription:', error);
			throw error;
		}
	}

	/**
	 * Get subscriptions filtered by status
	 * Uses query parameter: GET /subscriptions?status=active
	 */
	async getByStatus(
		status: BranchSubscription['status']
	): Promise<BranchSubscription[]> {
		try {
			const response = await this.liveApi.get<SubscriptionResponse>(
				this.endpoint,
				{
					headers: await this.getAuthHeaders(),
					params: { status }
				}
			);
			return response.data.data || [];
		} catch (error) {
			console.error('Error fetching subscriptions by status:', error);
			throw error;
		}
	}

	/**
	 * Get subscription for current branch (from auth context)
	 * Uses: GET /subscriptions/current
	 */
	async getActiveBranchSubscription(): Promise<BranchSubscription | null> {
		try {
			const response = await this.liveApi.get<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/current`,
				{ headers: await this.getAuthHeaders() }
			);
			return response.data.data ? this.normalizeSubscription(response.data.data) : null;
		} catch (error) {
			console.error('Error fetching current branch subscription:', error);
			return null;
		}
	}

	/**
	 * Get subscriptions filtered by plan ID
	 * Uses query parameter: GET /subscriptions?planId=xxx
	 */
	async getByPlanId(planId: string): Promise<BranchSubscription[]> {
		try {
			const response = await this.liveApi.get<SubscriptionResponse>(
				this.endpoint,
				{
					headers: await this.getAuthHeaders(),
					params: { planId }
				}
			);
			return response.data.data || [];
		} catch (error) {
			console.error('Error fetching subscriptions by plan:', error);
			throw error;
		}
	}

	/**
	 * Cancel a subscription
	 */
	async cancel(id: string): Promise<BranchSubscription> {
		try {
			const response = await this.liveApi.post<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/${id}/cancel`,
				{},
				{ headers: await this.getAuthHeaders() }
			);
			return response.data.data;
		} catch (error) {
			console.error('Error cancelling subscription:', error);
			throw error;
		}
	}

	/**
	 * Reactivate a cancelled subscription
	 */
	async reactivate(id: string): Promise<BranchSubscription> {
		try {
			const response = await this.liveApi.post<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/${id}/reactivate`,
				{},
				{ headers: await this.getAuthHeaders() }
			);
			return response.data.data;
		} catch (error) {
			console.error('Error reactivating subscription:', error);
			throw error;
		}
	}

	/**
	 * Process payment for a subscription
	 */
	async processPayment(
		id: string,
		paymentData: ProcessPaymentRequest
	): Promise<BranchSubscription> {
		try {
			const response = await this.liveApi.post<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/${id}/process-payment`,
				paymentData,
				{ headers: await this.getAuthHeaders() }
			);
			return response.data.data;
		} catch (error) {
			console.error('Error processing payment:', error);
			throw error;
		}
	}

	/**
	 * Get subscriptions expiring within the specified days
	 */
	async getExpiring(days: number = 30): Promise<BranchSubscription[]> {
		try {
			const response = await this.liveApi.get<ApiResponse<BranchSubscription[]>>(
				`${this.endpoint}/expiring?days=${days}`,
				{ headers: await this.getAuthHeaders() }
			);
			return response.data.data || [];
		} catch (error) {
			console.error('Error fetching expiring subscriptions:', error);
			throw error;
		}
	}

	/**
	 * Get subscription statistics
	 */
	async getStats(): Promise<SubscriptionStats> {
		try {
			const response = await this.liveApi.get<ApiResponse<SubscriptionStats>>(
				`${this.endpoint}/stats`,
				{ headers: await this.getAuthHeaders() }
			);
			return response.data.data;
		} catch (error) {
			console.error('Error fetching subscription stats:', error);
			throw error;
		}
	}

	/**
	 * Bulk update subscriptions
	 */
	async bulkUpdate(data: BulkUpdateRequest): Promise<BranchSubscription[]> {
		try {
			const response = await this.liveApi.patch<ApiResponse<BranchSubscription[]>>(
				`${this.endpoint}/bulk-update`,
				data,
				{ headers: await this.getAuthHeaders() }
			);
			return response.data.data || [];
		} catch (error) {
			console.error('Error bulk updating subscriptions:', error);
			throw error;
		}
	}
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;