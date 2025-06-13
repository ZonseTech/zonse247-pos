import { ClientModel } from "../models/client.model";
import { ShopModel } from "../models/shop.model";
import { SubscriptionModel } from "../models/subscription.model";
import { WorkstationModel } from "../models/work-station.model";

export class ClientService {
    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateRequired(fields: Record<string, any>, requiredFields: string[]): string | null {
        for (const field of requiredFields) {
            if (!fields[field]) {
                return `Missing required field: ${field}`;
            }
        }
        return null;
    }

    static async registerClient(data: RegisterClientRequest): Promise<Client> {
        const validationError = this.validateRequired(data, ['company_name', 'owner_name', 'email', 'phone']);
        if (validationError) {
            throw new Error(validationError);
        }

        if (!this.validateEmail(data.email)) {
            throw new Error('Invalid email format');
        }

        const existingClients = await ClientModel.findByEmail(data.email);
        if (existingClients.length > 0) {
            throw new Error('Client with this email already exists');
        }

        const clientData = ClientModel.buildClientData(data);

        return ClientModel.create(clientData);
    }

    static async verifyClient(client_id: string, auth_key: string): Promise<Omit<Client, 'auth_key'>> {
        const clients = await ClientModel.findByCredentials(client_id, auth_key);

        if (clients.length === 0) {
            throw new Error('Invalid credentials');
        }

        return ClientModel.sanitizeClient(clients[0]);
    }

    static async updateClient(client_id: string, updateData: Partial<RegisterClientRequest>): Promise<Omit<Client, 'auth_key'>> {
        const client = await ClientModel.findById(client_id);
        if (!client) {
            throw new Error('Client not found');
        }

        if (updateData.email && updateData.email !== client.email) {
            const existingClients = await ClientModel.findByEmail(updateData.email);
            if (existingClients.length > 0) {
                throw new Error('Email already exists');
            }
        }

        const numUpdated = await ClientModel.update(client_id, updateData);
        if (numUpdated === 0) {
            throw new Error('Failed to update client');
        }

        const updatedClient = await ClientModel.findById(client_id);
        if (!updatedClient) {
            throw new Error('Failed to retrieve updated client data');
        }

        return ClientModel.sanitizeClient(updatedClient);
    }

    static async getOnboardingStatus(client_id: string): Promise<OnboardingStatus> {
        const client = await ClientModel.findById(client_id);
        if (!client) {
            throw new Error('Client not found');
        }

        const subscriptions = await SubscriptionModel.findByClientId(client_id);
        const activeSubscription = subscriptions.find(sub => sub.status === 'active') || null;

        const shops = await ShopModel.findByClientId(client_id);
        const workstations = await WorkstationModel.findByClientId(client_id);

        const onboardingSteps = {
            client_registered: true,
            subscription_active: !!activeSubscription,
            shop_created: shops.length > 0,
            workstation_setup: workstations.length > 0
        };

        const completedSteps = Object.values(onboardingSteps).filter(Boolean).length;
        const totalSteps = Object.keys(onboardingSteps).length;
        const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

        const safeClient = ClientModel.sanitizeClient(client);

        return {
            client: safeClient,
            subscription: activeSubscription,
            shops,
            workstations,
            onboarding: {
                steps: onboardingSteps,
                completed_steps: completedSteps,
                total_steps: totalSteps,
                completion_percentage: completionPercentage,
                is_complete: completionPercentage === 100
            }
        };
    }
}