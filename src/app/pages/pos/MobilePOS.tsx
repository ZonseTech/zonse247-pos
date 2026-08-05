import MobileCartItemCard from './partials/MobileCartItemCard';
import MobilePaymentModal, { PaymentMode } from './partials/MobilePaymentModal';
import MobileEditItemModal from './partials/MobileEditItemModal';
import MobileCheckoutModal, { CHECKOUT, PaymentMethod } from './partials/MobileCheckoutModal';
import MobileTabPageHeader from '../../components/page/MobileTabPageHeader';
import CustomerSelector from '../customers/partials/CustomerSelector';
import MultiplePaymentModal from './partials/MultiplePaymentModal';
import { MobileItemLookupModal, MobileCameraScannerModal } from '../../components/modals';
import { FunctionComponent, useState, useEffect } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { useFocusManager } from '../../hooks/useFocusManager';
import { formatCurrency, hasAnyPermission, hasPermission } from '../../utils';
import { useParkedSales } from '../../hooks/useParkedSales';
import { useAuth } from '../../context/AuthProvider';
import { HiSearch, HiPlusCircle, HiUserAdd } from 'react-icons/hi';
import { BsUpcScan } from 'react-icons/bs';
import InventoryStatsCard from '../../components/stats/InventoryStatsCard';
import { HiArrowRight } from 'react-icons/hi2';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import POSGuide from './partials/POSGuide';
import type { Step } from 'react-joyride';

