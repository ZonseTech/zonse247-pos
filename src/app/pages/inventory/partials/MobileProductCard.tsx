import React, { useCallback, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    AlertTriangle,
    Package,
    Edit2,
    Trash2,
    PackagePlus,
    History,
    MoreVertical,
    Tag,
} from 'lucide-react';
import { formatCurrency } from '../../../utils';
import dayjs from 'dayjs';

interface MobileProductCardProps {
    item: ApiProduct;
    onEdit?: (item: ApiProduct) => void;
    onDelete?: (productId: string) => void;
    onAdjustQuantity?: (item: ApiProduct) => void;
    onViewStockMovements?: (item: ApiProduct) => void;
    onTap?: (item: ApiProduct) => void;
}

const getDefaultVariant = (item: ApiProduct): ProductVariant | undefined =>
    item.variants?.find(v => v.isDefault) || item.variants?.[0];

const getStockBadge = (qty: number, reorderPoint: number) => {
    if (qty <= 0) return { label: 'Out of Stock', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' };
    if (qty <= reorderPoint) return { label: 'Low Stock', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' };
    return { label: 'In Stock', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' };
};

const MobileProductCard: React.FC<MobileProductCardProps> = ({
    item,
    onEdit,
    onDelete,
    onAdjustQuantity,
    onViewStockMovements,
    onTap,
}) => {
    const [showActions, setShowActions] = useState(false);

    const variant = getDefaultVariant(item);
    const qty = item.totalAvailableQuantity ?? 0;
    const reserved = item.totalReservedQuantity ?? 0;
    const reorderPoint = variant?.inventory?.reorderPoint ?? 0;
    const stockBadge = getStockBadge(qty, reorderPoint);
    const variantCount = item.variantCount ?? item.variants?.length ?? 1;
    const categoryName = item.categoryDetails?.name || 'Uncategorized';
    const unit = variant?.unit || item.defaultUnit || 'pc';

    const expiryInfo = (() => {
        if (!variant?.expirationDate) return null;
        const days = dayjs(variant.expirationDate).diff(dayjs(), 'day');
        if (days < 0) return { label: 'Expired', color: 'text-red-600 dark:text-red-400' };
        if (days <= 30) return { label: `${days}d left`, color: 'text-orange-600 dark:text-orange-400' };
        return null;
    })();

    const hasAnyAction = !!(onAdjustQuantity || onViewStockMovements || onEdit || onDelete);

    const handleCardTap = useCallback(() => {
        if (showActions) {
            setShowActions(false);
            return;
        }
        onTap?.(item);
    }, [showActions, onTap, item]);

    return (
        <DropdownMenu.Root open={showActions} onOpenChange={setShowActions}>
        <div
            className={`relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                       active:scale-[0.99] transition-transform touch-manipulation`}
            onClick={handleCardTap}
        >
            {/* Main content */}
            <div className="p-3.5">
                <div className="flex items-start gap-3">
                    {/* Product avatar */}
                    <div className="w-11 h-11 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                                    {item.name}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {categoryName}
                                    </span>
                                    {variantCount > 1 && (
                                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                            {variantCount} variants
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions menu trigger */}
                            {hasAnyAction && (
                                <DropdownMenu.Trigger asChild>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1.5 -mt-0.5 -mr-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                             hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        aria-label="Actions"
                                    >
                                        <MoreVertical className="w-4.5 h-4.5" />
                                    </button>
                                </DropdownMenu.Trigger>
                            )}
                        </div>

                        {/* Price and stock row */}
                        <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-baseline gap-2">
                                <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(variant?.sellingPrice || 0)}
                                </span>
                                {variant?.costPrice ? (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        Cost {formatCurrency(variant.costPrice)}
                                    </span>
                                ) : null}
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stockBadge.bg} ${stockBadge.text}`}>
                                    {qty} {unit}
                                </span>
                                {qty <= reorderPoint && qty > 0 && (
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                )}
                            </div>
                        </div>

                        {/* Extra info pills */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {reserved > 0 && (
                                <span className="text-[11px] text-orange-500 dark:text-orange-400">
                                    {reserved} reserved
                                </span>
                            )}
                            {expiryInfo && (
                                <span className={`text-[11px] font-medium ${expiryInfo.color}`}>
                                    {expiryInfo.label}
                                </span>
                            )}
                            {variant?.primaryBarcode && (
                                <span className="flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                                    <Tag className="w-3 h-3" />
                                    {variant.primaryBarcode}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick actions dropdown */}
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={4}
                    className="z-50 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                             shadow-lg min-w-[160px] py-1 animate-in fade-in-0 zoom-in-95 duration-150"
                >
                    {onAdjustQuantity && (
                        <DropdownMenu.Item
                            onSelect={() => onAdjustQuantity(item)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300
                                     hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer outline-none"
                        >
                            <PackagePlus className="w-4 h-4 text-purple-500" />
                            Adjust Stock
                        </DropdownMenu.Item>
                    )}
                    {onViewStockMovements && (variantCount <= 1) && (
                        <DropdownMenu.Item
                            onSelect={() => onViewStockMovements(item)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300
                                     hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer outline-none"
                        >
                            <History className="w-4 h-4 text-sky-500" />
                            Stock History
                        </DropdownMenu.Item>
                    )}
                    {onEdit && (
                        <DropdownMenu.Item
                            onSelect={() => onEdit(item)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300
                                     hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer outline-none"
                        >
                            <Edit2 className="w-4 h-4 text-green-500" />
                            Edit Item
                        </DropdownMenu.Item>
                    )}
                    {onDelete && (
                        <>
                            <DropdownMenu.Separator className="mx-3 my-0.5 h-px bg-gray-100 dark:bg-gray-700" />
                            <DropdownMenu.Item
                                onSelect={() => onDelete(variant?.id?.toString() || item.id?.toString() || '')}
                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 dark:text-red-400
                                         hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer outline-none"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Item
                            </DropdownMenu.Item>
                        </>
                    )}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </div>
        </DropdownMenu.Root>
    );
};

/** Skeleton for loading state */
export const MobileProductCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 animate-pulse">
        <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                <div className="flex justify-between">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
            </div>
        </div>
    </div>
);

export default MobileProductCard;
