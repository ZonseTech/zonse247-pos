import { ClientService } from "./client.service";
import { ShopModel } from "../models/shop.model";
import { ClientModel } from "../models/client.model";
import { SubscriptionModel } from "../models/subscription.model";

export class ShopService {
	static async createShop(data: CreateShopRequest): Promise<IShop> {
		const validationError = ClientService.validateRequired(data, ['client_id', 'shop_code', 'name']);
		if (validationError) {
			throw new Error(validationError);
		}

		const client = await ClientModel.findById(data.client_id);
		if (!client) {
			throw new Error('Client not found');
		}

		if (client.status !== 'active') {
			throw new Error('Client must be active to create shops');
		}

		const existingShops = await ShopModel.findByClientIdAndShopCode(data.client_id, data.shop_code);
		if (existingShops.length > 0) {
			throw new Error('Shop code already exists for this client');
		}

		const activeSubscriptions = await SubscriptionModel.findActiveByClientId(data.client_id);
		if (activeSubscriptions.length > 0) {
			const subscription = activeSubscriptions[0];
			const plan = await SubscriptionModel.findById(subscription.plan_id);

			if (plan) {
				const existingShopsCount = await ShopModel.findByClientId(data.client_id);
				if (existingShopsCount.length >= plan.max_shops) {
					throw new Error(`Maximum number of shops (${plan.max_shops}) reached for current subscription plan`);
				}
			}
		}

		const shopData = ShopModel.buildShopData(data);
		return ShopModel.create(shopData);
	}
}