import Panel from '../../components/Panel';
import CartTable from './partials/CartTable';
import CartItemCard from './partials/CartItemCard';
import InputKeyboard from '../../components/InputKeyboard';
import Footer from '../../components/Footer';
import BarcodeScanner from './partials/BarcodeScanner';
import FunctionButtons from './partials/FunctionButtons';
import ItemLookupModal from './partials/ItemLookupModal';
import DiscountModal from './partials/DiscountModal';
import PageHeader from '../../components/page/PageHeader';
import CustomerSelector from '../customers/partials/CustomerSelector';
import { useFocusManager } from '../../hooks/useFocusManager';
import { FunctionComponent, useState, useEffect, useRef } from 'react';
import CheckoutModal, { CHECKOUT, PaymentMethod } from './partials/CheckoutModal';
import MultiplePaymentModal from './partials/MultiplePaymentModal';
import { useInventory } from '../../hooks/useInventory';
import ParkSaleModal from './partials/ParkSaleModal';
import ParkedSalesModal from './partials/ParkedSalesModal';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { useIsMobile, useIsEBN } from '../../hooks/useMediaQuery';
import { SearchIcon, UserCircle2Icon } from 'lucide-react';
import { Link } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { Button, BottomSheet } from '../../components';
import { useKeyboardSettings } from '../../hooks/useKeyboardSettings';
import { useLayout } from '../../context/LayoutContext';
import { useApp } from '../../context/AppProvider';
import { isElectron } from '../../../helpers/index.helper';
import classNames from 'classnames';

