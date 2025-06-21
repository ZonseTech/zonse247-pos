import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';

const router = Router();

router.get('/', InventoryController.getProducts);
router.post('/product', InventoryController.createProduct);
router.post('/product/sku', InventoryController.findProductBySku);
router.get('/products-only', InventoryController.getProductsOnly);
router.get('/product/:productId', InventoryController.getProduct);
router.put('/product/:productId', InventoryController.updateProduct);
router.put('/product-void/:productId', InventoryController.voidProduct);
router.delete('/product/:productId', InventoryController.deleteProduct);

export default router;
