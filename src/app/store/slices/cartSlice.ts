import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_SEED_KEY } from '../../constants'

interface CartState {
    items: CartItem[]
    subtotal: number
    discount: number
    tax: number
    total: number
}

const initialState: CartState = {
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<InventoryItem>) => {
            const item = action.payload
            const quantity = parseInt(item?.orderItems?.toString() || '0') || 1
            const existingItem = state.items.find(cartItem => cartItem.productId === item.productId)

            if (existingItem) {
                existingItem.quantity += quantity
            } else {
                const isConsumableItem = item.categoryId?.toString() === DEFAULT_SEED_KEY
                const sellPriceNum = parseFloat(item.sellPrice?.toString() || '0')
                const customPriceNum = parseFloat(item.customPrice?.toString() || '0')
                const price = isConsumableItem && customPriceNum > 0
                    ? customPriceNum
                    : sellPriceNum

                state.items.push({
                    barcode: item.barcode,
                    productId: item.productId.toString(),
                    name: item.name,
                    purchasePrice: parseFloat(item.costPrice?.toString() || '0'),
                    sellPrice: price,
                    discount: item.discount ?? 0,
                    quantity: isConsumableItem ? 0 : quantity,
                    categoryId: item.categoryId?.toString() || '',
                })
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.productId !== action.payload)
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const { id, quantity } = action.payload
            const item = state.items.find(item => item.productId === id)

            if (item) {
                const isConsumable = item.categoryId === DEFAULT_SEED_KEY
                if (!isConsumable && quantity < 1) return
                item.quantity = quantity
            }
        },
        updateCustomPrice: (state, action: PayloadAction<{ productId: string; newPrice: number }>) => {
            const { productId, newPrice } = action.payload
            const item = state.items.find(item => item.productId === productId)
            if (item) {
                item.sellPrice = newPrice
            }
        },
        setDiscount: (state, action: PayloadAction<number>) => {
            state.discount = action.payload
        },
        clearCart: (state) => {
            state.items = []
            state.subtotal = 0
            state.discount = 0
            state.total = 0
        },
        calculateTotals: (state) => {
            let totalPrice = 0
            const newSubtotal = state.items.reduce((sum, item) => {
                if (item.quantity === 0) {
                    totalPrice = item.sellPrice
                } else {
                    totalPrice = item.sellPrice * item.quantity
                }
                return sum + totalPrice
            }, 0)

            state.subtotal = newSubtotal
            state.total = newSubtotal - state.discount
        },
        setCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload
        },
        setTotal: (state, action: PayloadAction<number>) => {
            state.total = action.payload
        },
    },
})

export const {
    addToCart,
    removeFromCart,
    updateQuantity,
    updateCustomPrice,
    setDiscount,
    clearCart,
    calculateTotals,
    setCart,
    setTotal,
} = cartSlice.actions
export default cartSlice.reducer
