import React from 'react';
import { Package, Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';

interface MobileProductListProps {
    data: Product[];
    isLoading: boolean;
    searchTerm?: string;
    selectedItems: Product[];
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    onViewStock: (product: Product) => void;
    onSelectItem?: (product: Product, selected: boolean) => void;
    totalRows: number;
}

const MobileProductList: React.FC<MobileProductListProps> = ({
    data,
    isLoading,
    searchTerm,
    selectedItems,
    onEdit,
    onDelete,
    onViewStock,
    onSelectItem,
    totalRows,
}) => {
    const isItemSelected = (product: Product) => {
        return selectedItems.some((selected) => selected.productId === product.productId);
    };

    if (isLoading && data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 text-sky-500 animate-spin" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading products...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <Package className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                    {searchTerm ? 'No matching products' : 'No products yet'}
                </h3>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                    {searchTerm
                        ? 'Try adjusting your search terms or clear the search to see all products.'
                        : 'Get started by adding your first product.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-4">
            {/* Results count */}
            <div className="px-1 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {data.length} of {totalRows} products
                </p>
                {selectedItems.length > 0 && (
                    <span className="text-sm font-medium text-sky-500 dark:text-sky-400">
                        {selectedItems.length} selected
                    </span>
                )}
            </div>

            {/* Cards */}
            {data.map((product) => (
                <ProductCard
                    key={product.productId}
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewStock={onViewStock}
                    isSelected={isItemSelected(product)}
                    onSelect={onSelectItem}
                />
            ))}

            {/* Loading indicator for pagination */}
            {isLoading && data.length > 0 && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
                </div>
            )}
        </div>
    );
};

export default MobileProductList;
