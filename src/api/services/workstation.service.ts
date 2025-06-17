import { ClientService } from "./client.service";
import { ShopModel } from "../models/shop.model";
import { WorkstationModel } from "../models/work-station.model";

export class WorkstationService {

    static async createWorkstation(data: CreateWorkstationRequest): Promise<Workstation> {
        const validationError = ClientService.validateRequired(data, ['shop_code', 'client_id', 'till_name', 'till_number']);
        if (validationError) {
            throw new Error(validationError);
        }

        const shop = await ShopModel.findByShopCode(data.shop_code);
        if (!shop) {
            throw new Error('Shop not found');
        }

        if (shop.client_id !== data.client_id) {
            throw new Error('Client does not own this shop');
        }

        const existingWorkstations = await WorkstationModel.findByShopCodeAndTillNumber(data.shop_code, data.till_number);
        if (existingWorkstations.length > 0) {
            throw new Error('Till number already exists for this shop');
        }

        if (data.is_primary) {
            const primaryWorkstations = await WorkstationModel.findPrimaryByShopCode(data.shop_code);
            for (const workstation of primaryWorkstations) {
                await WorkstationModel.update(workstation.uuid, { is_primary: false });
            }
        }

        const workstationData = WorkstationModel.buildWorkstationData(data);
        return WorkstationModel.create(workstationData);
    }

    static async getAllWorkstations(query: any = {}): Promise<Workstation[]> {
        try {
            if (query.client_id) {
                return await WorkstationModel.findByClientId(query.client_id);
            }

            if (query.shop_code) {
                return await WorkstationModel.findByShopCode(query.shop_code);
            }

            return await WorkstationModel.findAll();
        } catch (error) {
            throw new Error(`Failed to retrieve workstations: ${error}`);
        }
    }

    static async getWorkstationById(id: string): Promise<Workstation | null> {
        try {
            return await WorkstationModel.findById(id);
        } catch (error) {
            throw new Error(`Failed to retrieve workstation: ${error}`);
        }
    }

    static async updateWorkstation(id: string, data: Partial<Workstation>): Promise<Workstation | null> {
        try {
            const existingWorkstation = await WorkstationModel.findById(id);
            if (!existingWorkstation) {
                throw new Error('Workstation not found');
            }

            if (data.till_number && data.till_number !== existingWorkstation.till_number) {
                const conflictingWorkstations = await WorkstationModel.findByShopCodeAndTillNumber(
                    existingWorkstation.shop_code,
                    data.till_number
                );
                if (conflictingWorkstations.length > 0) {
                    throw new Error('Till number already exists for this shop');
                }
            }

            if (data.is_primary === true && !existingWorkstation.is_primary) {
                const primaryWorkstations = await WorkstationModel.findPrimaryByShopCode(existingWorkstation.shop_code);
                for (const workstation of primaryWorkstations) {
                    await WorkstationModel.update(workstation.uuid, { is_primary: false });
                }
            }

            const updateData = {
                ...data,
                last_activity: new Date().toISOString()
            };

            const numUpdated = await WorkstationModel.update(id, updateData);
            if (numUpdated === 0) {
                return null;
            }

            return await WorkstationModel.findById(id);
        } catch (error) {
            throw error;
        }
    }

    static async deleteWorkstation(id: string): Promise<boolean> {
        try {
            const numDeleted = await WorkstationModel.delete(id);
            return numDeleted > 0;
        } catch (error) {
            throw new Error(`Failed to delete workstation: ${error}`);
        }
    }

    static async updateWorkstationStatus(id: string, status: 'active' | 'inactive' | 'maintenance'): Promise<Workstation | null> {
        try {
            const updateData = {
                status,
                last_activity: new Date().toISOString()
            };

            const numUpdated = await WorkstationModel.update(id, updateData);
            if (numUpdated === 0) {
                return null;
            }

            return await WorkstationModel.findById(id);
        } catch (error) {
            throw new Error(`Failed to update workstation status: ${error}`);
        }
    }

    static async syncWorkstation(id: string): Promise<{ status: boolean; last_sync: string }> {
        try {
            const workstation = await WorkstationModel.findById(id);
            if (!workstation) {
                throw new Error('Workstation not found');
            }

            const lastSync = new Date().toISOString();
            await WorkstationModel.update(id, {
                last_sync: lastSync,
                last_activity: lastSync
            });

            return {
                status: true,
                last_sync: lastSync
            };
        } catch (error) {
            throw error;
        }
    }
}