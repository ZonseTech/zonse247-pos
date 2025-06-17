import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { sealDBModel } from '../databases/local';
import { TABLE_NAMES } from '../databases/local/tables';

export class ClientModel {
    static generateClientId(): string {
        return 'CLT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    static generateAuthKey(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    static async findAll(query: any = {}): Promise<Client[]> {
        const conditions: any = {};

        if (query.status) {
            conditions.status = query.status;
        }

        if (query.subscription_status) {
            conditions.subscription_status = query.subscription_status;
        }

        if (query.country) {
            conditions.country = query.country;
        }

        if (query.search) {
            conditions.$or = [
                { company_name: { $regex: new RegExp(query.search, 'i') } },
                { owner_name: { $regex: new RegExp(query.search, 'i') } },
                { email: { $regex: new RegExp(query.search, 'i') } }
            ];
        }

        return sealDBModel.find(TABLE_NAMES.CLIENTS, conditions);
    }

    static async findByEmail(email: string): Promise<Client[]> {
        return sealDBModel.find(TABLE_NAMES.CLIENTS, { email });
    }

    static async findById(id: string): Promise<Client | null> {
        return sealDBModel.findById(TABLE_NAMES.CLIENTS, id);
    }

    static async findClientId(id: string): Promise<Client | null> {
        return sealDBModel.find(TABLE_NAMES.CLIENTS, { client_id: id }) as any;
    }

    static async findByCredentials(client_id: string, auth_key: string): Promise<Client[]> {
        return sealDBModel.find(TABLE_NAMES.CLIENTS, { client_id, auth_key });
    }

    static async create(clientData: Omit<Client, 'id'>): Promise<Client> {
        return sealDBModel.insert(TABLE_NAMES.CLIENTS, clientData);
    }

    static async update(id: string, updateData: Partial<Client>): Promise<number> {
        return sealDBModel.update(TABLE_NAMES.CLIENTS, id, updateData);
    }

    static async delete(id: string): Promise<number> {
        return sealDBModel.delete(TABLE_NAMES.CLIENTS, id);
    }

    static buildClientData(data: RegisterClientRequest): Omit<Client, 'id'> {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);

        return {
            uuid: uuidv4(),
            client_id: this.generateClientId(),
            company_name: data.company_name,
            owner_name: data.owner_name,
            email: data.email,
            phone: data.phone,
            address: data.address || '',
            country: data.country || '',
            timezone: data.timezone || 'UTC',
            subscription_status: 'trial',
            trial_ends_at: trialEndDate.toISOString(),
            auth_key: this.generateAuthKey(),
            status: 'pending',
            registered_at: new Date().toISOString()
        };
    }

    static sanitizeClient(client: Client): Omit<Client, 'auth_key'> {
        const { auth_key, ...safeClient } = client;
        return safeClient;
    }
}