import React, { useState } from 'react';
import { Loader2, PlusCircle, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import { useAppSelector } from '../../../hooks/redux';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';
import { HiPlusCircle } from 'react-icons/hi2';
import VariantSelectorModal from './VariantSelectorModal';

interface MobileInventoryListProps {
    data: ApiProduct[];
    isLoading: boolean;
    searchTerm?: string;
    selectedItems: ApiProduct[];
    onEdit: (item: ApiProduct) => void;
    onDelete: (productId: string) => void;
    onAdjustQuantity?: (item: ApiProduct) => void;
    onSelectItem?: (item: ApiProduct, selected: boolean) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    totalRows: number;
    onAddToCart?: (item: ApiProduct, variant?: ProductVariant) => void;
    onRemoveFromCart?: (item: ApiProduct, variant?: ProductVariant) => void;
    onSetCartQuantity?: (item: ApiProduct, variant: ProductVariant, quantity: number) => void;
    onNewItem?: () => void;
}

const SkeletonTile: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse flex flex-col items-center justify-center aspect-square">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
    </div>
);

interface ItemTileProps {
    item: ApiProduct;
    onTap: (item: ApiProduct) => void;
    cartQuantity: number;
}

const ItemTile: React.FC<ItemTileProps> = ({ item, onTap, cartQuantity }) => {
    const imageUrl = item.imageUrl || item.variants?.[0]?.imageUrl;
    const firstLetter = item.name?.charAt(0)?.toUpperCase() || '?';
    const defaultVariant = item.variants?.find(v => v.isDefault) || item.variants?.[0];
    const sellingPrice = defaultVariant?.sellingPrice ?? 0;

    return (
        <button
            onClick={() => onTap(item)}
            className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center justify-center aspect-square active:scale-95 transition-all relative"
        >
            {cartQuantity > 0 && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-sm min-w-[24px] text-center">
                    x{cartQuantity}
                </div>
            )}

            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover mb-3"
                />
            ) : (
                <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-3">
                    <span className="text-xl font-bold text-sky-500 dark:text-sky-400">
                        {firstLetter}
                    </span>
                </div>
            )}

            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 text-center line-clamp-2 mb-1">
                {item.name}
            </p>

            <p className="text-sm font-semibold text-sky-500 dark:text-sky-400">
                {formatCurrency(sellingPrice)}
            </p>
        </button>
    );
};

interface NewItemTileProps {
    onTap: () => void;
}

const NewItemTile: React.FC<NewItemTileProps> = ({ onTap }) => (
    <button
        onClick={onTap}
        className="bg-white dark:bg-gray-800 rounded-sm border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 flex flex-col items-center justify-center aspect-square hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/10 active:scale-95 transition-all"
    >
        <HiPlusCircle className="w-8 h-8 text-sky-500 dark:text-sky-400 mb-3" />

        <p className="text-sm font-semibold text-sky-500 dark:text-sky-400 text-center">
            NEW ITEM
        </p>
    </button>
);

const MobileInventoryList: React.FC<MobileInventoryListProps> = ({
    data,
    isLoading,
    totalRows,
    onAddToCart,
    onRemoveFromCart,
    onSetCartQuantity,
    onNewItem,
}) => {
    const navigate = useNavigate();
    const cartItems = useAppSelector((state) => state.cart.items);
    const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

    const getTotalCartCount = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    // Get total cart quantity for a product (sum of all variants)
    const getProductCartQuantity = (product: ApiProduct): number => {
        // Get all variant IDs for this product
        const variantIds = product.variants?.map(v => v.id) || [];
        // Sum up quantities for all variants in cart
        return cartItems
            .filter(item => variantIds.includes(item.productId))
            .reduce((sum, item) => sum + item.quantity, 0);
    };

    // Get cart quantity for a specific variant
    const getVariantCartQuantity = (variantId: string): number => {
        const cartItem = cartItems.find(item => item.productId === variantId);
        return cartItem ? cartItem.quantity : 0;
    };

    const handleItemTap = (item: ApiProduct) => {
        const variantCount = item.variants?.length || 0;

        if (variantCount > 1) {
            // Multiple variants - show modal to select
            setSelectedProduct(item);
            setIsVariantModalOpen(true);
        } else {
            // Single variant - add directly to cart
            const defaultVariant = item.variants?.[0];
            onAddToCart?.(item, defaultVariant);
        }
    };

    const handleVariantSelect = (product: ApiProduct, variant: ProductVariant) => {
        onAddToCart?.(product, variant);
        // Don't close modal - allow user to add more of different variants
    };

    const handleVariantRemove = (product: ApiProduct, variant: ProductVariant) => {
        onRemoveFromCart?.(product, variant);
    };

    const handleSetVariantQuantity = (product: ApiProduct, variant: ProductVariant, quantity: number) => {
        onSetCartQuantity?.(product, variant, quantity);
    };

    const handleCloseVariantModal = () => {
        setIsVariantModalOpen(false);
        setSelectedProduct(null);
    };

    const handleNewItemTap = () => {
        onNewItem?.();
    };

    const handleGoToCart = () => {
        navigate(ROUTES.POS);
    };

    if (isLoading && data.length === 0) {
        return (
            <div className="pb-4">
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <SkeletonTile key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return null;
    }

    return (
        <div className="pb-4">
            {getTotalCartCount() > 0 && (
                <button
                    onClick={handleGoToCart}
                    className="w-full mb-3 py-3 bg-green-500 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Go to Cart ({getTotalCartCount()} items)</span>
                </button>
            )}

            <div className="grid grid-cols-3 gap-2">
                {data.map((item) => (
                    <ItemTile
                        key={item.id}
                        item={item}
                        onTap={handleItemTap}
                        cartQuantity={getProductCartQuantity(item)}
                    />
                ))}

                <NewItemTile onTap={handleNewItemTap} />
            </div>

            {isLoading && data.length > 0 && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
                </div>
            )}

            <VariantSelectorModal
                isOpen={isVariantModalOpen}
                onClose={handleCloseVariantModal}
                product={selectedProduct}
                onSelectVariant={handleVariantSelect}
                onRemoveVariant={handleVariantRemove}
                onSetVariantQuantity={handleSetVariantQuantity}
                getVariantCartQuantity={getVariantCartQuantity}
            />
        </div>
    );
};

export default MobileInventoryList;
