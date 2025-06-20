import { CategoryModel } from "../models/category.model";

export class CategoryService {
    static async getAllCategories(filters: CategoryFilters): Promise<Category[]> {
        try {
            return await CategoryModel.findByClientIdAndShopId(filters.clientId, filters.shopId);
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw new Error('Failed to fetch categories');
        }
    }

    static async createCategory(
        categoryData: { name: string },
        user: AuthenticatedUser
    ): Promise<Category> {
        try {
            const createRequest: CreateCategoryRequest = {
                name: categoryData.name,
                clientId: user.clientId,
                shopId: user.shopId,
                userId: user.userId,
            };

            const validationErrors = CategoryModel.validateCreateRequest(createRequest);
            if (validationErrors.length > 0) {
                throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
            }

            const existingCategories = await CategoryModel.findByClientIdAndName(
                user.clientId,
                categoryData.name.trim()
            );

            const duplicateInShop = existingCategories.find(cat => cat.shopId === user.shopId);
            if (duplicateInShop) {
                throw new Error('Category with this name already exists in the shop');
            }

            const newCategory = CategoryModel.buildCategoryData(createRequest);
            return await CategoryModel.create(newCategory);
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    static async updateCategory(
        categoryId: string,
        updateData: UpdateCategoryDto,
        user: AuthenticatedUser
    ): Promise<void> {
        try {
            const validationErrors = CategoryModel.validateUpdateRequest(updateData);
            if (validationErrors.length > 0) {
                throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
            }

            const existingCategory = await this.getCategoryById(categoryId, {
                clientId: user.clientId,
                shopId: user.shopId
            });

            if (!existingCategory) {
                throw new Error('Category not found or access denied');
            }

            if (updateData.name && updateData.name.trim() !== existingCategory.name) {
                const existingCategories = await CategoryModel.findByClientIdAndName(
                    user.clientId,
                    updateData.name.trim()
                );

                const duplicateInShop = existingCategories.find(
                    cat => cat.shopId === user.shopId && cat.uuid !== categoryId
                );
                if (duplicateInShop) {
                    throw new Error('Category with this name already exists in the shop');
                }
            }

            const updatedCount = await CategoryModel.update(categoryId, updateData as any);
            if (updatedCount === 0) {
                throw new Error('Failed to update category - no rows affected');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }

    static async deleteCategory(
        categoryId: string,
        user: AuthenticatedUser
    ): Promise<void> {
        try {
            const existingCategory = await this.getCategoryById(categoryId, {
                clientId: user.clientId,
                shopId: user.shopId
            });

            if (!existingCategory) {
                throw new Error('Category not found or access denied');
            }

            // TODO: Add check for related entities (products, etc.)
            // const relatedProducts = await ProductModel.findByCategoryId(categoryId);
            // if (relatedProducts.length > 0) {
            //     throw new Error('Cannot delete category with associated products');
            // }

            const deletedCount = await CategoryModel.delete(categoryId);
            if (deletedCount === 0) {
                throw new Error('Failed to delete category - no rows affected');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    static async getCategoryById(
        categoryId: string,
        filters: CategoryFilters
    ): Promise<Category | null> {
        try {
            const category = await CategoryModel.findById(categoryId);

            if (!category ||
                category.clientId !== filters.clientId ||
                category.shopId !== filters.shopId) {
                return null;
            }

            return category;
        } catch (error) {
            console.error('Error fetching category by ID:', error);
            throw new Error('Failed to fetch category');
        }
    }

    static async getCategoriesByClient(clientId: string): Promise<Category[]> {
        try {
            return await CategoryModel.findByClientId(clientId);
        } catch (error) {
            console.error('Error fetching categories by client:', error);
            throw new Error('Failed to fetch categories by client');
        }
    }

    static async getCategoriesByShop(shopId: string): Promise<Category[]> {
        try {
            return await CategoryModel.findByShopId(shopId);
        } catch (error) {
            console.error('Error fetching categories by shop:', error);
            throw new Error('Failed to fetch categories by shop');
        }
    }

    static async searchCategoriesByName(
        name: string,
        filters: CategoryFilters
    ): Promise<Category[]> {
        try {
            const allCategories = await CategoryModel.findByClientIdAndShopId(
                filters.clientId,
                filters.shopId
            );

            return allCategories.filter(category =>
                category.name.toLowerCase().includes(name.toLowerCase())
            );
        } catch (error) {
            console.error('Error searching categories by name:', error);
            throw new Error('Failed to search categories');
        }
    }

    static async getUnsyncedCategories(clientId: string): Promise<Category[]> {
        try {
            return await CategoryModel.findUnsyncedByClient(clientId);
        } catch (error) {
            console.error('Error fetching unsynced categories:', error);
            throw new Error('Failed to fetch unsynced categories');
        }
    }

    static async markCategoryAsSynced(categoryId: string, user: AuthenticatedUser): Promise<void> {
        try {
            const category = await this.getCategoryById(categoryId, {
                clientId: user.clientId,
                shopId: user.shopId
            });

            if (!category) {
                throw new Error('Category not found or access denied');
            }

            const updatedCount = await CategoryModel.markAsSynced(categoryId);
            if (updatedCount === 0) {
                throw new Error('Failed to mark category as synced');
            }
        } catch (error) {
            console.error('Error marking category as synced:', error);
            throw error;
        }
    }

    static async markCategoryAsUnsynced(categoryId: string, user: AuthenticatedUser): Promise<void> {
        try {
            const category = await this.getCategoryById(categoryId, {
                clientId: user.clientId,
                shopId: user.shopId
            });

            if (!category) {
                throw new Error('Category not found or access denied');
            }

            const updatedCount = await CategoryModel.markAsUnsynced(categoryId);
            if (updatedCount === 0) {
                throw new Error('Failed to mark category as unsynced');
            }
        } catch (error) {
            console.error('Error marking category as unsynced:', error);
            throw error;
        }
    }

    static async getCategoryCount(filters?: Partial<CategoryFilters>): Promise<number> {
        try {
            const conditions = filters ? { ...filters } : {};
            return await CategoryModel.count(conditions);
        } catch (error) {
            console.error('Error getting category count:', error);
            throw new Error('Failed to get category count');
        }
    }

    static async bulkMarkAsSynced(categoryIds: string[], user: AuthenticatedUser): Promise<void> {
        try {
            const results = await Promise.allSettled(
                categoryIds.map(id => this.markCategoryAsSynced(id, user))
            );

            const failures = results.filter(result => result.status === 'rejected');
            if (failures.length > 0) {
                console.warn(`Failed to sync ${failures.length} out of ${categoryIds.length} categories`);
            }
        } catch (error) {
            console.error('Error in bulk sync operation:', error);
            throw new Error('Failed to complete bulk sync operation');
        }
    }

    static async validateCategoryAccess(
        categoryId: string,
        user: AuthenticatedUser
    ): Promise<boolean> {
        try {
            const category = await this.getCategoryById(categoryId, {
                clientId: user.clientId,
                shopId: user.shopId
            });
            return category !== null;
        } catch (error) {
            console.error('Error validating category access:', error);
            return false;
        }
    }
}