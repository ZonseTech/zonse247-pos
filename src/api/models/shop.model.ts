import { v4 as uuidv4 } from 'uuid';
import { sealDBModel } from '../databases/local';
import { TABLE_NAMES } from '../databases/local/tables';

export class ShopModel {

    static async findAll(conditions: any = {}): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, conditions);
    }

    static async findByClientId(client_id: string): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, { client_id });
    }

    static async findByShopCode(shop_code: string): Promise<IShop | null> {
        return sealDBModel.findById(TABLE_NAMES.SHOPS, { shop_code });
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

    static async update(id: string, data: Partial<IShop>): Promise<number> {
        return sealDBModel.update(TABLE_NAMES.SHOPS, id, data);
    }

    static async delete(id: string): Promise<number> {
        return sealDBModel.delete(TABLE_NAMES.SHOPS, id);
    }

    static async count(conditions: any = {}): Promise<number> {
        return sealDBModel.count(TABLE_NAMES.SHOPS, conditions);
    }

    static async findByStatus(status: string): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, { status });
    }

    static async findByCity(city: string): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, { city });
    }

    static async findByState(state: string): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, { state });
    }

    static async findByCountry(country: string): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, { country });
    }

    static async findActiveShops(): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, { status: 'active' });
    }

    static async findActiveShopsByClientId(client_id: string): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, { client_id, status: 'active' });
    }

    static async getShopsByEmailDomain(domain: string): Promise<IShop[]> {
        const allShops = await sealDBModel.findAll(TABLE_NAMES.SHOPS);
        return allShops.filter((shop: IShop) =>
            shop.email && shop.email.toLowerCase().endsWith(`@${domain.toLowerCase()}`)
        );
    }

    static async getUnsyncedShops(): Promise<IShop[]> {
        return sealDBModel.getUnsyncedRecords(TABLE_NAMES.SHOPS);
    }

    static async markAsSynced(id: string): Promise<number> {
        return sealDBModel.markAsSynced(TABLE_NAMES.SHOPS, id);
    }

    static async clearAllShops(): Promise<number> {
        return sealDBModel.clearTable(TABLE_NAMES.SHOPS);
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

    static buildUpdateData(data: Partial<IShop>): Partial<IShop> {
        const {
            uuid,
            client_id,
            created_at,
            ...updateableData
        } = data;

        return updateableData;
    }

    static validateShopData(data: Partial<IShop>): string | null {
        if (data.email && !this.isValidEmail(data.email)) {
            return 'Invalid email format';
        }

        if (data.tax_rate && (data.tax_rate < 0 || data.tax_rate > 100)) {
            return 'Tax rate must be between 0 and 100';
        }

        if (data.status && !['active', 'inactive', 'suspended'].includes(data.status)) {
            return 'Invalid status. Must be active, inactive, or suspended';
        }

        if (data.phone && data.phone.length > 20) {
            return 'Phone number too long';
        }

        if (data.shop_code && !/^[A-Za-z0-9_-]+$/.test(data.shop_code)) {
            return 'Shop code can only contain letters, numbers, hyphens, and underscores';
        }

        return null;
    }

    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static async findByEmail(email: string): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, { email });
    }

    static async findByPhone(phone: string): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, { phone });
    }

    static async findByTaxNumber(tax_number: string): Promise<IShop[]> {
        return sealDBModel.find(TABLE_NAMES.SHOPS, { tax_number });
    }

    static async findShopsWithPagination(
        conditions: any = {},
        page: number = 1,
        limit: number = 10
    ): Promise<{ shops: IShop[], total: number, page: number, limit: number }> {
        const allShops = await sealDBModel.find(TABLE_NAMES.SHOPS, conditions);
        const total = allShops.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const shops = allShops.slice(startIndex, endIndex);

        return {
            shops,
            total,
            page,
            limit
        };
    }

    static async findShopsWithSorting(
        conditions: any = {},
        sortBy: keyof IShop = 'name',
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<IShop[]> {
        const shops = await sealDBModel.find(TABLE_NAMES.SHOPS, conditions);

        return shops.sort((a: IShop, b: IShop) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];

            if (aValue === undefined && bValue === undefined) return 0;
            if (aValue === undefined) return sortOrder === 'asc' ? 1 : -1;
            if (bValue === undefined) return sortOrder === 'asc' ? -1 : 1;

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }
}