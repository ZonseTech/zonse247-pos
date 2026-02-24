import Panel from '../../components/Panel';
import CartTable from './partials/CartTable';
import InputKeyboard from '../../components/InputKeyboard';
import BarcodeScanner from './partials/BarcodeScanner';
import FunctionButtons from './partials/FunctionButtons';
import ItemLookupModal from './partials/ItemLookupModal';
import DiscountModal from './partials/DiscountModal';
import ReprintModal from './partials/ReprintModal';
import CustomerSelector from '../customers/partials/CustomerSelector';
import { useFocusManager } from '../../hooks/useFocusManager';
import { FunctionComponent, useState, useEffect, useRef } from 'react';
import CheckoutModal, { CHECKOUT, PaymentMethod } from './partials/CheckoutModal';
import MultiplePaymentModal from './partials/MultiplePaymentModal';
import { useInventory } from '../../hooks/useInventory';
import ParkSaleModal from './partials/ParkSaleModal';
import ParkedSalesModal from './partials/ParkedSalesModal';
import { useIsEBN } from '../../hooks/useMediaQuery';
import { useKeyboardSettings } from '../../hooks/useKeyboardSettings';
import { useLayout } from '../../context/LayoutContext';
import { isElectron } from '../../../helpers/index.helper';
import classNames from 'classnames';

