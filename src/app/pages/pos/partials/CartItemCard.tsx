import type { FunctionComponent } from "react";
import { formatCurrency } from "../../../utils";
import { Minus, Plus, Trash2 } from "lucide-react";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { useInventory } from "../../../hooks/useInventory";
import QuantityControl from "./QuantityControl";
import PriceControl from "./PriceControl";

interface CartItemProps {
    customPriceInputs: Record<string, string>;
    onPriceChange: (productId: string, value: string) => void;
}

const CartItemCard: FunctionComponent<CartItemProps> = ({ customPriceInputs,
    onPriceChange }) => {

    const {
        cart,
        inventory,
        removeFromCart,
        updateQuantity,
    } = useInventory();

    // Calculate max available stock for each cart item (current inventory + quantity in cart)
    const getMaxStock = (productId: string, currentCartQuantity: number): number => {
        const inventoryItem = inventory.find(p => p.productId === productId);
        const availableInInventory = parseInt((inventoryItem?.quantity || '0').toString());
        return availableInInventory + currentCartQuantity;
    };

    return (
        <div className="w-full">
            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <HiOutlineShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Your cart is empty</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Scan items to add them here</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cart.map((item) => (
                        <div key={item.productId} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex py-3">
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-gray-900 dark:text-gray-100 font-medium text-sm leading-tight mb-1 truncate">
                                            {item.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                                {formatCurrency(item.sellPrice * item.quantity)}
                                            </span>
                                            {item.discount > 0 && (
                                                <span className="text-green-500 dark:text-green-400 text-xs">
                                                    -{formatCurrency(item.discount)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right ml-2">
                                        <PriceControl
                                            sellPrice={item.sellPrice}
                                            categoryId={item.categoryId}
                                            productId={item.productId}
                                            customPriceInput={customPriceInputs[item.productId] || ''}
                                            onPriceChange={onPriceChange}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center gap-2">
                                        <QuantityControl
                                            quantity={item.quantity}
                                            onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
                                            onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
                                            onInputChange={(value) => updateQuantity(item.productId, value)}
                                            itemId={item.productId}
                                            maxStock={getMaxStock(item.productId, item.quantity)}
                                            isDefaultItem={item.isDefault}
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CartItemCard;