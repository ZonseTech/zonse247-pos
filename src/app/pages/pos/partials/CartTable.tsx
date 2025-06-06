import QuantityControl from './QuantityControl';
import CartTableFooter from './CartTableFooter';
import { formatCurrency } from '../../../utils';
import { Fragment, useState } from 'react';
import type { FunctionComponent } from 'react'
import { useProducts } from '../../../context/ProductsProvider';
import { HiOutlineShoppingCart, HiOutlinePencil, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

const CartTable: FunctionComponent = () => {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        updateCustomPrice,
        subtotal,
        discount,
        setDiscount,
        tax,
        total,
        clearCart
    } = useProducts();

    const [customPriceInput, setCustomPriceInput] = useState<string>('');
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    const handleEditPrice = (itemId: string, currentPrice: number) => {
        setEditingItemId(itemId);
        setCustomPriceInput(currentPrice.toString());
    };

    const handleSavePrice = (itemId: string) => {
        const newPrice = parseFloat(customPriceInput);
        if (newPrice && newPrice >= 0) {
            updateCustomPrice(itemId, newPrice);
        }
        setEditingItemId(null);
    };

    return (
        <Fragment>
            <div className="flex-grow overflow-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b uppercase">
                            <th className="text-left p-2">#</th>
                            <th className="text-left p-2">Item</th>
                            <th className="text-left p-2">Qty</th>
                            <th className="text-left p-2">Price</th>
                            <th className="text-left p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                        <HiOutlineShoppingCart className="h-16 w-16 mb-4 text-gray-300" />
                                        <p className="text-lg font-semibold">The cart is empty</p>
                                        <p className="text-sm text-gray-400">Start adding products by clicking on them in the list.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            cart.map((item, index) => (
                                <tr key={item.productId} className="border-b">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{item.name}</td>
                                    <td className="p-2">
                                        <QuantityControl
                                            quantity={item.quantity}
                                            onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
                                            onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
                                            onInputChange={(value) => updateQuantity(item.productId, value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        {item.categoryId === "-1" ? (
                                            <div className="flex items-center">
                                                {editingItemId === item.productId ? (
                                                    <Fragment>
                                                        <input
                                                            type="number"
                                                            value={customPriceInput}
                                                            onChange={(e) => setCustomPriceInput(e.target.value)}
                                                            className="w-20 border rounded p-1 text-sm"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                        <button
                                                            onClick={() => handleSavePrice(item.productId)}
                                                            className="ml-1 text-green-500"
                                                        >
                                                            <HiOutlineCheck className="h-5 w-5" />
                                                        </button>
                                                    </Fragment>
                                                ) : (
                                                    <Fragment>
                                                        <span>{formatCurrency(item.sellPrice)}</span>
                                                        <button
                                                            onClick={() => handleEditPrice(item.productId, item.sellPrice)}
                                                            className="ml-1 text-blue-500"
                                                        >
                                                            <HiOutlinePencil className="h-4 w-4" />
                                                        </button>
                                                    </Fragment>
                                                )}
                                            </div>
                                        ) : (
                                            formatCurrency(item.sellPrice)
                                        )}
                                    </td>
                                    <td className="p-2">
                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            className="text-red-500"
                                        >
                                            <HiOutlineX className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <CartTableFooter
                cart={cart}
                discount={discount}
                subtotal={subtotal}
                tax={tax}
                total={total}
                setDiscount={setDiscount}
                clearCart={clearCart}
            />
        </Fragment>
    )
}

export default CartTable