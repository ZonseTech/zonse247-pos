import { FunctionComponent } from 'react';
import { Badge, Flex, Text, Box } from '@radix-ui/themes';
import { FileText } from 'lucide-react';
import { formatCurrency, formatDate } from './helpers';

const CREDIT_NOTE_STATUS_COLOR: Record<string, string> = {
    PENDING: 'amber',
    APPLIED: 'green',
    CANCELLED: 'red',
};

interface CreditNotesViewProps {
    creditNotes: SupplierCreditNote[];
}

const CreditNotesView: FunctionComponent<CreditNotesViewProps> = ({ creditNotes }) => {
    if (!creditNotes.length) return null;

    return (
        <Box className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Flex align="center" gap="2" px="5" py="4" className="border-b border-gray-200 dark:border-gray-700">
                <FileText className="w-4 h-4 text-emerald-500" />
                <Text size="2" weight="bold">Credit Notes</Text>
            </Flex>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Credit Note #</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Amount</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                            <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Applied To</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {creditNotes.map((cn) => (
                            <tr key={cn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-5 py-3">
                                    <Text size="2" weight="medium">{cn.creditNoteNumber}</Text>
                                </td>
                                <td className="px-5 py-3">
                                    <Text size="2" color="gray">{formatDate(cn.creditNoteDate)}</Text>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Text size="2" weight="bold" color="green">
                                        {formatCurrency(cn.amount)}
                                    </Text>
                                </td>
                                <td className="px-5 py-3">
                                    <Badge variant="soft" color={CREDIT_NOTE_STATUS_COLOR[cn.status] as any} size="1">
                                        {cn.status}
                                    </Badge>
                                </td>
                                <td className="px-5 py-3">
                                    <Text size="2" color="gray">
                                        {cn.appliedToInvoice?.invoiceNumber || '—'}
                                    </Text>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Box>
    );
};

export default CreditNotesView;
