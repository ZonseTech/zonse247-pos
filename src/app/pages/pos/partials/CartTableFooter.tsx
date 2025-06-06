import PaymentModal from "./PaymentModal";
import { type FunctionComponent } from "react";
import { Confirm, Report } from "notiflix";
import { HiOutlineBan } from "react-icons/hi";
import IconLabelButton from "../../../components/IconLabelButton";
import { formatCurrency } from "../../../utils";

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
                    clearCart()

                    Report.success(
                        "Cleared!",
                        "All items have been removed.",
                        "Ok"
                    );
                },
            );
        }

    }

    return (
        <div className="mt-4 border-t p-2.5">
            <div className="flex justify-between mb-2">
                <span>Total Item(s)</span>
                <span>: {cart.length}</span>
            </div>
            <div className="flex justify-between mb-2">
                <span>Discount</span>
                <div className="flex items-center">
                    <span>: </span>
                    <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-24 p-1 border ml-1"
                    />
                </div>
            </div>
            <div className="flex justify-between mb-2">
                <span>Price</span>
                <span>: {formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
                <span>Gross Price (inc {tax}% Tax)</span>
                <span className="text-xl font-bold">{formatCurrency(total)}</span>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <IconLabelButton
                    key={Math.random().toString()}
                    color={'bg-red-500'}
                    iconColor={'bg-red-600'}
                    text='Cancel'
                    icon={<HiOutlineBan className="w-5 h-5" />}
                    onClick={handleOnCancel}
                />

                <PaymentModal />

            </div>
        </div>
    )
}

export default CartTableFooter