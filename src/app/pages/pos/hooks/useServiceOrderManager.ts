import { useCallback, useRef, useState } from 'react';
import { Notify } from 'notiflix';
import { useAuth } from '../../../context/AuthProvider';
import { useAppSelector } from '../../../hooks/redux';
import { getErrorMessage } from '../../../utils/api-error-handler';
import serviceOrderService from '../../../services/service-order.service';

interface UseServiceOrderManagerOptions {
    cart: CartItem[];
    selectedCustomer: Customer | null;
}

export function useServiceOrderManager({ cart, selectedCustomer }: UseServiceOrderManagerOptions) {
    const { user } = useAuth();
    const { staff } = useAppSelector((state) => state.staff);

    // Keep latest values in refs so async callbacks never go stale
    const cartRef = useRef(cart);
    cartRef.current = cart;
    const customerRef = useRef(selectedCustomer);
    customerRef.current = selectedCustomer;

    const [staffAssignments, setStaffAssignments] = useState<Record<string, string>>({});
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
    const [isServiceOrdersOpen, setIsServiceOrdersOpen] = useState(false);
    const [activeServiceOrder, setActiveServiceOrder] = useState<ServiceOrderWithItems | null>(null);

    // ── Helpers ─────────────────────────────────────────────────────────────

    const resolveCurrentStaff = useCallback(() => {
        return staff.find(s => s.userId === user?.userId) || staff[0];
    }, [staff, user]);

    const resolveCustomerId = useCallback(() => {
        const customer = customerRef.current;
        return customer && !(customer as any).isDefault
            ? customer.customerId
            : undefined;
    }, []);

    // ── Update existing active order ────────────────────────────────────────

    const updateActiveOrder = useCallback(async () => {
        const currentCart = cartRef.current;

        const existingVariantIds = new Set(
            (activeServiceOrder?.productItems || []).map(p => p.variantId),
        );
        const newProducts = currentCart.filter(
            item => item.trackInventory !== false && !existingVariantIds.has(item.variantId),
        );

        const existingServiceIds = new Set(
            (activeServiceOrder?.items || []).map(i => i.serviceId),
        );
        const newServices = currentCart.filter(
            item => item.trackInventory === false
                && !existingServiceIds.has(item.productId || item.variantId),
        );

        if (newProducts.length === 0 && newServices.length === 0) {
            Notify.info('No new items to add to this order');
            return;
        }

        try {
            const payload: UpdateServiceOrderInput = {};

            if (newServices.length > 0) {
                const currentStaff = resolveCurrentStaff();
                payload.items = newServices.map(item => ({
                    serviceId: item.productId || item.variantId,
                    quantity: item.quantity,
                    unitPrice: item.sellingPrice,
                    staffAssignments: [{
                        staffId: staffAssignments[item.variantId] || currentStaff?.staffId,
                    }].filter(a => a.staffId),
                }));
            }

            if (newProducts.length > 0) {
                payload.productItems = newProducts.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    unitPrice: item.sellingPrice,
                }));
            }

            const customerId = resolveCustomerId();
            if (customerId) payload.customerId = customerId;

            const updated = await serviceOrderService.update(activeServiceOrder!.id, payload);
            const parts: string[] = [];
            if (newServices.length > 0) parts.push(`${newServices.length} service(s)`);
            if (newProducts.length > 0) parts.push(`${newProducts.length} product(s)`);
            Notify.success(`Order ${updated.orderNumber} updated — ${parts.join(' & ')} added`);
            setActiveServiceOrder(updated);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to update service order'));
        }
    }, [activeServiceOrder, staffAssignments, resolveCurrentStaff, resolveCustomerId]);

    // ── Create or update order (F7 / Park Sale override) ────────────────────

    const handleCreateOrder = useCallback(() => {
        if (cartRef.current.length === 0) return;
        if (activeServiceOrder) {
            updateActiveOrder();
            return;
        }
        setIsCreateOrderOpen(true);
    }, [activeServiceOrder, updateActiveOrder]);

    // ── Quick-checkout: auto-create order in background ─────────────────────

    const handleQuickCheckout = useCallback(async () => {
        const currentCart = cartRef.current;
        const serviceItems = currentCart.filter(item => item.trackInventory === false);
        const productItems = currentCart.filter(item => item.trackInventory !== false);
        if (serviceItems.length === 0 && productItems.length === 0) return;

        let assignments: Record<string, string> = {};

        if (serviceItems.length > 0) {
            const currentStaff = resolveCurrentStaff();
            if (!currentStaff) {
                Notify.failure('No staff available to assign');
                return;
            }
            for (const item of serviceItems) {
                assignments[item.variantId] = staffAssignments[item.variantId] || currentStaff.staffId;
            }
        }

        try {
            const payload: CreateServiceOrderInput = {
                customerId: resolveCustomerId(),
            };

            if (serviceItems.length > 0) {
                payload.items = serviceItems.map(item => ({
                    serviceId: item.productId || item.variantId,
                    quantity: item.quantity,
                    unitPrice: item.sellingPrice,
                    staffAssignments: [{ staffId: assignments[item.variantId] }],
                }));
            }

            if (productItems.length > 0) {
                payload.productItems = productItems.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    unitPrice: item.sellingPrice,
                }));
            }

            const order = await serviceOrderService.create(payload);
            Notify.success(`Order ${order.orderNumber} auto-created`);
            setActiveServiceOrder(order);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to auto-create service order'));
            throw error;
        }
    }, [staffAssignments, resolveCurrentStaff, resolveCustomerId]);

    // ── Simple handlers ─────────────────────────────────────────────────────

    const handleServiceOrders = useCallback(() => {
        setIsServiceOrdersOpen(true);
    }, []);

    const handleCheckoutOrder = useCallback((order: ServiceOrderWithItems) => {
        setActiveServiceOrder(order);
    }, []);

    const clearActiveOrder = useCallback(() => {
        setActiveServiceOrder(null);
    }, []);

    return {
        activeServiceOrder,
        staffAssignments,
        setStaffAssignments,

        // Modal state
        isCreateOrderOpen,
        closeCreateOrder: useCallback(() => setIsCreateOrderOpen(false), []),
        isServiceOrdersOpen,
        closeServiceOrders: useCallback(() => setIsServiceOrdersOpen(false), []),

        // Actions
        handleCreateOrder,
        handleServiceOrders,
        handleQuickCheckout,
        handleCheckoutOrder,
        clearActiveOrder,
    };
}

export type ServiceOrderManager = ReturnType<typeof useServiceOrderManager>;
