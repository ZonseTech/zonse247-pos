import React from 'react';
import { Package, Loader2 } from 'lucide-react';
import InventoryCard from './InventoryCard';

interface MobileInventoryListProps {
    data: InventoryItem[];
    isLoading: boolean;
    searchTerm?: string;
    selectedItems: InventoryItem[];
    onEdit: (item: InventoryItem) => void;
    onDelete: (productId: string) => void;
    onAdjustQuantity?: (item: InventoryItem) => void;
    onSelectItem?: (item: InventoryItem, selected: boolean) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    totalRows: number;
}

const MobileInventoryList: React.FC<MobileInventoryListProps> = ({
    data,
    isLoading,
    searchTerm,
    selectedItems,
    onEdit,
    onDelete,
    onAdjustQuantity,
    onSelectItem,
    totalRows,
}) => {
    const isItemSelected = (item: InventoryItem) => {
        return selectedItems.some(selected => selected.productId === item.productId);
    };

    if (isLoading && data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading inventory...</p>
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
                    {searchTerm ? 'No matching items' : 'No inventory items yet'}
                </h3>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                    {searchTerm
                        ? 'Try adjusting your search terms or clear the search to see all items.'
                        : 'Get started by adding your first inventory item.'
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-4">
            {/* Results count */}
            <div className="px-1 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {data.length} of {totalRows} items
                </p>
                {selectedItems.length > 0 && (
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {selectedItems.length} selected
                    </span>
                )}
            </div>

            {/* Cards */}
            {data.map((item) => (
                <InventoryCard
                    key={item.productId}
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAdjustQuantity={onAdjustQuantity}
                    isSelected={isItemSelected(item)}
                    onSelect={onSelectItem}
                />
            ))}

            {/* Loading indicator for pagination */}
            {isLoading && data.length > 0 && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                </div>
            )}
        </div>
    );
};

export default MobileInventoryList;
