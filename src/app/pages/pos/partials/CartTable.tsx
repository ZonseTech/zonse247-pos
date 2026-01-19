import QuantityControl from './QuantityControl';
import PriceControl from './PriceControl';
import { formatCurrency } from '../../../utils';
import type { FunctionComponent } from 'react'
import { useInventory } from '../../../hooks/useInventory';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { useFocusManager } from '../../../hooks/useFocusManager';
import { Trash2, Package, Tag, Hash, Percent } from 'lucide-react';
import classNames from 'classnames';

interface CartTableProps {
    focusManager: ReturnType<typeof useFocusManager>;
    customPriceInputs: Record<string, string>;
    onPriceChange: (productId: string, value: string) => void;
    compact?: boolean;
}

const CartTable: FunctionComponent<CartTableProps> = ({
    focusManager,
    customPriceInputs,
    onPriceChange,
    compact = false,
}) => {
    const {
        cart,
        inventory,
        removeFromCart,
        updateQuantity,
    } = useInventory();

    const getMaxStock = (productId: string, currentCartQuantity: number): number => {
        const inventoryItem = inventory.find(p => p.productId === productId);
        const availableInInventory = parseInt((inventoryItem?.quantity || '0').toString());
        return availableInInventory + currentCartQuantity;
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-none border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className={classNames(
                "border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900",
                compact ? "px-2 py-1.5" : "px-5 py-4"
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={classNames(
                            "bg-blue-100 dark:bg-blue-500/20 rounded-xl",
                            compact ? "p-1" : "p-2.5"
                        )}>
                            <HiOutlineShoppingCart className={classNames(
                                "text-blue-600 dark:text-blue-400",
                                compact ? "w-3.5 h-3.5" : "w-6 h-6"
                            )} />
                        </div>
                        <div>
                            <h3 className={classNames(
                                "font-semibold text-gray-900 dark:text-white",
                                compact ? "text-xs" : "text-lg"
                            )}>Shopping Cart</h3>
                            <p className={classNames(
                                "text-gray-500 dark:text-gray-400",
                                compact ? "text-[10px]" : "text-sm"
                            )}>
                                {cart.length} {cart.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                    </div>
                    {cart.length > 0 && (
                        <span className={classNames(
                            "font-semibold bg-blue-600 text-white rounded-full",
                            compact ? "px-1.5 py-0.5 text-[10px]" : "px-3 py-1.5 text-sm"
                        )}>
                            {cart.reduce((sum, item) => sum + item.quantity, 0)} units
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-grow overflow-auto">
                <table className="w-full table-fixed border-collapse">
                    <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
                        <tr>
                            <th className={classNames(
                                "text-left",
                                compact ? "w-[32%] px-1.5 py-1" : "w-[28%] px-3 py-2 lg:px-4 lg:py-4"
                            )}>
                                <div className={classNames(
                                    "flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider",
                                    compact ? "text-[9px]" : "text-sm"
                                )}>
                                    <Package size={compact ? 10 : 18} />
                                    Product
                                </div>
                            </th>
                            <th className={classNames(
                                "text-left",
                                compact ? "w-[18%] px-1 py-1" : "w-[12%] px-2 py-2 lg:px-3 lg:py-4"
                            )}>
                                <span className={classNames(
                                    "font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider",
                                    compact ? "text-[9px]" : "text-sm"
                                )}>
                                    Qty
                                </span>
                            </th>
                            <th className={classNames(
                                "text-left",
                                compact ? "w-[18%] px-1 py-1" : "w-[14%] px-2 py-2 lg:px-3 lg:py-4"
                            )}>
                                <div className={classNames(
                                    "flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider",
                                    compact ? "text-[9px]" : "text-sm"
                                )}>
                                    <Tag size={compact ? 10 : 18} />
                                    Price
                                </div>
                            </th>
                            <th className={classNames(
                                "text-left",
                                compact ? "w-[18%] px-1 py-1" : "w-[14%] px-2 py-2 lg:px-3 lg:py-4"
                            )}>
                                <span className={classNames(
                                    "font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider",
                                    compact ? "text-[9px]" : "text-sm"
                                )}>
                                    Total
                                </span>
                            </th>
                            {!compact && (
                                <th className={classNames(
                                    "w-[14%] text-left",
                                    "px-2 py-2 lg:px-3 lg:py-4"
                                )}>
                                    <div className={classNames(
                                        "flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider",
                                        "text-sm"
                                    )}>
                                        <Hash size={18} />
                                        Barcode
                                    </div>
                                </th>
                            )}
                            {!compact && (
                                <th className={classNames(
                                    "w-[10%] text-left",
                                    "px-2 py-2 lg:px-3 lg:py-4"
                                )}>
                                    <div className={classNames(
                                        "flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider",
                                        "text-sm"
                                    )}>
                                        <Percent size={18} />
                                        Disc
                                    </div>
                                </th>
                            )}
                            <th className={classNames(
                                "text-center",
                                compact ? "w-[14%] px-1 py-1" : "w-[8%] px-2 py-2 lg:px-3 lg:py-4"
                            )}>
                                <span className={classNames(
                                    "font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider",
                                    compact ? "text-[9px]" : "text-sm"
                                )}>

                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {cart.length === 0 ? (
                            <tr>
                                <td colSpan={compact ? 5 : 7} className="p-0">
                                    <div className={classNames(
                                        "flex flex-col items-center justify-center px-4",
                                        compact ? "py-8" : "py-16"
                                    )}>
                                        <div className="relative mb-6">
                                            <div className={classNames(
                                                "rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center",
                                                compact ? "w-16 h-16" : "w-24 h-24"
                                            )}>
                                                <HiOutlineShoppingCart className={classNames(
                                                    "text-gray-300 dark:text-gray-600",
                                                    compact ? "h-8 w-8" : "h-12 w-12"
                                                )} />
                                            </div>
                                            <div className={classNames(
                                                "absolute -bottom-1 -right-1 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center",
                                                compact ? "w-5 h-5" : "w-8 h-8"
                                            )}>
                                                <span className={classNames(
                                                    "text-white font-bold",
                                                    compact ? "text-xs" : "text-sm"
                                                )}>0</span>
                                            </div>
                                        </div>
                                        <h3 className={classNames(
                                            "font-semibold text-gray-700 dark:text-gray-300 mb-2",
                                            compact ? "text-sm" : "text-lg"
                                        )}>Your cart is empty</h3>
                                        <p className={classNames(
                                            "text-gray-400 dark:text-gray-500 text-center max-w-xs",
                                            compact ? "text-xs" : "text-sm"
                                        )}>
                                            Scan a barcode or search for products to add items to your cart
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            cart.map((item, index) => (
                                <tr
                                    key={item.productId}
                                    className="group hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all duration-200"
                                >
                                    <td className={classNames(compact ? "px-1.5 py-1" : "px-4 py-4")}>
                                        <div className="flex items-center gap-2">
                                            <div className="min-w-0">
                                                <p className={classNames(
                                                    "font-semibold text-gray-900 dark:text-gray-100 truncate",
                                                    compact ? "text-[10px]" : "text-base"
                                                )}>
                                                    {item.name}
                                                </p>
                                                {item.isDefault && (
                                                    <span className={classNames(
                                                        "inline-flex items-center rounded-full font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 mt-0.5",
                                                        compact ? "px-1 py-0 text-[7px]" : "px-2 py-0.5 text-xs"
                                                    )}>
                                                        Custom Item
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className={classNames(compact ? "px-1 py-1" : "px-3 py-4")}>
                                        <QuantityControl
                                            quantity={item.quantity}
                                            onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
                                            onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
                                            onInputChange={(value) => updateQuantity(item.productId, value)}
                                            itemId={item.productId}
                                            focusManager={focusManager}
                                            maxStock={getMaxStock(item.productId, item.quantity)}
                                            isDefaultItem={item.isDefault}
                                            compact={compact}
                                        />
                                    </td>
                                    <td className={classNames(compact ? "px-1 py-1" : "px-3 py-4")}>
                                        <PriceControl
                                            sellPrice={item.sellPrice}
                                            categoryId={item.categoryId}
                                            productId={item.productId}
                                            customPriceInput={customPriceInputs[item.productId] || ''}
                                            onPriceChange={onPriceChange}
                                            focusManager={focusManager}
                                            compact={compact}
                                        />
                                    </td>
                                    <td className={classNames(compact ? "px-1 py-1" : "px-3 py-4")}>
                                        <div className="flex flex-col">
                                            <span className={classNames(
                                                "font-bold text-gray-900 dark:text-white",
                                                compact ? "text-[10px]" : "text-lg"
                                            )}>
                                                {formatCurrency(item.sellPrice * item.quantity)}
                                            </span>
                                            <span className={classNames(
                                                "text-gray-400 dark:text-gray-500",
                                                compact ? "text-[8px]" : "text-xs"
                                            )}>
                                                {item.quantity} × {formatCurrency(item.sellPrice)}
                                            </span>
                                        </div>
                                    </td>
                                    {!compact && (
                                        <td className="px-3 py-4">
                                            <span className="font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md text-sm px-2.5 py-1.5">
                                                {item.barcode}
                                            </span>
                                        </td>
                                    )}
                                    {!compact && (
                                        <td className="px-3 py-4">
                                            {item.discount > 0 ? (
                                                <span className="inline-flex items-center rounded-md font-semibold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2.5 py-1.5 text-sm">
                                                    -{formatCurrency(item.discount)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500 text-sm">—</span>
                                            )}
                                        </td>
                                    )}
                                    <td className={classNames(
                                        "text-center",
                                        compact ? "px-1 py-1" : "px-3 py-4"
                                    )}>
                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            className={classNames(
                                                "text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400",
                                                "hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200",
                                                "focus:outline-none focus:ring-2 focus:ring-red-500/20",
                                                compact ? "p-1" : "p-2.5"
                                            )}
                                            title="Remove item"
                                        >
                                            <Trash2 size={compact ? 14 : 20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    )
}

export default CartTable