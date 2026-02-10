import { Report } from "notiflix"
import { HiOutlinePause, HiOutlineShoppingCart, HiOutlineCurrencyDollar, HiOutlineUser } from "react-icons/hi"
import { useState, type ChangeEvent, type FunctionComponent } from "react"
import { useInventory } from '../../../hooks/useInventory'
import { useAuth } from '../../../context/AuthProvider'
import { useApp } from '../../../context/AppProvider'
import { Modal, Input } from "../../../components"
import parkedSalesService from "../../../services/parked-sales.service"
import { formatCurrency } from "../../../utils"

interface ParkSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const ParkSaleModal: FunctionComponent<ParkSaleModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [reference, setReference] = useState("")
    const [notes, setNotes] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { cart, total, subtotal, discount, tax, clearCart, selectedCustomer } = useInventory()
    const { user, activeBranchId } = useAuth()
    const { settings } = useApp()

    const handleReferenceChange = (e: ChangeEvent<HTMLInputElement>) => {
        setReference(e.target.value)
    }

    const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value)
    }

    const handleSubmitParkSale = async () => {
        if (!reference.trim()) {
            Report.warning("Required", "Please enter a reference (customer name or order ID)", "Ok")
            return
        }

        if (!user?.userId || !activeBranchId) {
            Report.warning("Error", "User or branch information is missing", "Ok")
            return
        }

        if (cart.length === 0) {
            Report.warning("Empty Cart", "There are no items to park", "Ok")
            return
        }

        try {
            setIsSubmitting(true)

            const parkedSalePayload: CreateParkedSalePayload = {
                tenantId: user.tenantId || '',
                branchId: activeBranchId,
                userId: user.userId.toString(),
                terminalId: (settings as any)?.terminalId || undefined,
                customerId: selectedCustomer?.customerId || undefined,
                reference: reference.trim(),
                items: cart.map(item => ({
                    productId: item.productId,
                    barcode: item.barcode,
                    name: item.name,
                    categoryId: item.categoryId,
                    quantity: item.quantity,
                    unitPrice: item.sellingPrice,
                    sellingPrice: item.sellingPrice,
                    purchasePrice: item.purchasePrice,
                    discount: item.discount || 0,
                    taxAmount: 0,
                    variancePrice: item.variancePrice,
                })),
                subtotal: subtotal,
                taxAmount: tax,
                discountAmount: discount,
                totalAmount: total,
                notes: notes.trim() || undefined,
            }

            await parkedSalesService.create(parkedSalePayload)

            Report.success("Sale Parked", `Order "${reference}" has been saved for later`, "Ok")

            clearCart()
            handleCloseModal()
            onSuccess?.()

        } catch (error: any) {
            console.error("Error parking sale:", error)
            const errorMessage = error?.response?.data?.message || "Failed to park the sale. Please try again."
            Report.failure("Error", errorMessage, "Ok")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCloseModal = () => {
        setReference("")
        setNotes("")
        onClose()
    }

    if (!isOpen) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCloseModal}
            header={
                <div className="text-start pb-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Park This Sale
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Save this order to complete later
                    </p>
                </div>
            }
        >
            <div className="flex flex-col gap-6 p-2">
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-sky-100 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-sky-500 dark:bg-sky-500 rounded-lg flex items-center justify-center">
                                    <HiOutlineShoppingCart className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Items</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Items in cart</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{cart.length}</p>
                                <p className="text-xs text-sky-500 dark:text-sky-400">items</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-emerald-100 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-emerald-500 dark:bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <HiOutlineCurrencyDollar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Amount</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Order value</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(total)}</p>
                                <p className="text-xs text-emerald-500 dark:text-emerald-400">total</p>
                            </div>
                        </div>
                    </div>

                    {selectedCustomer && (
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-purple-100 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500 dark:bg-purple-600 rounded-lg flex items-center justify-center">
                                        <HiOutlineUser className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Customer</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Will be saved</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{selectedCustomer.name}</p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400">{selectedCustomer.phone || selectedCustomer.email || ''}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reference / Customer Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        name="reference"
                        type="text"
                        required
                        value={reference}
                        onChange={handleReferenceChange}
                        placeholder="Enter customer name or order reference"
                        className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        autoFocus
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notes (Optional)
                    </label>
                    <textarea
                        name="notes"
                        value={notes}
                        onChange={handleNotesChange}
                        placeholder="Add any notes about this order..."
                        rows={2}
                        className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        onClick={handleCloseModal}
                        type="button"
                        className="flex-1 bg-red-100 hover:bg-red-200 dark:bg-red-500 dark:hover:bg-red-500 text-red-700 dark:text-red-200 py-3 px-6 rounded-sm font-medium transition-all duration-200 border border-red-300 dark:border-red-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-red-800"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmitParkSale}
                        type="button"
                        disabled={isSubmitting || cart.length === 0}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-500 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:focus:ring-gray-400"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Parking...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <HiOutlinePause className="w-4 h-4" />
                                <span>Park Sale</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default ParkSaleModal
