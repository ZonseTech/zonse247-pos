import { liveApi, getAuthHeaders } from './live-api.service';

/**
 * Subscription Service
 * Uses LIVE API for all requests
 */
class SubscriptionService {
	private readonly endpoint = '/subscriptions';

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
			const response = await liveApi.get<SubscriptionResponse>(this.endpoint, {
				headers: await getAuthHeaders()
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
			const response = await liveApi.get<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/${id}`,
				{ headers: await getAuthHeaders() }
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
			const response = await liveApi.post<ApiResponse<BranchSubscription>>(
				this.endpoint,
				subscriptionData,
				{ headers: await getAuthHeaders() }
			);
			return response.data.data;
		} catch (error) {
			console.error('Error creating subscription:', error);
			throw error;
		}
	}

	/**
	 * Subscribe a branch to a plan, replacing its current subscription
	 * Uses: POST /subscriptions/subscribe-branch
	 */
	async subscribeBranch(
		subscriptionData: SubscribeBranchRequest
	): Promise<BranchSubscription> {
		try {
			const response = await liveApi.post<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/subscribe-branch`,
				subscriptionData,
				{ headers: await getAuthHeaders() }
			);
			return response.data.data;
		} catch (error) {
			console.error('Error subscribing branch:', error);
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
			const response = await liveApi.put<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/${id}`,
				subscriptionData,
				{ headers: await getAuthHeaders() }
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
			await liveApi.delete(`${this.endpoint}/${id}`, {
				headers: await getAuthHeaders()
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
			const response = await liveApi.get<SubscriptionResponse>(
				this.endpoint,
				{
					headers: await getAuthHeaders(),
					params: { status }
				}
			);
			const data = response.data.data;
			return Array.isArray(data) ? data : (data?.subscriptions || []);
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
			const response = await liveApi.get<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/current`,
				{ headers: await getAuthHeaders() }
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
			const response = await liveApi.get<SubscriptionResponse>(
				this.endpoint,
				{
					headers: await getAuthHeaders(),
					params: { planId }
				}
			);
			const data = response.data.data;
			return Array.isArray(data) ? data : (data?.subscriptions || []);
		} catch (error) {
			console.error('Error fetching subscriptions by plan:', error);
			throw error;
		}
	}

	/**
	 * Get all subscriptions for a specific tenant's branches
	 * Uses: GET /subscriptions/tenant/:tenantId
	 */
	async getByTenantId(tenantId: string): Promise<BranchSubscription[]> {
		try {
			const response = await liveApi.get<SubscriptionResponse>(
				`${this.endpoint}/tenant/${tenantId}`,
				{ headers: await getAuthHeaders() }
			);
			const data = response.data.data;
			const items = Array.isArray(data) ? data : (data?.subscriptions || []);
			return items.map(sub => this.normalizeSubscription(sub));
		} catch (error) {
			console.error('Error fetching subscriptions by tenant:', error);
			throw error;
		}
	}

	/**
	 * Cancel a subscription
	 */
	async cancel(id: string): Promise<BranchSubscription> {
		try {
			const response = await liveApi.post<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/${id}/cancel`,
				{},
				{ headers: await getAuthHeaders() }
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
			const response = await liveApi.post<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/${id}/reactivate`,
				{},
				{ headers: await getAuthHeaders() }
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
			const response = await liveApi.post<ApiResponse<BranchSubscription>>(
				`${this.endpoint}/${id}/process-payment`,
				paymentData,
				{ headers: await getAuthHeaders() }
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
			const response = await liveApi.get<ApiResponse<any>>(
				`${this.endpoint}/expiring?days=${days}`,
				{ headers: await getAuthHeaders() }
			);
			const data = response.data.data;
			return Array.isArray(data) ? data : (data?.subscriptions || []);
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
			const response = await liveApi.get<ApiResponse<SubscriptionStats>>(
				`${this.endpoint}/stats`,
				{ headers: await getAuthHeaders() }
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
			const response = await liveApi.patch<ApiResponse<any>>(
				`${this.endpoint}/bulk-update`,
				data,
				{ headers: await getAuthHeaders() }
			);
			const result = response.data.data;
			return Array.isArray(result) ? result : (result?.subscriptions || []);
		} catch (error) {
			console.error('Error bulk updating subscriptions:', error);
			throw error;
		}
	}
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;