import { v4 as uuidv4 } from 'uuid';
import { sealDBModel } from '../databases/local';
import { CATEGORIES_DB } from '../databases/local/tables';

export class CategoryModel {
    static async findAll(conditions: any = {}): Promise<Category[]> {
        try {
            return await sealDBModel.find(CATEGORIES_DB, conditions);
        } catch (error) {
            throw new Error(`Error finding categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async findById(id: string): Promise<Category | null> {
        try {
            return await sealDBModel.findById<Category>(CATEGORIES_DB, id);
        } catch (error) {
            throw new Error(`Error finding category by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async findByClientUuid(clientUuid: string): Promise<Category[]> {
        try {
            return await sealDBModel.find(CATEGORIES_DB, { clientUuid: clientUuid });
        } catch (error) {
            throw new Error(`Error finding categories by client ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async findByShopUuid(shopUuid: string): Promise<Category[]> {
        try {
            return await sealDBModel.find(CATEGORIES_DB, { shopUuid: shopUuid });
        } catch (error) {
            throw new Error(`Error finding categories by shop ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async findByClientUuidAndShopUuid(clientUuid: string, shopUuid: string): Promise<Category[]> {
        try {
            return await sealDBModel.find(CATEGORIES_DB, {
                clientUuid: clientUuid,
                shopUuid: shopUuid
            });
        } catch (error) {
            throw new Error(`Error finding categories by client ID and shop ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async findByName(name: string): Promise<Category[]> {
        try {
            return await sealDBModel.find(CATEGORIES_DB, { name: name });
        } catch (error) {
            throw new Error(`Error finding categories by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async findByClientUuidAndName(clientUuid: string, name: string): Promise<Category[]> {
        try {
            return await sealDBModel.find(CATEGORIES_DB, {
                clientUuid: clientUuid,
                name: name
            });
        } catch (error) {
            throw new Error(`Error finding category by client ID and name: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async findBySynced(synced: number): Promise<Category[]> {
        try {
            return await sealDBModel.find(CATEGORIES_DB, { synced: synced });
        } catch (error) {
            throw new Error(`Error finding categories by sync status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async findUnsyncedByClient(clientUuid: string): Promise<Category[]> {
        try {
            return await sealDBModel.find(CATEGORIES_DB, {
                clientUuid: clientUuid,
                synced: 0
            });
        } catch (error) {
            throw new Error(`Error finding unsynced categories by client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static buildCategoryData(data: CreateCategoryRequest): Category {
        const now = new Date();
        return {
            uuid: uuidv4(),
            name: data.name,
            clientUuid: data.clientUuid,
            shopUuid: data.shopUuid,
            userUuid: data.userUuid,
            createdAt: now,
            updatedAt: now,
            synced: 0
        };
    }

    static async create(categoryData: Category): Promise<Category> {
        try {
            return await sealDBModel.insert(CATEGORIES_DB, categoryData);
        } catch (error) {
            throw new Error(`Error creating category: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async update(id: string, updateData: Partial<Category>): Promise<number> {
        try {
            const dataWithTimestamp = {
                ...updateData,
                updatedAt: new Date(),
                synced: 0
            };
            return await sealDBModel.update(CATEGORIES_DB, id, dataWithTimestamp);
        } catch (error) {
            throw new Error(`Error updating category: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async delete(id: string): Promise<number> {
        try {
            return await sealDBModel.delete(CATEGORIES_DB, id);
        } catch (error) {
            throw new Error(`Error deleting category: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async count(conditions: any = {}): Promise<number> {
        try {
            return await sealDBModel.count(CATEGORIES_DB, conditions);
        } catch (error) {
            throw new Error(`Error counting categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async markAsSynced(id: string): Promise<number> {
        try {
            return await this.update(id, { synced: 1 });
        } catch (error) {
            throw new Error(`Error marking category as synced: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async markAsUnsynced(id: string): Promise<number> {
        try {
            return await this.update(id, { synced: 0 });
        } catch (error) {
            throw new Error(`Error marking category as unsynced: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static validateCreateRequest(data: CreateCategoryRequest): string[] {
        const errors: string[] = [];

        if (!data.name || data.name.trim().length === 0) {
            errors.push('Category name is required');
        }

        if (data.name && data.name.trim().length > 100) {
            errors.push('Category name must be less than 100 characters');
        }

        if (!data.clientUuid || data.clientUuid.trim().length === 0) {
            errors.push('Client ID is required');
        }

        if (!data.shopUuid || data.shopUuid.trim().length === 0) {
            errors.push('Shop ID is required');
        }

        if (!data.userUuid || data.userUuid.trim().length === 0) {
            errors.push('User ID is required');
        }

        return errors;
    }

    static validateUpdateRequest(data: UpdateCategoryDto): string[] {
        const errors: string[] = [];

        if (data.name !== undefined) {
            if (!data.name || data.name.trim().length === 0) {
                errors.push('Category name cannot be empty');
            }

            if (data.name && data.name.trim().length > 100) {
                errors.push('Category name must be less than 100 characters');
            }
        }

        if (data.synced !== undefined && ![0, 1].includes(data.synced)) {
            errors.push('Synced status must be 0 or 1');
        }

        return errors;
    }
}