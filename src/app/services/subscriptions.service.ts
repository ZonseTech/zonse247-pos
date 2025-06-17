import api from "./http.service";

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

    async show(id: string): Promise<ClientSubscription> {
        try {
            const response = await api.get<ClientSubscription>(`${this.endpoint}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching subscription:', error);
            throw error;
        }
    }

    async store(subscriptionData: Omit<ClientSubscription, 'id' | 'created_at' | 'updated_at'>): Promise<ClientSubscription> {
        try {
            const response = await api.post(this.endpoint, subscriptionData);
            return response.data;
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }

    async update(id: string, subscriptionData: Partial<ClientSubscription>): Promise<ClientSubscription> {
        try {
            const response = await api.put<ClientSubscription>(`${this.endpoint}/${id}`, subscriptionData as any);
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

    async getByStatus(status: ClientSubscription['status']): Promise<ClientSubscription[]> {
        try {
            const response = await api.get<Array<ClientSubscription>>(`${this.endpoint}?status=${status}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching subscriptions by status:', error);
            throw error;
        }
    }

    async getByClientId(clientId: string): Promise<ClientSubscription[]> {
        try {
            const response = await api.get<Array<ClientSubscription>>(`${this.endpoint}?client_id=${clientId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching subscriptions by client:', error);
            throw error;
        }
    }

    async getByPlanId(planId: string): Promise<ClientSubscription[]> {
        try {
            const response = await api.get<Array<ClientSubscription>>(`${this.endpoint}?plan_id=${planId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching subscriptions by plan:', error);
            throw error;
        }
    }

    async cancel(id: string): Promise<ClientSubscription> {
        try {
            const response = await api.put<ClientSubscription>(`${this.endpoint}/${id}/cancel`, {} as ClientSubscription);
            return response.data;
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
        }
    }

    async reactivate(id: string): Promise<ClientSubscription> {
        try {
            const response = await api.put(`${this.endpoint}/${id}/reactivate`, {} as ClientSubscription);
            return response.data;
        } catch (error) {
            console.error('Error reactivating subscription:', error);
            throw error;
        }
    }

    async processPayment(id: string, paymentData: { amount: number; payment_method: string }): Promise<ClientSubscription> {
        try {
            const response = await api.post<ClientSubscription>(`${this.endpoint}/${id}/payment`, paymentData as any);
            return response.data;
        } catch (error) {
            console.error('Error processing payment:', error);
            throw error;
        }
    }

    async getExpiring(days: number = 30): Promise<ClientSubscription[]> {
        try {
            const response = await api.get<Array<ClientSubscription>>(`${this.endpoint}/expiring?days=${days}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching expiring subscriptions:', error);
            throw error;
        }
    }

    async bulkUpdate(ids: string[], updateData: Partial<ClientSubscription>): Promise<ClientSubscription[]> {
        try {
            const response = await api.patch<any>(`${this.endpoint}/bulk-update`, {
                ids,
                data: updateData
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