const DesktopPOS: FunctionComponent = () => {
    const {
        cart,
        updateQuantity,
        updateCustomPrice,
        total,
        subtotal,
        discount,
        clearCart,
        inventory,
        addToCart
    } = useInventory();

    const isEBN = useIsEBN();
    const { isSidebarHidden } = useLayout();
    const focusManager = useFocusManager();
    const keyboardSettings = useKeyboardSettings();
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

    // Only web browsers should have dynamic sidebar positioning (not Electron or EBN)
    const isSidebarVisible = !isElectron() && !isEBN && !isSidebarHidden;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.target instanceof HTMLInputElement) return;

            switch (event.key) {
                case 'F2':
                    event.preventDefault();
                    handleItemLookup();
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
                    handleParkSale();
                    break;
                case 'F3':
                    event.preventDefault();
                    handleParkedSales();
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
    }, [isLookupModalOpen]);

    const handleNumpadClick = (value: string) => {
        if (focusManager.activeComponent === 'barcode') {
            setNumpadInput(value);
        } else if (focusManager.activeComponent === 'quantity' && focusManager.activeItemId) {
            handleQuantityNumpadInput(focusManager.activeItemId, value);
        }
    };

    const handleQuantityNumpadInput = (itemId: string, value: string) => {
        const cartItem = cart.find(item => item.productId === itemId);
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
    };

    const handlePriceInputChange = (itemId: string, value: string) => {
        setCustomPriceInputs(prev => ({
            ...prev,
            [itemId]: value
        }));

        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0) {
            updateCustomPrice(itemId, numericValue);
        }
    };

    const handleNumpadInputProcessed = () => {
        setNumpadInput('');
    };

    const handleCompleteTransaction = (paymentMethod: PaymentMethod) => {
        if (cart.length === 0) return;
        setPaymentMethodId(paymentMethod);
        setIsCheckoutModalOpen(true);
    };

    const handleMultiplePayment = () => {
        if (cart.length === 0) return;
        setIsMultiplePaymentModalOpen(true);
    };

    const handleVoidSale = () => {
        clearCart();
        setCustomPriceInputs({});
        focusManager.clearFocus();
    };

    const handleParkSale = () => {
        if (cart.length === 0) return;
        setIsParkSaleModalOpen(true);
    };

    const handleParkedSales = () => {
        setIsParkedSalesModalOpen(true);
    };

    const handleOpenDrawer = () => {
        console.log('Opening cash drawer...');
        // Add drawer opening logic
    };

    const handleItemLookup = () => {
        setIsLookupModalOpen(true);
    };

    const handleReprint = () => {
        setIsReprintModalOpen(true);
    };

    const handleDiscount = () => {
        if (cart.length === 0) return;
        setIsDiscountModalOpen(true);
    };

    const handleAddToCartFromLookup = (item: InventoryItem) => {
        addToCart(item);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Fixed Balance Due (compact for EBN) */}
            <div className={classNames(
                "flex-shrink-0",
                isEBN ? "mb-1" : "mb-2 lg:mb-3"
            )}>
                <div className="flex items-center justify-between">
                    <Panel size='1/2'>
                        <h1 className={classNames(
                            "uppercase tracking-wider font-bold text-black dark:text-gray-400",
                            isEBN ? "text-xl" : "text-5xl lg:text-7xl"
                        )}>
                            BALANCE DUE
                        </h1>
                        {discount > 0 && (
                            <div className={classNames(
                                "flex items-center gap-2 mt-1",
                                isEBN ? "text-xs" : "text-sm lg:text-base"
                            )}>
                                <span className="text-gray-500 dark:text-gray-400">Subtotal: MK {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span className="text-green-500 dark:text-green-400 font-semibold">Discount: -MK {discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        )}
                    </Panel>
                    <Panel size='1/2' className={classNames(
                        "bg-gray-800 text-green-400/95 text-center font-bold",
                        isEBN
                            ? "px-2 py-1.5 text-xl"
                            : "px-4 lg:px-8 py-3 lg:py-4 text-4xl lg:text-6xl"
                    )}>
                        MK {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Panel>
                </div>
            </div>

            {/* Scrollable Cart Items Section */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full flex gap-x-2 lg:gap-x-4">
                    <Panel size={isEBN && keyboardSettings.enabled ? '2/3' : '3/4'} className='w-full h-full overflow-hidden'>
                        <div className={classNames(
                            "h-full overflow-y-auto",
                            isEBN ? "pb-28" : "pb-48"
                        )}>
                            <CartTable
                                focusManager={focusManager}
                                customPriceInputs={customPriceInputs}
                                onPriceChange={handlePriceInputChange}
                                compact={isEBN}
                            />
                        </div>
                    </Panel>

                    {keyboardSettings.enabled ? (
                        <Panel size={isEBN ? '1/3' : '1/4'} className='flex flex-shrink-0'>
                            <InputKeyboard
                                variant="numpad"
                                onButtonClick={handleNumpadClick}
                                focusManager={focusManager}
                                settings={{
                                    theme: keyboardSettings.theme,
                                    enableSound: keyboardSettings.enableSound,
                                    enableHaptic: keyboardSettings.enableHaptic,
                                }}
                                compact={isEBN}
                            />
                        </Panel>
                    ) : null}
                </div>
            </div>

            {/* Fixed Bottom Section (compact for EBN) */}
            <div className={classNames(
                "fixed right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30 transition-all duration-300",
                isSidebarVisible ? "left-64" : "left-0",
                isEBN ? "bottom-8" : "bottom-16"
            )}>
                <div className={classNames(
                    "flex gap-x-2 lg:gap-x-4",
                    isEBN ? "px-2 py-1" : "px-2 lg:px-4 py-3"
                )}>
                    <Panel size={isEBN && keyboardSettings.enabled ? '2/3' : '3/4'} className='w-full'>
                        <div className={classNames(
                            "flex items-center gap-2",
                            isEBN ? "mb-0.5" : "mb-0.5 lg:mb-1"
                        )}>
                            <label className={classNames(
                                "block font-bold text-black dark:text-gray-400 flex-1",
                                isEBN ? "text-xs" : "text-base lg:text-lg"
                            )}>
                                SCAN/ENTER PRODUCT CODE
                            </label>
                            <div className="block">
                                <CustomerSelector compact={isEBN} />
                            </div>
                        </div>
                        <BarcodeScanner
                            externalInput={numpadInput}
                            barcodeScannerInputRef={barcodeScannerInputRef}
                            onExternalInputProcessed={handleNumpadInputProcessed}
                            focusManager={focusManager}
                            compact={isEBN}
                        />
                    </Panel>

                    <Panel size={isEBN ? '1/3' : '1/4'} className='flex'>
                        <label className={classNames(
                            "block font-bold text-black dark:text-gray-400",
                            isEBN ? "text-xs mb-0.5" : "text-base lg:text-lg mb-0.5 lg:mb-1"
                        )}>
                            TOTAL NUMBER OF ITEMS
                        </label>
                        <div className={classNames(
                            "bg-gray-800 text-white font-bold text-center",
                            isEBN ? "text-sm py-2" : "text-lg lg:text-xl py-2 lg:py-2.5"
                        )}>
                            {cart.length}
                        </div>
                    </Panel>
                </div>

                <Panel size='full' className={classNames(
                    "border-0 shadow-none",
                    isEBN ? "px-2 pb-1" : "px-2 lg:px-4"
                )}>
                    <FunctionButtons
                        onVoidSale={handleVoidSale}
                        onParkSale={handleParkSale}
                        onParkedSales={handleParkedSales}
                        onOpenDrawer={handleOpenDrawer}
                        onItemLookup={handleItemLookup}
                        onReprint={handleReprint}
                        onDiscount={handleDiscount}
                        onMultiplePayment={handleMultiplePayment}
                        onBankTransfer={() => handleCompleteTransaction(CHECKOUT.BANK_TRANSFER)}
                        onEPayment={() => handleCompleteTransaction(CHECKOUT.E_PAYMENT)}
                        onPayCash={() => handleCompleteTransaction(CHECKOUT.CASH)}
                        compact={isEBN}
                    />
                </Panel>
            </div>

            {/* Modals */}
            <ParkSaleModal
                isOpen={isParkSaleModalOpen}
                onClose={() => setIsParkSaleModalOpen(false)}
                onSuccess={() => setIsParkSaleModalOpen(false)}
            />

            <ParkedSalesModal
                isOpen={isParkedSalesModalOpen}
                onClose={() => setIsParkedSalesModalOpen(false)}
                onResumeSuccess={() => setIsParkedSalesModalOpen(false)}
            />

            <ItemLookupModal
                isOpen={isLookupModalOpen}
                onClose={() => setIsLookupModalOpen(false)}
                inventory={inventory}
                onAddToCart={handleAddToCartFromLookup}
                barcodeScannerInputRef={barcodeScannerInputRef}
            />

            <CheckoutModal
                focusManager={focusManager}
                paymentMethodId={paymentMethodId}
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
            />

            <MultiplePaymentModal
                isOpen={isMultiplePaymentModalOpen}
                onClose={() => setIsMultiplePaymentModalOpen(false)}
            />

            <DiscountModal
                isOpen={isDiscountModalOpen}
                onClose={() => setIsDiscountModalOpen(false)}
            />

            <ReprintModal
                isOpen={isReprintModalOpen}
                onClose={() => setIsReprintModalOpen(false)}
            />
        </div>
    );
};

export default DesktopPOS;
