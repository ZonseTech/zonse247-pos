import { useState, useEffect, useRef, useCallback } from 'react';
import { Report, Confirm } from 'notiflix';
import { useFocusManager } from '../../../hooks/useFocusManager';
import { useInventory } from '../../../hooks/useInventory';
import { CHECKOUT, PaymentMethod } from '../partials/CheckoutModal';

interface POSControllerOptions {
    onParkSaleOverride?: () => void;
    onParkedSalesOverride?: () => void;
    /** Whether the POS is in service mode (non-retail) */
    isServiceMode?: boolean;
    /** The currently loaded service order (for checkout gating) */
    activeServiceOrder?: ServiceOrderWithItems | null;
    /** Called when user chooses to quick-checkout without a service order */
    onQuickCheckout?: () => Promise<void> | void;
}

export function usePOSController(options: POSControllerOptions = {}) {
    const inventory = useInventory();
    const {
        cart,
        updateQuantity,
        updateCustomPrice,
        clearCart,
        addToCart,
    } = inventory;

    const focusManager = useFocusManager();
    const barcodeScannerInputRef = useRef<HTMLInputElement>(null);
    const [numpadInput, setNumpadInput] = useState('');
    const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isParkSaleModalOpen, setIsParkSaleModalOpen] = useState(false);
    const [isParkedSalesModalOpen, setIsParkedSalesModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [isReprintModalOpen, setIsReprintModalOpen] = useState(false);
    const [isMultiplePaymentModalOpen, setIsMultiplePaymentModalOpen] = useState(false);
    const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethod>(CHECKOUT.CASH);
    const [customPriceInputs, setCustomPriceInputs] = useState<Record<string, string>>({});

    const handleNumpadClick = useCallback((value: string) => {
        if (focusManager.activeComponent === 'barcode') {
            setNumpadInput(value);
        } else if (focusManager.activeComponent === 'quantity' && focusManager.activeItemId) {
            handleQuantityNumpadInput(focusManager.activeItemId, value);
        }
    }, [focusManager.activeComponent, focusManager.activeItemId]);

    const handleQuantityNumpadInput = useCallback((itemId: string, value: string) => {
        const cartItem = cart.find(item => item.variantId === itemId);
        if (!cartItem) return;

        if (value === 'Del') {
            const currentStr = cartItem.quantity.toString();
            if (currentStr.length > 1) {
                const newQuantity = parseInt(currentStr.slice(0, -1));
                updateQuantity(itemId, Math.max(1, newQuantity));
            } else {
                updateQuantity(itemId, 0);
            }
        } else if (value === 'OK') {
            focusManager.clearFocus();
        } else if (!isNaN(parseInt(value))) {
            const currentStr = cartItem.quantity.toString();
            const newQuantityStr = currentStr === '0' ? value : currentStr + value;
            const newQuantity = parseInt(newQuantityStr);
            if (newQuantity <= 999) {
                updateQuantity(itemId, newQuantity);
            }
        }
    }, [cart, updateQuantity, focusManager]);

    const handlePriceInputChange = useCallback((itemId: string, value: string) => {
        setCustomPriceInputs(prev => ({
            ...prev,
            [itemId]: value
        }));

        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0) {
            updateCustomPrice(itemId, numericValue);
        }
    }, [updateCustomPrice]);

    const handleNumpadInputProcessed = useCallback(() => {
        setNumpadInput('');
    }, []);

    const handleCompleteTransaction = useCallback(async (paymentMethod: PaymentMethod) => {
        if (cart.length === 0) return;
        // In service mode, require an active service order if cart has services
        const hasServices = cart.some(item => item.trackInventory === false);
        if (options.isServiceMode && hasServices && !options.activeServiceOrder) {
            Confirm.show(
                'No Service Order',
                'You haven\'t created a service order yet. You can create one first or proceed directly to checkout.',
                'Proceed to Checkout',
                'Create Order (F7)',
                async () => {
                    // User chose to proceed — auto-create order in background
                    if (options.onQuickCheckout) {
                        try {
                            await options.onQuickCheckout();
                        } catch { /* handled inside callback */ }
                    }
                    setPaymentMethodId(paymentMethod);
                    setIsCheckoutModalOpen(true);
                },
                () => {
                    // User chose to create order first
                    options.onParkSaleOverride?.();
                },
            );
            return;
        }
        setPaymentMethodId(paymentMethod);
        setIsCheckoutModalOpen(true);
    }, [cart, options.isServiceMode, options.activeServiceOrder, options.onQuickCheckout, options.onParkSaleOverride]);

    const handleMultiplePayment = useCallback(async () => {
        if (cart.length === 0) return;
        // In service mode, require an active service order if cart has services
        const hasServices = cart.some(item => item.trackInventory === false);
        if (options.isServiceMode && hasServices && !options.activeServiceOrder) {
            Confirm.show(
                'No Service Order',
                'You haven\'t created a service order yet. You can create one first or proceed directly to checkout.',
                'Proceed to Checkout',
                'Create Order (F7)',
                async () => {
                    if (options.onQuickCheckout) {
                        try {
                            await options.onQuickCheckout();
                        } catch { /* handled inside callback */ }
                    }
                    setIsMultiplePaymentModalOpen(true);
                },
                () => {
                    options.onParkSaleOverride?.();
                },
            );
            return;
        }
        setIsMultiplePaymentModalOpen(true);
    }, [cart, options.isServiceMode, options.activeServiceOrder, options.onQuickCheckout, options.onParkSaleOverride]);

    const handleVoidSale = useCallback(() => {
        clearCart();
        setCustomPriceInputs({});
        focusManager.clearFocus();
    }, [clearCart, focusManager]);

    const handleParkSale = useCallback(() => {
        if (cart.length === 0) return;
        setIsParkSaleModalOpen(true);
    }, [cart.length]);

    const handleParkedSales = useCallback(() => {
        setIsParkedSalesModalOpen(true);
    }, []);

    const handleOpenDrawer = useCallback(() => {
        console.log('Opening cash drawer...');
    }, []);

    const handleItemLookup = useCallback(() => {
        setIsLookupModalOpen(true);
    }, []);

    const handleReprint = useCallback(() => {
        setIsReprintModalOpen(true);
    }, []);

    const handleDiscount = useCallback(() => {
        if (cart.length === 0) return;
        setIsDiscountModalOpen(true);
    }, [cart.length]);

    const handleAddToCartFromLookup = useCallback((item: InventoryItem) => {
        addToCart(item);
    }, [addToCart]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.target instanceof HTMLInputElement) return;

            switch (event.key) {
                case 'F2':
                    if (!options.isServiceMode) {
                        event.preventDefault();
                        handleItemLookup();
                    }
                    break;
                case 'F4':
                    event.preventDefault();
                    handleVoidSale();
                    break;
                case 'F6':
                    event.preventDefault();
                    handleOpenDrawer();
                    break;
                case 'F7':
                    event.preventDefault();
                    (options.onParkSaleOverride || handleParkSale)();
                    break;
                case 'F3':
                    event.preventDefault();
                    (options.onParkedSalesOverride || handleParkedSales)();
                    break;
                case 'F5':
                    event.preventDefault();
                    handleDiscount();
                    break;
                case 'F12':
                    event.preventDefault();
                    handleCompleteTransaction(CHECKOUT.BANK_TRANSFER);
                    break;
                case 'F8':
                    event.preventDefault();
                    handleCompleteTransaction(CHECKOUT.E_PAYMENT);
                    break;
                case 'F10':
                    event.preventDefault();
                    handleCompleteTransaction(CHECKOUT.CASH);
                    break;
                case 'F9':
                    event.preventDefault();
                    handleMultiplePayment();
                    break;
                case 'F11':
                    event.preventDefault();
                    handleReprint();
                    break;
                case 'Escape':
                    if (isLookupModalOpen) {
                        setIsLookupModalOpen(false);
                    } else {
                        focusManager.clearFocus();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        isLookupModalOpen,
        handleItemLookup,
        handleVoidSale,
        handleOpenDrawer,
        handleParkSale,
        handleParkedSales,
        handleDiscount,
        handleCompleteTransaction,
        handleMultiplePayment,
        handleReprint,
        focusManager,
        options.onParkSaleOverride,
        options.onParkedSalesOverride,
    ]);

    return {
        // Inventory data
        ...inventory,

        // Refs
        focusManager,
        barcodeScannerInputRef,

        // Input state
        numpadInput,
        customPriceInputs,
        paymentMethodId,

        // Modal states
        modals: {
            lookup: { isOpen: isLookupModalOpen, open: handleItemLookup, close: () => setIsLookupModalOpen(false) },
            checkout: { isOpen: isCheckoutModalOpen, open: () => { }, close: () => setIsCheckoutModalOpen(false) },
            parkSale: { isOpen: isParkSaleModalOpen, open: handleParkSale, close: () => setIsParkSaleModalOpen(false) },
            parkedSales: { isOpen: isParkedSalesModalOpen, open: handleParkedSales, close: () => setIsParkedSalesModalOpen(false) },
            discount: { isOpen: isDiscountModalOpen, open: handleDiscount, close: () => setIsDiscountModalOpen(false) },
            reprint: { isOpen: isReprintModalOpen, open: handleReprint, close: () => setIsReprintModalOpen(false) },
            multiplePayment: { isOpen: isMultiplePaymentModalOpen, open: handleMultiplePayment, close: () => setIsMultiplePaymentModalOpen(false) },
        },

        // Handlers
        handleNumpadClick,
        handlePriceInputChange,
        handleNumpadInputProcessed,
        handleCompleteTransaction,
        handleMultiplePayment,
        handleVoidSale,
        handleParkSale,
        handleParkedSales,
        handleOpenDrawer,
        handleItemLookup,
        handleReprint,
        handleDiscount,
        handleAddToCartFromLookup,
    };
}

export type POSController = ReturnType<typeof usePOSController>;
