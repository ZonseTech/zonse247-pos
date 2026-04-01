import { poStatusLabelMap } from './PurchaseOrderTableColumns';
import type { POFormItem } from './types';

export const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

export const formatDate = (d?: Date | string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const calculateTotal = (items: POFormItem[]) =>
    items.reduce((sum, item) => sum + item.orderedQuantity * item.unitPrice, 0);

const poStatusBgMap: Record<string, string> = {
    DRAFT: 'bg-gray-100 dark:bg-gray-700',
    PENDING: 'bg-yellow-100 dark:bg-yellow-900/30',
    SENT: 'bg-indigo-100 dark:bg-indigo-900/30',
    SHIPPED: 'bg-purple-100 dark:bg-purple-900/30',
    PARTIALLY_RECEIVED: 'bg-sky-100 dark:bg-sky-900/30',
    RECEIVED: 'bg-green-100 dark:bg-green-900/30',
    CANCELLED: 'bg-red-100 dark:bg-red-900/30',
};

const poStatusTextMap: Record<string, string> = {
    DRAFT: 'text-gray-800 dark:text-gray-300',
    PENDING: 'text-yellow-800 dark:text-yellow-400',
    SENT: 'text-indigo-800 dark:text-indigo-400',
    SHIPPED: 'text-purple-800 dark:text-purple-400',
    PARTIALLY_RECEIVED: 'text-sky-800 dark:text-sky-400',
    RECEIVED: 'text-green-800 dark:text-green-400',
    CANCELLED: 'text-red-800 dark:text-red-400',
};

export const poStatusConfig: Record<string, { bg: string; text: string; label: string }> = Object.fromEntries(
    Object.keys(poStatusLabelMap).map(key => [
        key,
        {
            bg: poStatusBgMap[key] || '',
            text: poStatusTextMap[key] || '',
            label: poStatusLabelMap[key as PurchaseOrderStatus],
        },
    ])
);
