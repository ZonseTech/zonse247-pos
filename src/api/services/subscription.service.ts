import { ClientService } from "./client.service";
import { ClientModel } from "../models/client.model";
import { SubscriptionModel } from "../models/subscription.model";

export class SubscriptionService {
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