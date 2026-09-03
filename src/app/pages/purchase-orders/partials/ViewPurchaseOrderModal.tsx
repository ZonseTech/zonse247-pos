import { FunctionComponent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Badge, Flex, Text, Button, Table } from '@radix-ui/themes';
import dayjs from 'dayjs';
import FormModal from '../../../components/FormModal';
import { poStatusColorMap, poStatusLabelMap } from './PurchaseOrderTableColumns';
import { formatCurrency } from './helpers';

interface ViewPurchaseOrderModalProps {
    purchaseOrder: PurchaseOrder;
    onClose: () => void;
}

const ViewPurchaseOrderModal: FunctionComponent<ViewPurchaseOrderModalProps> = ({ purchaseOrder, onClose }) => {
    const total = purchaseOrder.totalAmount || purchaseOrder.items?.reduce((s, i) => s + (i.totalPrice || i.orderedQuantity * i.unitPrice), 0) || 0;

    return (
        <FormModal
            open
            onOpenChange={(open) => { if (!open) onClose(); }}
            title={purchaseOrder.poNumber}
            description={`${purchaseOrder.supplier?.name || 'N/A'} · raised ${dayjs(purchaseOrder.orderDate).format('DD MMM YYYY')}`}
            size="xl"
            footer={
                <Flex justify="end">
                    <Dialog.Close asChild>
                        <Button variant="soft" color="gray">Close</Button>
                    </Dialog.Close>
                </Flex>
            }
        >
            <Flex direction="column" gap="4">
                <Flex>
                    <Badge variant="soft" color={poStatusColorMap[purchaseOrder.status] || 'gray'} radius="full">
                        {poStatusLabelMap[purchaseOrder.status] || purchaseOrder.status}
                    </Badge>
                </Flex>

                <Table.Root variant="surface" layout="auto">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Item</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell justify="end">Ordered</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell justify="end">Received</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell justify="end">Unit Cost</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell justify="end">Line Total</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {purchaseOrder.items.map((item, index) => {
                            const variantName = item.variant?.variantName || '';
                            const productName = item.variant?.product?.name || '';
                            const displayName = productName
                                ? `${productName}${variantName && variantName !== 'Default' ? ` — ${variantName}` : ''}`
                                : variantName || item.product?.name || 'Unknown';

                            return (
                                <Table.Row key={item.id || index} align="center">
                                    <Table.RowHeaderCell>
                                        <Text size="2">{displayName}</Text>
                                        {(item.variant?.sku || item.product?.sku) && (
                                            <Text as="p" size="1" color="gray">{item.variant?.sku || item.product?.sku}</Text>
                                        )}
                                    </Table.RowHeaderCell>
                                    <Table.Cell justify="end">{item.orderedQuantity}</Table.Cell>
                                    <Table.Cell justify="end">{item.receivedQuantity || 0}</Table.Cell>
                                    <Table.Cell justify="end">{formatCurrency(item.unitPrice)}</Table.Cell>
                                    <Table.Cell justify="end">
                                        <Text weight="medium">
                                            {formatCurrency(item.totalPrice || item.orderedQuantity * item.unitPrice)}
                                        </Text>
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table.Root>

                <Flex justify="end" pt="4" className="border-t border-gray-200 dark:border-gray-700">
                    <Text size="4">
                        <Text color="gray">Total: </Text>
                        <Text weight="bold">{formatCurrency(total)}</Text>
                    </Text>
                </Flex>

                {purchaseOrder.notes && (
                    <Text as="p" size="2" color="gray">Note: {purchaseOrder.notes}</Text>
                )}
            </Flex>
        </FormModal>
    );
};

export default ViewPurchaseOrderModal;
