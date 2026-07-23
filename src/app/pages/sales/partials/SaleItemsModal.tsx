import { FunctionComponent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Flex, Text, ScrollArea, Theme } from '@radix-ui/themes';
import { Package, X } from 'lucide-react';
import SaleItems from './SaleItems';

interface SaleItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale | Transaction | null;
}

const getSaleRef = (sale: Sale | Transaction | null): string => {
    if (!sale) return '';
    return (sale as Sale).saleNumber || (sale as Transaction).refNumber || (sale as Transaction).transactionId || sale.id || '';
};

const SaleItemsModal: FunctionComponent<SaleItemsModalProps> = ({ isOpen, onClose, sale }) => {
    if (!sale) return null;

    const items = sale.items || [];
    const hasItems = Array.isArray(items) && items.length > 0;

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Theme appearance="inherit" accentColor="cyan">
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-lg max-h-[85vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        <Flex
                            justify="between"
                            align="center"
                            p="4"
                            className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
                        >
                            <Flex align="center" gap="3">
                                <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                                    <Package className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                </div>
                                <div>
                                    <Dialog.Title asChild>
                                        <Text size="3" weight="bold" as="p" className="leading-tight">
                                            Sale Items
                                        </Text>
                                    </Dialog.Title>
                                    <Text size="1" color="gray" as="p" className="leading-tight">
                                        {getSaleRef(sale)}
                                    </Text>
                                </div>
                            </Flex>
                            <Dialog.Close asChild>
                                <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </Dialog.Close>
                        </Flex>

                        <ScrollArea scrollbars="vertical" style={{ maxHeight: 'calc(85vh - 76px)' }}>
                            <div className="p-4">
                                <SaleItems items={items} hasItems={hasItems} />
                            </div>
                        </ScrollArea>
                    </Dialog.Content>
                </Theme>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default SaleItemsModal;
