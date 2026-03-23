import { TableColumn } from 'react-data-table-component';
import { formatCurrency } from '../../../utils';

const STATUS_BADGE_CLASSES: Record<string, string> = {
    active: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    slow: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    dead: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

export const getAgingTableColumns = (): TableColumn<InventoryAgingItem>[] => [
    {
        name: 'Product',
        sortable: true,
        selector: (row) => row.productName,
        cell: (row) => (
            <div className="py-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {row.productName}
                    {row.variantName && row.variantName !== 'Default' && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">– {row.variantName}</span>
                    )}
                </p>
                {row.sku && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{row.sku}</p>
                )}
            </div>
        ),
    },
    {
        name: 'Qty',
        sortable: true,
        right: true,
        selector: (row) => row.availableQuantity,
        cell: (row) => (
            <span className="text-sm font-medium text-gray-900 dark:text-white">
                {row.availableQuantity.toLocaleString()}
            </span>
        ),
    },
    {
        name: 'Avg Cost',
        sortable: true,
        right: true,
        selector: (row) => row.averageCost,
        cell: (row) => (
            <span className="text-sm text-gray-700 dark:text-gray-300">
                {formatCurrency(row.averageCost, true)}
            </span>
        ),
    },
    {
        name: 'Stock Value',
        sortable: true,
        right: true,
        selector: (row) => row.stockValue,
        cell: (row) => (
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(row.stockValue, true)}
            </span>
        ),
    },
    {
        name: 'Days Idle',
        sortable: true,
        right: true,
        selector: (row) => row.daysSinceLastSale ?? 9999,
        cell: (row) => (
            <span className={`text-sm font-medium ${row.daysSinceLastSale === null
                ? 'text-gray-400 dark:text-gray-500'
                : row.daysSinceLastSale > 180
                    ? 'text-red-600 dark:text-red-400'
                    : row.daysSinceLastSale > 90
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-gray-700 dark:text-gray-300'
                }`}>
                {row.daysSinceLastSale !== null ? row.daysSinceLastSale : 'Never'}
            </span>
        ),
    },
    {
        name: 'Last Sale',
        sortable: true,
        selector: (row) => row.lastSoldAt ? new Date(row.lastSoldAt).getTime() : 0,
        cell: (row) => (
            <span className="text-xs text-gray-500 dark:text-gray-400">
                {row.lastSoldAt ? new Date(row.lastSoldAt).toLocaleDateString() : '—'}
            </span>
        ),
    },
    {
        name: 'Status',
        center: true,
        cell: (row) => (
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${STATUS_BADGE_CLASSES[row.status] || ''}`}>
                {row.status}
            </span>
        ),
    },
];
