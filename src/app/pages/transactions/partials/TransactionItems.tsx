import { FunctionComponent } from "react";
import { formatCurrency } from "../../../utils";

const TransactionItems: FunctionComponent<{
    items: CartItem[];
    hasItems: boolean;
}> = ({ items, hasItems }) => (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                🛒 Items
            </h4>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
        </div>

        {hasItems ? (
            <div className="space-y-4">
                <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="space-y-3">
                    {items.map((item, index) => (
                        <ItemRow key={`${item.productUuid}-${index}`} item={item} />
                    ))}
                </div>
            </div>
        ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-lg font-medium">No items found</p>
                <p className="text-sm">This transaction appears to be empty</p>
            </div>
        )}
    </div>
);

const ItemRow: FunctionComponent<{ item: Partial<CartItem & { productDetails: Product }> }> = ({ item }) => {
    const itemTotal = item.quantity * item.sellPrice;

    return (
        <div className="grid grid-cols-12 gap-3 py-3 border-b border-gray-100 dark:border-gray-700/50 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-lg transition-colors duration-200 px-2 -mx-2">
            <div className="col-span-6">
                <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {item?.productDetails?.name}
                </div>
                {item.barcode && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                        #{item.barcode}
                    </div>
                )}
            </div>
            <div className="col-span-2 text-center text-gray-700 dark:text-gray-300 font-medium">
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                    {item.quantity}
                </span>
            </div>
            <div className="col-span-2 text-right text-gray-700 dark:text-gray-300 font-medium">
                {formatCurrency(item.sellPrice)}
            </div>
            <div className="col-span-2 text-right font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(itemTotal)}
            </div>
        </div>
    );
};

export default TransactionItems