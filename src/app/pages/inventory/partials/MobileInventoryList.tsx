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

const SkeletonCard: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
        <div className="flex justify-between mb-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
        <div className="flex gap-2 mb-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded" />
        </div>
        <div className="flex gap-2">
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
    </div>
);

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

    // Show skeleton loading
    if (isLoading && data.length === 0) {
        return (
            <div className="space-y-3 pb-4">
                {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    // Empty state is handled by parent component
    if (data.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3 pb-4">
            {/* Results count */}
            <div className="px-1 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {data.length} of {totalRows} items
                </p>
                {selectedItems.length > 0 && (
                    <span className="text-sm font-medium text-sky-600 dark:text-sky-400">
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
                    <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
                </div>
            )}
        </div>
    );
};

export default MobileInventoryList;
