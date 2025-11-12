import { Report } from "notiflix"
import { HiOutlineHand, HiOutlineShoppingCart, HiOutlineCurrencyDollar } from "react-icons/hi"
import { Fragment, useState, type ChangeEvent, type FunctionComponent } from "react"
import { useProducts } from '../../../hooks/useProducts';
import { Modal, Input } from "../../../components"
import holdOrderService from "../../../services/hold-orders.service"
import { formatCurrency } from "../../../utils"

const HoldPayment: FunctionComponent = () => {
    const [reference, setReference] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isOpenHoldModal, setOpenHoldModal] = useState(false)
    const { cart, total, clearCart, user, till } = useProducts()

    const handleOnHold = () => {
        if (cart.length > 0) {
            setOpenHoldModal(!isOpenHoldModal)
        } else {
            Report.warning("Oops!", "There is nothing to hold!", "Ok")
        }
    }

    const handleReferenceChange = (e: ChangeEvent<HTMLInputElement>) => {
        setReference(e.target.value)
    }

    const handleSubmitHoldOrder = async () => {
        if (!reference.trim()) {
            Report.warning("Required", "Please enter a reference number", "Ok")
            return
        }

        try {
            setIsSubmitting(true)

            const holdOrderData = {
                itemId: '',
                reference: reference,
                items: cart,
                total: total,
                date: new Date(),
                status: "on-hold",
                userId: (user?.userId || 1).toString(),
                totalItems: cart.length,
                till: (till?.userId || 1).toString()
            }

            await holdOrderService.store(holdOrderData)

            Report.success("Success", "Order has been placed on hold", "Ok")

            clearCart()
            setOpenHoldModal(false)
            setReference("")

        } catch (error) {
            console.error("Error saving hold order:", error)
            Report.failure("Error", "Failed to hold the order. Please try again.", "Ok")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCloseModal = () => {
        setOpenHoldModal(false)
        setReference("")
    }

    return (
        <Fragment>
            <button
                onClick={handleOnHold}
                disabled={cart.length === 0}
                className="group bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-yellow-500/25 disabled:shadow-none transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 disabled:focus:ring-gray-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
                <div className="w-8 h-8 bg-yellow-400/30 dark:bg-yellow-300/20 group-disabled:bg-gray-400/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-disabled:border-gray-300/20">
                    <HiOutlineHand className="w-5 h-5 text-white group-disabled:text-gray-300" />
                </div>
                <span>Hold</span>
            </button>

            <Modal
                title="Hold Order"
                isOpen={isOpenHoldModal}
                onClose={handleCloseModal}
                className="max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-xl shadow-2xl backdrop-blur-sm"
            >
                <div className="flex flex-col gap-6 p-2">
                    <div className="text-center pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <HiOutlineHand className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Place Order on Hold
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Save this order for later processing
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-blue-100 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                                        <HiOutlineShoppingCart className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Items</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Items in cart</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{cart.length}</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">items</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-emerald-100 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-emerald-500 dark:bg-emerald-600 rounded-lg flex items-center justify-center">
                                        <HiOutlineCurrencyDollar className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Amount</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Order value</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(total)}</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">total</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reference Number / Customer Name
                        </label>
                        <Input
                            name="reference"
                            type="text"
                            required
                            value={reference}
                            onChange={handleReferenceChange}
                            placeholder="Enter reference number or customer name"
                            className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleCloseModal}
                            type="button"
                            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-3 px-6 rounded-lg font-medium transition-all duration-200 border border-gray-300 dark:border-gray-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmitHoldOrder}
                            type="button"
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:focus:ring-gray-400"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <HiOutlineHand className="w-4 h-4" />
                                    <span>Hold Order</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </Fragment>
    )
}

export default HoldPayment