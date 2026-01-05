/**
 * Inventory Workflow Services
 * Export all services for easy importing
 */

import productService from './product.service';
import supplierService from './supplier.service';
import purchaseOrderService from './purchase-order.service';
import stockMovementService from './stock-movement.service';
import saleService from './sale.service';
import inventoryService from './inventory.service';

export { productService, supplierService, purchaseOrderService, stockMovementService, saleService, inventoryService };

// Re-export for convenience
export const inventoryWorkflow = {
    product: productService,
    supplier: supplierService,
    purchaseOrder: purchaseOrderService,
    stockMovement: stockMovementService,
    sale: saleService,
    inventory: inventoryService,
};

export default inventoryWorkflow;
