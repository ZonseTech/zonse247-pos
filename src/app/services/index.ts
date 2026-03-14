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
import barcodeScannerService from './barcode-scanner.service';
import mraComplianceService from './mra-compliance.service';

// Re-export live API utilities for centralized API access
export {
    liveApi,
    getLiveApiUrl,
    isLiveApiConfigured,
    getTenantId,
    getAuthToken,
    getAuthHeaders,
    isLiveServerAvailable,
} from './live-api.service';

export {
    productService,
    supplierService,
    purchaseOrderService,
    stockMovementService,
    saleService,
    inventoryService,
    barcodeScannerService,
    mraComplianceService,
};

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
