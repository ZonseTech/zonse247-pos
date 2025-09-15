import Panel from '../../components/Panel';
import CartTable from './partials/CartTable';
import Numpad from '../../components/Numpad';
import Footer from '../../components/Footer';
import BarcodeScanner from './partials/BarcodeScanner';
import FunctionButtons from './partials/FunctionButtons';
import ItemLookupModal from './partials/ItemLookupModal';
import { useProducts } from '../../context/ProductsProvider';
import { useFocusManager } from '../../hooks/useFocusManager';
import { FunctionComponent, useState, useEffect } from 'react';
import CheckoutModal, { CHECKOUT, PaymentMethod } from './partials/CheckoutModal';

const POSSystem: FunctionComponent = () => {
    const {
        cart,
        updateQuantity,
        updateCustomPrice,
        total,
        clearCart,
        products,
        categories,
        addToCart
    } = useProducts();

    const focusManager = useFocusManager();
    const [numpadInput, setNumpadInput] = useState('');
    const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
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
                case 'F5':
                    event.preventDefault();
                    handleDiscount();
                    break;
                case 'F12':
                    event.preventDefault();
                    handleOnBankTransfer();
                    break;
                case 'F8':
                    event.preventDefault();
                    handleOnEPayment();
                    break;
                case 'F10':
                    event.preventDefault();
                    handleOnPayCash();
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
        const cartItem = cart.find(item => item.productUuid === itemId);
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

    const handleCompleteTransaction = (paymentMethod: string, cashTendered?: number) => {
        console.log('Transaction completed:', {
            paymentMethod,
            cashTendered,
            total,
            cart: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.sellPrice,
                total: item.quantity * (item.sellPrice)
            }))
        });

        // Here you would typically:
        // 1. Save the transaction to your database
        // 2. Print the receipt
        // 3. Update inventory
        // 4. Clear the cart

        clearCart();
        setCustomPriceInputs({});
        setIsCheckoutModalOpen(false);
        focusManager.clearFocus();

        alert('Transaction completed successfully!');
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

    const handleOpenDrawer = () => {
        console.log('Opening cash drawer...');
        // Add drawer opening logic
    };

    const handleItemLookup = () => {
        setIsLookupModalOpen(true);
    };

    const handleReprint = () => {
        console.log('Reprinting receipt...');
        // Add reprint logic
    };

    const handleDiscount = () => {
        console.log('Applying discount...');
        // Add discount logic
    };

    const [checkoutType, setCheckoutType] = useState<PaymentMethod>(CHECKOUT.CASH);

    const handleOnBankTransfer = () => {
        if (cart.length === 0) {
            console.log('Cannot checkout with empty cart');
            return;
        }

        setCheckoutType(CHECKOUT.BANK_TRANSFER);
        setIsCheckoutModalOpen(true);
    };

    const handleOnEPayment = () => {
        if (cart.length === 0) {
            console.log('Cannot checkout with empty cart');
            return;
        }
        setCheckoutType(CHECKOUT.E_PAYMENT);
        setIsCheckoutModalOpen(true);
    };

    const handleOnPayCash = () => {
        if (cart.length === 0) {
            console.log('Cannot checkout with empty cart');
            return;
        }
        setCheckoutType(CHECKOUT.CASH);
        setIsCheckoutModalOpen(true);
    };

    const handleAddToCartFromLookup = (product: Product) => {
        addToCart(product);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto pb-32">
                <div className="my-3">
                    <div className="flex items-center justify-between">
                        <Panel size='1/2'>
                            <h1 className="text-7xl uppercase tracking-wider font-bold text-black dark:text-gray-400">BALANCE DUE</h1>
                        </Panel>
                        <Panel size='1/2' className="bg-gray-800 text-green-400/95 text-center px-8 py-4 text-6xl font-bold">
                            MK {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Panel>
                    </div>
                </div>

                <div className="flex gap-x-4 mb-4">
                    <Panel size='3/4'>
                        <CartTable
                            focusManager={focusManager}
                            customPriceInputs={customPriceInputs}
                            onPriceChange={handlePriceInputChange}
                        />
                    </Panel>

                    <Panel size='1/4'>
                        <Numpad
                            onButtonClick={handleNumpadClick}
                            focusManager={focusManager}
                        />
                    </Panel>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                <div>
                    <div className="flex gap-x-4 my-6">
                        <Panel size='3/4'>
                            <label className="block text-lg font-bold text-black dark:text-gray-400 mb-1">
                                SCAN/ENTER PRODUCT CODE
                            </label>
                            <BarcodeScanner
                                externalInput={numpadInput}
                                onExternalInputProcessed={handleNumpadInputProcessed}
                                focusManager={focusManager}
                            />
                        </Panel>

                        <Panel size='1/4'>
                            <label className="block text-lg font-bold text-black dark:text-gray-400 mb-1">
                                TOTAL NUMBER OF ITEMS
                            </label>
                            <div className="bg-gray-800 text-white text-xl font-bold py-2.5 text-center">
                                {cart.length}
                            </div>
                        </Panel>
                    </div>

                    <Panel size='full' className="border-0 shadow-none">
                        <div className="mb-4">
                            <FunctionButtons
                                onVoidSale={handleVoidSale}
                                onParkSale={handleParkSale}
                                onOpenDrawer={handleOpenDrawer}
                                onItemLookup={handleItemLookup}
                                onReprint={handleReprint}
                                onDiscount={handleDiscount}
                                onBankTransfer={handleOnBankTransfer}
                                onEPayment={handleOnEPayment}
                                onPayCash={handleOnPayCash}
                            />
                        </div>
                    </Panel>
                </div>
                <Footer />
            </div>

            <ItemLookupModal
                isOpen={isLookupModalOpen}
                onClose={() => setIsLookupModalOpen(false)}
                products={products}
                categories={categories}
                onAddToCart={handleAddToCartFromLookup}
            />

            <CheckoutModal
                total={total}
                checkoutType={checkoutType}
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                onCompleteTransaction={handleCompleteTransaction}
            />
        </div>
    );
};

export default POSSystem;