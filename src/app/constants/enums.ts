/**
 * Shared Enums
 * Aligned with zonse247-pos-api v1.6.1 Prisma enums
 * Single source of truth for all status/type constants across components
 */

// ─── Purchase Requisition ───────────────────────────────────────────────────

export const RequisitionStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    PARTIALLY_APPROVED: 'PARTIALLY_APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
} as const;
export type RequisitionStatus = (typeof RequisitionStatus)[keyof typeof RequisitionStatus];

// ─── Purchase Order ─────────────────────────────────────────────────────────

export const PurchaseOrderStatus = {
    PENDING: 'PENDING',
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    SHIPPED: 'SHIPPED',
    PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
    RECEIVED: 'RECEIVED',
    CANCELLED: 'CANCELLED',
} as const;
export type PurchaseOrderStatus = (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus];

// ─── Goods Receipt Note (GRN) ──────────────────────────────────────────────

export const GRNStatus = {
    DRAFT: 'DRAFT',
    VERIFIED: 'VERIFIED',
    POSTED: 'POSTED',
    CANCELLED: 'CANCELLED',
} as const;
export type GRNStatus = (typeof GRNStatus)[keyof typeof GRNStatus];

// ─── Supplier Invoice ──────────────────────────────────────────────────────

export const InvoiceStatus = {
    PENDING: 'PENDING',
    PARTIALLY_PAID: 'PARTIALLY_PAID',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED',
    DISPUTED: 'DISPUTED',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

// ─── Payment Terms ─────────────────────────────────────────────────────────

export const PaymentTerms = {
    CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
    NET_15: 'NET_15',
    NET_30: 'NET_30',
    NET_60: 'NET_60',
    NET_90: 'NET_90',
} as const;
export type PaymentTerms = (typeof PaymentTerms)[keyof typeof PaymentTerms];

// ─── Supplier Status ───────────────────────────────────────────────────────

export const SupplierStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
} as const;
export type SupplierStatus = (typeof SupplierStatus)[keyof typeof SupplierStatus];

// ─── Supplier Payment ──────────────────────────────────────────────────────

export const PaymentStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
    CANCELLED: 'CANCELLED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// ─── Supplier Return ───────────────────────────────────────────────────────

export const SupplierReturnStatus = {
    DRAFT: 'DRAFT',
    APPROVED: 'APPROVED',
    SHIPPED: 'SHIPPED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;
export type SupplierReturnStatus = (typeof SupplierReturnStatus)[keyof typeof SupplierReturnStatus];

// ─── Credit Note ───────────────────────────────────────────────────────────

export const CreditNoteStatus = {
    PENDING: 'PENDING',
    APPLIED: 'APPLIED',
    CANCELLED: 'CANCELLED',
} as const;
export type CreditNoteStatus = (typeof CreditNoteStatus)[keyof typeof CreditNoteStatus];

// ─── Stock Movement ────────────────────────────────────────────────────────

export const StockMovementType = {
    PURCHASE_RECEIPT: 'PURCHASE_RECEIPT',
    SALE: 'SALE',
    RETURN: 'RETURN',
    ADJUSTMENT: 'ADJUSTMENT',
    TRANSFER_IN: 'TRANSFER_IN',
    TRANSFER_OUT: 'TRANSFER_OUT',
    DAMAGE: 'DAMAGE',
    EXPIRY: 'EXPIRY',
    OPENING_BALANCE: 'OPENING_BALANCE',
    RETURN_TO_SUPPLIER: 'RETURN_TO_SUPPLIER',
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

// ─── Stock Reference Type ──────────────────────────────────────────────────

export const StockReferenceType = {
    PURCHASE_ORDER: 'PURCHASE_ORDER',
    GOODS_RECEIPT: 'GOODS_RECEIPT',
    SALE: 'SALE',
    RETURN: 'RETURN',
    ADJUSTMENT: 'ADJUSTMENT',
    TRANSFER: 'TRANSFER',
    OPENING_BALANCE: 'OPENING_BALANCE',
    SUPPLIER_RETURN: 'SUPPLIER_RETURN',
} as const;
export type StockReferenceType = (typeof StockReferenceType)[keyof typeof StockReferenceType];

// ─── Costing Method ────────────────────────────────────────────────────────

export const CostingMethod = {
    WEIGHTED_AVERAGE: 'WEIGHTED_AVERAGE',
    FIFO: 'FIFO',
    LIFO: 'LIFO',
} as const;
export type CostingMethod = (typeof CostingMethod)[keyof typeof CostingMethod];

// ─── Sale Status ───────────────────────────────────────────────────────────

export const SaleStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    VOIDED: 'VOIDED',
    REFUNDED: 'REFUNDED',
    PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;
export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];

// ─── Inventory Status ──────────────────────────────────────────────────────

export const InventoryStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DISCONTINUED: 'discontinued',
    OUT_OF_STOCK: 'out_of_stock',
} as const;
export type InventoryStatus = (typeof InventoryStatus)[keyof typeof InventoryStatus];

// ─── Barcode ───────────────────────────────────────────────────────────────

export const BarcodeType = {
    EAN13: 'EAN13',
    EAN8: 'EAN8',
    UPCA: 'UPCA',
    UPCE: 'UPCE',
    CODE39: 'CODE39',
    CODE128: 'CODE128',
    QR: 'QR',
    CUSTOM: 'CUSTOM',
} as const;
export type BarcodeType = (typeof BarcodeType)[keyof typeof BarcodeType];

export const BarcodeSource = {
    MANUFACTURER: 'MANUFACTURER',
    SUPPLIER: 'SUPPLIER',
    STORE: 'STORE',
    BUNDLE: 'BUNDLE',
    PACKAGING: 'PACKAGING',
    CUSTOM: 'CUSTOM',
} as const;
export type BarcodeSource = (typeof BarcodeSource)[keyof typeof BarcodeSource];

// ─── Inventory Filter ──────────────────────────────────────────────────────

export const InventoryFilter = {
    ALL: 'all',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    NEW: 'new',
    NEW_STOCK: 'new-stock',
    IN_STOCK: 'in-stock',
    LOW_STOCK: 'low-stock',
    OUT_OF_STOCK: 'out-of-stock',
    EXPIRING_SOON: 'expiring-soon',
    EXPIRED: 'expired',
} as const;
export type InventoryFilter = (typeof InventoryFilter)[keyof typeof InventoryFilter];
