import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { useAuth } from '../context/AuthProvider'
import {
    fetchAllInventoryData,
    updateInventoryStock,
    clearInventory,
    setCategories,
} from '../store/slices/inventorySlice'
import {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setDiscount,
    calculateTotals,
    updateCustomPrice,
    setCart,
    setTotal,
} from '../store/slices/cartSlice'
import {
    fetchCustomers,
    setSelectedCustomer,
    setCustomers,
    clearCustomers,
} from '../store/slices/customerSlice'
import {
    setLoading,
    clearUserData,
} from '../store/slices/uiSlice'
import { Notify } from 'notiflix'
import { DEFAULT_SEED_KEY } from '../constants'

export const useInventory = () => {
    const dispatch = useAppDispatch()
    const { isAuthenticated, user: authUser } = useAuth()

    const inventory = useAppSelector((state) => state.inventory.inventory)
    const inventoryLoading = useAppSelector((state) => state.inventory.loading)

    const cart = useAppSelector((state) => state.cart.items)
    const subtotal = useAppSelector((state) => state.cart.subtotal)
    const discount = useAppSelector((state) => state.cart.discount)
    const tax = useAppSelector((state) => state.cart.tax)
    const total = useAppSelector((state) => state.cart.total)

    const customers = useAppSelector((state) => state.customers.customers)
    const selectedCustomer = useAppSelector((state) => state.customers.selectedCustomer)
    const customersLoading = useAppSelector((state) => state.customers.loading)

    const isLoading = useAppSelector((state) => state.ui.isLoading)
    const user = useAppSelector((state) => state.ui.user)
    const till = useAppSelector((state) => state.ui.till)

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(clearInventory())
            dispatch(clearCustomers())
            dispatch(clearUserData())
            dispatch(clearCart())

            return
        }
    }, [isAuthenticated, authUser, dispatch])

    useEffect(() => {
        dispatch(calculateTotals())
    }, [cart, discount, dispatch])

    const handleAddToCart = (item: InventoryItem) => {
        if (!isAuthenticated) {
            Notify.failure('Please log in to add items to cart')
            return
        }

        const quantity = parseInt(item?.orderItems?.toString() || '0') || 1
        const existingItem = cart.find(cartItem => cartItem.productId === item.productId)
        const isConsumableItem = item.categoryId?.toString() === DEFAULT_SEED_KEY

        if (!isConsumableItem) {
            const availableStock = parseInt((item.quantity || '0').toString())
            const currentCartQuantity = existingItem ? existingItem.quantity : 0
            const newTotalQuantity = currentCartQuantity + quantity

            if (newTotalQuantity > availableStock) {
                Notify.failure(`Cannot add ${quantity} item(s). Only ${availableStock - currentCartQuantity} available in stock.`)
                return
            }
        }

        dispatch(addToCart(item))

        if (!existingItem) {
            if (!isConsumableItem) {
                dispatch(updateInventoryStock({
                    id: item.productId.toString(),
                    newStock: parseInt((item.quantity || '0').toString()) - quantity
                }))
            }
        } else {
            if (!isConsumableItem) {
                dispatch(updateInventoryStock({
                    id: item.productId.toString(),
                    newStock: parseInt((item.quantity || '0').toString()) - quantity
                }))
            }
        }
    }

    const handleRemoveFromCart = (id: string) => {
        if (!isAuthenticated) return

        const itemToRemove = cart.find(item => item.productId === id)
        dispatch(removeFromCart(id))

        if (itemToRemove) {
            const inventoryItem = inventory.find(p => p.productId === id)
            if (inventoryItem) {
                dispatch(updateInventoryStock({
                    id,
                    newStock: parseInt((inventoryItem.quantity || '0').toString()) + itemToRemove.quantity
                }))
            }
        }
    }

    const handleUpdateQuantity = (id: string, quantity: number) => {
        if (!isAuthenticated) return

        const prevItem = cart.find(item => item.productId === id)
        if (!prevItem) return

        const inventoryItem = inventory.find(p => p.productId === id)
        const isConsumableItem = prevItem.categoryId === DEFAULT_SEED_KEY

        if (!isConsumableItem && inventoryItem) {
            const currentInventoryStock = parseInt((inventoryItem.quantity || '0').toString())
            const difference = prevItem.quantity - quantity

            const newInventoryStock = currentInventoryStock + difference

            if (newInventoryStock < 0) {
                const maxAllowedQuantity = prevItem.quantity + currentInventoryStock
                Notify.failure(`Cannot set quantity to ${quantity}. Maximum available: ${maxAllowedQuantity}`)
                return
            }
        }

        dispatch(updateQuantity({ id, quantity }))

        if (prevItem && inventoryItem) {
            const difference = prevItem.quantity - quantity
            dispatch(updateInventoryStock({
                id,
                newStock: parseInt((inventoryItem.quantity || '0').toString()) + difference
            }))
        }
    }

    const handleClearCart = () => {
        if (!isAuthenticated) return

        cart.forEach(item => {
            const inventoryItem = inventory.find(p => p.productId === item.productId)
            if (inventoryItem) {
                dispatch(updateInventoryStock({
                    id: item.productId,
                    newStock: parseInt((inventoryItem.quantity || '0').toString()) + item.quantity
                }))
            }
        })

        dispatch(clearCart())
    }

    const reloadInventory = async () => {
        if (!isAuthenticated) return

        dispatch(setLoading(true))
        try {
            await dispatch(fetchAllInventoryData())
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleFetchCustomers = async () => {
        await dispatch(fetchCustomers())
    }

    return {
        inventory,
        cart,
        customers,
        user,
        till,
        selectedCustomer,
        subtotal,
        discount,
        tax,
        total,
        isLoading: isLoading || inventoryLoading || customersLoading,
        setCart: (items: CartItem[]) => dispatch(setCart(items)),
        setTotal: (amount: number) => dispatch(setTotal(amount)),
        setSelectedCustomer: (customer: Customer) => dispatch(setSelectedCustomer(customer)),
        addToCart: handleAddToCart,
        removeFromCart: handleRemoveFromCart,
        updateQuantity: handleUpdateQuantity,
        clearCart: handleClearCart,
        setDiscount: (amount: number) => dispatch(setDiscount(amount)),
        reloadInventory,
        updateCustomPrice: (productId: string, newPrice: number) =>
            dispatch(updateCustomPrice({ productId, newPrice })),
        setCategories: (categories: Category[]) => dispatch(setCategories(categories)),
        setCustomers: (customers: Customer[]) => dispatch(setCustomers(customers)),
        fetchCustomers: handleFetchCustomers,
    }
}