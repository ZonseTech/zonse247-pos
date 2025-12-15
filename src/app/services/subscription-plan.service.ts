import api from './http.service';

class SubscriptionPlanService {
	private readonly endpoint = '/subscription-plans';

	async list(): Promise<SubscriptionPlan[]> {
		try {
			const response = await api.get<ApiResponse<SubscriptionPlan[]>>(this.endpoint);
			return response.data.data || [];
		} catch (error) {
			console.error('Error fetching subscription plans:', error);
			throw error;
		}
	}

	async show(id: string): Promise<SubscriptionPlan> {
		try {
			const response = await api.get<ApiResponse<SubscriptionPlan>>(
				`${this.endpoint}/${id}`
			);
			return response.data.data;
		} catch (error) {
			console.error('Error fetching subscription plan:', error);
			throw error;
		}
	}

	async store(planData: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
		try {
			const response = await api.post<ApiResponse<SubscriptionPlan>>(
				this.endpoint,
				planData as any
			);
			return response.data.data;
		} catch (error) {
			console.error('Error creating subscription plan:', error);
			throw error;
		}
	}

	async update(
		id: string,
		planData: Partial<SubscriptionPlan>
	): Promise<SubscriptionPlan> {
		try {
			const response = await api.put<any>(
				`${this.endpoint}/${id}`,
				planData
			);
			return response.data;
		} catch (error) {
			console.error('Error updating subscription plan:', error);
			throw error;
		}
	}

	async delete(id: string): Promise<void> {
		try {
			await api.delete(`${this.endpoint}/${id}`);
		} catch (error) {
			console.error('Error deleting subscription plan:', error);
			throw error;
		}
	}

	async getActive(): Promise<SubscriptionPlan[]> {
		try {
			const response = await api.get<SubscriptionPlan[]>(
				`${this.endpoint}/active`
			);

			const sortedPlans = response.data.data.sort((a, b) => {
				const order = { 'BASIC': 1, 'STANDARD': 2, 'PREMIUM': 3 };
				return order[a.name] - order[b.name];
			});

			return sortedPlans;
		} catch (error) {
			console.error('Error fetching active subscription plans:', error);
			throw error;
		}
	}

	async getByBillingCycle(billingCycle: string): Promise<SubscriptionPlan[]> {
		try {
			const response = await api.get<SubscriptionPlan[]>(
				`${this.endpoint}/billing-cycle/${billingCycle}`
			);
			return response.data;
		} catch (error) {
			console.error('Error fetching subscription plans by billing cycle:', error);
			throw error;
		}
	}

	async toggleStatus(id: string): Promise<SubscriptionPlan> {
		try {
			const response = await api.get<SubscriptionPlan>(
				`${this.endpoint}/${id}/toggle-status`
			);
			return response.data;
		} catch (error) {
			console.error('Error toggling subscription plan status:', error);
			throw error;
		}
	}

	async validatePlan(id: string): Promise<{ valid: boolean; message: string }> {
		try {
			const response = await api.get<{ valid: boolean; message: string }>(
				`${this.endpoint}/${id}/validate`
			);
			return response.data;
		} catch (error) {
			console.error('Error validating subscription plan:', error);
			throw error;
		}
	}

	async getPlansByFeature(feature: string): Promise<SubscriptionPlan[]> {
		try {
			const response = await api.get<SubscriptionPlan[]>(
				`${this.endpoint}/feature/${feature}`
			);
			return response.data;
		} catch (error) {
			console.error('Error fetching subscription plans by feature:', error);
			throw error;
		}
	}
}

const subscriptionPlanService = new SubscriptionPlanService();
export default subscriptionPlanService;