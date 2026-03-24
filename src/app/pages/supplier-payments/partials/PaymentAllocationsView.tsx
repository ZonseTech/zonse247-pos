import { FunctionComponent } from 'react';
import { Flex, Text, Box } from '@radix-ui/themes';
import { FileText } from 'lucide-react';
import { formatCurrency } from './helpers';

interface PaymentAllocationsViewProps {
    allocations: SupplierPaymentAllocation[];
}

const PaymentAllocationsView: FunctionComponent<PaymentAllocationsViewProps> = ({ allocations }) => {
    if (!allocations.length) return null;

    const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);

    return (
        <Box className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Flex align="center" gap="2" px="5" py="4" className="border-b border-gray-200 dark:border-gray-700">
                <FileText className="w-4 h-4 text-emerald-500" />
                <Text size="2" weight="bold">Payment Allocations</Text>
            </Flex>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Invoice Total</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Balance Due</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Allocated</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {allocations.map((alloc) => (
                            <tr key={alloc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-5 py-3">
                                    <Text size="2" weight="medium">
                                        {alloc.invoice?.invoiceNumber || alloc.invoiceId}
                                    </Text>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Text size="2" color="gray">
                                        {formatCurrency(alloc.invoice?.totalAmount || 0)}
                                    </Text>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Text size="2" color="gray">
                                        {formatCurrency(alloc.invoice?.balanceDue || 0)}
                                    </Text>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Text size="2" weight="bold" color="green">
                                        {formatCurrency(alloc.allocatedAmount)}
                                    </Text>
                                </td>
                                <td className="px-5 py-3">
                                    <Text size="1" color="gray" className="capitalize">
                                        {alloc.invoice?.status?.toLowerCase().replace('_', ' ') || '—'}
                                    </Text>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                            <td className="px-5 py-3" colSpan={3}>
                                <Text size="2" weight="bold">Total Allocated</Text>
                            </td>
                            <td className="px-5 py-3 text-right">
                                <Text size="2" weight="bold">{formatCurrency(totalAllocated)}</Text>
                            </td>
                            <td />
                        </tr>
                    </tfoot>
                </table>
            </div>
        </Box>
    );
};

export default PaymentAllocationsView;
