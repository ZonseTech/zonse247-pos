import { v4 as uuidv4 } from 'uuid';
import { sealDBModel } from '../databases/local';
import { TABLE_NAMES } from '../databases/local/tables';

export class WorkstationModel {
    static async findByClientId(client_id: string): Promise<Workstation[]> {
        return sealDBModel.find(TABLE_NAMES.WORKSTATIONS, { client_id });
    }

    static async findByShopIdAndTillNumber(shop_id: string, till_number: string): Promise<Workstation[]> {
        return sealDBModel.find(TABLE_NAMES.WORKSTATIONS, { shop_id, till_number });
    }

    static async findPrimaryByShopId(shop_id: string): Promise<Workstation[]> {
        return sealDBModel.find(TABLE_NAMES.WORKSTATIONS, { shop_id, is_primary: true });
    }

    static async create(workstationData: Omit<Workstation, 'id'>): Promise<Workstation> {
        return sealDBModel.insert(TABLE_NAMES.WORKSTATIONS, workstationData);
    }

    static async update(uuid: string, updateData: Partial<Workstation>): Promise<number> {
        return sealDBModel.update(TABLE_NAMES.WORKSTATIONS, uuid, updateData);
    }

    static buildWorkstationData(data: CreateWorkstationRequest): Omit<Workstation, 'id'> {
        return {
            uuid: uuidv4(),
            shop_id: data.shop_id,
            client_id: data.client_id,
            till_name: data.till_name,
            till_number: data.till_number,
            device_id: data.device_id || '',
            device_type: data.device_type || 'desktop',
            ip_address: data.ip_address || '',
            is_primary: data.is_primary || false,
            status: 'active',
            registered_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
        };
    }
}