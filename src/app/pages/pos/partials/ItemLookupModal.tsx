import { X, Package } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import { useState, useEffect, FunctionComponent, useRef } from 'react';
import VirtualKeyboard from '../../../components/VirtualKeyboard';

interface ItemLookupModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    categories: Category[];
    onAddToCart: (product: Product) => void;
}

const ItemLookupModal: FunctionComponent<ItemLookupModalProps> = ({
    isOpen,
    onClose,
    products,
    categories,
    onAddToCart
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Detect if device supports touch
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setShowVirtualKeyboard(false);
            return;
        }

        let filtered = products.filter(product => {
            if (product.expirationDate && new Date(product.expirationDate) < new Date()) {
                return false;
            }
            return true;
        });

        if (searchTerm) {
            filtered = filtered.filter(product => {
                const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
                const barcodeMatch = product.barcode.toString().includes(searchTerm);
                return nameMatch || barcodeMatch;
            });
        }

        setFilteredProducts(filtered);
    }, [products, searchTerm, categories, isOpen]);

    const handleAddToCart = (product) => {
        onAddToCart(product);
        onClose();
    };

    const handleInputFocus = () => {
        if (isTouchDevice) {
            setShowVirtualKeyboard(true);
        }
    };

    const handleInputBlur = () => {
        // Small delay to allow keyboard button clicks to register
        setTimeout(() => {
            setShowVirtualKeyboard(false);
        }, 100);
    };

    const handleKeyPress = (key: string) => {
        setSearchTerm(prev => prev + key);
        // Keep focus on input
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
        // If there's exactly one product, add it to cart
        if (filteredProducts.length === 1) {
            const product = filteredProducts[0];
            const quantity = parseFloat((product.quantity || 0).toString());
            if (quantity > 0) {
                handleAddToCart(product);
            }
        }
        setShowVirtualKeyboard(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-200 to-blue-200 border-b border-gray-300">
                    <h2 className="text-2xl uppercase font-bold text-gray-800">
                        Search
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 bg-white/80 border-b border-gray-300">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="Search product name or code..."
                        className="w-full px-4 py-3 text-lg text-center border border-gray-300 rounded-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
                        autoFocus
                        // Disable browser virtual keyboard on touch devices when our virtual keyboard is shown
                        inputMode={isTouchDevice && showVirtualKeyboard ? "none" : "text"}
                    />
                </div>

                <div className="grid grid-cols-12 bg-gradient-to-r from-purple-200 to-blue-200 gap-4 px-6 py-4 font-bold text-lg text-gray-800 border-b border-gray-400">
                    <div className="col-span-6">PRODUCT NAME</div>
                    <div className="col-span-4 text-right">CURRENT SELLING PRICE</div>
                </div>

                <div className={`flex-1 overflow-auto bg-white/90 ${showVirtualKeyboard ? 'pb-0' : ''}`}>
                    {filteredProducts.length > 0 ? (
                        <div className="divide-y divide-gray-300">
                            {filteredProducts.map((product, index) => {
                                const quantity = parseFloat((product.quantity || 0).toString());
                                const isOutOfStock = quantity <= 0;

                                if (isOutOfStock) return null;

                                return (
                                    <div
                                        key={product.uuid}
                                        onClick={() => handleAddToCart(product)}
                                        className={`grid grid-cols-12 gap-4 px-6 py-4 text-lg cursor-pointer ${index % 2 === 0 ? 'bg-purple-50/80' : 'bg-blue-50/80'
                                            } ${isOutOfStock ? 'opacity-60' : 'hover:bg-purple-100/80'}`}
                                    >
                                        <div className="col-span-6 font-semibold text-gray-800 flex items-center">
                                            {product.name}
                                            <span className="ml-2 text-sm text-gray-600">({product.categoryDetails?.name})</span>
                                        </div>
                                        <div className="col-span-4 text-right font-bold flex items-center justify-end">
                                            {formatCurrency(parseFloat((product.sellPrice || 0).toString()))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center text-gray-600 py-12">
                            <Package className="w-16 h-16 mb-4 opacity-50" />
                            <h3 className="text-xl font-medium mb-2">
                                No products found
                            </h3>
                            <p className="text-lg max-w-md text-center opacity-75">
                                {searchTerm
                                    ? 'No products match your current search criteria.'
                                    : 'Start typing to search for products.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                <VirtualKeyboard
                    onKeyPress={handleKeyPress}
                    onBackspace={handleBackspace}
                    onSpace={handleSpace}
                    onEnter={handleEnter}
                    className="border-t border-gray-300"
                />
            </div>
        </div>
    );
};

export default ItemLookupModal;