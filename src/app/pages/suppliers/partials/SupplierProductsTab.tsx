import { FC } from 'react';
import { Package } from 'lucide-react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Box, Text } from '@radix-ui/themes';
import dayjs from 'dayjs';
import TableSkeleton from '../../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../../components/TableEmptyState';
import { formatCurrencyShort } from '../../../utils';

interface SupplierProductsTabProps {
    products: SupplierProductHistoryItem[];
    isLoading: boolean;
}

const columns: TableColumn<SupplierProductHistoryItem>[] = [
    {
        name: 'Product',
        cell: (row) => (
            <Box py="2" minWidth="0">
                <Text as="p" size="2" weight="medium" truncate className="text-gray-900 dark:text-gray-100">
                    {row.productName}
                </Text>
                <Text as="p" size="1" color="gray" truncate>
                    {row.variantName}{row.sku ? ` · ${row.sku}` : ''}
                </Text>
            </Box>
        ),
        sortable: true,
        grow: 2,
        minWidth: '200px',
    },
    {
        name: 'Ordered',
        selector: (row) => row.totalOrdered,
        cell: (row) => (
            <Text size="2" className="text-gray-700 dark:text-gray-300">
                {row.totalOrdered} {row.unit}
            </Text>
        ),
        sortable: true,
        right: true,
    },
    {
        name: 'Received',
        selector: (row) => row.totalReceived,
        cell: (row) => (
            <Text size="2" className="text-gray-700 dark:text-gray-300">
                {row.totalReceived} {row.unit}
            </Text>
        ),
        sortable: true,
        right: true,
    },
    {
        name: 'Last Price',
        selector: (row) => row.lastUnitPrice,
        cell: (row) => (
            <Text size="2" weight="medium" className="text-gray-900 dark:text-gray-100">
                {formatCurrencyShort(row.lastUnitPrice)}
            </Text>
        ),
        sortable: true,
        right: true,
    },
    {
        name: 'Last Ordered',
        selector: (row) => dayjs(row.lastOrderDate).valueOf(),
        cell: (row) => (
            <Box>
                <Text as="p" size="2" color="gray">
                    {dayjs(row.lastOrderDate).format('MMM D, YYYY')}
                </Text>
                <Text as="p" size="1" color="gray">
                    {row.lastPoNumber}
                </Text>
            </Box>
        ),
        sortable: true,
    },
    {
        name: 'Orders',
        selector: (row) => row.orderCount,
        cell: (row) => (
            <Text size="2" className="text-gray-700 dark:text-gray-300">
                {row.orderCount}
            </Text>
        ),
        sortable: true,
        right: true,
        width: '100px',
    },
];

const SupplierProductsTab: FC<SupplierProductsTabProps> = ({ products, isLoading }) => (
    <DataTable
        columns={columns}
        data={products}
        progressPending={isLoading}
        progressComponent={<TableSkeleton rows={5} columns={6} showCheckbox={false} showActions={false} />}
        highlightOnHover
        responsive
        noDataComponent={
            <TableEmptyState
                icon={<Package />}
                title="No products supplied yet"
                description="Products this supplier has been ordered for will show up here once purchase orders are placed."
            />
        }
    />
);

export default SupplierProductsTab;
