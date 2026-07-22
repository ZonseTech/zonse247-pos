/**
 * Payment method hierarchy helpers.
 *
 * Payment methods can have a parent (e.g. "POS" and "Bank Transfer" both have
 * parent "Bank"). Parent-only nodes are never themselves used as a
 * SalePayment.paymentMethodId - only leaves are - so anywhere a payment
 * method needs to be picked/filtered by, only leaves should be offered.
 */
export const getLeafPaymentMethods = (methods: PaymentMethod[]): PaymentMethod[] => {
    const parentIds = new Set(methods.map(m => m.parentMethodId).filter(Boolean));
    return methods.filter(m => !parentIds.has(m.methodId));
};
