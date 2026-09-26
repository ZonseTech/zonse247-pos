/**
 * Purchase requisition helper utilities
 * Mirrors the API rule: a requisition's POs may only order approved quantities not yet ordered.
 */

// Approved quantity on a line not yet covered by an active (non-cancelled) purchase order.
// `orderedQuantity` is absent from older API builds; treat that as nothing ordered yet.
export const getOutstandingQuantity = (item: PurchaseRequisitionItem): number =>
    Math.max(0, (item.approvedQuantity ?? 0) - (item.orderedQuantity ?? 0));

// Whether a purchase order can still be raised from the requisition.
export const canCreatePOFromRequisition = (requisition: PurchaseRequisitionWithItems): boolean =>
    (requisition.status === 'APPROVED' || requisition.status === 'PARTIALLY_APPROVED') &&
    requisition.items.some((item) => getOutstandingQuantity(item) > 0);
