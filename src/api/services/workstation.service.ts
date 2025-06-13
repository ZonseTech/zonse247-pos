import { ClientService } from "./client.service";
import { ShopModel } from "../models/shop.model";
import { WorkstationModel } from "../models/work-station.model";

export class WorkstationService {
    static async createWorkstation(data: CreateWorkstationRequest): Promise<Workstation> {
        const validationError = ClientService.validateRequired(data, ['shop_id', 'client_id', 'till_name', 'till_number']);
        if (validationError) {
            throw new Error(validationError);
        }

        const shop = await ShopModel.findById(data.shop_id);
        if (!shop) {
            throw new Error('Shop not found');
        }

        if (shop.client_id !== data.client_id) {
            throw new Error('Client does not own this shop');
        }

        const existingWorkstations = await WorkstationModel.findByShopIdAndTillNumber(data.shop_id, data.till_number);
        if (existingWorkstations.length > 0) {
            throw new Error('Till number already exists for this shop');
        }

        if (data.is_primary) {
            const primaryWorkstations = await WorkstationModel.findPrimaryByShopId(data.shop_id);
            for (const workstation of primaryWorkstations) {
                await WorkstationModel.update(workstation.uuid, { is_primary: false });
            }
        }

        const workstationData = WorkstationModel.buildWorkstationData(data);
        return WorkstationModel.create(workstationData);
    }
}