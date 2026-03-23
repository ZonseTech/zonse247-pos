import { TableColumn } from 'react-data-table-component';
import { Eye } from 'lucide-react';
import { IconButton, Badge } from '@radix-ui/themes';
import { formatCurrency } from '../../../utils';

interface GetValuationColumnsOptions {
    openDrillDown: (row: InventoryValuationItem) => void;
}

export const getValuationTableColumns = ({
    openDrillDown,
}: GetValuationColumnsOptions): TableColumn<InventoryValuationItem>[] => [
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
            name: 'Value',
            sortable: true,
            right: true,
            selector: (row) => row.totalValue,
            cell: (row) => (
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(row.totalValue, true)}
                </span>
            ),
        },
        {
            name: 'Method',
            center: true,
            cell: (row) => {
                const label = row.costingMethod === 'WEIGHTED_AVERAGE' ? 'WAC'
                    : row.costingMethod === 'FIFO' ? 'FIFO' : 'LIFO';
                return (
                    <Badge size="1" variant="soft">
                        {label}
                    </Badge>
                );
            },
        },
        {
            name: 'Action',
            right: true,
            cell: (row) => (
                <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    onClick={() => openDrillDown(row)}
                    title="View details"
                >
                    <Eye className="w-4 h-4" />
                </IconButton>
            ),
        },
    ];
