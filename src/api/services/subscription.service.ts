import { ClientService } from "./client.service";
import { ClientModel } from "../models/client.model";
import { SubscriptionModel } from "../models/subscription.model";

export class SubscriptionService {

    static async getAll(): Promise<ClientSubscription[]> {
        return SubscriptionModel.findAll();
    }

    static async getById(id: string): Promise<ClientSubscription | null> {
        return SubscriptionModel.findByUuid(id);
    }

    static async create(data: Omit<ClientSubscription, 'id' | 'created_at' | 'updated_at'>): Promise<ClientSubscription> {
        const validationError = ClientService.validateRequired(data, ['client_id', 'plan_id']);
        if (validationError) {
            throw new Error(validationError);
        }

        const client = await ClientModel.findClientId(data.client_id);
        if (!client) {
            throw new Error('Client not found');
        }

        /* const plan = await SubscriptionModel.findById(data.plan_id);
        if (!plan || !plan.is_active) {
            throw new Error('Subscription plan not found or inactive');
        } */

        const existingSubscriptions = await SubscriptionModel.findActiveByClientId(data.client_id);
        if (existingSubscriptions.length > 0) {
            throw new Error('Client already has an active subscription');
        }

        const subscriptionData = {
            ...data,
            status: data.status || 'active',
            starts_at: data.starts_at || new Date().toISOString(),
            auto_renew: data.auto_renew !== undefined ? data.auto_renew : true
        };

        const newSubscription = await SubscriptionModel.create(subscriptionData);

        await ClientModel.update(data.client_id, {
            subscription_status: 'active',
            status: 'active',
            activated_at: new Date().toISOString()
        });

        return newSubscription;
    }

    static async update(id: string, data: Partial<ClientSubscription>): Promise<ClientSubscription | null> {
        const existingSubscription = await SubscriptionModel.findByUuid(id);
        if (!existingSubscription) {
            return null;
        }

        const numUpdated = await SubscriptionModel.update(id, data);
        if (numUpdated === 0) {
            return null;
        }

        return SubscriptionModel.findByUuid(id);
    }

    static async delete(id: string): Promise<boolean> {
        const numDeleted = await SubscriptionModel.delete(id);
        return numDeleted > 0;
    }

    static async getByStatus(status: string): Promise<ClientSubscription[]> {
        return SubscriptionModel.findByStatus(status);
    }

    static async getByClientId(clientId: string): Promise<ClientSubscription[]> {
        return SubscriptionModel.findByClientId(clientId);
    }

    static async getByPlanId(planId: string): Promise<ClientSubscription[]> {
        return SubscriptionModel.findByPlanId(planId);
    }

    static async cancel(id: string): Promise<ClientSubscription | null> {
        const subscription = await SubscriptionModel.findByUuid(id);
        if (!subscription) {
            return null;
        }

        const cancelData = {
            status: 'cancelled',
            ends_at: new Date().toISOString(),
            auto_renew: false,
            cancelled_at: new Date().toISOString()
        };

        await SubscriptionModel.update(id, cancelData as any);

        await ClientModel.update(subscription.client_id, {
            subscription_status: 'cancelled'
        });

        return SubscriptionModel.findByUuid(id);
    }

    static async reactivate(id: string): Promise<ClientSubscription | null> {
        const subscription = await SubscriptionModel.findByUuid(id);
        if (!subscription) {
            return null;
        }

        const plan = await SubscriptionModel.findById(subscription.plan_id);
        if (!plan) {
            throw new Error('Subscription plan not found');
        }

        const now = new Date();
        let endDate: Date | null = null;

        switch (plan.billing_cycle) {
            case 'monthly':
                endDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
                break;
            case 'yearly':
                endDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
                break;
            case 'lifetime':
                endDate = null;
                break;
            default:
                endDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        }

        const reactivateData = {
            status: 'active',
            starts_at: now.toISOString(),
            ends_at: endDate ? endDate.toISOString() : undefined,
            auto_renew: true,
            cancelled_at: undefined
        };

        await SubscriptionModel.update(id, reactivateData as any);

        await ClientModel.update(subscription.client_id, {
            subscription_status: 'active',
            status: 'active'
        });

        return SubscriptionModel.findByUuid(id);
    }

    static async processPayment(id: string, paymentData: { amount: number; payment_method: string }): Promise<ClientSubscription | null> {
        const subscription = await SubscriptionModel.findByUuid(id);
        if (!subscription) {
            return null;
        }

        const now = new Date();
        const paymentProcessData = {
            last_payment_date: now.toISOString(),
            payment_method: paymentData.payment_method,
            status: 'active'
        };

        const plan = await SubscriptionModel.findById(subscription.plan_id);
        if (plan) {
            let nextPaymentDate: Date | null = null;
            switch (plan.billing_cycle) {
                case 'monthly':
                    nextPaymentDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
                    break;
                case 'yearly':
                    nextPaymentDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
                    break;
                case 'lifetime':
                    nextPaymentDate = null;
                    break;
            }

            if (nextPaymentDate) {
                (paymentProcessData as any).next_payment_date = nextPaymentDate.toISOString();
                (paymentProcessData as any).ends_at = nextPaymentDate.toISOString();
            }
        }

        await SubscriptionModel.update(id, paymentProcessData as any);
        return SubscriptionModel.findByUuid(id);
    }

    static async getExpiring(days: number = 30): Promise<ClientSubscription[]> {
        return SubscriptionModel.findExpiring(days);
    }

    static async bulkUpdate(ids: string[], updateData: Partial<ClientSubscription>): Promise<ClientSubscription[]> {
        const updatedSubscriptions: ClientSubscription[] = [];

        for (const id of ids) {
            try {
                await SubscriptionModel.update(id, updateData);
                const updated = await SubscriptionModel.findByUuid(id);
                if (updated) {
                    updatedSubscriptions.push(updated);
                }
            } catch (error) {
                console.error(`Error updating subscription ${id}:`, error);
            }
        }

        return updatedSubscriptions;
    }

    static async getStats(): Promise<{
        total: number;
        active: number;
        cancelled: number;
        expired: number;
        past_due: number;
        monthly_revenue: number;
        annual_revenue: number;
    }> {
        return SubscriptionModel.getStats();
    }

    static async getActivePlans(): Promise<SubscriptionPlan[]> {
        return SubscriptionModel.findActivePlans();
    }

    static async createSubscription(data: CreateSubscriptionRequest): Promise<ClientSubscription> {
        const validationError = ClientService.validateRequired(data, ['client_id', 'plan_id']);
        if (validationError) {
            throw new Error(validationError);
        }

        const client = await ClientModel.findById(data.client_id);
        if (!client) {
            throw new Error('Client not found');
        }

        const plan = await SubscriptionModel.findById(data.plan_id);
        if (!plan || !plan.is_active) {
            throw new Error('Subscription plan not found or inactive');
        }

        const existingSubscriptions = await SubscriptionModel.findActiveByClientId(data.client_id);
        if (existingSubscriptions.length > 0) {
            throw new Error('Client already has an active subscription');
        }

        const subscriptionData = SubscriptionModel.buildSubscriptionData(
            data.client_id,
            data.plan_id,
            plan,
            data.payment_method,
            data.auto_renew
        );

        const newSubscription = await SubscriptionModel.create(subscriptionData);

        const now = new Date();
        await ClientModel.update(data.client_id, {
            subscription_status: 'active',
            status: 'active',
            activated_at: now.toISOString()
        });

        return newSubscription;
    }
}