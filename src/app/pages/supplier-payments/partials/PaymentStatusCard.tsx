import { FunctionComponent } from 'react';
import { Badge, Flex, Text, Box, Separator } from '@radix-ui/themes';
import { Ban } from 'lucide-react';
import { Button } from '../../../components';
import { paymentStatusConfig } from './SupplierPaymentTableColumns';
import { formatCurrency, formatDate } from './helpers';

interface PaymentStatusCardProps {
    payment: SupplierPaymentWithAllocations;
    onVoid: () => void;
}

const PaymentStatusCard: FunctionComponent<PaymentStatusCardProps> = ({ payment, onVoid }) => {
    const statusCfg = paymentStatusConfig[payment.status];

    return (
        <Box className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" p="5">
            <Flex direction={{ initial: 'column', sm: 'row' }} align={{ sm: 'center' }} justify="between" gap="4">
                <Flex align="center" gap="3">
                    {statusCfg && (
                        <Badge variant="soft" color={statusCfg.color as any} size="2" radius="full">
                            {statusCfg.label}
                        </Badge>
                    )}
                    <Text size="2" color="gray">{payment.paymentNumber}</Text>
                </Flex>
                <Flex wrap="wrap" gap="2">
                    {payment.status === 'COMPLETED' && (
                        <Button type="button" theme="danger" layout="outline" onClick={onVoid}>
                            <Ban className="w-4 h-4 mr-2" />
                            Void Payment
                        </Button>
                    )}
                </Flex>
            </Flex>

            <Separator size="4" my="4" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Flex direction="column">
                    <Text size="1" color="gray">Supplier</Text>
                    <Text size="2" weight="medium" mt="1">{payment.supplier?.name || '—'}</Text>
                </Flex>
                <Flex direction="column">
                    <Text size="1" color="gray">Payment Date</Text>
                    <Text size="2" weight="medium" mt="1">{formatDate(payment.paymentDate)}</Text>
                </Flex>
                <Flex direction="column">
                    <Text size="1" color="gray">Amount</Text>
                    <Text size="2" weight="bold" mt="1">{formatCurrency(payment.amount)}</Text>
                </Flex>
                <Flex direction="column">
                    <Text size="1" color="gray">Method</Text>
                    <Text size="2" weight="medium" mt="1" className="capitalize">
                        {payment.paymentMethod || '—'}
                    </Text>
                </Flex>
                {payment.reference && (
                    <Flex direction="column">
                        <Text size="1" color="gray">Reference</Text>
                        <Text size="2" weight="medium" mt="1">{payment.reference}</Text>
                    </Flex>
                )}
                <Flex direction="column">
                    <Text size="1" color="gray">Invoices Paid</Text>
                    <Text size="2" weight="medium" mt="1" color="sky">
                        {payment.allocations?.length || 0} invoice(s)
                    </Text>
                </Flex>
                {payment.notes && (
                    <Flex direction="column" className="col-span-2 sm:col-span-4">
                        <Text size="1" color="gray">Notes</Text>
                        <Text size="2" mt="1">{payment.notes}</Text>
                    </Flex>
                )}
            </div>
        </Box>
    );
};

export default PaymentStatusCard;
