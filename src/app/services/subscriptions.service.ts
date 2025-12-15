import api from './http.service';

class SubscriptionService {
	private readonly endpoint = '/subscriptions';

	async list(): Promise<SubscriptionResponse> {
		try {
			const response = await api.get<SubscriptionResponse>(this.endpoint);
			return response.data;
		} catch (error) {
			console.error('Error fetching subscriptions:', error);
			throw error;
		}
	}

	async show(id: string): Promise<TenantSubscription> {
		try {
			const response = await api.get<TenantSubscription>(
				`${this.endpoint}/${id}`
			);
			return response.data;
		} catch (error) {
			console.error('Error fetching subscription:', error);
			throw error;
		}
	}

	async store(
		subscriptionData: CreateSubscriptionRequest
	): Promise<Omit<TenantSubscription, 'id' | 'created_at' | 'updated_at'>> {
		try {
			const response = await api.post(this.endpoint, subscriptionData);
			return response.data;
		} catch (error) {
			console.error('Error creating subscription:', error);
			throw error;
		}
	}

	async update(
		id: string,
		subscriptionData: Partial<TenantSubscription>
	): Promise<TenantSubscription> {
		try {
			const response = await api.put<TenantSubscription>(
				`${this.endpoint}/${id}`,
				subscriptionData as any
			);
			return response.data;
		} catch (error) {
			console.error('Error updating subscription:', error);
			throw error;
		}
	}

	async delete(id: string): Promise<void> {
		try {
			await api.delete(`${this.endpoint}/${id}`);
		} catch (error) {
			console.error('Error deleting subscription:', error);
			throw error;
		}
	}

	async getByStatus(
		status: TenantSubscription['status']
	): Promise<TenantSubscription[]> {
		try {
			const response = await api.get<Array<TenantSubscription>>(
				`${this.endpoint}/status/${status}`
			);
			return response.data;
		} catch (error) {
			console.error('Error fetching subscriptions by status:', error);
			throw error;
		}
	}

	async getActiveSubscriptionByTenantId(tenantId: string): Promise<TenantSubscription> {
		try {
			const response = await api.get<TenantSubscription>(
				`${this.endpoint}/tenant/${tenantId}`
			);

			return response.data?.data;
		} catch (error) {
			throw error;
		}
	}

	async getByPlanId(planId: string): Promise<TenantSubscription[]> {
		try {
			const response = await api.get<Array<TenantSubscription>>(
				`${this.endpoint}/plan/${planId}`
			);
			return response.data;
		} catch (error) {
			console.error('Error fetching subscriptions by plan:', error);
			throw error;
		}
	}

	async cancel(id: string): Promise<TenantSubscription> {
		try {
			const response = await api.get<TenantSubscription>(
				`${this.endpoint}/${id}/cancel`
			);
			return response.data;
		} catch (error) {
			console.error('Error cancelling subscription:', error);
			throw error;
		}
	}

	async reactivate(id: string): Promise<TenantSubscription> {
		try {
			const response = await api.get<TenantSubscription>(
				`${this.endpoint}/${id}/reactivate`
			);
			return response.data;
		} catch (error) {
			console.error('Error reactivating subscription:', error);
			throw error;
		}
	}

	async processPayment(
		id: string,
		paymentData: { amount: number; paymentMethod: string }
	): Promise<TenantSubscription> {
		try {
			const response = await api.post<any>(
				`${this.endpoint}/${id}/process-payment`,
				paymentData
			);
			return response.data;
		} catch (error) {
			console.error('Error processing payment:', error);
			throw error;
		}
	}

	async getExpiring(days: number = 30): Promise<TenantSubscription[]> {
		try {
			const response = await api.get<Array<TenantSubscription>>(
				`${this.endpoint}/expiring?days=${days}`
			);
			return response.data;
		} catch (error) {
			console.error('Error fetching expiring subscriptions:', error);
			throw error;
		}
	}

	async getStats(): Promise<{
		total: number;
		active: number;
		cancelled: number;
		expired: number;
		pastDue: number;
		monthlyRevenue: number;
		annualRevenue: number;
	}> {
		try {
			const response = await api.get<any>(`${this.endpoint}/stats`);
			return response.data;
		} catch (error) {
			console.error('Error fetching subscription stats:', error);
			throw error;
		}
	}
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;