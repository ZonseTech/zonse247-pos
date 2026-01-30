import { X, Package } from 'lucide-react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../../utils';
import { useIsMobile, useIsEBN } from '../../hooks/useMediaQuery';
import InputKeyboard from '../InputKeyboard';
import { useKeyboardSettings } from '../../hooks/useKeyboardSettings';
import { useState, useEffect, FunctionComponent, useRef } from 'react';
import classNames from 'classnames';
import { Capacitor } from '@capacitor/core';

interface ItemLookupModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: InventoryItem[];
    onAddToCart: (item: InventoryItem) => void;
    barcodeScannerInputRef: React.RefObject<HTMLInputElement>;
}

const ItemLookupModal: FunctionComponent<ItemLookupModalProps> = ({
    isOpen,
    onClose,
    inventory,
    onAddToCart,
    barcodeScannerInputRef
}) => {
    const isMobile = useIsMobile()
    const isEBN = useIsEBN();
    const isNative = Capacitor.isNativePlatform();
    const keyboardSettings = useKeyboardSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
    const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setShowVirtualKeyboard(false);
            return;
        }

        // Frontend filtering is intentional for POS performance
        // Inventory is already loaded in memory for quick access
        let filtered = inventory.filter(item => {
            // Filter out expired items - these should never be sold
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

    const handleAddToCart = (item: InventoryItem) => {
        onAddToCart(item);
        barcodeScannerInputRef.current?.focus();
        onClose();
    };

    const handleInputFocus = () => {
        if (isTouchDevice) {
            setShowVirtualKeyboard(true);
        }
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setShowVirtualKeyboard(false);
        }, 100);
    };

    const handleKeyPress = (key: string) => {
        setSearchTerm(prev => prev + key);

        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleBackspace = () => {
        setSearchTerm(prev => prev.slice(0, -1));
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleSpace = () => {
        setSearchTerm(prev => prev + ' ');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleEnter = () => {
        if (filteredItems.length === 1) {
            const item = filteredItems[0];
            const quantity = parseFloat((item.quantity || 0).toString());
            if (quantity > 0) {
                handleAddToCart(item);
            }
        }
        setShowVirtualKeyboard(false);
    };

    if (!isOpen) return null;

    const showKeyboard = !isMobile && keyboardSettings.enabled;

    return createPortal(
        <div className={classNames(
            "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]",
            isEBN ? "p-1" : "p-4"
        )}>
            <div className={classNames(
                "bg-white dark:bg-gray-800 rounded-none shadow-xl w-full flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700",
                isEBN ? "max-w-5xl h-[98vh]" : "max-w-6xl max-h-[90vh]"
            )}>
                <div className={classNames(
                    "flex items-center justify-between bg-slate-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700",
                    isEBN ? "p-3" : "p-6"
                )}>
                    <h2 className={classNames(
                        "uppercase font-bold text-slate-800 dark:text-gray-100",
                        isEBN ? "text-lg" : "text-2xl"
                    )}>
                        Search Inventory
                    </h2>
                    <button
                        onClick={onClose}
                        className={classNames(
                            "text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-none hover:bg-slate-200 dark:hover:bg-gray-700",
                            isEBN ? "p-1" : "p-2"
                        )}
                    >
                        <X className={isEBN ? "w-5 h-5" : "w-6 h-6"} />
                    </button>
                </div>

                <div className={classNames(
                    "bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600",
                    isEBN ? "p-2" : "p-6"
                )}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="Search item name or barcode..."
                        className={classNames(
                            "w-full text-center border border-gray-300 dark:border-gray-500 rounded-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400",
                            isEBN ? "px-3 py-2 text-sm" : "px-4 py-3 text-lg"
                        )}
                        autoFocus
                        inputMode={isNative ? "text" : (isTouchDevice && showVirtualKeyboard ? "none" : "text")}
                    />
                </div>

                <div className={classNames(
                    "hidden md:grid grid-cols-12 bg-slate-100 dark:bg-gray-800 gap-4 font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600",
                    isEBN ? "px-3 py-2 text-xs" : "px-6 py-4 text-sm"
                )}>
                    <div className="col-span-3">Code</div>
                    <div className="col-span-6">Item Name</div>
                    <div className="col-span-3 text-right">Price</div>
                </div>

                <div className={classNames(
                    "flex-1 overflow-auto bg-white dark:bg-gray-800 min-h-0",
                    showVirtualKeyboard && (isEBN ? "max-h-48" : "max-h-60")
                )}>
                    {filteredItems.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredItems.map((item) => {
                                const quantity = parseFloat((item.quantity || 0).toString());
                                const isOutOfStock = quantity <= 0;
                                if (isOutOfStock) return null;

                                return (
                                    <div
                                        key={item.productId}
                                        onClick={() => handleAddToCart(item)}
                                        className="cursor-pointer bg-white dark:bg-gray-800 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:shadow-sm transition-all duration-150 group"
                                    >
                                        <div className="md:hidden px-4 py-3 space-y-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-slate-800 dark:text-gray-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate">
                                                        {item.name}
                                                    </div>
                                                    {item.categoryDetails?.name && (
                                                        <div className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                                            {item.categoryDetails.name}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-bold text-lg text-slate-900 dark:text-gray-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 whitespace-nowrap">
                                                    {formatCurrency(parseFloat((item.sellPrice || 0).toString()))}
                                                </div>
                                            </div>
                                            <div className="font-mono text-xs text-slate-500 dark:text-gray-400 group-hover:text-sky-500 dark:group-hover:text-sky-400">
                                                Code: {item.barcode}
                                            </div>
                                        </div>

                                        <div className={classNames(
                                            "hidden md:grid grid-cols-12 gap-4",
                                            isEBN ? "px-3 py-2" : "px-6 py-4"
                                        )}>
                                            <div className={classNames(
                                                "col-span-3 font-mono text-slate-600 dark:text-gray-400 flex items-center group-hover:text-sky-600 dark:group-hover:text-sky-400",
                                                isEBN ? "text-xs" : "text-sm"
                                            )}>
                                                {item.barcode}
                                            </div>
                                            <div className="col-span-6 flex flex-col justify-center">
                                                <div className={classNames(
                                                    "font-medium text-slate-800 dark:text-gray-100 group-hover:text-sky-600 dark:group-hover:text-sky-400",
                                                    isEBN && "text-sm"
                                                )}>
                                                    {item.name}
                                                </div>
                                                {item.categoryDetails?.name && (
                                                    <div className={classNames(
                                                        "text-slate-500 dark:text-gray-400 mt-1",
                                                        isEBN ? "text-xs" : "text-sm"
                                                    )}>
                                                        {item.categoryDetails.name}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={classNames(
                                                "col-span-3 text-right font-bold flex items-center justify-end text-slate-900 dark:text-gray-100 group-hover:text-sky-600 dark:group-hover:text-sky-400",
                                                isEBN ? "text-sm" : "text-lg"
                                            )}>
                                                {formatCurrency(parseFloat((item.sellPrice || 0).toString()))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={classNames(
                            "flex flex-1 flex-col items-center justify-center text-slate-500 dark:text-gray-400 px-4",
                            isEBN ? "py-6" : "py-16"
                        )}>
                            <Package className={classNames(
                                "mb-4 text-slate-300 dark:text-gray-600",
                                isEBN ? "w-10 h-10" : "w-16 h-16 md:w-20 md:h-20 md:mb-6"
                            )} />
                            <h3 className={classNames(
                                "font-medium text-slate-600 dark:text-gray-300 text-center",
                                isEBN ? "text-sm mb-1" : "text-lg md:text-xl mb-2 md:mb-3"
                            )}>
                                No items found
                            </h3>
                            <p className={classNames(
                                "max-w-md text-center text-slate-500 dark:text-gray-400 leading-relaxed",
                                isEBN ? "text-xs" : "text-sm md:text-base"
                            )}>
                                {searchTerm
                                    ? 'No items match your search criteria. Try a different search term.'
                                    : 'Start typing to search for items by name or barcode.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {showKeyboard && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                        <InputKeyboard
                            variant="full"
                            onKeyPress={handleKeyPress}
                            onBackspace={handleBackspace}
                            onSpace={handleSpace}
                            onEnter={handleEnter}
                            settings={{
                                theme: keyboardSettings.theme,
                                enableSound: keyboardSettings.enableSound,
                                enableHaptic: keyboardSettings.enableHaptic,
                            }}
                            compact={isEBN}
                        />
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default ItemLookupModal;