const POSSystem: FunctionComponent = () => {
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
    const isMobile = useIsMobile();
    const isEBN = useIsEBN();
    const { isSidebarHidden } = useLayout();
    const { settings } = useApp();
    const focusManager = useFocusManager();
    const keyboardSettings = useKeyboardSettings();
    const barcodeScannerInputRef = useRef<HTMLInputElement>(null);
    const [numpadInput, setNumpadInput] = useState('');
    const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isParkSaleModalOpen, setIsParkSaleModalOpen] = useState(false);
    const [isParkedSalesModalOpen, setIsParkedSalesModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [isFunctionSheetOpen, setIsFunctionSheetOpen] = useState(false);
    const [isMultiplePaymentModalOpen, setIsMultiplePaymentModalOpen] = useState(false);
    const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethod>(CHECKOUT.CASH);
    const [customPriceInputs, setCustomPriceInputs] = useState<Record<string, string>>({});

    // Check if sidebar is actually visible (web nav enabled AND not hidden by toggle)
    const showWebNav = !isElectron() || settings?.navigationMenuType === 'web';
    const isSidebarVisible = showWebNav && !isMobile && !isSidebarHidden;
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
        if (focusManager.activeComponent === 'barcode') {
            setNumpadInput('');
        }
    };

    const handleCompleteTransaction = (paymentMethod: PaymentMethod) => {
        if (cart.length === 0) {
            return;
        }

        setPaymentMethodId(paymentMethod);
        setIsCheckoutModalOpen(true);
    };

    const handleMultiplePayment = () => {
        if (cart.length === 0) {
            return;
        }

        setIsMultiplePaymentModalOpen(true);
    };

    const handleVoidSale = () => {
        clearCart();
        setCustomPriceInputs({});
        focusManager.clearFocus();
    };

    const handleParkSale = () => {
        if (cart.length === 0) {
            return;
        }
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
        console.log('Reprinting receipt...');
    };

    const handleDiscount = () => {
        if (cart.length === 0) {
            return;
        }
        setIsDiscountModalOpen(true);
    };

    const handleAddToCartFromLookup = (item: InventoryItem) => {
        addToCart(item);
    };


    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Fixed Header - Mobile only */}
            <PageHeader
                title="Point of Sale"
                className='md:hidden flex-shrink-0'
                icon={<HiOutlineShoppingCart className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
                action={
                    <div className="flex gap-3 items-center">
                        <CustomerSelector />
                        <SearchIcon className="w-5 h-5 cursor-pointer" onClick={handleItemLookup} />
                        <Link to={ROUTES.MY_PROFILE} className='cursor-pointer'>
                            <UserCircle2Icon className="w-5 h-5" />
                        </Link>
                    </div>
                }
            />

            {/* Fixed Balance Due - Desktop only (compact for EBN) */}
            <div className={classNames(
                "flex-shrink-0 hidden md:block",
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
                                <span className="text-green-600 dark:text-green-400 font-semibold">Discount: -MK {discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                <div className="h-full md:flex md:gap-x-2 lg:gap-x-4">
                    {isMobile ? (
                        <div className="h-full overflow-y-auto pb-32">
                            <CartItemCard
                                customPriceInputs={customPriceInputs}
                                onPriceChange={handlePriceInputChange}
                            />
                        </div>
                    ) : (
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
                    )}

                    {keyboardSettings.enabled && (
                        <Panel size={isEBN ? '1/3' : '1/4'} className='hidden md:flex flex-shrink-0'>
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
                    )}
                </div>
            </div>

            {/* Fixed Bottom Section - Desktop (compact for EBN) */}
            <div className={classNames(
                "hidden md:block fixed right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30 transition-all duration-300",
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
                            isEBN ? "text-sm py-1" : "text-lg lg:text-xl py-2 lg:py-2.5"
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

            {/* Fixed Bottom Section - Mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30 safe-area-bottom">
                <div className="px-2 py-2">
                    <BarcodeScanner
                        externalInput={numpadInput}
                        barcodeScannerInputRef={barcodeScannerInputRef}
                        onExternalInputProcessed={handleNumpadInputProcessed}
                        focusManager={focusManager}
                    />
                </div>
                <div className="bg-sky-600 text-white flex">
                    <div className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center">
                        <div className="flex flex-col">
                            <span className="text-base sm:text-lg font-semibold">
                                MK {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-100">
                                <span>Items: {cart.length}</span>
                                {discount > 0 && (
                                    <span className="text-green-300">• Disc: -MK {discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        className="bg-sky-700 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold hover:bg-sky-800 active:bg-sky-900 rounded-none"
                        onClick={() => setIsFunctionSheetOpen(true)}
                        disabled={cart.length === 0}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <BottomSheet
                isOpen={isFunctionSheetOpen}
                onClose={() => setIsFunctionSheetOpen(false)}
                title="Actions"
            >
                <div className="grid grid-cols-2 gap-3 pb-2">
                    <Button
                        theme='danger'
                        onClick={() => { handleVoidSale(); setIsFunctionSheetOpen(false); }}
                    >
                        Void Sale
                    </Button>
                    <Button
                        theme='danger'
                        onClick={() => { handleParkSale(); setIsFunctionSheetOpen(false); }}
                    >
                        Park Sale
                    </Button>
                    <Button
                        theme='danger'
                        onClick={() => { handleParkedSales(); setIsFunctionSheetOpen(false); }}
                    >
                        Parked Sales
                    </Button>
                    <Button
                        theme='primary'
                        onClick={() => { handleReprint(); setIsFunctionSheetOpen(false); }}
                    >
                        Reprint
                    </Button>
                    <Button
                        theme='primary'
                        onClick={() => { handleDiscount(); setIsFunctionSheetOpen(false); }}
                    >
                        Discount
                    </Button>
                    <Button
                        theme='warning'
                        onClick={() => { handleMultiplePayment(); setIsFunctionSheetOpen(false); }}
                    >
                        Split Payment
                    </Button>
                    <Button
                        theme='success'
                        onClick={() => { handleCompleteTransaction(CHECKOUT.BANK_TRANSFER); setIsFunctionSheetOpen(false); }}
                    >
                        Bank Transfer
                    </Button>
                    <Button
                        theme='success'
                        onClick={() => { handleCompleteTransaction(CHECKOUT.E_PAYMENT); setIsFunctionSheetOpen(false); }}
                    >
                        E-Payment
                    </Button>
                    <Button
                        theme='success'
                        className="col-span-2"
                        onClick={() => { handleCompleteTransaction(CHECKOUT.CASH); setIsFunctionSheetOpen(false); }}
                    >
                        Pay Cash
                    </Button>
                </div>
            </BottomSheet>

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
        </div>
    );
};

export default POSSystem;