const MobilePOS: FunctionComponent = () => {
    const { user } = useAuth();
    const {
        cart,
        inventory,
        addToCart,
        setCart,
        setSelectedCustomer,
        total
    } = useInventory();
    const { parkedSales, fetchParkedSales, resumeParkedSale } = useParkedSales();
    const navigate = useNavigate();
    const focusManager = useFocusManager();
    const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
    const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isMultiplePaymentModalOpen, setIsMultiplePaymentModalOpen] = useState(false);
    const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethod>(CHECKOUT.CASH);
    const [editingItem, setEditingItem] = useState<CartItem | null>(null);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);

    const canViewItems = hasAnyPermission(user, ['products.view', 'inventory.view']);
    const canCreateSale = hasPermission(user, 'sales.create');
    const canProcessPayment = hasPermission(user, 'payments.process');
    const canViewParkedSales = hasAnyPermission(user, ['sales.hold', 'sales.view', 'sales.view.own']);

    useEffect(() => {
        fetchParkedSales();
    }, [fetchParkedSales]);

    const handleEditItem = (item: CartItem) => {
        setEditingItem(item);
        setIsEditItemModalOpen(true);
    };

    const handleSelectPaymentMode = (mode: PaymentMode) => {
        setIsPaymentModalOpen(false);

        if (cart.length === 0) return;

        switch (mode) {
            case 'cash':
                setPaymentMethodId(CHECKOUT.CASH);
                setIsCheckoutModalOpen(true);
                break;
            case 'e-pay':
                setPaymentMethodId(CHECKOUT.E_PAYMENT);
                setIsCheckoutModalOpen(true);
                break;
            case 'bank':
                setPaymentMethodId(CHECKOUT.BANK_TRANSFER);
                setIsCheckoutModalOpen(true);
                break;
            case 'split':
                setIsMultiplePaymentModalOpen(true);
                break;
        }
    };

    const handleAddToCartFromLookup = (item: InventoryItem) => {
        addToCart(item);
    };

    const handleResumeParkedSale = async (sale: ParkedSale) => {
        try {
            const result = await resumeParkedSale(sale.id);
            if (result) {
                setCart(sale.items.map(item => ({
                    variantId: item.variantId,
                    productId: item.productId,
                    barcode: item.barcode,
                    name: item.name,
                    categoryId: item.categoryId || '',
                    quantity: item.quantity,
                    sellingPrice: item.sellingPrice,
                    purchasePrice: item.purchasePrice,
                    discount: item.discount,
                    variancePrice: item.variancePrice,
                })));
                if (sale.customer) {
                    setSelectedCustomer(sale.customer);
                }
            }
        } catch (error) {
            console.error('Failed to resume sale:', error);
        }
    };

    const hasCartItems = cart.length > 0;

    const posGuideSteps: Step[] = [
        {
            target: '[data-pos-guide="mobile-header"]',
            content: 'Use the top bar to search items, scan barcodes, and pick a customer for the sale.',
            placement: 'bottom' as const,
        },
        ...(hasCartItems ? [{
            target: '[data-pos-guide="mobile-cart"]',
            content: 'Review or edit the current cart before you charge the customer.',
            placement: 'top' as const,
        }] : canCreateSale && canViewItems ? [{
            target: '[data-pos-guide="mobile-new-sale"]',
            content: 'Start a new sale from here when the cart is empty.',
            placement: 'top' as const,
        }] : []),

        ...(canViewParkedSales && parkedSales.length > 0 ? [{
            target: '[data-pos-guide="mobile-parked-sales"]',
            content: 'Resume parked sales from this list when you need to continue later.',
            placement: 'top' as const,
        }] : []),
        ...(hasCartItems && canProcessPayment ? [{
            target: '[data-pos-guide="mobile-charge"]',
            content: 'When you are ready, use this button to complete the payment.',
            placement: 'top' as const,
        }] : []),
    ];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50" data-pos-guide="mobile-header">
                <MobileTabPageHeader
                    rightContent={
                        <div className="flex items-center gap-2">
                            <POSGuide
                                steps={posGuideSteps}
                                storageKey="pos-guide-seen-mobile"
                                placement="inline"
                                buttonClassName="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                                buttonLabel="Guide"
                            />
                            <CustomerSelector
                                trigger={
                                    <HiUserAdd className="w-6 h-6 text-white active:scale-95 transition-transform" />
                                }
                            />
                        </div>
                    }
                >
                    {!hasCartItems && canViewItems ? (
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => setIsLookupModalOpen(true)}
                                className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 rounded-sm transition-colors border border-gray-200 dark:border-gray-700"
                            >
                                <HiSearch className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-500 dark:text-gray-400 font-light">Item Lookup</span>
                            </button>
                            <button
                                onClick={() => setIsCameraScannerOpen(true)}
                                className="p-2.5 bg-white dark:bg-gray-800 rounded-sm transition-colors border border-gray-200 dark:border-gray-700"
                                aria-label="Open camera scanner"
                            >
                                <BsUpcScan className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                            </button>
                        </div>
                    ) : null}
                </MobileTabPageHeader>
            </div>

            <div className={`flex-1 min-h-0 overflow-hidden ${hasCartItems ? 'pt-[52px]' : 'pt-[108px]'}`}>
                <div className="h-full overflow-y-auto pb-40">
                    {hasCartItems ? (
                        <div data-pos-guide="mobile-cart">
                            <MobileCartItemCard
                                onEditItem={handleEditItem}
                                onAddNewItem={canViewItems ? () => navigate(ROUTES.ITEMS) : undefined}
                                onScanBarcode={() => setIsCameraScannerOpen(true)}
                            />
                        </div>
                    ) : (
                        <div className="space-y-5 px-4 pt-2">
                            {canCreateSale && canViewItems && (
                                <button
                                    data-pos-guide="mobile-new-sale"
                                    onClick={() => navigate(ROUTES.ITEMS)}
                                    className="w-full flex flex-col items-center justify-center gap-2 py-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 active:bg-gray-100 dark:active:bg-gray-700 rounded-sm transition-colors"
                                >
                                    <HiPlusCircle className="w-10 h-10 text-emerald-500" />
                                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 ">New Sale</span>
                                </button>
                            )}

                            <InventoryStatsCard />

                            {canViewParkedSales && parkedSales.length > 0 && (
                                <>
                                    <div className="flex items-center justify-between" data-pos-guide="mobile-parked-sales">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 tracking-wide">Pending Sales (Park):</h3>
                                            <span className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                                {parkedSales.length}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => { /* TODO: Navigate to pending sales page */ }}
                                            className="flex items-center gap-1 text-sky-500 dark:text-sky-400 text-sm font-medium active:scale-95 transition-transform"
                                        >
                                            <HiArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-none border border-gray-200 dark:border-gray-700">
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {parkedSales.map((sale) => (
                                                <button
                                                    key={sale.id}
                                                    onClick={() => handleResumeParkedSale(sale)}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {sale.reference || `Sale #${sale.id.slice(-6)}`}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {sale.items.length} items • MK {sale.totalAmount?.toLocaleString() || '0'}
                                                        </p>
                                                    </div>
                                                    <span className="text-sky-500 dark:text-sky-400 text-sm font-medium">
                                                        Resume
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <MobileCameraScannerModal
                isOpen={isCameraScannerOpen}
                onClose={() => setIsCameraScannerOpen(false)}
                inventory={inventory}
                cart={cart}
                onAddToCart={addToCart}
                onOpenItemLookup={canViewItems ? () => setIsLookupModalOpen(true) : undefined}
            />

            <MobileItemLookupModal
                isOpen={isLookupModalOpen}
                onClose={() => setIsLookupModalOpen(false)}
                inventory={inventory}
                onAddToCart={handleAddToCartFromLookup}
                onOpenScanner={() => setIsCameraScannerOpen(true)}
                multiSelect
            />

            <MobilePaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                total={total}
                onSelectPaymentMode={handleSelectPaymentMode}
            />

            <MobileCheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                focusManager={focusManager}
                paymentMethodId={paymentMethodId}
            />

            <MultiplePaymentModal
                isOpen={isMultiplePaymentModalOpen}
                onClose={() => setIsMultiplePaymentModalOpen(false)}
            />

            <MobileEditItemModal
                isOpen={isEditItemModalOpen}
                onClose={() => {
                    setIsEditItemModalOpen(false);
                    setEditingItem(null);
                }}
                item={editingItem}
            />

            {hasCartItems && canProcessPayment && (
                <div className="fixed bottom-[65px] left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40 safe-area-bottom" data-pos-guide="mobile-charge">
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-full py-3 bg-green-500 hover:bg-green-700 active:bg-green-800 text-white font-bold text-lg rounded-sm transition-colors"
                    >
                        CHARGE: {formatCurrency(total, true)}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MobilePOS;
