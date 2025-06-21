import { InventoryModel } from '../models/inventory.model';
import { CategoryService } from './category.service';

export class InventoryService {

    static async getProductById(productId: string, auth: AuthContext): Promise<Product | null> {
        return await InventoryModel.findById(productId, auth);
    }

    static async getActiveProducts(auth: AuthContext): Promise<Product[]> {
        return await InventoryModel.findActive(auth);
    }

    static async getProductsWithCategories(auth: AuthContext): Promise<Product[]> {
        const categories: Category[] = await CategoryService.getAllCategories(auth);

        const categoryMap = new Map<string, Category>();
        categories.forEach((category) => {
            categoryMap.set(category.uuid.toString(), category);
            if (category.name) {
                categoryMap.set(category.name as string, category);
            }
        });

        const products: Product[] = await InventoryModel.findActive(auth);

        const enhancedProducts = products.map((product) => {
            if (product.categoryUuid) {
                const categoryKey = product.categoryUuid.toString();
                if (categoryMap.has(categoryKey)) {
                    product.categoryDetails = categoryMap.get(categoryKey);
                }
            }
            return product;
        });

        return enhancedProducts;
    }

    static async createProduct(productData: Record<string, any>, auth: AuthContext): Promise<void> {
        await InventoryModel.create(productData, auth);
    }

    static async updateProduct(productId: string, productData: Record<string, any>, auth: AuthContext): Promise<number> {
        return await InventoryModel.updateWithValidation(productId, productData, auth);
    }

    static async voidProduct(productId: string, auth: AuthContext): Promise<number> {
        return await InventoryModel.voidWithCheck(productId, auth);
    }

    static async deleteProduct(productId: string, auth: AuthContext): Promise<number> {
        return await InventoryModel.deleteWithCheck(productId, auth);
    }

    static async findProductBySku(sku: string, auth: AuthContext): Promise<Product | null> {
        return await InventoryModel.findBySku(sku, auth);
    }

    static async decrementInventory(products: CartItem[], auth: AuthContext): Promise<void> {
        return await InventoryModel.decrementInventory(products, auth);
    }

    // Additional service methods that leverage the model

    static async getProductCount(auth: AuthContext, includeVoided: boolean = false): Promise<number> {
        return await InventoryModel.getCount(auth, includeVoided);
    }

    static async productExists(productId: string, auth: AuthContext): Promise<boolean> {
        return await InventoryModel.exists(productId, auth);
    }

    static async updateProductQuantity(productId: string, quantity: number, auth: AuthContext): Promise<number> {
        const exists = await InventoryModel.exists(productId, auth);
        if (!exists) {
            throw new Error('Product not found or access denied');
        }

        return await InventoryModel.updateQuantity(productId, quantity, auth);
    }

    static async getProductsByCategory(categoryId: string, auth: AuthContext): Promise<Product[]> {
        return await InventoryModel.find({ categoryId }, auth);
    }

    static async getProductsByStatus(status: string, auth: AuthContext): Promise<Product[]> {
        return await InventoryModel.find({ status }, auth);
    }

    static async getAllProducts(auth: AuthContext, includeVoided: boolean = false): Promise<Product[]> {
        if (includeVoided) {
            return await InventoryModel.find({}, auth);
        }
        return await InventoryModel.findActive(auth);
    }

    static async searchProducts(searchTerm: string, auth: AuthContext): Promise<Product[]> {
        // This would require the model to support text search - adding as example
        const products = await InventoryModel.findActive(auth);

        // Basic client-side filtering - in production, this should be done at DB level
        return products.filter(product =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode?.toString().includes(searchTerm)
        );
    }

    static async bulkUpdateProducts(updates: Array<{ productId: string, data: Record<string, any> }>, auth: AuthContext): Promise<void> {
        const updatePromises = updates.map(async ({ productId, data }) => {
            return await InventoryModel.updateWithValidation(productId, data, auth);
        });

        await Promise.all(updatePromises);
    }

    static async getProductsWithLowStock(threshold: number, auth: AuthContext): Promise<Product[]> {
        const products = await InventoryModel.findActive(auth);

        return products.filter(product =>
            product.quantity !== undefined &&
            product.quantity !== null &&
            parseInt(product.quantity.toString()) < threshold
        );
    }

    static async adjustInventory(productId: string, adjustment: number, auth: AuthContext): Promise<number> {
        const product = await InventoryModel.findById(productId, auth);
        if (!product) {
            throw new Error('Product not found or access denied');
        }

        const currentQuantity = parseInt(product.quantity?.toString() || '0');
        const newQuantity = currentQuantity + adjustment;

        if (newQuantity < 0) {
            throw new Error('Adjustment would result in negative inventory');
        }

        return await InventoryModel.updateQuantity(productId, newQuantity, auth);
    }
}