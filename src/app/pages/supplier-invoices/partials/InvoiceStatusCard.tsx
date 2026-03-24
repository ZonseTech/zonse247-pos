import { FunctionComponent } from 'react';
import { Badge, Flex, Text, Box, Separator } from '@radix-ui/themes';
import { Scale, AlertTriangle, Ban, Receipt, Link2 } from 'lucide-react';
import { Button } from '../../../components';
import { invoiceStatusConfig } from './SupplierInvoiceTableColumns';
import { formatCurrency, formatDate } from './helpers';

interface InvoiceStatusCardProps {
    invoice: SupplierInvoiceWithItems;
    showMatch: boolean;
    onToggleMatch: () => void;
    onDispute: () => void;
    onCancel: () => void;
    onApplyCredit: () => void;
}

const InvoiceStatusCard: FunctionComponent<InvoiceStatusCardProps> = ({
    invoice,
    showMatch,
    onToggleMatch,
    onDispute,
    onCancel,
    onApplyCredit,
}) => {
    const statusCfg = invoiceStatusConfig[invoice.status];

    return (
        <Box className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" p="5">
            <Flex direction={{ initial: 'column', sm: 'row' }} align={{ sm: 'center' }} justify="between" gap="4">
                <Flex align="center" gap="3">
                    {statusCfg && (
                        <Badge variant="soft" color={statusCfg.color as any} size="2" radius="full">
                            {statusCfg.label}
                        </Badge>
                    )}
                    <Text size="2" color="gray">{invoice.invoiceNumber}</Text>
                </Flex>
                <Flex wrap="wrap" gap="2">
                    {invoice.purchaseOrderId && (
                        <Button type="button" theme="primary" layout="outline" onClick={onToggleMatch}>
                            <Scale className="w-4 h-4 mr-2" />
                            {showMatch ? 'Hide' : 'Show'} 3-Way Match
                        </Button>
                    )}
                    {invoice.status === 'PENDING' && (
                        <>
                            <Button type="button" theme="warning" layout="outline" onClick={onDispute}>
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Dispute
                            </Button>
                            <Button type="button" theme="danger" layout="outline" onClick={onCancel}>
                                <Ban className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </>
                    )}
                    {invoice.balanceDue > 0 && invoice.status !== 'CANCELLED' && (
                        <Button type="button" theme="success" layout="outline" onClick={onApplyCredit}>
                            <Receipt className="w-4 h-4 mr-2" />
                            Apply Credit
                        </Button>
                    )}
                </Flex>
            </Flex>

            <Separator size="4" my="4" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Flex direction="column">
                    <Text size="1" color="gray">Supplier</Text>
                    <Text size="2" weight="medium" mt="1">{invoice.supplier?.name || '—'}</Text>
                </Flex>
                <Flex direction="column">
                    <Text size="1" color="gray">Invoice Date</Text>
                    <Text size="2" weight="medium" mt="1">{formatDate(invoice.invoiceDate)}</Text>
                </Flex>
                <Flex direction="column">
                    <Text size="1" color="gray">Due Date</Text>
                    <Text size="2" weight="medium" mt="1" color={
                        invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.balanceDue > 0
                            ? 'red' : undefined
                    }>
                        {formatDate(invoice.dueDate)}
                    </Text>
                </Flex>
                <Flex direction="column">
                    <Text size="1" color="gray">Total Amount</Text>
                    <Text size="2" weight="bold" mt="1">{formatCurrency(invoice.totalAmount)}</Text>
                </Flex>
                <Flex direction="column">
                    <Text size="1" color="gray">Amount Paid</Text>
                    <Text size="2" weight="medium" mt="1" color="green">{formatCurrency(invoice.amountPaid)}</Text>
                </Flex>
                <Flex direction="column">
                    <Text size="1" color="gray">Balance Due</Text>
                    <Text size="2" weight="bold" mt="1" color={invoice.balanceDue > 0 ? 'red' : 'green'}>
                        {formatCurrency(invoice.balanceDue)}
                    </Text>
                </Flex>
                {invoice.purchaseOrder && (
                    <Flex direction="column">
                        <Text size="1" color="gray">Linked PO</Text>
                        <Flex align="center" gap="1" mt="1">
                            <Link2 className="w-3.5 h-3.5 text-sky-500" />
                            <Text size="2" weight="medium" color="sky">{invoice.purchaseOrder.poNumber}</Text>
                        </Flex>
                    </Flex>
                )}
                {invoice.notes && (
                    <Flex direction="column" className="col-span-2 sm:col-span-4">
                        <Text size="1" color="gray">Notes</Text>
                        <Text size="2" mt="1">{invoice.notes}</Text>
                    </Flex>
                )}
            </div>
        </Box>
    );
};

export default InvoiceStatusCard;
