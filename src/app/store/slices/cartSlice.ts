import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { decodeHtmlEntities } from '../../utils/text-encoding'

export type OtherChargeType = 'delivery' | 'packing' | 'service' | 'other';

export interface OtherCharge {
    id: string;
    type: OtherChargeType;
    label: string;
    value: number;
    isPercentage: boolean;
}

interface CartState {
    items: CartItem[]
    subtotal: number
    discount: number
    discountIsPercentage: boolean
    tax: number
    taxName: string
    otherCharges: OtherCharge[]
    total: number
}

const initialState: CartState = {
    items: [],
    subtotal: 0,
    discount: 0,
    discountIsPercentage: false,
    tax: 0,
    taxName: '',
    otherCharges: [],
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
                const isDefaultItem = item.isDefault === true
                const sellPriceNum = parseFloat(item.sellPrice?.toString() || '0')
                const customPriceNum = parseFloat(item.customPrice?.toString() || '0')
                const price = isDefaultItem && customPriceNum > 0
                    ? customPriceNum
                    : sellPriceNum

                state.items.push({
                    barcode: item.barcode,
                    productId: item.productId.toString(),
                    name: decodeHtmlEntities(item.name),
                    purchasePrice: parseFloat(item.costPrice?.toString() || '0'),
                    sellPrice: price,
                    discount: item.discount ?? 0,
                    quantity: isDefaultItem ? 0 : quantity,
                    categoryId: item.categoryId?.toString() || '',
                    isDefault: item.isDefault,
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
                const isDefaultItem = item.isDefault === true
                if (!isDefaultItem && quantity < 1) return
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
        updateItemDiscount: (state, action: PayloadAction<{ productId: string; discount: number; isPercentage: boolean }>) => {
            const { productId, discount, isPercentage } = action.payload
            const item = state.items.find(item => item.productId === productId)
            if (item) {
                item.discount = discount
                item.discountIsPercentage = isPercentage
            }
        },
        setDiscount: (state, action: PayloadAction<{ amount: number; isPercentage: boolean }>) => {
            state.discount = action.payload.amount
            state.discountIsPercentage = action.payload.isPercentage
        },
        setTax: (state, action: PayloadAction<{ amount: number; name: string }>) => {
            state.tax = action.payload.amount
            state.taxName = action.payload.name
        },
        addOtherCharge: (state, action: PayloadAction<OtherCharge>) => {
            state.otherCharges.push(action.payload)
        },
        removeOtherCharge: (state, action: PayloadAction<string>) => {
            state.otherCharges = state.otherCharges.filter(charge => charge.id !== action.payload)
        },
        clearOtherCharges: (state) => {
            state.otherCharges = []
        },
        clearCart: (state) => {
            state.items = []
            state.subtotal = 0
            state.discount = 0
            state.discountIsPercentage = false
            state.tax = 0
            state.taxName = ''
            state.otherCharges = []
            state.total = 0
        },
        calculateTotals: (state) => {
            let totalPrice = 0
            let totalItemDiscounts = 0
            const newSubtotal = state.items.reduce((sum, item) => {
                if (item.quantity === 0) {
                    totalPrice = item.sellPrice
                } else {
                    totalPrice = item.sellPrice * item.quantity
                }
                // Calculate item-level discount
                const itemDiscountValue = item.discount || 0
                const itemQty = item.quantity === 0 ? 1 : item.quantity
                if (item.discountIsPercentage) {
                    // Percentage discount: calculate from item total
                    totalItemDiscounts += (totalPrice * itemDiscountValue) / 100
                } else {
                    // Fixed amount discount per item
                    totalItemDiscounts += itemDiscountValue * itemQty
                }
                return sum + totalPrice
            }, 0)

            state.subtotal = newSubtotal

            // Calculate cart-level discount amount
            const cartDiscountAmount = state.discountIsPercentage
                ? (newSubtotal * state.discount) / 100
                : state.discount

            // Total discount includes both item-level and cart-level discounts
            const discountAmount = totalItemDiscounts + cartDiscountAmount

            // Calculate tax amount (always percentage)
            const taxableAmount = newSubtotal - discountAmount
            const taxAmount = (taxableAmount * state.tax) / 100

            // Calculate other charges total
            const otherChargesTotal = state.otherCharges.reduce((sum, charge) => {
                const chargeAmount = charge.isPercentage
                    ? (newSubtotal * charge.value) / 100
                    : charge.value
                return sum + chargeAmount
            }, 0)

            state.total = newSubtotal - discountAmount + taxAmount + otherChargesTotal
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
    updateItemDiscount,
    setDiscount,
    setTax,
    addOtherCharge,
    removeOtherCharge,
    clearOtherCharges,
    clearCart,
    calculateTotals,
    setCart,
    setTotal,
} = cartSlice.actions
export default cartSlice.reducer
