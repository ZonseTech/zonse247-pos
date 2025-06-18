import { v4 as uuidv4 } from 'uuid';
import { sealDBModel } from '../databases/local';
import { TABLE_NAMES } from '../databases/local/tables';

export class SubscriptionModel {

    static async findAll(): Promise<ClientSubscription[]> {
        return sealDBModel.findAll(TABLE_NAMES.CLIENT_SUBSCRIPTIONS);
    }

    static async findByUuid(uuid: string): Promise<ClientSubscription | null> {
        return sealDBModel.findById(TABLE_NAMES.CLIENT_SUBSCRIPTIONS, uuid);
    }

    static async findByStatus(status: string): Promise<ClientSubscription[]> {
        return sealDBModel.find(TABLE_NAMES.CLIENT_SUBSCRIPTIONS, { status });
    }

    static async findByPlanId(plan_id: string): Promise<ClientSubscription[]> {
        return sealDBModel.find(TABLE_NAMES.CLIENT_SUBSCRIPTIONS, { plan_id });
    }

    static async update(uuid: string, data: Partial<ClientSubscription>): Promise<number> {
        return sealDBModel.update(TABLE_NAMES.CLIENT_SUBSCRIPTIONS, uuid, data);
    }

    static async delete(uuid: string): Promise<number> {
        return sealDBModel.delete(TABLE_NAMES.CLIENT_SUBSCRIPTIONS, uuid);
    }

    static async findExpiring(days: number): Promise<ClientSubscription[]> {
        const allSubscriptions = await sealDBModel.findAll(TABLE_NAMES.CLIENT_SUBSCRIPTIONS);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);

        return allSubscriptions.filter(subscription => {
            if (!subscription.ends_at || subscription.status !== 'active') return false;

            const endDate = new Date(subscription.ends_at);
            return endDate <= expirationDate && endDate > new Date();
        });
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
        const allSubscriptions = await sealDBModel.findAll(TABLE_NAMES.CLIENT_SUBSCRIPTIONS);
        const now = new Date();

        const stats = {
            total: allSubscriptions.length,
            active: 0,
            cancelled: 0,
            expired: 0,
            past_due: 0,
            monthly_revenue: 0,
            annual_revenue: 0
        };

        const allPlans = await sealDBModel.findAll(TABLE_NAMES.SUBSCRIPTION_PLANS);
        const plansMap = new Map(allPlans.map(plan => [plan.uuid, plan]));

        for (const subscription of allSubscriptions) {
            switch (subscription.status) {
                case 'active':
                    if (subscription.ends_at && new Date(subscription.ends_at) < now) {
                        stats.expired++;
                    } else {
                        stats.active++;

                        const plan = plansMap.get(subscription.plan_id);
                        if (plan) {
                            if (plan.billing_cycle === 'monthly') {
                                stats.monthly_revenue += plan.price || 0;
                                stats.annual_revenue += (plan.price || 0) * 12;
                            } else if (plan.billing_cycle === 'yearly') {
                                stats.annual_revenue += plan.price || 0;
                                stats.monthly_revenue += (plan.price || 0) / 12;
                            }
                        }
                    }
                    break;
                case 'cancelled':
                    stats.cancelled++;
                    break;
                case 'expired':
                    stats.expired++;
                    break;
                case 'past_due':
                    stats.past_due++;
                    break;
            }
        }

        return stats;
    }

    static async findActivePlans(): Promise<SubscriptionPlan[]> {
        return sealDBModel.find(TABLE_NAMES.SUBSCRIPTION_PLANS, { is_active: true });
    }

    static async findById(id: string): Promise<SubscriptionPlan | null> {
        return sealDBModel.findById(TABLE_NAMES.SUBSCRIPTION_PLANS, id);
    }

    static async findActiveByClientId(clientId: string): Promise<ClientSubscription[]> {
        return sealDBModel.find(TABLE_NAMES.CLIENT_SUBSCRIPTIONS, { clientId, status: 'active' });
    }

    static async findByClientId(clientId: string): Promise<ClientSubscription[]> {
        return sealDBModel.find(TABLE_NAMES.CLIENT_SUBSCRIPTIONS, { clientId });
    }

    static async create(subscriptionData: Omit<ClientSubscription, 'id'>): Promise<ClientSubscription> {
        return sealDBModel.insert(TABLE_NAMES.CLIENT_SUBSCRIPTIONS, subscriptionData);
    }

    static buildSubscriptionData(
        clientId: string,
        plan_id: string,
        plan: SubscriptionPlan,
        payment_method?: string,
        auto_renew = true
    ): Omit<ClientSubscription, 'id'> {
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
            clientId,
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