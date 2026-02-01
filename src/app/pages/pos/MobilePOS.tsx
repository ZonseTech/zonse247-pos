import MobileCartItemCard from './partials/MobileCartItemCard';
import MobilePaymentModal, { PaymentMode } from './partials/MobilePaymentModal';
import MobileEditItemModal from './partials/MobileEditItemModal';
import MobileCheckoutModal, { CHECKOUT, PaymentMethod } from './partials/MobileCheckoutModal';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import CustomerSelector from '../customers/partials/CustomerSelector';
import MultiplePaymentModal from './partials/MultiplePaymentModal';
import { CameraBarcodeScanner } from '../../components';
import { HelpModal, MobileItemLookupModal } from '../../components/modals';
import { FunctionComponent, useState, useEffect } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { useFocusManager } from '../../hooks/useFocusManager';
import { formatCurrency } from '../../utils';
import { useParkedSales } from '../../hooks/useParkedSales';
import { useBranch } from '../../context/BranchContext';
import BranchSwitchModal from '../../navigation/components/BranchSwitchModal';
import { HiOutlineChatAlt2, HiSearch, HiShoppingCart, HiPlusCircle, HiMenu } from 'react-icons/hi';
import { RiUserAddLine } from 'react-icons/ri';
import { FaCaretDown } from 'react-icons/fa';
import { BsUpcScan } from 'react-icons/bs';
import InventoryStatsCard from '../../components/stats/InventoryStatsCard';
import { HiArrowRight } from 'react-icons/hi2';
import { useMobileNav } from '../../context/MobileNavContext';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';

const MobilePOS: FunctionComponent = () => {
    const {
        cart,
        inventory,
        addToCart,
        setCart,
        setSelectedCustomer,
        total
    } = useInventory();
    const { currentBranch } = useBranch();
    const { parkedSales, fetchParkedSales, resumeParkedSale, isLoading: isLoadingParked } = useParkedSales();
    const { openDrawer } = useMobileNav();
    const navigate = useNavigate();
    const focusManager = useFocusManager();

    const [isBranchSwitchModalOpen, setIsBranchSwitchModalOpen] = useState(false);
    const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
    const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isMultiplePaymentModalOpen, setIsMultiplePaymentModalOpen] = useState(false);
    const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethod>(CHECKOUT.CASH);
    const [editingItem, setEditingItem] = useState<CartItem | null>(null);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);

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

    const handleCameraScan = (result: { barcode: string }) => {
        if (result.barcode) {
            setIsCameraScannerOpen(false);
        }
    };

    const handleAddToCartFromLookup = (item: InventoryItem) => {
        addToCart(item);
    };

    const handleResumeParkedSale = async (sale: ParkedSale) => {
        try {
            const result = await resumeParkedSale(sale.id);
            if (result) {
                setCart(sale.items);
                if (sale.customer) {
                    setSelectedCustomer(sale.customer);
                }
            }
        } catch (error) {
            console.error('Failed to resume sale:', error);
        }
    };

    const hasCartItems = cart.length > 0;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    className='bg-sky-500 dark:bg-sky-700'
                    noBorder
                    showLeftButton={false}
                    title={
                        <div className="flex items-center gap-3">
                            <HiMenu
                                className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                                onClick={openDrawer}
                            />
                            <button
                                onClick={() => setIsBranchSwitchModalOpen(true)}
                                className="flex items-center gap-1 rounded-sm active:scale-95 transition-all"
                            >
                                <span className="text-base font-semibold text-white truncate max-w-[180px]">
                                    {currentBranch?.branchName || 'Select Branch'}
                                </span>
                                <FaCaretDown className="w-4 h-4 text-sky-100 flex-shrink-0" />
                            </button>
                        </div>
                    }
                    rightContent={
                        <div className="flex gap-4 items-center">
                            <CustomerSelector
                                trigger={
                                    <RiUserAddLine className="w-6 h-6 text-white active:scale-95 transition-transform" />
                                }
                            />
                            <HiOutlineChatAlt2
                                className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                                onClick={() => setIsHelpModalOpen(true)}
                            />
                        </div>
                    }
                >
                    {!hasCartItems ? (
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
                </MobilePageHeader>
            </div>

            <div className={`flex-1 min-h-0 overflow-hidden ${hasCartItems ? 'pt-[52px]' : 'pt-[108px]'}`}>
                <div className="h-full overflow-y-auto pb-40">
                    {hasCartItems ? (
                        <MobileCartItemCard
                            onEditItem={handleEditItem}
                            onAddNewItem={() => navigate(ROUTES.ITEMS)}
                            onScanBarcode={() => setIsCameraScannerOpen(true)}
                        />
                    ) : (
                        <div className="space-y-5 px-4 pt-2">
                            <button
                                onClick={() => navigate(ROUTES.ITEMS)}
                                className="w-full flex flex-col items-center justify-center gap-2 py-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 active:bg-gray-100 dark:active:bg-gray-700 rounded-sm transition-colors"
                            >
                                <HiPlusCircle className="w-10 h-10 text-emerald-500" />
                                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 ">New Sale</span>
                            </button>

                            <InventoryStatsCard inventory={inventory} />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 tracking-wide">Pending Sales (Park):</h3>
                                    {parkedSales.length > 0 && (
                                        <span className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                            {parkedSales.length}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => { /* TODO: Navigate to pending sales page */ }}
                                    className="flex items-center gap-1 text-sky-500 dark:text-sky-400 text-sm font-medium active:scale-95 transition-transform"
                                >
                                    <HiArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-sm shadow-none border border-gray-200 dark:border-gray-700">

                                {isLoadingParked ? (
                                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                        Loading...
                                    </div>
                                ) : parkedSales.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                        <HiShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                        <p>No pending sales</p>
                                    </div>
                                ) : (
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
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <BranchSwitchModal
                isOpen={isBranchSwitchModalOpen}
                onClose={() => setIsBranchSwitchModalOpen(false)}
            />

            <CameraBarcodeScanner
                isOpen={isCameraScannerOpen}
                onClose={() => setIsCameraScannerOpen(false)}
                onScan={handleCameraScan}
                title="Scan Product"
                subtitle="Point camera at product barcode"
            />

            <MobileItemLookupModal
                isOpen={isLookupModalOpen}
                onClose={() => setIsLookupModalOpen(false)}
                inventory={inventory}
                onAddToCart={handleAddToCartFromLookup}
                onOpenScanner={() => setIsCameraScannerOpen(true)}
                multiSelect
            />

            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
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

            {hasCartItems && (
                <div className="fixed bottom-[65px] left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40 safe-area-bottom">
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
