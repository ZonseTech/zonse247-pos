import PaymentModal from "./PaymentModal";
import { type FunctionComponent } from "react";
import { Confirm, Report } from "notiflix";
import { HiOutlineBan } from "react-icons/hi";
import IconLabelButton from "../../../components/IconLabelButton";
import { formatCurrency } from "../../../utils";
import HoldPayment from "./HoldPayment";

const CartTableFooter: FunctionComponent<CartTableFooterProps> = ({
    cart,
    discount,
    setDiscount,
    subtotal,
    tax,
    total,
    clearCart
}) => {
    const handleOnCancel = () => {
        if (cart.length > 0) {
            const diagOptions = {
                title: "Are you sure?",
                text: "You are about to remove all items from the cart.",
                icon: "warning",
                showCancelButton: true,
                okButtonText: "Yes, clear it!",
                cancelButtonText: "Cancel",
            };
            Confirm.show(
                diagOptions.title,
                diagOptions.text,
                diagOptions.okButtonText,
                diagOptions.cancelButtonText,
                () => {
                    clearCart();
                    Report.success(
                        "Cleared!",
                        "All items have been removed.",
                        "Ok"
                    );
                },
            );
        }
    };

    return (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 space-y-4">
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Total Item(s)</span>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold">{cart.length}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">Discount</span>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">$</span>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                className="w-20 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                         transition-colors duration-200"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Subtotal</span>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold">{formatCurrency(subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-200 font-medium">
                            Gross Price <span className="text-xs text-gray-500 dark:text-gray-400">(inc {tax}% Tax)</span>
                        </span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={handleOnCancel}
                        className="group inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                            text-red-700 dark:text-red-300 disabled:text-gray-300
                            bg-gradient-to-r from-red-100 to-gray-200 dark:from-red-700 dark:to-red-800
                            disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                            border border-red-300 dark:border-red-600 rounded-lg
                            hover:from-red-200 hover:to-gray-300 dark:hover:from-red-600 dark:hover:to-red-700
                            hover:border-red-400 dark:hover:border-red-500 hover:shadow-md
                            disabled:shadow-none disabled:transform-none disabled:hover:scale-100
                            focus:outline-none focus:ring-2 focus:ring-red-400/50 dark:focus:ring-red-500/50
                            disabled:focus:ring-gray-400/50
                            transition-all duration-200 ease-in-out hover:scale-[1.02]"
                        disabled={cart.length === 0}
                    >
                        <div className="flex items-center justify-center w-8 h-8 bg-red-400/20 dark:bg-red-500/20 group-disabled:bg-gray-400/30 rounded-full">
                            <HiOutlineBan className="w-5 h-5 text-red-600 dark:text-red-400 group-disabled:text-gray-300" />
                        </div>
                        <span>Clear Cart</span>
                    </button>

                    <HoldPayment />

                    <PaymentModal />
                </div>
            </div>
        </div>
    );
};

export default CartTableFooter;