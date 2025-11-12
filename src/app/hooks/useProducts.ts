import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { useAuth } from '../context/AuthProvider'
import {
    fetchAllProductData,
    updateProductStock,
    clearProducts,
    setCategories,
} from '../store/slices/productsSlice'
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
    setUser,
    setTill,
    clearUserData,
} from '../store/slices/uiSlice'
import { Notify } from 'notiflix'
import { DEFAULT_SEED_KEY } from '../constants'

export const useProducts = () => {
    const dispatch = useAppDispatch()
    const { isAuthenticated, user: authUser } = useAuth()

    const products = useAppSelector((state) => state.products.products)
    const productsLoading = useAppSelector((state) => state.products.loading)

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
            dispatch(clearProducts())
            dispatch(clearCustomers())
            dispatch(clearUserData())
            dispatch(clearCart())

            return
        }
    }, [isAuthenticated, authUser, dispatch])

    useEffect(() => {
        dispatch(calculateTotals())
    }, [cart, discount, dispatch])

    const handleAddToCart = (product: Product) => {
        if (!isAuthenticated) {
            Notify.failure('Please log in to add items to cart')
            return
        }

        const quantity = parseInt(product?.orderItems?.toString() || '0') || 1
        const existingItem = cart.find(item => item.productId === product.productId)

        dispatch(addToCart(product))

        if (!existingItem) {
            const isConsumableProduct = product.categoryId.toString() === DEFAULT_SEED_KEY
            if (!isConsumableProduct) {
                dispatch(updateProductStock({
                    id: product.productId.toString(),
                    newStock: parseInt((product.quantity || 0).toString()) - quantity
                }))
            }
        } else {
            dispatch(updateProductStock({
                id: product.productId.toString(),
                newStock: parseInt((product.quantity || 0).toString()) - quantity
            }))
        }
    }

    const handleRemoveFromCart = (id: string) => {
        if (!isAuthenticated) return

        const itemToRemove = cart.find(item => item.productId === id)
        dispatch(removeFromCart(id))

        if (itemToRemove) {
            const product = products.find(p => p.productId === id)
            if (product) {
                dispatch(updateProductStock({
                    id,
                    newStock: parseInt((product.quantity || 0).toString()) + itemToRemove.quantity
                }))
            }
        }
    }

    const handleUpdateQuantity = (id: string, quantity: number) => {
        if (!isAuthenticated) return

        const prevItem = cart.find(item => item.productId === id)
        dispatch(updateQuantity({ id, quantity }))

        if (prevItem) {
            const difference = prevItem.quantity - quantity
            const product = products.find(p => p.productId === id)
            if (product) {
                dispatch(updateProductStock({
                    id,
                    newStock: parseInt((product.quantity || 0).toString()) + difference
                }))
            }
        }
    }

    const handleClearCart = () => {
        if (!isAuthenticated) return

        cart.forEach(item => {
            const product = products.find(p => p.productId === item.productId)
            if (product) {
                dispatch(updateProductStock({
                    id: item.productId,
                    newStock: parseInt((product.quantity || 0).toString()) + item.quantity
                }))
            }
        })

        dispatch(clearCart())
    }

    const reloadProducts = async () => {
        if (!isAuthenticated) return

        dispatch(setLoading(true))
        try {
            await dispatch(fetchAllProductData())
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleFetchCustomers = async () => {
        await dispatch(fetchCustomers())
    }

    return {
        products,
        cart,
        customers,
        user,
        till,
        selectedCustomer,
        subtotal,
        discount,
        tax,
        total,
        isLoading: isLoading || productsLoading || customersLoading,
        setCart: (items: CartItem[]) => dispatch(setCart(items)),
        setTotal: (amount: number) => dispatch(setTotal(amount)),
        setSelectedCustomer: (customer: Customer) => dispatch(setSelectedCustomer(customer)),
        addToCart: handleAddToCart,
        removeFromCart: handleRemoveFromCart,
        updateQuantity: handleUpdateQuantity,
        clearCart: handleClearCart,
        setDiscount: (amount: number) => dispatch(setDiscount(amount)),
        reloadProducts,
        updateCustomPrice: (productId: string, newPrice: number) =>
            dispatch(updateCustomPrice({ productId, newPrice })),
        setCategories: (categories: Category[]) => dispatch(setCategories(categories)),
        setCustomers: (customers: Customer[]) => dispatch(setCustomers(customers)),
        fetchCustomers: handleFetchCustomers,
    }
}