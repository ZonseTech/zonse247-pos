import { FunctionComponent } from 'react';
import { Badge, Flex, Text } from '@radix-ui/themes';
import { Loader2, Receipt } from 'lucide-react';
import { Button, Modal } from '../../../components';
import { creditNoteStatusConfig } from '../../credit-notes/partials/CreditNoteTableColumns';
import { formatCurrency } from './helpers';

interface ApplyCreditModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: SupplierInvoiceWithItems | null;
    creditNotes: SupplierCreditNote[];
    loading: boolean;
    applyingId: string | null;
    onApply: (creditNoteId: string) => void;
}

const ApplyCreditModal: FunctionComponent<ApplyCreditModalProps> = ({
    isOpen,
    onClose,
    invoice,
    creditNotes,
    loading,
    applyingId,
    onApply,
}) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply Credit Note" size="lg">
        <div className="p-5">
            {invoice && (
                <Flex justify="between" align="center" mb="4" pb="4" className="border-b border-gray-200 dark:border-gray-700">
                    <Flex direction="column">
                        <Text size="1" color="gray">Invoice</Text>
                        <Text size="2" weight="bold">{invoice.invoiceNumber}</Text>
                    </Flex>
                    <Flex direction="column" align="end">
                        <Text size="1" color="gray">Balance Due</Text>
                        <Text size="2" weight="bold" color="red">{formatCurrency(invoice.balanceDue)}</Text>
                    </Flex>
                </Flex>
            )}

            {loading ? (
                <Flex direction="column" align="center" justify="center" py="9">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-3" />
                    <Text size="2" color="gray">Loading credit notes…</Text>
                </Flex>
            ) : creditNotes.length === 0 ? (
                <Flex direction="column" align="center" justify="center" py="9">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                        <Receipt className="w-7 h-7 text-gray-400" />
                    </div>
                    <Text size="3" weight="medium" mb="1">No pending credit notes</Text>
                    <Text size="2" color="gray" align="center" className="max-w-xs">
                        There are no pending credit notes for this supplier. Complete supplier returns to generate credit notes.
                    </Text>
                </Flex>
            ) : (
                <Flex direction="column" gap="3">
                    <Text size="2" color="gray" mb="2">
                        Select a credit note to apply against this invoice:
                    </Text>
                    {creditNotes.map((cn) => {
                        const cfg = creditNoteStatusConfig[cn.status];
                        return (
                            <Flex
                                key={cn.id}
                                align="center"
                                justify="between"
                                p="4"
                                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                            >
                                <Flex direction="column" className="min-w-0 flex-1">
                                    <Flex align="center" gap="2" mb="1">
                                        <Text size="2" weight="bold">{cn.creditNoteNumber}</Text>
                                        <Badge variant="soft" color={cfg.color as any} size="1" radius="full">
                                            {cfg.label}
                                        </Badge>
                                    </Flex>
                                    {cn.supplierReturn?.returnNumber && (
                                        <Text size="1" color="sky">Return: {cn.supplierReturn.returnNumber}</Text>
                                    )}
                                    {cn.creditNoteDate && (
                                        <Text size="1" color="gray" mt="1">
                                            {new Date(cn.creditNoteDate).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                            })}
                                        </Text>
                                    )}
                                </Flex>
                                <Flex align="center" gap="3" ml="3" className="flex-shrink-0">
                                    <Text size="2" weight="bold">{formatCurrency(cn.amount)}</Text>
                                    <Button
                                        type="button"
                                        theme="success"
                                        layout="outline"
                                        onClick={() => onApply(cn.id)}
                                        disabled={applyingId !== null}
                                        className="!px-3 !py-1.5 text-xs"
                                    >
                                        {applyingId === cn.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            'Apply'
                                        )}
                                    </Button>
                                </Flex>
                            </Flex>
                        );
                    })}
                </Flex>
            )}
        </div>
    </Modal>
);

export default ApplyCreditModal;
