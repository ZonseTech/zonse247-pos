import { FunctionComponent } from "react";
import { formatCurrency } from "../../../utils";
import { ShoppingCart, Package, Hash } from "lucide-react";

// Union type for both CartItem and SaleItem
type ItemType = CartItem | SaleItem;

// Helper functions to normalize item properties
const getItemName = (item: ItemType): string => {
    if ('name' in item && item.name) return item.name;
    if ('productDetails' in item && item.productDetails?.name) return item.productDetails.name;
    if ('product' in item && (item as SaleItem).product?.name) return (item as SaleItem).product!.name;
    return 'Unknown Product';
};

const getItemPrice = (item: ItemType): number => {
    if ('sellPrice' in item) return item.sellPrice;
    if ('unitPrice' in item) return item.unitPrice;
    return 0;
};

const getItemBarcode = (item: ItemType): string | number | undefined => {
    if ('barcode' in item) return item.barcode;
    if ('product' in item) {
        const saleItem = item as SaleItem;
        return saleItem.product?.primaryBarcode || saleItem.product?.barcodes?.[0]?.barcode;
    }
    return undefined;
};

const SaleItems: FunctionComponent<{
    items: ItemType[];
    hasItems: boolean;
}> = ({ items = [], hasItems }) => (
    <div className="bg-white dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                <ShoppingCart className="w-4 h-4" />
                Items Purchased
            </h4>
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
        </div>

        {hasItems ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {/* Table Header */}
                <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50/50 dark:bg-gray-800/30 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-right">Total</div>
                </div>

                {/* Items */}
                {items.map((item, index) => (
                    <ItemRow key={`${item.productId}-${index}`} item={item} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No items found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This transaction appears to be empty</p>
            </div>
        )}
    </div>
);

const ItemRow: FunctionComponent<{ item: ItemType }> = ({ item }) => {
    const price = getItemPrice(item);
    const itemTotal = item.quantity * price;
    const barcode = getItemBarcode(item);

    return (
        <div className="grid grid-cols-12 gap-3 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
            {/* Product Info */}
            <div className="col-span-12 sm:col-span-6">
                <div className="flex items-start gap-3">
                    <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex-shrink-0">
                        <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {getItemName(item)}
                        </p>
                        {barcode && (
                            <div className="flex items-center gap-1 mt-1">
                                <Hash className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    {barcode}
                                </span>
                            </div>
                        )}
                        {/* Mobile: Show price info */}
                        <div className="flex items-center justify-between mt-2 sm:hidden text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                                {formatCurrency(price)} × {item.quantity}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(itemTotal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quantity - Desktop */}
            <div className="hidden sm:flex col-span-2 items-center justify-center">
                <span className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg font-medium text-sm">
                    {item.quantity}
                </span>
            </div>

            {/* Unit Price - Desktop */}
            <div className="hidden sm:flex col-span-2 items-center justify-end text-gray-600 dark:text-gray-400 font-medium text-sm">
                {formatCurrency(price)}
            </div>

            {/* Total - Desktop */}
            <div className="hidden sm:flex col-span-2 items-center justify-end font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(itemTotal)}
            </div>
        </div>
    );
};

export default SaleItems