export const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

export const formatDate = (d?: Date | string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const calculateSubtotal = (items: { quantity: number; unitPrice: number }[]) =>
    items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

export const getVariantDisplayName = (variant?: { variantName?: string; product?: { name?: string } }) => {
    if (!variant) return 'Unknown';
    const pName = variant.product?.name || '';
    const vName = variant.variantName || '';
    return pName
        ? `${pName}${vName && vName !== 'Default' ? ` — ${vName}` : ''}`
        : vName || 'Unknown';
};
