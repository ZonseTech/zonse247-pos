import { sealDBModel } from '../databases/local';
import { SHOP_DB } from '../databases/local/tables';

export class ShopService {
	async getPosDetails() {
		return await sealDBModel.findAll(SHOP_DB)[0];
	}

	async verifyShopDetails(params: ShopVerificationParams) {}

	private async createOrUpdateFromServer(params: ShopVerificationParams) {}
}
