import { FunctionComponent } from "react";
import { formatCurrency } from "../../../utils";
import { Package } from "lucide-react";

type ItemType = CartItem | SaleItem;

const getItemName = (item: ItemType): string => {
    if ('name' in item && item.name) return item.name;
    if ('productDetails' in item && item.productDetails?.name) return item.productDetails.name;
    if ('product' in item && (item as SaleItem).product?.name) return (item as SaleItem).product!.name;
    return 'Unknown Product';
};

const getItemPrice = (item: ItemType): number => {
    if ('sellingPrice' in item) return item.sellingPrice;
    if ('unitPrice' in item) return item.unitPrice;
    return 0;
};

const SaleItems: FunctionComponent<{
    items: ItemType[];
    hasItems: boolean;
    compact?: boolean;
}> = ({ items = [], hasItems, compact = false }) => (
    <div>
        {/* Dashed divider top */}
        <div className={compact ? "border-t border-dashed border-gray-300 dark:border-gray-600 my-2" : "border-t border-dashed border-gray-300 dark:border-gray-600 my-3"} />

        {/* Table header */}
        <div className={compact
            ? "flex justify-between text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-1"
            : "flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-2"
        }>
            <span className="flex-1">Item</span>
            <span className={compact ? "w-10 text-center" : "w-12 text-center"}>Qty</span>
            <span className={compact ? "w-16 text-right" : "w-20 text-right"}>Price</span>
            <span className={compact ? "w-16 text-right" : "w-24 text-right"}>Amount</span>
        </div>

        <div className={compact ? "border-t border-gray-200 dark:border-gray-700 mb-1" : "border-t border-gray-200 dark:border-gray-700 mb-1.5"} />

        {hasItems ? (
            <div>
                {items.map((item, index) => {
                    const price = getItemPrice(item);
                    const total = item.quantity * price;
                    return (
                        <div
                            key={`${item.productId}-${index}`}
                            className={compact
                                ? "flex justify-between items-start py-1 text-[10px]"
                                : "flex justify-between items-start py-1.5 text-sm"
                            }
                        >
                            <span className="flex-1 text-gray-900 dark:text-gray-100 pr-2 truncate">
                                {getItemName(item)}
                            </span>
                            <span className={`${compact ? "w-10" : "w-12"} text-center text-gray-600 dark:text-gray-400 tabular-nums`}>
                                {item.quantity}
                            </span>
                            <span className={`${compact ? "w-16" : "w-20"} text-right text-gray-600 dark:text-gray-400 tabular-nums`}>
                                {formatCurrency(price)}
                            </span>
                            <span className={`${compact ? "w-16" : "w-24"} text-right font-medium text-gray-900 dark:text-gray-100 tabular-nums`}>
                                {formatCurrency(total)}
                            </span>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className={compact ? "text-center py-6" : "text-center py-10"}>
                <Package className={compact ? "w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-1" : "w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2"} />
                <p className={compact
                    ? "text-[10px] text-gray-400 dark:text-gray-500"
                    : "text-sm text-gray-400 dark:text-gray-500"
                }>No items</p>
            </div>
        )}

        {/* Item count footer */}
        {hasItems && (
            <div className={compact
                ? "border-t border-gray-200 dark:border-gray-700 pt-1 mt-1 flex justify-between text-[9px] text-gray-500 dark:text-gray-400"
                : "border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-1.5 flex justify-between text-xs text-gray-500 dark:text-gray-400"
            }>
                <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                <span>{items.reduce((sum, i) => sum + i.quantity, 0)} unit{items.reduce((sum, i) => sum + i.quantity, 0) !== 1 ? 's' : ''}</span>
            </div>
        )}
    </div>
);

export default SaleItems