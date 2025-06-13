import { v4 as uuidv4 } from 'uuid';
import { sealDBModel } from '../databases/local';
import { TABLE_NAMES } from '../databases/local/tables';

export class SubscriptionModel {
    static async findActivePlans(): Promise<SubscriptionPlan[]> {
        return sealDBModel.find(TABLE_NAMES.SUBSCRIPTION_PLANS, { is_active: true });
    }

    static async findById(id: string): Promise<SubscriptionPlan | null> {
        return sealDBModel.findById(TABLE_NAMES.SUBSCRIPTION_PLANS, id);
    }

    static async findActiveByClientId(client_id: string): Promise<ClientSubscription[]> {
        return sealDBModel.find(TABLE_NAMES.CLIENT_SUBSCRIPTIONS, { client_id, status: 'active' });
    }

    static async findByClientId(client_id: string): Promise<ClientSubscription[]> {
        return sealDBModel.find(TABLE_NAMES.CLIENT_SUBSCRIPTIONS, { client_id });
    }

    static async create(subscriptionData: Omit<ClientSubscription, 'id'>): Promise<ClientSubscription> {
        return sealDBModel.insert(TABLE_NAMES.CLIENT_SUBSCRIPTIONS, subscriptionData);
    }

    static buildSubscriptionData(client_id: string, plan_id: string, plan: SubscriptionPlan, payment_method?: string, auto_renew = true): Omit<ClientSubscription, 'id'> {
        const now = new Date();
        let endDate: Date | null = null;
        let nextPaymentDate: Date | null = null;

        switch (plan.billing_cycle) {
            case 'monthly':
                endDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
                nextPaymentDate = new Date(endDate);
                break;
            case 'yearly':
                endDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
                nextPaymentDate = new Date(endDate);
                break;
            case 'lifetime':
                endDate = null;
                nextPaymentDate = null;
                break;
            default:
                endDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
                nextPaymentDate = new Date(endDate);
        }

        return {
            uuid: uuidv4(),
            client_id,
            plan_id,
            status: 'active',
            starts_at: now.toISOString(),
            ends_at: endDate ? endDate.toISOString() : undefined,
            auto_renew,
            payment_method: payment_method || '',
            last_payment_date: now.toISOString(),
            next_payment_date: nextPaymentDate ? nextPaymentDate.toISOString() : undefined
        };
    }
}