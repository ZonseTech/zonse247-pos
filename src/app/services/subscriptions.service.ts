import api from './http.service';

class SubscriptionsService {
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
		subscriptionData: Omit<
			TenantSubscription,
			'id' | 'created_at' | 'updated_at'
		>
	): Promise<TenantSubscription> {
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
				`${this.endpoint}?status=${status}`
			);
			return response.data;
		} catch (error) {
			console.error('Error fetching subscriptions by status:', error);
			throw error;
		}
	}

	async getByClientUuid(clientUuid: string): Promise<TenantSubscription[]> {
		try {
			const response = await api.get<Array<TenantSubscription>>(
				`${this.endpoint}?clientUuid=${clientUuid}`
			);
			return response.data;
		} catch (error) {
			console.error('Error fetching subscriptions by client:', error);
			throw error;
		}
	}

	async getByPlanId(planId: string): Promise<TenantSubscription[]> {
		try {
			const response = await api.get<Array<TenantSubscription>>(
				`${this.endpoint}?plan_id=${planId}`
			);
			return response.data;
		} catch (error) {
			console.error('Error fetching subscriptions by plan:', error);
			throw error;
		}
	}

	async cancel(id: string): Promise<TenantSubscription> {
		try {
			const response = await api.put<TenantSubscription>(
				`${this.endpoint}/${id}/cancel`,
				{} as TenantSubscription
			);
			return response.data;
		} catch (error) {
			console.error('Error cancelling subscription:', error);
			throw error;
		}
	}

	async reactivate(id: string): Promise<TenantSubscription> {
		try {
			const response = await api.put(
				`${this.endpoint}/${id}/reactivate`,
				{} as TenantSubscription
			);
			return response.data;
		} catch (error) {
			console.error('Error reactivating subscription:', error);
			throw error;
		}
	}

	async processPayment(
		id: string,
		paymentData: { amount: number; payment_method: string }
	): Promise<TenantSubscription> {
		try {
			const response = await api.post<TenantSubscription>(
				`${this.endpoint}/${id}/payment`,
				paymentData as any
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

	async bulkUpdate(
		ids: string[],
		updateData: Partial<TenantSubscription>
	): Promise<TenantSubscription[]> {
		try {
			const response = await api.patch<any>(`${this.endpoint}/bulk-update`, {
				ids,
				data: updateData,
			});
			return response.data;
		} catch (error) {
			console.error('Error bulk updating subscriptions:', error);
			throw error;
		}
	}

	async getStats(): Promise<{
		total: number;
		active: number;
		cancelled: number;
		expired: number;
		past_due: number;
		monthly_revenue: number;
		annual_revenue: number;
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

const subscriptionsService = new SubscriptionsService();
export default subscriptionsService;
