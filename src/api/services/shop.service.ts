import { ClientService } from "./client.service";
import { ShopModel } from "../models/shop.model";
import { ClientModel } from "../models/client.model";
import { SubscriptionModel } from "../models/subscription.model";

export class ShopService {

	static async getAllShops(query: any = {}): Promise<IShop[]> {
		try {
			const conditions: any = {};

			if (query.clientId) {
				conditions.clientId = query.clientId;
			}

			if (query.status) {
				conditions.status = query.status;
			}

			if (query.shopCode) {
				conditions.shopCode = query.shopCode;
			}

			if (query.city) {
				conditions.city = query.city;
			}

			if (query.state) {
				conditions.state = query.state;
			}

			if (query.country) {
				conditions.country = query.country;
			}

			if (query.name) {
				conditions.name = query.name;
			}

			return await ShopModel.findAll(conditions);
		} catch (error: any) {
			throw new Error(`Failed to retrieve shops: ${error.message}`);
		}
	}

	static async getShopByClientId(id: string): Promise<IShop[]> {
		if (!id) {
			throw new Error('Client ID is required');
		}

		const shops = await ShopModel.findByClientId(id);
		return shops;
	}

	static async getShopById(id: string): Promise<IShop> {
		if (!id) {
			throw new Error('Shop ID is required');
		}

		const shop = await ShopModel.findById(id);
		if (!shop) {
			throw new Error('Shop not found');
		}

		return shop;
	}

	static async createShop(data: CreateShopRequest): Promise<IShop> {
		const validationError = ClientService.validateRequired(data, ['clientId', 'shopCode', 'name']);
		if (validationError) {
			throw new Error(validationError);
		}

		const client = await ClientModel.findClientId(data.clientId);
		if (!client) {
			throw new Error('Client not found');
		}

		const existingShops = await ShopModel.findByClientIdAndShopCode(data.clientId, data.shopCode);
		if (existingShops.length > 0) {
			throw new Error('Shop code already exists for this client');
		}

		const subscription = await SubscriptionModel.findActiveByClientId(data.clientId);
		if (subscription) {
			const plan = await SubscriptionModel.findById(subscription.planId);

			if (plan) {
				const existingShopsCount = await ShopModel.findByClientId(data.clientId);
				if (existingShopsCount.length >= plan.maxShops) {
					throw new Error(`Maximum number of shops (${plan.maxShops}) reached for current subscription plan`);
				}
			}
		}

		const shopData = ShopModel.buildShopData(data);
		return ShopModel.create(shopData);
	}

	static async updateShop(id: string, data: Partial<IShop>): Promise<IShop> {
		if (!id) {
			throw new Error('Shop ID is required');
		}

		const existingShop = await ShopModel.findById(id);
		if (!existingShop) {
			throw new Error('Shop not found');
		}

		const protectedFields = ['uuid', 'clientId', 'created_at'];
		const updateData = { ...data };

		protectedFields.forEach(field => {
			if (field in updateData) {
				delete updateData[field as keyof typeof updateData];
			}
		});

		if (updateData.shopCode && updateData.shopCode !== existingShop.shopCode) {
			const existingShops = await ShopModel.findByClientIdAndShopCode(existingShop.clientId, updateData.shopCode);
			if (existingShops.length > 0) {
				throw new Error('Shop code already exists for this client');
			}
		}

		const numUpdated = await ShopModel.update(id, updateData);
		if (numUpdated === 0) {
			throw new Error('Failed to update shop');
		}

		const updatedShop = await ShopModel.findById(id);
		if (!updatedShop) {
			throw new Error('Failed to retrieve updated shop');
		}

		return updatedShop;
	}

	static async deleteShop(id: string): Promise<{ status: boolean }> {
		if (!id) {
			throw new Error('Shop ID is required');
		}

		const existingShop = await ShopModel.findById(id);
		if (!existingShop) {
			throw new Error('Shop not found');
		}

		const numDeleted = await ShopModel.delete(id);
		if (numDeleted === 0) {
			throw new Error('Failed to delete shop');
		}

		return { status: true };
	}

	static async getShopsByClientId(clientId: string): Promise<IShop[]> {
		if (!clientId) {
			throw new Error('Client ID is required');
		}

		return await ShopModel.findByClientId(clientId);
	}

	static async getShopByCode(clientId: string, shopCode: string): Promise<IShop | null> {
		if (!clientId || !shopCode) {
			throw new Error('Client ID and Shop Code are required');
		}

		const shops = await ShopModel.findByClientIdAndShopCode(clientId, shopCode);
		return shops.length > 0 ? shops[0] : null;
	}

	static async updateShopStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<IShop> {
		if (!id || !status) {
			throw new Error('Shop ID and status are required');
		}

		const validStatuses = ['active', 'inactive', 'suspended'];
		if (!validStatuses.includes(status)) {
			throw new Error('Invalid status. Must be one of: active, inactive, suspended');
		}

		return await this.updateShop(id, { status });
	}
}