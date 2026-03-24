import { FunctionComponent } from 'react';
import { Flex, Text } from '@radix-ui/themes';
import { Separator } from '@radix-ui/themes';
import { formatCurrency } from './helpers';

interface InvoiceTotalsProps {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
}

const InvoiceTotals: FunctionComponent<InvoiceTotalsProps> = ({
    subtotal,
    taxAmount,
    discountAmount,
    total,
}) => (
    <>
        <Separator size="4" />
        <Flex direction="column" align="end" gap="1" pt="3">
            <Flex align="center" gap="4">
                <Text size="2" color="gray">Subtotal:</Text>
                <Text size="2" weight="medium" className="w-28 text-right">
                    {formatCurrency(subtotal)}
                </Text>
            </Flex>
            {taxAmount > 0 && (
                <Flex align="center" gap="4">
                    <Text size="2" color="gray">Tax:</Text>
                    <Text size="2" weight="medium" className="w-28 text-right">
                        +{formatCurrency(taxAmount)}
                    </Text>
                </Flex>
            )}
            {discountAmount > 0 && (
                <Flex align="center" gap="4">
                    <Text size="2" color="gray">Discount:</Text>
                    <Text size="2" weight="medium" color="green" className="w-28 text-right">
                        -{formatCurrency(discountAmount)}
                    </Text>
                </Flex>
            )}
            <Separator size="4" />
            <Flex align="center" gap="4" pt="1">
                <Text size="2" weight="medium" color="gray">Total:</Text>
                <Text size="4" weight="bold" className="w-28 text-right">
                    {formatCurrency(total)}
                </Text>
            </Flex>
        </Flex>
    </>
);

export default InvoiceTotals;
