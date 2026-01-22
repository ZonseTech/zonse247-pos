import { TableColumn } from 'react-data-table-component';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';

export const getStockMovementTableColumns = (): TableColumn<StockMovement>[] => [
    {
        name: 'Date',
        selector: (row) => String(row.movementDate),
        cell: (row) => (
            <div>
                <div>{dayjs(row.movementDate).format('MMM D, YYYY')}</div>
                <div className="text-xs text-gray-500">{dayjs(row.movementDate).format('HH:mm')}</div>
            </div>
        ),
        sortable: true,
        width: '140px',
    },
    {
        name: 'Type',
        cell: (row) => {
            const typeColors: Record<StockMovementType, string> = {
                PURCHASE_RECEIPT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                SALE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                RETURN: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
                ADJUSTMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                TRANSFER_IN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                TRANSFER_OUT: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
                DAMAGE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                EXPIRY: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                STOCK_TAKE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
                PRODUCTION: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
                CONSUMPTION: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
            };
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[row.movementType]}`}>
                    {row.movementType.replace('_', ' ')}
                </span>
            );
        },
        sortable: true,
        width: '180px',
    },
    {
        name: 'Product',
        selector: (row) => row.product?.name || 'Unknown',
        grow: 2,
    },
    {
        name: 'Movement',
        cell: (row) => {
            const isIncrease = row.direction === 'IN';
            const Icon = isIncrease ? TrendingUp : row.direction === 'OUT' ? TrendingDown : RefreshCw;
            const colorClass = isIncrease ? 'text-green-600' : row.direction === 'OUT' ? 'text-red-600' : 'text-yellow-600';

            return (
                <div className={`flex items-center gap-2 font-medium ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                    <span>
                        {isIncrease ? '+' : row.direction === 'OUT' ? '-' : '±'}
                        {row.quantity}
                    </span>
                </div>
            );
        },
        sortable: true,
    },
    {
        name: 'Before',
        selector: (row) => row.previousQuantity,
        sortable: true,
        right: true,
    },
    {
        name: 'After',
        selector: (row) => row.newQuantity,
        cell: (row) => <div className="font-medium">{row.newQuantity}</div>,
        sortable: true,
        right: true,
    },
    {
        name: 'Unit Cost',
        selector: (row) => row.unitCost,
        cell: (row) => (
            <div>
                {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'MWK',
                }).format(row.unitCost)}
            </div>
        ),
        sortable: true,
        right: true,
    },
    {
        name: 'Reference',
        selector: (row) => row.referenceNumber || '-',
        cell: (row) => (
            <div className="text-xs">
                {row.referenceNumber || '-'}
            </div>
        ),
    },
    {
        name: 'Notes',
        selector: (row) => row.notes || '-',
        cell: (row) => (
            <div className="text-xs text-gray-500 truncate max-w-xs" title={row.notes}>
                {row.notes || '-'}
            </div>
        ),
        grow: 1,
    },
];
