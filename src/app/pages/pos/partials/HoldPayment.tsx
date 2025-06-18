import { Report } from "notiflix"
import { HiOutlineHand } from "react-icons/hi"
import { Fragment, useState, type ChangeEvent, type FunctionComponent } from "react"
import { useProducts } from "../../../context/ProductsProvider"
import IconLabelButton from "../../../components/IconLabelButton"
import { Modal, Button, Input } from "../../../components"
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
                uuid: '',
                reference: reference,
                items: cart,
                total: total,
                date: new Date(),
                status: "on-hold",
                userId: (user?.uuid || 1).toString(),
                totalItems: cart.length,
                till: (till?.uuid || 1).toString()
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
            <IconLabelButton
                key={Math.random().toString()}
                color="bg-green-400"
                iconColor="bg-green-500"
                text="Hold"
                icon={<HiOutlineHand className="w-5 h-5" />}
                onClick={handleOnHold}
            />

            <Modal
                title="Hold Order"
                isOpen={isOpenHoldModal}
                onClose={handleCloseModal}
                className="max-w-md bg-white dark:bg-gray-700 text-gray-700 rounded shadow-lg"
            >
                <div className="flex flex-col gap-4">
                    <div className="bg-gray-100 rounded p-3 text-lg flex justify-between">
                        <span className="text-gray-600">Total Items</span>
                        <span>{cart.length}</span>
                    </div>

                    <div className="bg-gray-100 rounded p-3 text-lg flex justify-between">
                        <span className="text-gray-600">Total Amount</span>
                        <span>{formatCurrency(total)}</span>
                    </div>

                    <Input
                        name="reference"
                        type="text"
                        required
                        value={reference}
                        onChange={handleReferenceChange}
                        placeholder="Enter reference number or customer name"
                        className="p-3"
                    />

                    <div className="flex gap-3 mt-4">
                        <Button
                            onClick={handleCloseModal}
                            type="button"
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:text-gray-400 py-2 px-4 rounded flex-1"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSubmitHoldOrder}
                            type="button"
                            disabled={isSubmitting}
                            className="bg-green-500 hover:bg-green-600 text-white dark:text-gray-100 py-2 px-4 rounded flex-1"
                        >
                            {isSubmitting ? "Processing..." : "Hold Order"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </Fragment>
    )
}

export default HoldPayment