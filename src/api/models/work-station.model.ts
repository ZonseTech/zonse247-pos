import { v4 as uuidv4 } from 'uuid';
import { sealDBModel } from '../databases/local';
import { TABLE_NAMES } from '../databases/local/tables';

export class WorkstationModel {

    static async findByClientId(client_id: string): Promise<Workstation[]> {
        return sealDBModel.find(TABLE_NAMES.WORKSTATIONS, { client_id });
    }

    static async findByShopCode(shop_code: string): Promise<Workstation[]> {
        return sealDBModel.find(TABLE_NAMES.WORKSTATIONS, { shop_code });
    }

    static async findByShopCodeAndTillNumber(shop_code: string, till_number: string): Promise<Workstation[]> {
        return sealDBModel.find(TABLE_NAMES.WORKSTATIONS, { shop_code, till_number });
    }

    static async findPrimaryByShopCode(shop_code: string): Promise<Workstation[]> {
        return sealDBModel.find(TABLE_NAMES.WORKSTATIONS, { shop_code, is_primary: true });
    }

    static async findAll(): Promise<Workstation[]> {
        return sealDBModel.findAll(TABLE_NAMES.WORKSTATIONS);
    }

    static async findById(uuid: string): Promise<Workstation | null> {
        return sealDBModel.findById(TABLE_NAMES.WORKSTATIONS, uuid);
    }

    static async create(workstationData: Omit<Workstation, 'id'>): Promise<Workstation> {
        return sealDBModel.insert(TABLE_NAMES.WORKSTATIONS, workstationData);
    }

    static async update(uuid: string, updateData: Partial<Workstation>): Promise<number> {
        return sealDBModel.update(TABLE_NAMES.WORKSTATIONS, uuid, updateData);
    }

    static async delete(uuid: string): Promise<number> {
        return sealDBModel.delete(TABLE_NAMES.WORKSTATIONS, uuid);
    }

    static async count(conditions: any = {}): Promise<number> {
        return sealDBModel.count(TABLE_NAMES.WORKSTATIONS, conditions);
    }

    static buildWorkstationData(data: CreateWorkstationRequest): Omit<Workstation, 'id'> {
        return {
            uuid: uuidv4(),
            shop_code: data.shop_code,
            client_id: data.client_id,
            till_name: data.till_name,
            till_number: data.till_number,
            device_id: data.device_id || '',
            device_type: data.device_type || 'desktop',
            ip_address: data.ip_address || '',
            is_primary: data.is_primary || false,
            status: 'active',
            registered_at: new Date().toISOString(),
            last_activity: new Date().toISOString(),
            last_sync: null
        };
    }
}