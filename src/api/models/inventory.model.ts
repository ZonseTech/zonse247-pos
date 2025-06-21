import { eachSeries } from 'async';
import { sealDBModel } from '../databases/local';
import { ProductModel } from './product.model';
import { INVENTORY_DB } from '../databases/local/tables';

export class InventoryModel {

    /**
     * Find a product by its ID
     */
    static async findById(productUuid: string, auth: AuthContext): Promise<Product | null> {
        return await sealDBModel.findById(INVENTORY_DB, {
            uuid: productUuid,
            clientUuid: auth.clientUuid,
            shopUuid: auth.shopUuid
        });
    }

    /**
     * Find products with specified criteria
     */
    static async find(criteria: Record<string, any>, auth: AuthContext): Promise<Product[]> {
        const baseCriteria = {
            ...criteria,
            clientUuid: auth.clientUuid,
            shopUuid: auth.shopUuid
        };

        return await sealDBModel.find(INVENTORY_DB, baseCriteria);
    }

    /**
     * Find active products (non-voided)
     */
    static async findActive(auth: AuthContext): Promise<Product[]> {
        return await sealDBModel.find(INVENTORY_DB, {
            status: { $ne: 'void' },
            clientUuid: auth.clientUuid,
            shopUuid: auth.shopUuid
        });
    }

    /**
     * Find product by SKU/barcode
     */
    static async findBySku(sku: string, auth: AuthContext): Promise<Product | null> {
        const products = await sealDBModel.find(INVENTORY_DB, {
            barcode: parseInt(sku),
            clientUuid: auth.clientUuid,
            shopUuid: auth.shopUuid
        });

        return products.length > 0 ? products[0] : null;
    }

    /**
     * Insert a new product
     */
    static async insert(productData: Record<string, any>): Promise<void> {
        await sealDBModel.insert(INVENTORY_DB, productData);
    }

    /**
     * Update an existing product
     */
    static async update(productId: string, updateData: Record<string, any>): Promise<number> {
        return await sealDBModel.update(INVENTORY_DB, productId, updateData);
    }

    /**
     * Update product with user tracking
     */
    static async updateWithUser(productId: string, updateData: Record<string, any>, auth: AuthContext): Promise<number> {
        const dataWithUser = {
            ...updateData,
            userUuid: auth.userUuid
        };

        return await sealDBModel.update(INVENTORY_DB, productId, dataWithUser);
    }

    /**
     * Void a product (soft delete)
     */
    static async void(productId: string, auth: AuthContext): Promise<number> {
        return await sealDBModel.update(INVENTORY_DB, productId, {
            status: 'void',
            userUuid: auth.userUuid
        });
    }

    /**
     * Delete a product (hard delete)
     */
    static async delete(productId: string): Promise<number> {
        return await sealDBModel.delete(INVENTORY_DB, productId);
    }

    /**
     * Update product quantity
     */
    static async updateQuantity(productId: string, quantity: number, auth: AuthContext): Promise<number> {
        return await sealDBModel.update(INVENTORY_DB, productId, {
            quantity: quantity,
            userUuid: auth.userUuid
        });
    }

    /**
     * Decrement inventory for multiple products (batch operation)
     */
    static async decrementInventory(products: CartItem[], auth: AuthContext): Promise<void> {
        return new Promise((resolve, reject) => {
            eachSeries(
                products,
                async (transactionProduct: CartItem, callback: (err?: Error) => void) => {
                    try {
                        const product = await sealDBModel.findById(INVENTORY_DB, {
                            uuid: transactionProduct.productUuid,
                            clientUuid: auth.clientUuid,
                            shopUuid: auth.shopUuid
                        });

                        if (!product || !product.quantity) {
                            callback();
                        } else {
                            const updatedQuantity =
                                parseInt(product.quantity.toString()) -
                                parseInt(transactionProduct.quantity.toString());

                            await sealDBModel.update(INVENTORY_DB, product.uuid, {
                                quantity: updatedQuantity,
                                userId: auth.userUuid
                            });
                            callback();
                        }
                    } catch (error) {
                        callback(error as Error);
                    }
                },
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    static async create(productData: Record<string, any>, auth: AuthContext): Promise<void> {
        const productModel = ProductModel.create(productData, auth);

        if (!productModel.validate()) {
            throw new Error('Product validation failed');
        }

        await this.insert(productModel.toJSON());
    }

    static async updateWithValidation(productUuid: string, productData: Record<string, any>, auth: AuthContext): Promise<number> {
        const productModel = ProductModel.fromParams(productData, auth);

        if (!productModel.validate()) {
            throw new Error('Product validation failed');
        }

        const existingProduct = await this.findById(productUuid, auth);
        if (!existingProduct) {
            throw new Error('Product not found or access denied');
        }

        return await this.update(productUuid, productModel.toJSON());
    }

    static async voidWithCheck(productId: string, auth: AuthContext): Promise<number> {
        const existingProduct = await this.findById(productId, auth);
        if (!existingProduct) {
            throw new Error('Product not found or access denied');
        }

        return await this.void(productId, auth);
    }

    /**
     * Delete product with existence check
     */
    static async deleteWithCheck(productId: string, auth: AuthContext): Promise<number> {
        const existingProduct = await this.findById(productId, auth);
        if (!existingProduct) {
            throw new Error('Product not found or access denied');
        }

        return await this.delete(productId);
    }

    /**
     * Check if product exists and user has access
     */
    static async exists(productId: string, auth: AuthContext): Promise<boolean> {
        const product = await this.findById(productId, auth);
        return product !== null;
    }

    /**
     * Get product count for a shop
     */
    static async getCount(auth: AuthContext, includeVoided: boolean = false): Promise<number> {
        const criteria: Record<string, any> = {
            clientUuid: auth.clientUuid,
            shopUuid: auth.shopUuid
        };

        if (!includeVoided) {
            criteria.status = { $ne: 'void' };
        }

        const products = await this.find(criteria, auth);
        return products.length;
    }
}