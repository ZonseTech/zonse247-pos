import { FunctionComponent } from 'react';
import { Badge, Flex, Text, Box } from '@radix-ui/themes';
import { Scale } from 'lucide-react';
import { getVariantDisplayName } from './helpers';

interface ThreeWayMatchPanelProps {
    matchData: ThreeWayMatchResult[];
    invoice: SupplierInvoiceWithItems | null;
}

const ThreeWayMatchPanel: FunctionComponent<ThreeWayMatchPanelProps> = ({ matchData, invoice }) => {
    if (matchData.length === 0) return null;

    return (
        <Box className="bg-white dark:bg-gray-800 rounded-xl border border-sky-200 dark:border-sky-800" p="5">
            <Flex align="center" gap="2" mb="4">
                <Scale className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <Text size="2" weight="bold" color="sky">
                    3-Way Match: PO vs GRN vs Invoice
                </Text>
            </Flex>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-left py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Item</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Ordered</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Received</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Invoiced</th>
                            <th className="text-center py-2 pl-3 font-medium text-gray-600 dark:text-gray-400">Match</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matchData.map((m, idx) => {
                            const invItem = invoice?.items.find(i => i.variantId === m.variantId);
                            const displayName = getVariantDisplayName(invItem?.variant) || m.variantId.slice(0, 8);
                            return (
                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                    <td className="py-2 pr-4"><Text size="2">{displayName}</Text></td>
                                    <td className="py-2 px-3 text-right"><Text size="2" color="gray">{m.orderedQuantity}</Text></td>
                                    <td className="py-2 px-3 text-right"><Text size="2" color="gray">{m.receivedQuantity}</Text></td>
                                    <td className="py-2 px-3 text-right"><Text size="2" color="gray">{m.invoicedQuantity}</Text></td>
                                    <td className="py-2 pl-3 text-center">
                                        <Badge variant="soft" color={m.match ? 'green' : 'red'} size="1" radius="full">
                                            {m.match ? 'Match' : 'Mismatch'}
                                        </Badge>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {matchData.some(m => !m.match) && (
                <Box mt="3" p="3" className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                    <Text size="1" weight="medium" color="red" mb="1" as="p">Discrepancies:</Text>
                    <ul className="text-xs space-y-0.5">
                        {matchData
                            .filter(m => !m.match)
                            .flatMap((m, i) => m.discrepancies.map((d, j) => (
                                <li key={`${i}-${j}`}><Text size="1" color="red">• {d}</Text></li>
                            )))}
                    </ul>
                </Box>
            )}
        </Box>
    );
};

export default ThreeWayMatchPanel;
