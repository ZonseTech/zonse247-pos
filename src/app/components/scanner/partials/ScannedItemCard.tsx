import { FunctionComponent, useCallback } from 'react';
import { formatCurrency } from '../../../utils';

interface ScannedItemCardProps {
    item: InventoryItem;
    quantity: number;
    animationDelay: number;
}

const ScannedItemCard: FunctionComponent<ScannedItemCardProps> = ({
    item,
    quantity,
    animationDelay,
}) => {
    // Get product emoji based on category
    const getProductEmoji = useCallback((item: InventoryItem): string => {
        const categoryName = item.categoryDetails?.name?.toLowerCase() || '';
        if (categoryName.includes('food') || categoryName.includes('grocery')) return '🍎';
        if (categoryName.includes('drink') || categoryName.includes('beverage')) return '🥤';
        if (categoryName.includes('dairy')) return '🥛';
        if (categoryName.includes('meat')) return '🥩';
        if (categoryName.includes('bakery') || categoryName.includes('bread')) return '🍞';
        if (categoryName.includes('snack')) return '🍿';
        if (categoryName.includes('electronics')) return '📱';
        if (categoryName.includes('clothing') || categoryName.includes('apparel')) return '👕';
        if (categoryName.includes('health') || categoryName.includes('pharmacy')) return '💊';
        if (categoryName.includes('beauty') || categoryName.includes('cosmetic')) return '💄';
        if (categoryName.includes('home') || categoryName.includes('household')) return '🏠';
        return '📦';
    }, []);

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-sm p-3 border border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600 transition-all duration-300 hover:scale-105 active:scale-95 item-enter"
            style={{ animationDelay: `${animationDelay}s` }}
        >
            {/* Avatar with Quantity Badge */}
            <div className="relative mb-3">
                <div className="w-full aspect-square bg-sky-50 dark:bg-sky-900/30 rounded-sm flex items-center justify-center border border-sky-200 dark:border-sky-800 text-4xl">
                    {getProductEmoji(item)}
                </div>
                {/* Quantity Badge */}
                {quantity > 0 && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-sky-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <span className="text-xs font-bold text-white">{quantity}</span>
                    </div>
                )}
            </div>

            {/* Item Details */}
            <div className="text-center space-y-1">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-tight line-clamp-2">
                    {item.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {item.categoryDetails?.name || item.barcode}
                </p>
                <p className="text-base font-bold text-sky-500 mono">
                    {formatCurrency(parseFloat((item.sellingPrice || 0).toString()))}
                </p>
            </div>
        </div>
    );
};

export default ScannedItemCard;
