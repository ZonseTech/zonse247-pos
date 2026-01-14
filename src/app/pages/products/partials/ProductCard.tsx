import React from 'react';
import { Pencil, Trash2, BarChart3, Barcode, Tag, ChevronRight, Calendar } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    onViewStock: (product: Product) => void;
    isSelected?: boolean;
    onSelect?: (product: Product, selected: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onEdit,
    onDelete,
    onViewStock,
    isSelected = false,
    onSelect,
}) => {
    const isActive = product.isActive;
    const statusConfig = isActive
        ? {
            label: 'Active',
            className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            dotColor: 'bg-green-500',
        }
        : {
            label: 'Inactive',
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            dotColor: 'bg-gray-500',
        };

    return (
        <div
            className={`
                bg-white dark:bg-gray-800 
                rounded-xl shadow-sm 
                border ${isSelected ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-200 dark:border-gray-700'}
                overflow-hidden
                transition-all duration-200
                active:scale-[0.98]
            `}
        >
            {/* Main Content - Tappable area */}
            <div className="p-4 cursor-pointer" onClick={() => onEdit(product)}>
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
                                        onSelect(product, e.target.checked);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                />
                            )}
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{product.name}</h3>
                        </div>
                        {product.sku && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">SKU: {product.sku}</p>
                        )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>

                {/* Category & Barcode */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {product.categoryDetails?.name && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <Tag className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                {product.categoryDetails.name}
                            </span>
                        </div>
                    )}
                    {product.primaryBarcode && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                            <Barcode className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                                {product.primaryBarcode}
                            </span>
                        </div>
                    )}
                </div>

                {/* Status & Date */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig.dotColor}`}></span>
                        {statusConfig.label}
                    </span>
                    {product.createdAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>
                                {new Date(product.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Price Row */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                    <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Selling Price</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'MWK',
                            }).format(product.sellingPrice)}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Unit</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{product.unit || 'pc'}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewStock(product);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 
                        text-purple-600 dark:text-purple-400 
                        hover:bg-purple-50 dark:hover:bg-purple-900/20 
                        active:bg-purple-100 dark:active:bg-purple-900/30
                        transition-colors border-r border-gray-100 dark:border-gray-700"
                >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Stock</span>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(product);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 
                        text-blue-600 dark:text-blue-400 
                        hover:bg-blue-50 dark:hover:bg-blue-900/20 
                        active:bg-blue-100 dark:active:bg-blue-900/30
                        transition-colors border-r border-gray-100 dark:border-gray-700"
                >
                    <Pencil className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(product.productId);
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

export default ProductCard;
