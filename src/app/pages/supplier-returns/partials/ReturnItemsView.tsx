import { FunctionComponent } from 'react';
import { Flex, Text, Box } from '@radix-ui/themes';
import { RotateCcw } from 'lucide-react';
import { formatCurrency, getVariantDisplayName } from './helpers';

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

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Qty</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Unit Cost</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Total</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reason</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-5 py-3">
                                    <Box>
                                        <Text as="p" size="2" weight="medium">
                                            {item.variant?.product?.name || '—'}
                                        </Text>
                                        {item.variant && (
                                            <Text as="p" size="1" color="gray">
                                                {item.variant.variantName} {item.variant.sku ? `(${item.variant.sku})` : ''}
                                            </Text>
                                        )}
                                    </Box>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Text size="2" weight="medium">{item.returnQuantity}</Text>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Text size="2" color="gray">{formatCurrency(item.unitCost)}</Text>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Text size="2" weight="bold">{formatCurrency(item.totalCost)}</Text>
                                </td>
                                <td className="px-5 py-3">
                                    <Text size="2" color="gray">{item.reason || '—'}</Text>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                            <td className="px-5 py-3" colSpan={3}>
                                <Text size="2" weight="bold">Total</Text>
                            </td>
                            <td className="px-5 py-3 text-right">
                                <Text size="2" weight="bold">{formatCurrency(totalAmount)}</Text>
                            </td>
                            <td />
                        </tr>
                    </tfoot>
                </table>
            </div>
        </Box>
    );
};

export default ReturnItemsView;
