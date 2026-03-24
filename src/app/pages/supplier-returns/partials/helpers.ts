export const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

export const formatDate = (d?: Date | string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const calculateTotal = (items: { returnQuantity: number; unitCost: number }[]) =>
    items.reduce((sum, item) => sum + item.returnQuantity * item.unitCost, 0);

export const getVariantDisplayName = (variant?: { variantName?: string; sku?: string | null; product?: { name?: string } }) => {
    if (!variant) return '—';
    const pName = variant.product?.name || '';
    const vName = variant.variantName || '';
    const sku = variant.sku ? ` (${variant.sku})` : '';
    return pName ? `${pName} - ${vName}${sku}` : `${vName}${sku}` || '—';
};
