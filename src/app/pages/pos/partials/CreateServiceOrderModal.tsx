import { useState, useCallback, type FunctionComponent } from 'react';
import { Report, Notify } from 'notiflix';
import * as Dialog from '@radix-ui/react-dialog';
import { Theme, Flex, Text, Box, Separator, ScrollArea, Badge, TextArea, Button, Spinner } from '@radix-ui/themes';
import { ClipboardList, User, X } from 'lucide-react';
import { useInventory } from '../../../hooks/useInventory';
import { useAppSelector } from '../../../hooks/redux';
import { useAuth } from '../../../context/AuthProvider';
import { formatCurrency } from '../../../utils';
import { getErrorMessage } from '../../../utils/api-error-handler';
import serviceOrderService from '../../../services/service-order.service';

interface CreateServiceOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    staffAssignments: Record<string, string>;
    onSuccess?: (order: ServiceOrderWithItems) => void;
}

const CreateServiceOrderModal: FunctionComponent<CreateServiceOrderModalProps> = ({
    isOpen,
    onClose,
    staffAssignments,
    onSuccess,
}) => {
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { cart, total, subtotal, clearCart, selectedCustomer } = useInventory();
    const { staff } = useAppSelector((state) => state.staff);
    const { user } = useAuth();

    const getStaffName = (staffId: string) => {
        const s = staff.find(st => st.staffId === staffId);
        return s?.user?.fullname || s?.employeeCode || 'Unknown';
    };

    const handleSubmit = useCallback(async () => {
        const serviceItems = cart.filter(item => item.trackInventory === false);
        const productItems = cart.filter(item => item.trackInventory !== false);

        if (serviceItems.length === 0 && productItems.length === 0) {
            Report.warning('Empty Cart', 'Add at least one service or product before creating an order', 'Ok');
            return;
        }

        // Staff assignments only required for services
        if (serviceItems.length > 0) {
            const unassigned = serviceItems.filter(item => !staffAssignments[item.variantId]);
            if (unassigned.length > 0) {
                Report.warning(
                    'Staff Required',
                    `Please assign staff to all services: ${unassigned.map(i => i.name).join(', ')}`,
                    'Ok'
                );
                return;
            }
        }

        try {
            setIsSubmitting(true);

            const payload: CreateServiceOrderInput = {
                customerId: selectedCustomer && !selectedCustomer.isDefault
                    ? selectedCustomer.customerId
                    : undefined,
                notes: notes.trim() || undefined,
            };

            // Service items (orderType auto-detected by API)
            if (serviceItems.length > 0) {
                payload.items = serviceItems.map(item => ({
                    serviceId: item.productId || item.variantId,
                    quantity: item.quantity,
                    unitPrice: item.sellingPrice,
                    staffAssignments: staffAssignments[item.variantId]
                        ? [{ staffId: staffAssignments[item.variantId] }]
                        : undefined,
                }));
            }

            // Product items — stock deducted immediately at creation
            if (productItems.length > 0) {
                payload.productItems = productItems.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    unitPrice: item.sellingPrice,
                }));
            }

            const order = await serviceOrderService.create(payload);
            Notify.success(`Order ${order.orderNumber} created`);
            clearCart();
            handleClose();
            onSuccess?.(order);
        } catch (error: any) {
            const msg = getErrorMessage(error, 'Failed to create service order');
            Notify.failure(msg);
        } finally {
            setIsSubmitting(false);
        }
    }, [cart, staffAssignments, selectedCustomer, notes, clearCart, onSuccess]);

    const handleClose = () => {
        setNotes('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <Dialog.Portal>
                <Theme appearance="inherit" accentColor="cyan">
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 pointer-events-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
                    <Dialog.Content
                        className="fixed z-50 pointer-events-auto bg-white dark:bg-gray-800 shadow-2xl flex flex-col overflow-hidden
                                   bottom-0 left-0 right-0 rounded-t-2xl max-h-[90vh]
                                   sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                                   sm:rounded-2xl sm:w-[calc(100%-2rem)] sm:max-w-md sm:max-h-[85vh]
                                   data-[state=open]:animate-in data-[state=closed]:animate-out
                                   data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
                                   data-[state=open]:slide-in-from-bottom sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95
                                   data-[state=closed]:slide-out-to-bottom sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95
                                   duration-200"
                    >
                        {/* Mobile drag handle */}
                        <div className="flex justify-center sm:hidden pt-2">
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        </div>

                        {/* Header */}
                        <Flex align="center" justify="between" px="5" py="4" className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <Flex align="center" gap="3">
                                <Flex align="center" justify="center" className="w-8 h-8 rounded-lg bg-sky-500/10 dark:bg-sky-500/20">
                                    <ClipboardList className="w-4 h-4 text-sky-500" />
                                </Flex>
                                <Box>
                                    <Dialog.Title asChild>
                                        <Text size="3" weight="bold" className="block leading-tight">New Order</Text>
                                    </Dialog.Title>
                                    <Text size="1" color="gray">{cart.length} item{cart.length !== 1 && 's'}</Text>
                                </Box>
                            </Flex>
                            <Flex align="center" gap="3">
                                <Text size="5" weight="bold" className="tabular-nums">{formatCurrency(total)}</Text>
                                <Dialog.Close asChild>
                                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <X size={16} />
                                    </button>
                                </Dialog.Close>
                            </Flex>
                        </Flex>

                        {/* Body */}
                        <Flex direction="column" gap="3" px="5" py="4" className="overflow-y-auto flex-1">

                            {/* Customer */}
                            {selectedCustomer && !selectedCustomer.isDefault && (
                                <>
                                    <Flex align="center" gap="2" px="3" py="2" className="rounded-lg bg-[var(--gray-a2)]">
                                        <Flex align="center" justify="center" className="w-6 h-6 rounded-full" style={{ background: 'var(--purple-a3)' }}>
                                            <User size={12} className="text-[var(--purple-9)]" />
                                        </Flex>
                                        <Text size="2" weight="medium" truncate>{selectedCustomer.name}</Text>
                                        {(selectedCustomer.phone || selectedCustomer.email) && (
                                            <Text size="1" color="gray" className="ml-auto truncate">{selectedCustomer.phone || selectedCustomer.email}</Text>
                                        )}
                                    </Flex>
                                    <Separator size="4" />
                                </>
                            )}

                            {/* Services */}
                            <Box>
                                <Flex align="center" gap="1" mb="2">
                                    <Box className="w-1 h-3.5 rounded-full bg-sky-500" />
                                    <Text size="1" weight="bold" color="gray" className="uppercase tracking-wider">Services</Text>
                                </Flex>
                                <ScrollArea style={{ maxHeight: 192 }}>
                                    {cart.filter(item => item.trackInventory === false).map(item => {
                                        const assignedStaffId = staffAssignments[item.variantId];
                                        return (
                                            <Flex key={item.variantId} justify="between" align="start" gap="3" px="1" py="2">
                                                <Box className="min-w-0 flex-1">
                                                    <Text size="2" weight="medium" truncate className="block">{item.name}</Text>
                                                    <Flex align="center" gap="1" mt="1">
                                                        <Text size="1" color="gray" className="tabular-nums">{item.quantity} × {formatCurrency(item.sellingPrice)}</Text>
                                                        <Text size="1" color="gray">·</Text>
                                                        {assignedStaffId ? (
                                                            <Flex align="center" gap="1" asChild>
                                                                <Text size="1" color="sky" weight="medium">
                                                                    <User size={10} />
                                                                    {getStaffName(assignedStaffId)}
                                                                </Text>
                                                            </Flex>
                                                        ) : (
                                                            <Badge size="1" color="red" variant="soft">Unassigned</Badge>
                                                        )}
                                                    </Flex>
                                                </Box>
                                                <Text size="2" weight="bold" className="tabular-nums flex-shrink-0 pt-px">{formatCurrency(item.sellingPrice * item.quantity)}</Text>
                                            </Flex>
                                        );
                                    })}
                                </ScrollArea>
                            </Box>

                            {/* Products */}
                            {cart.some(item => item.trackInventory !== false) && (
                                <>
                                    <Separator size="4" />
                                    <Box>
                                        <Flex align="center" gap="1" mb="2">
                                            <Box className="w-1 h-3.5 rounded-full bg-amber-400" />
                                            <Text size="1" weight="bold" color="gray" className="uppercase tracking-wider">Products</Text>
                                            <Badge size="1" variant="soft" color="amber" ml="1">stock deducted immediately</Badge>
                                        </Flex>
                                        <ScrollArea style={{ maxHeight: 128 }}>
                                            {cart.filter(item => item.trackInventory !== false).map(item => (
                                                <Flex key={item.variantId} justify="between" align="center" gap="3" px="1" py="1">
                                                    <Flex align="center" gap="1" className="min-w-0">
                                                        <Text size="2" color="gray" truncate>{item.name}</Text>
                                                        <Text size="1" color="gray" className="tabular-nums flex-shrink-0">×{item.quantity}</Text>
                                                    </Flex>
                                                    <Text size="2" weight="medium" color="gray" className="tabular-nums flex-shrink-0">{formatCurrency(item.sellingPrice * item.quantity)}</Text>
                                                </Flex>
                                            ))}
                                        </ScrollArea>
                                    </Box>
                                </>
                            )}

                            <Separator size="4" />

                            {/* Total */}
                            <Flex align="center" justify="between" px="3" py="2" className="rounded-lg bg-[var(--gray-12)]">
                                <Text size="2" weight="medium" className="text-[var(--gray-1)]">Total</Text>
                                <Text size="4" weight="bold" className="tabular-nums text-[var(--gray-1)]">{formatCurrency(total)}</Text>
                            </Flex>

                            <Separator size="4" />

                            {/* Notes */}
                            <TextArea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Order notes..."
                                rows={2}
                                size="2"
                                variant="surface"
                                resize="none"
                            />
                        </Flex>

                        {/* Footer */}
                        <Flex gap="2" px="5" py="4" className="border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <Button
                                variant="outline"
                                color="gray"
                                size="2"
                                onClick={handleClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                color="blue"
                                size="2"
                                onClick={handleSubmit}
                                disabled={isSubmitting || cart.length === 0}
                                className="flex-[2]"
                            >
                                {isSubmitting ? <><Spinner size="1" /> Creating...</> : 'Create Order'}
                            </Button>
                        </Flex>
                    </Dialog.Content>
                </Theme>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default CreateServiceOrderModal;
