import { X, Package } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import InputKeyboard from '../../../components/InputKeyboard';
import { useState, useEffect, FunctionComponent, useRef } from 'react';

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl uppercase font-bold text-slate-800 dark:text-gray-100">
                        Search Inventory
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded-none hover:bg-slate-200 dark:hover:bg-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="Search item name or barcode..."
                        className="w-full px-4 py-3 text-lg text-center border border-gray-300 dark:border-gray-500 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        autoFocus
                        inputMode={isTouchDevice && showVirtualKeyboard ? "none" : "text"}
                    />
                </div>

                <div className="hidden md:grid grid-cols-12 bg-slate-100 dark:bg-gray-800 gap-4 px-6 py-4 font-semibold text-sm uppercase tracking-wide text-slate-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    <div className="col-span-3">Code</div>
                    <div className="col-span-6">Item Name</div>
                    <div className="col-span-3 text-right">Price</div>
                </div>

                <div className={`flex-1 overflow-auto bg-white dark:bg-gray-800 ${showVirtualKeyboard ? 'max-h-60' : ''}`}>
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
                                        className="cursor-pointer bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:shadow-sm transition-all duration-150 group"
                                    >
                                        <div className="md:hidden px-4 py-3 space-y-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                                        {item.name}
                                                    </div>
                                                    {item.categoryDetails?.name && (
                                                        <div className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                                            {item.categoryDetails.name}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-bold text-lg text-slate-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 whitespace-nowrap">
                                                    {formatCurrency(parseFloat((item.sellPrice || 0).toString()))}
                                                </div>
                                            </div>
                                            <div className="font-mono text-xs text-slate-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                                                Code: {item.barcode}
                                            </div>
                                        </div>

                                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4">
                                            <div className="col-span-3 font-mono text-sm text-slate-600 dark:text-gray-400 flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {item.barcode}
                                            </div>
                                            <div className="col-span-6 flex flex-col justify-center">
                                                <div className="font-medium text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                    {item.name}
                                                </div>
                                                {item.categoryDetails?.name && (
                                                    <div className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                                                        {item.categoryDetails.name}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-span-3 text-right font-bold text-lg flex items-center justify-end text-slate-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {formatCurrency(parseFloat((item.sellPrice || 0).toString()))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center text-slate-500 dark:text-gray-400 py-16 px-4">
                            <Package className="w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6 text-slate-300 dark:text-gray-600" />
                            <h3 className="text-lg md:text-xl font-medium mb-2 md:mb-3 text-slate-600 dark:text-gray-300 text-center">
                                No items found
                            </h3>
                            <p className="text-sm md:text-base max-w-md text-center text-slate-500 dark:text-gray-400 leading-relaxed">
                                {searchTerm
                                    ? 'No items match your search criteria. Try a different search term.'
                                    : 'Start typing to search for items by name or barcode.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {!isMobile && (<div className="border-t border-gray-200 dark:border-gray-700">
                    <InputKeyboard
                        variant="full"
                        onKeyPress={handleKeyPress}
                        onBackspace={handleBackspace}
                        onSpace={handleSpace}
                        onEnter={handleEnter}
                    />
                </div>)}
            </div>
        </div>
    );
};

export default ItemLookupModal;