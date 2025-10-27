import { v4 as uuidv4 } from 'uuid';
import { sealDBModel } from "../databases/local";
import { APP_SETUP_DB, TENANT_TABLE, TERMINAL_SETTINGS_DB, BRANCHES_TABLE, TERMINALS_TABLE } from "../databases/local/tables";

export class SettingsModel {
    static async findByContext(tenantId: string, branchId: string, terminalId: string): Promise<Setting[]> {
        try {
            const conditions = {
                tenantId,
                branchId,
                terminalId,
                status: 'active'
            };

            return await sealDBModel.find<Setting[]>(TERMINAL_SETTINGS_DB, conditions);
        } catch (error) {
            console.error('Error finding settings by context:', error);
            throw error;
        }
    }

    static async findByKey(
        tenantId: string,
        branchId: string,
        terminalId: string,
        key: string
    ): Promise<Setting | null> {
        try {
            const conditions = {
                tenantId,
                branchId,
                terminalId,
                key,
                status: 'active'
            };

            return await sealDBModel.findById<Setting>(TERMINAL_SETTINGS_DB, conditions);
        } catch (error) {
            console.error('Error finding setting by key:', error);
            throw error;
        }
    }

    static async findAll(): Promise<Setting[]> {
        try {
            return await sealDBModel.findAll(TERMINAL_SETTINGS_DB);
        } catch (error) {
            console.error('Error finding all settings:', error);
            throw error;
        }
    }

    static async getAppSetup(): Promise<SetupParams> {
        try {
            const setup = await sealDBModel.findById<SetupParams>(APP_SETUP_DB, '-1');
            return setup;
        } catch (error) {
            console.error('Error finding app setup:', error);
            throw error;
        }
    }

    static async create(params: CreateSettingRequest): Promise<TerminalSettings> {
        try {
            const now = new Date();

            const tenant = await sealDBModel.findById<Tenant>(TENANT_TABLE, params.tenantId);
            const branch = await sealDBModel.findById<Branch>(BRANCHES_TABLE, params.branchId);
            const terminal = await sealDBModel.findById<Terminal>(TERMINALS_TABLE, params.terminalId);

            const setting = {
                uuid: uuidv4(),
                tenantId: params.tenantId,
                branchId: params.branchId,
                terminalId: params.terminalId,
                // app: tenant.companyName,
                // store: branch.name,
                addressLine1: branch?.addressLine1,
                addressLine2: branch?.addressLine2,
                // country: branch.country,
                city: branch?.city,
                // contact: tenant.phone,
                tax: branch?.taxRate,
                symbol: branch?.currencySymbol,
                chargeTax: branch?.chargeTax,
                footer: branch?.receiptFooter,
                img: branch?.logoUrl,
                // tillName: terminal.tillName,
                status: branch?.status,
                createdAt: now,
                updatedAt: now
            };

            return await sealDBModel.insert(TERMINAL_SETTINGS_DB, setting);
        } catch (error) {
            console.error('Error creating setting:', error);
            throw error;
        }
    }

    static async update(uuid: string, updateData: UpdateSettingRequest): Promise<boolean> {
        try {
            const numUpdated = await sealDBModel.update(TERMINAL_SETTINGS_DB, uuid, updateData);
            return numUpdated > 0;
        } catch (error) {
            console.error('Error updating setting:', error);
            throw error;
        }
    }

    static async delete(uuid: string): Promise<boolean> {
        try {
            const numDeleted = await sealDBModel.delete(TERMINAL_SETTINGS_DB, uuid);
            return numDeleted > 0;
        } catch (error) {
            console.error('Error deleting setting:', error);
            throw error;
        }
    }

    static async getSettingsGroup(): Promise<TerminalSettings> {
        try {
            const settings = await sealDBModel.findAll(TERMINAL_SETTINGS_DB);
            return settings[0]
        } catch (error) {
            console.error('Error getting settings group:', error);
            throw error;
        }
    }

    static async getSettingsByCategory(
        tenantId: string,
        branchId: string,
        terminalId: string,
        category: string
    ): Promise<Setting[]> {
        try {
            const conditions = {
                tenantId,
                branchId,
                terminalId,
                category,
                status: 'active'
            };

            return await sealDBModel.find<Setting[]>(TERMINAL_SETTINGS_DB, conditions);
        } catch (error) {
            console.error('Error getting settings by category:', error);
            throw error;
        }
    }
}