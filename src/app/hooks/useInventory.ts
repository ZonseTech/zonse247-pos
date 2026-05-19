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
    setTax,
    addOtherCharge,
    removeOtherCharge,
    clearOtherCharges,
    calculateTotals,
    updateCustomPrice,
    updateItemDiscount,
    setCart,
    setTotal,
    OtherCharge,
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
import { clearServices } from '../store/slices/serviceSlice'
import { clearStaff } from '../store/slices/staffSlice'
import { Notify } from 'notiflix'

export const useInventory = () => {
    const dispatch = useAppDispatch()
    const { isAuthenticated, user: authUser } = useAuth()

    const inventory = useAppSelector((state) => state.inventory.inventory)
    const categories = useAppSelector((state) => state.inventory.categories)
    const inventoryLoading = useAppSelector((state) => state.inventory.loading)

    const cart = useAppSelector((state) => state.cart.items)
    const subtotal = useAppSelector((state) => state.cart.subtotal)
    const discount = useAppSelector((state) => state.cart.discount)
    const discountIsPercentage = useAppSelector((state) => state.cart.discountIsPercentage)
    const tax = useAppSelector((state) => state.cart.tax)
    const taxName = useAppSelector((state) => state.cart.taxName)
    const otherCharges = useAppSelector((state) => state.cart.otherCharges)
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
            dispatch(clearServices())
            dispatch(clearStaff())
            dispatch(clearUserData())
            dispatch(clearCart())

            return
        }
    }, [isAuthenticated, authUser, dispatch])

    useEffect(() => {
        dispatch(calculateTotals())
    }, [cart, discount, discountIsPercentage, tax, otherCharges, dispatch])

    /**
     * Add item to cart using variantId (the `id` field from InventoryItem)
     * Validates stock availability before adding (skipped for services)
     */
    const handleAddToCart = (item: InventoryItem) => {
        if (!isAuthenticated) {
            Notify.failure('Please log in to add items to cart')
            return
        }

        const variantId = item.id?.toString() || item.productId.toString()
        const quantity = parseInt(item?.orderItems?.toString() || '0') || 1
        const existingItem = cart.find(cartItem => cartItem.variantId === variantId)
        const isDefaultItem = item.isDefault === true
        const isService = item.trackInventory === false

        // Only validate stock for tracked products (not services or default items)
        if (!isDefaultItem && !isService) {
            // Find by variant ID (the `id` field)
            const currentInventoryItem = inventory.find(p => p.id === variantId)

            // Check if item is marked as OUT_OF_STOCK
            const itemStatus = currentInventoryItem?.status || item.status || ''
            if (itemStatus.toUpperCase() === 'OUT_OF_STOCK') {
                Notify.warning(`${item.displayName || item.name} is out of stock.`)
            }

            // Use inventory item quantity if found, otherwise use the item's own quantity
            const availableStock = parseInt((
                currentInventoryItem?.quantity ||
                currentInventoryItem?.availableQuantity ||
                item.quantity ||
                item.availableQuantity ||
                '0'
            ).toString())
            const currentCartQuantity = existingItem ? existingItem.quantity : 0
            const newTotalQuantity = currentCartQuantity + quantity

            // Warn if items have zero or negative stock
            if (availableStock <= 0) {
                Notify.warning(`${item.displayName || item.name} is out of stock.`)
            } else if (newTotalQuantity > availableStock) {
                Notify.warning(`Low stock: only ${availableStock - currentCartQuantity} of ${item.displayName || item.name} available.`)
            }
        }

        dispatch(addToCart(item))

        // Only adjust inventory stock for tracked products
        if (!isDefaultItem && !isService) {
            const currentInventoryItem = inventory.find(p => p.id === variantId)
            if (currentInventoryItem) {
                dispatch(updateInventoryStock({
                    id: variantId,
                    newStock: parseInt((currentInventoryItem.quantity || currentInventoryItem.availableQuantity || '0').toString()) - quantity
                }))
            }
        }
    }

    /**
     * Remove item from cart by variantId
     * Restores inventory stock when a tracked product is removed (not services)
     */
    const handleRemoveFromCart = (variantId: string) => {
        if (!isAuthenticated) return

        const itemToRemove = cart.find(item => item.variantId === variantId)
        dispatch(removeFromCart(variantId))

        // Only restore stock for tracked products
        if (itemToRemove && !itemToRemove.isDefault && itemToRemove.trackInventory !== false) {
            const inventoryItem = inventory.find(p => p.id === variantId)
            if (inventoryItem) {
                dispatch(updateInventoryStock({
                    id: variantId,
                    newStock: parseInt((inventoryItem.quantity || inventoryItem.availableQuantity || '0').toString()) + itemToRemove.quantity
                }))
            }
        }
    }

    /**
     * Update cart item quantity by variantId
     * Validates stock availability and adjusts inventory (skipped for services)
     */
    const handleUpdateQuantity = (variantId: string, quantity: number) => {
        if (!isAuthenticated) return

        const prevItem = cart.find(item => item.variantId === variantId)
        if (!prevItem) return

        // If quantity drops to 0 or below, remove the item entirely
        if (quantity <= 0) {
            handleRemoveFromCart(variantId)
            return
        }

        const inventoryItem = inventory.find(p => p.id === variantId)
        const isDefaultItem = prevItem.isDefault === true
        const isService = inventoryItem ? inventoryItem.trackInventory === false : prevItem.trackInventory === false

        // Only validate stock for tracked products
        if (!isDefaultItem && !isService && inventoryItem) {
            const currentInventoryStock = parseInt((inventoryItem.quantity || inventoryItem.availableQuantity || '0').toString())
            const difference = prevItem.quantity - quantity

            const newInventoryStock = currentInventoryStock + difference

            if (newInventoryStock < 0) {
                const maxAllowedQuantity = prevItem.quantity + currentInventoryStock
                Notify.warning(`Low stock: only ${maxAllowedQuantity} available for this item.`)
            }
        }

        dispatch(updateQuantity({ id: variantId, quantity }))

        // Only adjust inventory stock for tracked products
        if (!isDefaultItem && !isService && inventoryItem) {
            const difference = prevItem.quantity - quantity
            dispatch(updateInventoryStock({
                id: variantId,
                newStock: parseInt((inventoryItem.quantity || inventoryItem.availableQuantity || '0').toString()) + difference
            }))
        }
    }

    /**
     * Clear all items from cart
     * Restores inventory stock for tracked products only (not services)
     */
    const handleClearCart = () => {
        if (!isAuthenticated) return

        cart.forEach(item => {
            if (item.trackInventory === false) return
            const inventoryItem = inventory.find(p => p.id === item.variantId)
            if (inventoryItem) {
                dispatch(updateInventoryStock({
                    id: item.variantId,
                    newStock: parseInt((inventoryItem.quantity || inventoryItem.availableQuantity || '0').toString()) + item.quantity
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
        categories,
        cart,
        customers,
        user,
        till,
        selectedCustomer,
        subtotal,
        discount,
        discountIsPercentage,
        tax,
        taxName,
        otherCharges,
        total,
        isLoading: isLoading || inventoryLoading || customersLoading,
        setCart: (items: CartItem[]) => dispatch(setCart(items)),
        setTotal: (amount: number) => dispatch(setTotal(amount)),
        setSelectedCustomer: (customer: Customer) => dispatch(setSelectedCustomer(customer)),
        addToCart: handleAddToCart,
        removeFromCart: handleRemoveFromCart,
        updateQuantity: handleUpdateQuantity,
        clearCart: handleClearCart,
        setDiscount: (amount: number, isPercentage: boolean = false) => dispatch(setDiscount({ amount, isPercentage })),
        setTax: (amount: number, name: string = '') => dispatch(setTax({ amount, name })),
        addOtherCharge: (charge: OtherCharge) => dispatch(addOtherCharge(charge)),
        removeOtherCharge: (id: string) => dispatch(removeOtherCharge(id)),
        clearOtherCharges: () => dispatch(clearOtherCharges()),
        reloadInventory,
        updateCustomPrice: (variantId: string, newPrice: number) =>
            dispatch(updateCustomPrice({ variantId, newPrice })),
        updateItemDiscount: (variantId: string, discount: number, isPercentage: boolean = false) =>
            dispatch(updateItemDiscount({ variantId, discount, isPercentage })),
        setCategories: (categories: Category[]) => dispatch(setCategories(categories)),
        setCustomers: (customers: Customer[]) => dispatch(setCustomers(customers)),
        fetchCustomers: handleFetchCustomers,
    }
}