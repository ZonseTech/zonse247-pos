import type { FC } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Theme, Flex, Text, Box, ScrollArea, Spinner, TextField, IconButton, Tooltip, SegmentedControl } from '@radix-ui/themes';
import { ClipboardList, Search, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { STATUS_TABS, type StatusFilter } from './config';
import { useServiceOrdersList } from './useServiceOrdersList';
import { OrderCard } from './OrderCard';

export interface ServiceOrdersListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectOrder?: (order: ServiceOrderWithItems) => void;
}

const EmptyState: FC<{ loading: boolean }> = ({ loading }) => (
    <Flex direction="column" align="center" py="9">
        {loading ? (
            <>
                <Spinner size="3" />
                <Text size="2" color="gray" mt="3">Loading...</Text>
            </>
        ) : (
            <>
                <ClipboardList size={40} className="text-gray-300 mb-3" />
                <Text size="2" color="gray">No orders found</Text>
            </>
        )}
    </Flex>
);

export const ServiceOrdersListModal: FC<ServiceOrdersListModalProps> = ({
    isOpen,
    onClose,
    onSelectOrder,
}) => {
    const {
        orders,
        loading,
        filter,
        busyId,
        searchTerm,
        pagination,
        setFilter,
        setSearchTerm,
        loadOrders,
        handleClose,
        handleStart,
        handleSelect,
    } = useServiceOrdersList({ isOpen, onClose, onSelectOrder });

    return (
        <Dialog.Root open={isOpen} onOpenChange={open => !open && handleClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl max-h-[90vh] z-50">
                    <Theme accentColor="blue" radius="medium" className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <Flex p="4" justify="between" align="center" className="border-b border-gray-200 dark:border-gray-700">
                            <Flex align="center" gap="3">
                                <Box className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                                    <ClipboardList className="w-5 h-5 text-white" />
                                </Box>
                                <Box>
                                    <Dialog.Title asChild>
                                        <Text size="4" weight="bold">Service Orders</Text>
                                    </Dialog.Title>
                                    <Text size="1" color="gray">{pagination.pageLabel}</Text>
                                </Box>
                            </Flex>
                            <Flex gap="1">
                                <Tooltip content="Refresh">
                                    <IconButton
                                        size="2"
                                        variant="ghost"
                                        color="gray"
                                        onClick={loadOrders}
                                        disabled={loading}
                                    >
                                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                    </IconButton>
                                </Tooltip>
                                <Dialog.Close asChild>
                                    <IconButton size="2" variant="ghost" color="gray">
                                        <X size={16} />
                                    </IconButton>
                                </Dialog.Close>
                            </Flex>
                        </Flex>

                        <Box p="3" className="border-b border-gray-100 dark:border-gray-800">
                            <SegmentedControl.Root
                                value={filter}
                                onValueChange={v => setFilter(v as StatusFilter)}
                                size="1"
                                className="mb-3"
                            >
                                {STATUS_TABS.map(tab => (
                                    <SegmentedControl.Item key={tab.key} value={tab.key}>
                                        {tab.label}
                                    </SegmentedControl.Item>
                                ))}
                            </SegmentedControl.Root>
                            <TextField.Root
                                size="2"
                                placeholder="Search order# or customer..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            >
                                <TextField.Slot>
                                    <Search size={14} className="text-gray-400" />
                                </TextField.Slot>
                            </TextField.Root>
                        </Box>

                        <ScrollArea style={{ flex: 1 }} scrollbars="vertical">
                            <Box p="3">
                                {orders.length === 0 ? (
                                    <EmptyState loading={loading} />
                                ) : (
                                    <Flex direction="column" gap="2">
                                        {orders.map(order => (
                                            <OrderCard
                                                key={order.id}
                                                order={order}
                                                busy={busyId === order.id}
                                                onStart={() => handleStart(order)}
                                                onSelect={() => handleSelect(order)}
                                            />
                                        ))}
                                    </Flex>
                                )}
                            </Box>
                        </ScrollArea>

                        {pagination.totalPages > 1 && (
                            <Flex p="3" justify="between" align="center" className="border-t border-gray-200 dark:border-gray-700">
                                <Text size="1" color="gray">
                                    Page {pagination.page}/{pagination.totalPages}
                                </Text>
                                <Flex gap="1">
                                    <IconButton
                                        size="1"
                                        variant="soft"
                                        color="gray"
                                        onClick={pagination.prevPage}
                                        disabled={!pagination.hasPrevPage || loading}
                                    >
                                        <ChevronLeft size={14} />
                                    </IconButton>
                                    <IconButton
                                        size="1"
                                        variant="soft"
                                        color="gray"
                                        onClick={pagination.nextPage}
                                        disabled={!pagination.hasNextPage || loading}
                                    >
                                        <ChevronRight size={14} />
                                    </IconButton>
                                </Flex>
                            </Flex>
                        )}
                    </Theme>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ServiceOrdersListModal;
