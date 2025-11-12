import { Confirm, Report } from "notiflix"
import { formatCurrency } from "../../../utils"
import { Button, Modal } from "../../../components"
import { HiOutlineClipboardList } from "react-icons/hi"
import { useState, type FunctionComponent, Fragment } from "react"
import { useProducts } from '../../../hooks/useProducts';
import IconLabelButton from "../../../components/IconLabelButton"
import holdOrderService from "../../../services/hold-orders.service"


interface ItemLookupModalProps {
    isOpen: boolean;
    onClickOpen: () => void;
}

const HoldOrdersModal: FunctionComponent<ItemLookupModalProps> = ({
    isOpen,
    onClickOpen,
}) => {

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [holdOrders, setHoldOrders] = useState<Array<HoldOrder>>([])
    const { addToCart, setTotal, user, till, products } = useProducts()

    const fetchHoldOrders = async () => {
        setIsLoading(true)
        setError(null)

        try {
            let orders: Array<HoldOrder> = []

            if (user?.userId) {
                orders = await holdOrderService.byUser(user.userId.toString())
            } else if (till?.userId) {
                orders = await holdOrderService.byTill(till.userId.toString())
            } else {
                orders = await holdOrderService.list()
            }

            setHoldOrders(Array.isArray(orders) ? orders : [])
        } catch (error) {
            console.error("Error fetching hold orders:", error)
            setError("Failed to load held orders.")
            Report.failure("Error", "Failed to load held orders", "Ok")
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenModal = () => {
        onClickOpen()
        fetchHoldOrders()
    }

    const handleCloseModal = () => {
        onClickOpen()
        setError(null)
    }


    const handleLoadOrder = async (orderId: string) => {
        try {
            Confirm.show(
                'Load Order',
                'Loading this order will replace your current cart. Continue?',
                'Yes',
                'No',
                async () => {
                    setIsLoading(true);

                    try {
                        const orderData = await holdOrderService.show(orderId);

                        const cartItems = orderData.items.map(order => products.find(product => {
                            product.orderItems = order.quantity
                            return product.productId === order.productId
                        }))

                        cartItems.map(product => addToCart(product as Product))

                        setTotal(orderData.total);
                        await holdOrderService.delete(orderId);

                        const updatedOrders = holdOrders.filter(order => order.itemId !== orderId);
                        setHoldOrders(updatedOrders);

                        Report.success(
                            "Success",
                            "Order loaded successfully",
                            "Ok"
                        );

                        onClickOpen();
                    } catch (error) {
                        console.error("Error loading hold order:", error);
                        Report.failure(
                            "Error",
                            "Failed to load the order",
                            "Ok"
                        );
                    } finally {
                        setIsLoading(false);
                    }
                },
                () => {
                    // do nothing
                },
                {
                    titleColor: '#1e88e5',
                    okButtonBackground: '#1e88e5',
                }
            );
        } catch (error) {
            console.error("Error in handleLoadOrder:", error);
            Report.failure(
                "Error",
                "An unexpected error occurred",
                "Ok"
            );
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        try {
            if (!window.confirm("Are you sure you want to delete this held order?")) return

            setIsLoading(true)

            await holdOrderService.delete(orderId)
            const updatedOrders = holdOrders.filter(order => order.itemId !== orderId)
            setHoldOrders(updatedOrders)

            Report.success("Success", "Order deleted successfully", "Ok")
        } catch (error) {
            console.error("Error deleting hold order:", error)
            Report.failure("Error", "Failed to delete the order", "Ok")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Fragment>
            <IconLabelButton
                key={Math.random().toString()}
                color="bg-green-400"
                iconColor="bg-green-500"
                text="Held Orders"
                icon={<HiOutlineClipboardList className="w-5 h-5" />}
                onClick={handleOpenModal}
            />

            <Modal
                title="On-Hold Orders"
                isOpen={isOpen}
                onClose={handleCloseModal}
                className="max-w-2xl bg-white dark:bg-gray-700 text-gray-700 rounded shadow-lg"
            >
                <div className="flex flex-col gap-4">
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">
                            {error}
                            <div className="mt-4">
                                <Button
                                    onClick={fetchHoldOrders}
                                    className="bg-blue-500 hover:bg-blue-600 text-white dark:text-gray-100 py-1 px-3 rounded"
                                >
                                    Retry
                                </Button>
                            </div>
                        </div>
                    ) : holdOrders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No held orders found</div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-2 px-4 text-left">Reference</th>
                                        <th className="py-2 px-4 text-left">Date</th>
                                        <th className="py-2 px-4 text-right">Items</th>
                                        <th className="py-2 px-4 text-right">Total</th>
                                        <th className="py-2 px-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {holdOrders.map((order) => (
                                        <tr key={order.itemId} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">{order.reference}</td>
                                            <td className="py-3 px-4">
                                                {new Date(order.date).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">{order.totalItems}</td>
                                            <td className="py-3 px-4 text-right">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        onClick={() => handleLoadOrder(order.itemId)}
                                                        className="bg-green-500 hover:bg-green-600 text-white dark:text-gray-100 py-1 px-3 rounded text-sm"
                                                    >
                                                        Load
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDeleteOrder(order.itemId)}
                                                        className="bg-red-500 hover:bg-red-600 text-white dark:text-gray-100 py-1 px-3 rounded text-sm"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex justify-end mt-4">
                        <Button
                            onClick={handleCloseModal}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:text-gray-400 py-2 px-4 rounded"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
        </Fragment>
    )
}

export default HoldOrdersModal
