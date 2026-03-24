import { FunctionComponent } from 'react';
import { Flex, Text, Box } from '@radix-ui/themes';
import { formatCurrency, getVariantDisplayName } from './helpers';
import InvoiceTotals from './InvoiceTotals';

interface InvoiceItemsViewProps {
    invoice: SupplierInvoiceWithItems;
}

const InvoiceItemsView: FunctionComponent<InvoiceItemsViewProps> = ({ invoice }) => (
    <Flex direction="column" gap="3">
        {invoice.items.map((item, index) => {
            const displayName = getVariantDisplayName(item.variant);
            const sku = item.variant?.sku || '';

            return (
                <Box
                    key={item.id || index}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    p="4"
                >
                    <Flex justify="between" align="start" mb="2">
                        <Flex direction="column">
                            <Text size="2" weight="medium">{displayName}</Text>
                            {sku && <Text size="1" color="gray">SKU: {sku}</Text>}
                        </Flex>
                        <Text size="2" weight="bold">{formatCurrency(item.totalPrice)}</Text>
                    </Flex>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Flex direction="column">
                            <Text size="1" color="gray">Quantity</Text>
                            <Text size="2" weight="medium">{item.quantity}</Text>
                        </Flex>
                        <Flex direction="column">
                            <Text size="1" color="gray">Unit Price</Text>
                            <Text size="2" weight="medium">{formatCurrency(item.unitPrice)}</Text>
                        </Flex>
                        <Flex direction="column">
                            <Text size="1" color="gray">Tax</Text>
                            <Text size="2" weight="medium">{formatCurrency(item.taxAmount)}</Text>
                        </Flex>
                        <Flex direction="column">
                            <Text size="1" color="gray">Discount</Text>
                            <Text size="2" weight="medium">{formatCurrency(item.discountAmount)}</Text>
                        </Flex>
                    </div>
                    {item.notes && (
                        <Text size="1" color="gray" mt="2" as="p" className="italic">{item.notes}</Text>
                    )}
                </Box>
            );
        })}

        <InvoiceTotals
            subtotal={invoice.subtotal}
            taxAmount={invoice.taxAmount}
            discountAmount={invoice.discountAmount}
            total={invoice.totalAmount}
        />
    </Flex>
);

export default InvoiceItemsView;
