import { FunctionComponent } from 'react';
import { Flex, Text, Box, Table } from '@radix-ui/themes';
import { RotateCcw } from 'lucide-react';
import { formatCurrency } from './helpers';

interface ReturnItemsViewProps {
    items: SupplierReturnItem[];
    totalAmount: number;
}

const ReturnItemsView: FunctionComponent<ReturnItemsViewProps> = ({ items, totalAmount }) => {
    if (!items.length) return null;

    return (
        <Box className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Flex align="center" gap="2" px="5" py="4" className="border-b border-gray-200 dark:border-gray-700">
                <RotateCcw className="w-4 h-4 text-orange-500" />
                <Text size="2" weight="bold">Return Items</Text>
            </Flex>

            <Table.Root variant="ghost" layout="auto">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell justify="end">Qty</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell justify="end">Unit Cost</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell justify="end">Total</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Reason</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {items.map((item) => (
                        <Table.Row key={item.id} align="center">
                            <Table.RowHeaderCell>
                                <Text as="p" size="2" weight="medium">{item.variant?.product?.name || '—'}</Text>
                                {item.variant && (
                                    <Text as="p" size="1" color="gray">
                                        {item.variant.variantName} {item.variant.sku ? `(${item.variant.sku})` : ''}
                                    </Text>
                                )}
                            </Table.RowHeaderCell>
                            <Table.Cell justify="end">
                                <Text size="2" weight="medium">{item.returnQuantity}</Text>
                            </Table.Cell>
                            <Table.Cell justify="end">
                                <Text size="2" color="gray">{formatCurrency(item.unitCost)}</Text>
                            </Table.Cell>
                            <Table.Cell justify="end">
                                <Text size="2" weight="bold">{formatCurrency(item.totalCost)}</Text>
                            </Table.Cell>
                            <Table.Cell>
                                <Text size="2" color="gray">{item.reason || '—'}</Text>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

            <Flex justify="end" px="5" py="3" className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <Text size="2">
                    <Text color="gray">Total: </Text>
                    <Text weight="bold">{formatCurrency(totalAmount)}</Text>
                </Text>
            </Flex>
        </Box>
    );
};

export default ReturnItemsView;
