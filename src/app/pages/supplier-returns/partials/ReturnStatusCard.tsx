import { FunctionComponent } from 'react';
import { Badge, Flex, Text, Box, Separator } from '@radix-ui/themes';
import { Button as RadixButton } from '@radix-ui/themes';
import { CheckCircle, Truck, PackageCheck, Ban, Trash2, Link2 } from 'lucide-react';
import { returnStatusConfig } from './SupplierReturnTableColumns';
import { formatCurrency, formatDate } from './helpers';

interface ReturnStatusCardProps {
    returnData: SupplierReturnWithItems;
    onApprove: () => void;
    onShip: () => void;
    onComplete: () => void;
    onCancel: () => void;
    onDelete: () => void;
}

const ReturnStatusCard: FunctionComponent<ReturnStatusCardProps> = ({
    returnData, onApprove, onShip, onComplete, onCancel, onDelete,
}) => {
    const statusCfg = returnStatusConfig[returnData.status];

    return (
        <Box className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" p="5">
            <Flex direction={{ initial: 'column', sm: 'row' }} align={{ sm: 'center' }} justify="between" gap="4">
                <Flex align="center" gap="3">
                    <Badge variant="soft" color={statusCfg.color} size="2" radius="full">
                        {statusCfg.label}
                    </Badge>
                    <Text size="2" color="gray">{returnData.returnNumber}</Text>
                </Flex>
                <Flex wrap="wrap" gap="2">
                    {returnData.status === 'DRAFT' && (
                        <>
                            <RadixButton type="button" variant="outline" color="blue" size="2" onClick={onApprove}>
                                <CheckCircle className="w-4 h-4" /> Approve
                            </RadixButton>
                            <RadixButton type="button" variant="outline" color="red" size="2" onClick={onCancel}>
                                <Ban className="w-4 h-4" /> Cancel
                            </RadixButton>
                            <RadixButton type="button" variant="outline" color="red" size="2" onClick={onDelete}>
                                <Trash2 className="w-4 h-4" /> Delete
                            </RadixButton>
                        </>
                    )}
                    {returnData.status === 'APPROVED' && (
                        <>
                            <RadixButton type="button" variant="outline" color="purple" size="2" onClick={onShip}>
                                <Truck className="w-4 h-4" /> Ship
                            </RadixButton>
                            <RadixButton type="button" variant="outline" color="red" size="2" onClick={onCancel}>
                                <Ban className="w-4 h-4" /> Cancel
                            </RadixButton>
                        </>
                    )}
                    {returnData.status === 'SHIPPED' && (
                        <RadixButton type="button" variant="outline" color="green" size="2" onClick={onComplete}>
                            <PackageCheck className="w-4 h-4" /> Complete
                        </RadixButton>
                    )}
                </Flex>
            </Flex>

            <Separator size="4" my="4" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Flex direction="column">
                    <Text size="1" color="gray">Supplier</Text>
                    <Text size="2" weight="medium" mt="1">{returnData.supplier?.name || '—'}</Text>
                </Flex>
                <Flex direction="column">
                    <Text size="1" color="gray">Return Date</Text>
                    <Text size="2" weight="medium" mt="1">{formatDate(returnData.returnDate)}</Text>
                </Flex>
                <Flex direction="column">
                    <Text size="1" color="gray">Total Amount</Text>
                    <Text size="2" weight="bold" mt="1">{formatCurrency(returnData.totalAmount)}</Text>
                </Flex>
                <Flex direction="column">
                    <Text size="1" color="gray">Items</Text>
                    <Text size="2" weight="medium" mt="1">{returnData.items?.length || 0} item(s)</Text>
                </Flex>
                {returnData.purchaseOrder && (
                    <Flex direction="column">
                        <Text size="1" color="gray">Linked PO</Text>
                        <Flex align="center" gap="1" mt="1">
                            <Link2 className="w-3.5 h-3.5 text-sky-500" />
                            <Text size="2" weight="medium" color="sky">{returnData.purchaseOrder.poNumber}</Text>
                        </Flex>
                    </Flex>
                )}
                {returnData.goodsReceipt && (
                    <Flex direction="column">
                        <Text size="1" color="gray">Linked GRN</Text>
                        <Flex align="center" gap="1" mt="1">
                            <Link2 className="w-3.5 h-3.5 text-teal-500" />
                            <Text size="2" weight="medium" color="teal">{returnData.goodsReceipt.receiptNumber}</Text>
                        </Flex>
                    </Flex>
                )}
                {returnData.returnedByUser && (
                    <Flex direction="column">
                        <Text size="1" color="gray">Returned By</Text>
                        <Text size="2" weight="medium" mt="1">
                            {returnData.returnedByUser.firstName} {returnData.returnedByUser.lastName}
                        </Text>
                    </Flex>
                )}
                {returnData.reason && (
                    <Flex direction="column" className="col-span-2 sm:col-span-4">
                        <Text size="1" color="gray">Reason</Text>
                        <Text size="2" mt="1">{returnData.reason}</Text>
                    </Flex>
                )}
                {returnData.notes && (
                    <Flex direction="column" className="col-span-2 sm:col-span-4">
                        <Text size="1" color="gray">Notes</Text>
                        <Text size="2" mt="1">{returnData.notes}</Text>
                    </Flex>
                )}
            </div>
        </Box>
    );
};

export default ReturnStatusCard;
