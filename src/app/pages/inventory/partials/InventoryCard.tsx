import React from 'react';
import { Edit2, Trash2, PackagePlus, AlertTriangle, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import dayjs from 'dayjs';

interface InventoryCardProps {
    item: InventoryItem;
    onEdit: (item: InventoryItem) => void;
    onDelete: (productId: string) => void;
    onAdjustQuantity?: (item: InventoryItem) => void;
    isSelected?: boolean;
    onSelect?: (item: InventoryItem, selected: boolean) => void;
}

const getStockStatusColor = (quantity: number, minStock: number) => {
    if (quantity <= 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (quantity <= minStock) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
};

const getExpirationStatus = (expirationDate?: Date | string) => {
    if (!expirationDate) return null;
    const expDate = dayjs(expirationDate);
    const today = dayjs();
    const daysUntilExpiry = expDate.diff(today, 'day');

    if (daysUntilExpiry < 0) {
        return { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
    }
    if (daysUntilExpiry <= 30) {
        return { label: `${daysUntilExpiry}d left`, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' };
    }
    if (daysUntilExpiry <= 90) {
        return { label: `${daysUntilExpiry}d left`, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
    }
    return { label: 'Good', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
};

const InventoryCard: React.FC<InventoryCardProps> = ({
    item,
    onEdit,
    onDelete,
    onAdjustQuantity,
    isSelected = false,
    onSelect,
}) => {
    const qty = Number(item.quantity) || 0;
    const minStock = Number(item.minStock) || 0;
    const stockColorClass = getStockStatusColor(qty, minStock);
    const expirationStatus = getExpirationStatus(item.expirationDate);
    const isLowStock = qty <= minStock && qty > 0;
    const productId = item.productId?.toString() || '';

    return (
        <div
            className={`
                bg-white dark:bg-gray-800 
                rounded-xl shadow-sm 
                border ${isSelected ? 'border-sky-500 ring-2 ring-sky-200 dark:ring-sky-800' : 'border-gray-200 dark:border-gray-700'}
                overflow-hidden
                transition-all duration-200
                active:scale-[0.98]
            `}
        >
            {/* Main Content - Tappable area */}
            <div
                className="p-4 cursor-pointer"
                onClick={() => onEdit(item)}
            >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {onSelect && (
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        onSelect(item, e.target.checked);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-sky-600 focus:ring-sky-500"
                                />
                            )}
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {item.name}
                            </h3>
                        </div>
                        {item.brand && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {item.brand}
                            </p>
                        )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>

                {/* Category & Barcode */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {item.categoryDetails?.name && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                            {item.categoryDetails?.color && (
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: item.categoryDetails.color }}
                                />
                            )}
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                {item.categoryDetails.name}
                            </span>
                        </div>
                    )}
                    {item.barcode && (
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                            {item.barcode}
                        </span>
                    )}
                </div>

                {/* Quantity & Status Row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stockColorClass}`}>
                        {qty} {item.unit || 'pc'} in stock
                    </span>
                    {isLowStock && (
                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Low stock</span>
                        </div>
                    )}
                    {expirationStatus && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${expirationStatus.color}`}>
                            {expirationStatus.label}
                        </span>
                    )}
                </div>

                {/* Price Row */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                    <div className="flex items-center gap-4">
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">Cost</span>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {formatCurrency(Number(item.costPrice) || 0)}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">Sell</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {formatCurrency(Number(item.sellPrice) || 0)}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Min Stock</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{minStock}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {onAdjustQuantity && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdjustQuantity(item);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 
                            text-purple-600 dark:text-purple-400 
                            hover:bg-purple-50 dark:hover:bg-purple-900/20 
                            active:bg-purple-100 dark:active:bg-purple-900/30
                            transition-colors border-r border-gray-100 dark:border-gray-700"
                    >
                        <PackagePlus className="w-4 h-4" />
                        <span className="text-sm font-medium">Adjust</span>
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 
                        text-green-600 dark:text-green-400 
                        hover:bg-green-50 dark:hover:bg-green-900/20 
                        active:bg-green-100 dark:active:bg-green-900/30
                        transition-colors border-r border-gray-100 dark:border-gray-700"
                >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(productId);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 
                        text-red-600 dark:text-red-400 
                        hover:bg-red-50 dark:hover:bg-red-900/20 
                        active:bg-red-100 dark:active:bg-red-900/30
                        transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete</span>
                </button>
            </div>
        </div>
    );
};

export default InventoryCard;
