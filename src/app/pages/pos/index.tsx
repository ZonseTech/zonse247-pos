import Panel from '../../components/Panel';
import CartTable from './partials/CartTable';
import CartItemCard from './partials/CartItemCard';
import InputKeyboard from '../../components/InputKeyboard';
import Footer from '../../components/Footer';
import BarcodeScanner from './partials/BarcodeScanner';
import FunctionButtons from './partials/FunctionButtons';
import ItemLookupModal from './partials/ItemLookupModal';
import PageHeader from '../../components/page/PageHeader';
import CustomerSelector from './partials/CustomerSelector';
import { useFocusManager } from '../../hooks/useFocusManager';
import { FunctionComponent, useState, useEffect, useRef } from 'react';
import CheckoutModal, { CHECKOUT, PaymentMethod } from './partials/CheckoutModal';
import { useInventory } from '../../hooks/useInventory';
import HoldOrdersModal from './partials/HoldOrdersModal';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { SearchIcon, UserCircle2Icon } from 'lucide-react';
import { Link } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { Button, BottomSheet } from '../../components';
import { useKeyboardSettings } from '../../hooks/useKeyboardSettings';

const POSSystem: FunctionComponent = () => {
    const {
        cart,
        updateQuantity,
        updateCustomPrice,
        total,
        clearCart,
        inventory,
        addToCart
    } = useInventory();
    const isMobile = useIsMobile();
    const focusManager = useFocusManager();
    const keyboardSettings = useKeyboardSettings();
    const barcodeScannerInputRef = useRef<HTMLInputElement>(null);
    const [numpadInput, setNumpadInput] = useState('');
    const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isHoldOrdersModalOpen, setIsHoldOrdersModalOpen] = useState(false);
    const [isFunctionSheetOpen, setIsFunctionSheetOpen] = useState(false);
    const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethod>(CHECKOUT.CASH);
    const [customPriceInputs, setCustomPriceInputs] = useState<Record<string, string>>({});

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

    const handleVoidSale = () => {
        clearCart();
        setCustomPriceInputs({});
        focusManager.clearFocus();
    };

    const handleParkSale = () => {
        console.log('Parking sale...');
        // Add park sale logic
    };

    const handleParkedSales = () => {
        setIsHoldOrdersModalOpen(true)
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
        console.log('Applying discount...');
    };

    const handleAddToCartFromLookup = (item: InventoryItem) => {
        addToCart(item);
    };


    return (
        <div className="flex flex-col h-full">
            <PageHeader
                title="Point of Sale"
                className='md:hidden'
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
            <div className="flex-1 overflow-auto pb-32">
                <div className="mb-3 hidden md:block">
                    <div className="flex items-center justify-between">
                        <Panel size='1/2'>
                            <h1 className="text-7xl uppercase tracking-wider font-bold text-black dark:text-gray-400">BALANCE DUE</h1>
                        </Panel>
                        <Panel size='1/2' className="bg-gray-800 text-green-400/95 text-center px-8 py-4 text-6xl font-bold">
                            MK {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Panel>
                    </div>
                </div>

                <div className="md:flex md:gap-x-4 md:mb-4">
                    {isMobile ? (
                        <CartItemCard
                            customPriceInputs={customPriceInputs}
                            onPriceChange={handlePriceInputChange}
                        />
                    ) : (
                        <Panel size='3/4' className='w-full'>
                            <CartTable
                                focusManager={focusManager}
                                customPriceInputs={customPriceInputs}
                                onPriceChange={handlePriceInputChange}
                            />
                        </Panel>
                    )}

                    {keyboardSettings.enabled && (
                        <Panel size='1/4' className='hidden md:flex'>
                            <InputKeyboard
                                variant="numpad"
                                onButtonClick={handleNumpadClick}
                                focusManager={focusManager}
                                settings={{
                                    theme: keyboardSettings.theme,
                                    enableSound: keyboardSettings.enableSound,
                                    enableHaptic: keyboardSettings.enableHaptic,
                                }}
                            />
                        </Panel>
                    )}
                </div>
            </div>

            <div className="fixed md:px-4 bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                <div>
                    <div className="flex gap-x-4 my-3">
                        <Panel size='3/4' className='w-full mx-4 md:mx-0'>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="hidden md:block text-lg font-bold text-black dark:text-gray-400 flex-1">
                                    SCAN/ENTER PRODUCT CODE
                                </label>
                                <div className="hidden md:block">
                                    <CustomerSelector />
                                </div>
                            </div>
                            <BarcodeScanner
                                externalInput={numpadInput}
                                barcodeScannerInputRef={barcodeScannerInputRef}
                                onExternalInputProcessed={handleNumpadInputProcessed}
                                focusManager={focusManager}
                            />
                        </Panel>

                        <Panel size='1/4' className='hidden md:flex'>
                            <label className="block text-lg font-bold text-black dark:text-gray-400 mb-1">
                                TOTAL NUMBER OF ITEMS
                            </label>
                            <div className="bg-gray-800 text-white text-xl font-bold py-2.5 text-center">
                                {cart.length}
                            </div>
                        </Panel>
                    </div>

                    <Panel size='full' className="border-0 shadow-none">
                        <div className="hidden md:block mb-4">
                            <FunctionButtons
                                onVoidSale={handleVoidSale}
                                onParkSale={handleParkSale}
                                onParkedSales={handleParkedSales}
                                onOpenDrawer={handleOpenDrawer}
                                onItemLookup={handleItemLookup}
                                onReprint={handleReprint}
                                onDiscount={handleDiscount}
                                onBankTransfer={() => handleCompleteTransaction(CHECKOUT.BANK_TRANSFER)}
                                onEPayment={() => handleCompleteTransaction(CHECKOUT.E_PAYMENT)}
                                onPayCash={() => handleCompleteTransaction(CHECKOUT.CASH)}
                            />
                        </div>

                        <div className="md:hidden bg-sky-600 text-white flex">
                            <div className="flex-1 px-4 py-2.5 flex items-center">
                                <div className="flex flex-col">
                                    <span className="text-xl font-semibold">
                                        MK {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span>
                                        Total items: {cart.length}
                                    </span>
                                </div>
                            </div>
                            <Button
                                className="bg-sky-700 px-8 py-4 text-lg font-semibold hover:bg-sky-800 active:bg-sky-900"
                                onClick={() => setIsFunctionSheetOpen(true)}
                                disabled={cart.length === 0}
                            >
                                Next
                            </Button>
                        </div>
                    </Panel>
                </div>
                <div className="hidden md:block border-t border-gray-200 dark:border-gray-700">
                    <Footer />
                </div>
            </div>

            <BottomSheet
                isOpen={isFunctionSheetOpen}
                onClose={() => setIsFunctionSheetOpen(false)}
                title="Actions"
            >
                <div className="grid grid-cols-2 gap-3">
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
                        onClick={() => { handleItemLookup(); setIsFunctionSheetOpen(false); }}
                    >
                        Item Lookup
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

            <HoldOrdersModal
                isOpen={isHoldOrdersModalOpen}
                onClickOpen={() => setIsHoldOrdersModalOpen(false)} />

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
        </div>
    );
};

export default POSSystem;