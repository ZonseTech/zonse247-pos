import { TableColumn } from 'react-data-table-component';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Flex, Text, Badge } from '@radix-ui/themes';
import dayjs from 'dayjs';
import { getMovementDisplayType, isCorrectableMovement } from '../../../utils/stock-movement.helper';

const typeColorMap: Record<string, 'green' | 'red' | 'sky' | 'yellow' | 'purple' | 'pink' | 'orange' | 'gray' | 'indigo' | 'teal' | 'cyan' | 'violet'> = {
    PURCHASE_RECEIPT: 'green',
    SALE: 'red',
    RETURN: 'sky',
    ADJUSTMENT: 'yellow',
    TRANSFER_IN: 'purple',
    TRANSFER_OUT: 'pink',
    DAMAGE: 'orange',
    EXPIRY: 'gray',
    OPENING_BALANCE: 'indigo',
    RETURN_TO_SUPPLIER: 'teal',
    STOCK_COUNT: 'cyan',
    CORRECTION: 'violet',
};

interface StockMovementTableOptions {
    // Shown as a "Correct" action on correctable movements when provided
    onCorrect?: (movement: StockMovement) => void;
    correctedIds?: Set<string>;
}

export const getStockMovementTableColumns = (options: StockMovementTableOptions = {}): TableColumn<StockMovement>[] => [
    {
        name: 'Date',
        selector: (row) => String(row.movementDate),
        cell: (row) => (
            <Flex direction="column">
                <Text size="2">{dayjs(row.movementDate).format('MMM D, YYYY')}</Text>
                <Text size="1" color="gray">{dayjs(row.movementDate).format('HH:mm')}</Text>
            </Flex>
        ),
        sortable: true,
    },
    {
        name: 'Type',
        cell: (row) => (
            <Badge
                variant="soft"
                color={typeColorMap[getMovementDisplayType(row)] || 'gray'}
                size="1"
            >
                {getMovementDisplayType(row).replace(/_/g, ' ')}
            </Badge>
        ),
        sortable: true,
    },
    {
        name: 'Product',
        selector: (row) => row.inventory?.product?.name || row.product?.name || 'Unknown',
        cell: (row) => {
            const productName = row.inventory?.product?.name || row.product?.name || 'Unknown';
            const variantName = row.inventory?.variant?.variantName;
            return (
                <Flex direction="column">
                    <Text size="2" weight="medium">{productName}</Text>
                    {variantName && (
                        <Text size="1" color="gray">{variantName}</Text>
                    )}
                </Flex>
            );
        },
        grow: 2,
    },
    {
        name: 'Movement',
        cell: (row) => {
            const isIncrease = row.direction === 'IN';
            const Icon = isIncrease ? TrendingUp : row.direction === 'OUT' ? TrendingDown : RefreshCw;
            const color: 'green' | 'red' | 'yellow' = isIncrease ? 'green' : row.direction === 'OUT' ? 'red' : 'yellow';

            return (
                <Flex align="center" gap="2">
                    <Icon className="w-4 h-4" />
                    <Text size="2" weight="medium" color={color}>
                        {isIncrease ? '+' : row.direction === 'OUT' ? '-' : '±'}
                        {row.quantity}
                    </Text>
                </Flex>
            );
        },
        sortable: true,
    },
    {
        name: 'Before',
        selector: (row) => row.previousQuantity,
        cell: (row) => <Text size="2" color="gray">{row.previousQuantity}</Text>,
        sortable: true,
        right: true,
    },
    {
        name: 'After',
        selector: (row) => row.newQuantity,
        cell: (row) => <Text size="2" weight="medium">{row.newQuantity}</Text>,
        sortable: true,
        right: true,
    },
    {
        name: 'Unit Cost',
        selector: (row) => row.unitCost,
        cell: (row) => (
            <Text size="2">
                {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'MWK',
                }).format(row.unitCost)}
            </Text>
        ),
        sortable: true,
        right: true,
    },
    {
        name: 'Reference',
        selector: (row) => row.referenceNumber || '-',
        cell: (row) => <Text size="1" color="gray">{row.referenceNumber || '-'}</Text>,
    },
    {
        name: 'Notes',
        selector: (row) => row.notes || '-',
        cell: (row) => (
            <Text size="1" color="gray" truncate title={row.notes}>
                {row.notes || '-'}
            </Text>
        ),
        grow: 1,
    },
    ...(options.onCorrect
        ? [
            {
                name: '',
                width: '110px',
                cell: (row: StockMovement) =>
                    options.correctedIds?.has(row.id) ? (
                        <Text size="1" color="gray">Corrected</Text>
                    ) : isCorrectableMovement(row) ? (
                        <button
                            type="button"
                            onClick={() => options.onCorrect?.(row)}
                            className="text-xs font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
                        >
                            Correct
                        </button>
                    ) : null,
            } as TableColumn<StockMovement>,
        ]
        : []),
];
