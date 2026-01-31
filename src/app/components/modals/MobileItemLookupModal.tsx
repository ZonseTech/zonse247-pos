import { Package, ArrowLeft, Check, ShoppingCart } from 'lucide-react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../../utils';
import { useState, useEffect, FunctionComponent, useRef } from 'react';
import { HiSearch } from 'react-icons/hi';
import { BsUpcScan } from 'react-icons/bs';
import { useAppSelector } from '../../hooks/redux';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

interface MobileItemLookupModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: InventoryItem[];
    onAddToCart: (item: InventoryItem) => void;
    onOpenScanner?: () => void;
    multiSelect?: boolean;
}

const MobileItemLookupModal: FunctionComponent<MobileItemLookupModalProps> = ({
    isOpen,
    onClose,
    inventory,
    onAddToCart,
    onOpenScanner,
    multiSelect = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const cartItems = useAppSelector((state) => state.cart.items);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            return;
        }

        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);

        let filtered = inventory.filter(item => {
            if (item.expirationDate && new Date(item.expirationDate) < new Date()) {
                return false;
            }
            return true;
        });

        if (searchTerm) {
            filtered = filtered.filter(item => {
                const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
                const barcodeMatch = item.barcode.toString().includes(searchTerm);
                return nameMatch || barcodeMatch;
            });
        }

        setFilteredItems(filtered);
    }, [inventory, searchTerm, isOpen]);

    const getCartQuantity = (productId: string): number => {
        const cartItem = cartItems.find(item => item.productId === productId);
        return cartItem ? cartItem.quantity : 0;
    };

    const getTotalCartCount = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    const navigate = useNavigate();

    const handleAddToCart = (item: InventoryItem) => {
        onAddToCart(item);
        if (!multiSelect) {
            onClose();
        }
    };

    const handleGoToCounter = () => {
        navigate(ROUTES.POS);

        setTimeout(onClose, 200);
    };

    const handleScannerClick = () => {
        if (onOpenScanner) {
            onClose();
            onOpenScanner();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[60] flex flex-col">
            <div className="bg-white dark:bg-gray-900 px-2 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-2 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-sm">
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 active:scale-95 transition-all rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                            aria-label="Close"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search item..."
                            className="flex-1 bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 font-light outline-none text-base py-1 focus:outline-none focus:ring-0 border-none"
                            autoFocus
                        />
                    </div>

                    <button
                        onClick={handleScannerClick}
                        className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-sm active:scale-95 transition-transform"
                        aria-label="Open camera scanner"
                    >
                        <BsUpcScan className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                    </button>
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800 ${multiSelect && getTotalCartCount() > 0 ? 'pb-20' : ''}`}>
                {filteredItems.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredItems.map((item) => {
                            const quantity = parseFloat((item.quantity || 0).toString());
                            const isOutOfStock = quantity <= 0;
                            if (isOutOfStock) return null;

                            const itemCartQuantity = getCartQuantity(item.productId);
                            const isSelected = itemCartQuantity > 0;

                            return (
                                <button
                                    key={item.productId}
                                    onClick={() => handleAddToCart(item)}
                                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${isSelected
                                        ? 'bg-sky-50 dark:bg-sky-900/30'
                                        : 'bg-white dark:bg-gray-900 hover:bg-sky-50 dark:hover:bg-sky-900/20'
                                        } active:bg-sky-100 dark:active:bg-sky-900/30`}
                                >
                                    {multiSelect && (
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected
                                            ? 'bg-sky-600 text-white'
                                            : 'border-2 border-gray-300 dark:border-gray-600'
                                            }`}>
                                            {isSelected && (
                                                itemCartQuantity > 1
                                                    ? <span className="text-xs font-bold">{itemCartQuantity}</span>
                                                    : <Check className="w-4 h-4" />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {item.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                {item.barcode}
                                            </span>
                                            {item.categoryDetails?.name && (
                                                <>
                                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {item.categoryDetails.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <div className="font-bold text-sky-600 dark:text-sky-400">
                                            {formatCurrency(parseFloat((item.sellPrice || 0).toString()))}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {quantity} in stock
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                            No items found
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                            {searchTerm
                                ? `No items match "${searchTerm}". Try a different search term.`
                                : 'Start typing to search for items by name or barcode.'
                            }
                        </p>
                    </div>
                )}
            </div>

            {multiSelect && getTotalCartCount() > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-10">
                    <button
                        onClick={handleGoToCounter}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Go To Counter ({getTotalCartCount()} Items)</span>
                    </button>
                </div>
            )}
        </div>,
        document.body
    );
};

export default MobileItemLookupModal;
