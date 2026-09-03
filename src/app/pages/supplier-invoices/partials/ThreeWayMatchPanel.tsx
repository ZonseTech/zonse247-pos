import { FunctionComponent } from 'react';
import { Badge, Flex, Text, Box, Table } from '@radix-ui/themes';
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

            <Table.Root variant="ghost" layout="auto">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>Item</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell justify="end">Ordered</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell justify="end">Received</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell justify="end">Invoiced</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell justify="center">Match</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {matchData.map((m, idx) => {
                        const invItem = invoice?.items.find(i => i.variantId === m.variantId);
                        const displayName = getVariantDisplayName(invItem?.variant) || m.variantId.slice(0, 8);
                        return (
                            <Table.Row key={idx} align="center">
                                <Table.RowHeaderCell><Text size="2">{displayName}</Text></Table.RowHeaderCell>
                                <Table.Cell justify="end"><Text size="2" color="gray">{m.orderedQuantity}</Text></Table.Cell>
                                <Table.Cell justify="end"><Text size="2" color="gray">{m.receivedQuantity}</Text></Table.Cell>
                                <Table.Cell justify="end"><Text size="2" color="gray">{m.invoicedQuantity}</Text></Table.Cell>
                                <Table.Cell justify="center">
                                    <Badge variant="soft" color={m.match ? 'green' : 'red'} size="1" radius="full">
                                        {m.match ? 'Match' : 'Mismatch'}
                                    </Badge>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table.Root>

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
