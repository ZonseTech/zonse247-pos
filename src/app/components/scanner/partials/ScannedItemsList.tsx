import { Package } from 'lucide-react';
import { FunctionComponent } from 'react';
import ScannedItemCard from './ScannedItemCard';

interface ScannedItemsListProps {
    items: InventoryItem[];
    getCartQuantity: (productId: string) => number;
}

const ScannedItemsList: FunctionComponent<ScannedItemsListProps> = ({
    items,
    getCartQuantity,
}) => {
    if (items.length === 0) return null;

    return (
        <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Package className="w-5 h-5 text-sky-500" />
                    Scanned Items
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400 mono">{items.length} items</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {items.map((item, index) => (
                    <ScannedItemCard
                        key={item.productId}
                        item={item}
                        quantity={getCartQuantity(item.productId)}
                        animationDelay={index * 0.1}
                    />
                ))}
            </div>
        </div>
    );
};

export default ScannedItemsList;
