import { TableColumn } from 'react-data-table-component';
import { Eye } from 'lucide-react';
import { formatCurrency } from '../../../utils';

interface GetValuationColumnsOptions {
    getItemDisplayValue: (row: InventoryValuationItem) => number;
    openDrillDown: (row: InventoryValuationItem) => void;
}

export const getValuationTableColumns = ({
    getItemDisplayValue,
    openDrillDown,
}: GetValuationColumnsOptions): TableColumn<InventoryValuationItem>[] => [
        {
            name: 'Product',
            sortable: true,
            minWidth: '220px',
            selector: (row) => row.productName,
            cell: (row) => (
                <div className="py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {row.productName}
                    </p>
                    {row.sku && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {row.sku}
                        </p>
                    )}
                </div>
            ),
        },
        {
            name: 'Qty',
            sortable: true,
            width: '90px',
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
            width: '120px',
            right: true,
            selector: (row) => row.averageCost,
            cell: (row) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatCurrency(row.averageCost, true)}
                </span>
            ),
        },
        {
            name: 'Value',
            sortable: true,
            width: '140px',
            right: true,
            selector: (row) => getItemDisplayValue(row),
            cell: (row) => (
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(getItemDisplayValue(row), true)}
                </span>
            ),
        },
        {
            name: 'Method',
            width: '100px',
            center: true,
            cell: (row) => {
                const label = row.costingMethod === 'WEIGHTED_AVERAGE' ? 'WAC'
                    : row.costingMethod === 'FIFO' ? 'FIFO' : 'LIFO';
                return (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        {label}
                    </span>
                );
            },
        },
        {
            name: '',
            width: '60px',
            center: true,
            cell: (row) => (
                <button
                    onClick={() => openDrillDown(row)}
                    className="p-1.5 text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="View details"
                >
                    <Eye className="w-4 h-4" />
                </button>
            ),
        },
    ];
