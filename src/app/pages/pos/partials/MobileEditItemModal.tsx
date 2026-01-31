import { FunctionComponent, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Trash2, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import { useInventory } from '../../../hooks/useInventory';
import Button from '../../../components/Button';
import { Confirm } from 'notiflix';

interface MobileEditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: CartItem | null;
}

type OfferType = 'discount' | 'free' | null;
type DiscountType = 'percentage' | 'price';

const MobileEditItemModal: FunctionComponent<MobileEditItemModalProps> = ({
    isOpen,
    onClose,
    item,
}) => {
    const { updateQuantity, updateCustomPrice, removeFromCart, inventory } = useInventory();

    const [sellingPrice, setSellingPrice] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [offerType, setOfferType] = useState<OfferType>(null);
    const [discountType, setDiscountType] = useState<DiscountType>('percentage');
    const [discountValue, setDiscountValue] = useState('');

    const getMaxStock = (): number => {
        if (!item) return 999;
        const inventoryItem = inventory.find(p => p.productId === item.productId);
        const availableInInventory = parseInt((inventoryItem?.quantity || '0').toString());
        return item.isDefault ? 999 : availableInInventory + quantity;
    };

    useEffect(() => {
        if (item && isOpen) {
            setSellingPrice(item.sellPrice.toString());
            setQuantity(item.quantity);
            setOfferType(item.discount > 0 ? 'discount' : null);
            setDiscountValue(item.discount > 0 ? item.discount.toString() : '');
        }
    }, [item, isOpen]);

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleIncrement = () => {
        const maxStock = getMaxStock();
        if (quantity < maxStock) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleDelete = () => {
        if (!item) return;

        Confirm.show(
            'Remove Item',
            `Are you sure you want to remove "${item.name}" from the cart?`,
            'Yes, Remove',
            'Cancel',
            () => {
                removeFromCart(item.productId);
                onClose();
            },
            () => { },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const handleUpdate = () => {
        if (!item) return;

        updateQuantity(item.productId, quantity);

        const newPrice = parseFloat(sellingPrice);
        if (!isNaN(newPrice) && newPrice >= 0) {
            updateCustomPrice(item.productId, newPrice);
        }

        if (offerType === 'free') {
            updateCustomPrice(item.productId, 0);
        } else if (offerType === 'discount' && discountValue) {
            const discount = parseFloat(discountValue);
            if (!isNaN(discount) && discount > 0) {
                if (discountType === 'percentage') {
                    const discountAmount = (newPrice * quantity * discount) / 100;
                    // Note: You may need to update the cart slice to handle discount
                } else {
                    // Price per item discount
                    // Note: You may need to update the cart slice to handle discount
                }
            }
        }

        onClose();
    };

    if (!isOpen || !item) return null;

    return createPortal(
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[70] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="p-2 -ml-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Edit Item
                    </h1>
                </div>
                <button
                    onClick={handleDelete}
                    className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Delete item"
                >
                    <Trash2 className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {item.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Original Price: {formatCurrency(item.sellPrice)}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selling Price
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                            MK
                        </span>
                        <input
                            type="number"
                            value={sellingPrice}
                            onChange={(e) => setSellingPrice(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            placeholder="0.00"
                        />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Changes will apply to this sale only
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Quantity
                    </label>
                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={handleDecrement}
                            disabled={quantity <= 1}
                            className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                        >
                            <Minus className="w-6 h-6" />
                        </button>
                        <span className="text-3xl font-bold text-gray-900 dark:text-white min-w-[80px] text-center">
                            x{quantity}
                        </span>
                        <button
                            onClick={handleIncrement}
                            disabled={quantity >= getMaxStock()}
                            className="w-14 h-14 flex items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Apply Offer
                    </label>
                    <div className="flex gap-4">
                        <label className="flex-1 flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="offerType"
                                checked={offerType === 'discount'}
                                onChange={() => setOfferType('discount')}
                                className="w-5 h-5 text-sky-600 border-gray-300 focus:ring-sky-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Give Discount
                            </span>
                        </label>
                        <label className="flex-1 flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="offerType"
                                checked={offerType === 'free'}
                                onChange={() => setOfferType('free')}
                                className="w-5 h-5 text-sky-600 border-gray-300 focus:ring-sky-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Give as Free
                            </span>
                        </label>
                    </div>

                    {offerType === 'discount' && (
                        <div className="mt-4 space-y-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDiscountType('percentage')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${discountType === 'percentage'
                                        ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border-2 border-sky-500'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-transparent'
                                        }`}
                                >
                                    By Percentage
                                </button>
                                <button
                                    onClick={() => setDiscountType('price')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${discountType === 'price'
                                        ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border-2 border-sky-500'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-transparent'
                                        }`}
                                >
                                    By Price (Per Item)
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                                    {discountType === 'percentage' ? '%' : 'MK'}
                                </span>
                                <input
                                    type="number"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                                />
                            </div>
                        </div>
                    )}

                    {offerType === 'free' && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm text-green-700 dark:text-green-400">
                                This item will be given for free. The price will be set to MK 0.00
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <Button
                    theme="success"
                    layout="primary"
                    size="large"
                    block
                    onClick={handleUpdate}
                >
                    UPDATE ITEM
                </Button>
            </div>
        </div>,
        document.body
    );
};

export default MobileEditItemModal;
