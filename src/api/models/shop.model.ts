import { v4 as uuidv4 } from 'uuid';
import { sealDBModel } from '../databases/local';
import { TABLE_NAMES } from '../databases/local/tables';

export class ShopModel {
    static async findByClientId(client_id: string): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, { client_id });
    }

    static async findByClientIdAndShopCode(client_id: string, shop_code: string): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, { client_id, shop_code });
    }

    static async findById(id: string): Promise<IShop | null> {
        return sealDBModel.findById(TABLE_NAMES.SHOPS, id);
    }

    static async create(shopData: Omit<IShop, 'id'>): Promise<IShop> {
        return sealDBModel.insert(TABLE_NAMES.SHOPS, shopData);
    }

    static buildShopData(data: CreateShopRequest): Omit<IShop, 'id'> {
        return {
            uuid: uuidv4(),
            client_id: data.client_id,
            shop_code: data.shop_code,
            name: data.name,
            description: data.description || '',
            address_line1: data.address_line1 || '',
            address_line2: data.address_line2 || '',
            city: data.city || '',
            state: data.state || '',
            postal_code: data.postal_code || '',
            country: data.country || '',
            phone: data.phone || '',
            email: data.email || '',
            tax_number: data.tax_number || '',
            currency_code: data.currency_code || 'MWK',
            currency_symbol: data.currency_symbol || 'MK',
            tax_rate: data.tax_rate || 0.00,
            charge_tax: data.charge_tax || false,
            receipt_footer: data.receipt_footer || '',
            logo_url: data.logo_url || '',
            status: 'active'
        };
    }
}
