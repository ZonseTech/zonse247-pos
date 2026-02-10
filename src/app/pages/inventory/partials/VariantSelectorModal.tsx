import React from 'react';
import { X, Package, Plus, Minus, Pencil } from 'lucide-react';
import { BottomSheet, Button } from '../../../components';
import { formatCurrency } from '../../../utils';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';

interface VariantSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: ApiProduct | null;
    onSelectVariant: (product: ApiProduct, variant: ProductVariant) => void;
    onRemoveVariant: (product: ApiProduct, variant: ProductVariant) => void;
    onSetVariantQuantity: (product: ApiProduct, variant: ProductVariant, quantity: number) => void;
    getVariantCartQuantity: (variantId: string) => number;
}

const VariantSelectorModal: React.FC<VariantSelectorModalProps> = ({
    isOpen,
    onClose,
    product,
    onSelectVariant,
    onRemoveVariant,
    onSetVariantQuantity,
    getVariantCartQuantity,
}) => {
    const navigate = useNavigate();

    if (!product) return null;

    const handleIncrement = (variant: ProductVariant, e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectVariant(product, variant);
    };

    const handleDecrement = (variant: ProductVariant, e: React.MouseEvent) => {
        e.stopPropagation();
        onRemoveVariant(product, variant);
    };

    const handleQuantityChange = (variant: ProductVariant, value: string) => {
        const qty = parseInt(value, 10);
        if (!isNaN(qty) && qty >= 0) {
            onSetVariantQuantity(product, variant, qty);
        }
    };

    const handleEdit = () => {
        onClose();
        navigate(ROUTES.INVENTORY_FORM, { state: { productId: product.id } });
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={product.name}
            leftContent={
                <Button
                    type="button"
                    onClick={handleEdit}
                >
                    Edit Item
                </Button>
            }
            rightContent={
                <Button
                    type="button"
                    onClick={onClose}
                    theme='success'
                >
                    SELECT
                </Button>
            }
        >
            <div className="space-y-3 pb-8">
                {product.variants?.map((variant) => {
                    const cartQty = getVariantCartQuantity(variant.id);
                    const stockQty = variant.inventory?.availableQuantity ?? 0;
                    const reorderPoint = variant.inventory?.reorderPoint ?? 5;
                    const isOutOfStock = stockQty <= 0 && variant.inventory?.trackInventory;
                    const isLowStock = stockQty > 0 && stockQty <= reorderPoint;
                    const canDecrement = cartQty > 0;
                    const canIncrement = !isOutOfStock || !variant.inventory?.trackInventory;

                    return (
                        <div
                            key={variant.id}
                            className={`w-full flex items-center justify-between p-2.5 rounded-sm border transition-all ${isOutOfStock && cartQty === 0
                                ? 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-60'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="text-left min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                        {variant.variantName || 'Default'}
                                    </p>
                                    <div className="text-sm font-semibold text-sky-500 dark:text-sky-400">
                                        {formatCurrency(variant.sellingPrice, true)}
                                    </div>
                                    <div className={`text-xs ${isOutOfStock
                                        ? 'text-red-500'
                                        : isLowStock
                                            ? 'text-orange-500'
                                            : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        {isOutOfStock ? 'Out of stock' : `${stockQty} Left`}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={(e) => handleDecrement(variant, e)}
                                    disabled={!canDecrement}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${canDecrement
                                        ? 'text-red-600 dark:text-red-400 active:scale-95'
                                        : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>

                                <div className="w-14 text-center">
                                    <input
                                        type="number"
                                        min="0"
                                        value={cartQty}
                                        onChange={(e) => handleQuantityChange(variant, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`w-full text-center text-sm font-bold bg-transparent border-b-2 focus:outline-none transition-colors ${cartQty > 0
                                            ? 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-600 focus:border-green-500'
                                            : 'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 focus:border-gray-400'
                                            }`}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => handleIncrement(variant, e)}
                                    disabled={!canIncrement}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${canIncrement
                                        ? 'text-green-600 dark:text-green-400 active:scale-95'
                                        : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </BottomSheet>
    );
};

export default VariantSelectorModal;
