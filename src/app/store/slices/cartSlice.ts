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
    /** Backdated sale date (YYYY-MM-DD), set by users with sales.edit permission */
    saleDate: string | null
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
    saleDate: null,
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        /**
         * Add item to cart using variantId as unique identifier
         * The item.id from InventoryItem is the variant ID
         */
        addToCart: (state, action: PayloadAction<InventoryItem>) => {
            const item = action.payload
            const variantId = item.id?.toString() || item.productId.toString()
            const quantity = parseInt(item?.orderItems?.toString() || '0') || 1
            const existingItem = state.items.find(cartItem => cartItem.variantId === variantId)

            if (existingItem) {
                existingItem.quantity += quantity
            } else {
                const isDefaultItem = item.isDefault === true
                const sellingPriceNum = parseFloat(item.sellingPrice?.toString() || '0')
                const customPriceNum = parseFloat(item.customPrice?.toString() || '0')
                const price = isDefaultItem && customPriceNum > 0
                    ? customPriceNum
                    : sellingPriceNum

                // Use displayName if available, fallback to name
                const itemName = item.displayName || item.name || 'Unknown Item'
                // Use barcode or primaryBarcode
                const itemBarcode = item.barcode || item.primaryBarcode || ''

                state.items.push({
                    barcode: itemBarcode,
                    variantId: variantId,  // Variant ID (required for API v1.6.0+)
                    productId: item.productId?.toString(),
                    name: decodeHtmlEntities(itemName),
                    variantName: item.variantName || undefined,
                    purchasePrice: parseFloat(item.costPrice?.toString() || '0'),
                    sellingPrice: price,
                    discount: item.discount ?? 0,
                    quantity: isDefaultItem ? 0 : quantity,
                    categoryId: item.categoryId?.toString() || '',
                    isDefault: item.isDefault,
                    trackInventory: item.trackInventory ?? true,
                })
            }
        },
        /**
         * Remove item from cart by variantId
         */
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.variantId !== action.payload)
        },
        /**
         * Update quantity by variantId
         */
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const { id, quantity } = action.payload
            const item = state.items.find(item => item.variantId === id)

            if (item) {
                const isDefaultItem = item.isDefault === true
                if (!isDefaultItem && quantity < 1) return
                item.quantity = quantity
            }
        },
        /**
         * Update custom price by variantId
         */
        updateCustomPrice: (state, action: PayloadAction<{ variantId: string; newPrice: number }>) => {
            const { variantId, newPrice } = action.payload
            const item = state.items.find(item => item.variantId === variantId)
            if (item) {
                item.sellingPrice = newPrice
            }
        },
        /**
         * Update item discount by variantId
         */
        updateItemDiscount: (state, action: PayloadAction<{ variantId: string; discount: number; isPercentage: boolean }>) => {
            const { variantId, discount, isPercentage } = action.payload
            const item = state.items.find(item => item.variantId === variantId)
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
        setSaleDate: (state, action: PayloadAction<string | null>) => {
            state.saleDate = action.payload
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
            state.saleDate = null
        },
        calculateTotals: (state) => {
            let totalPrice = 0
            let totalItemDiscounts = 0
            const newSubtotal = state.items.reduce((sum, item) => {
                if (item.quantity === 0) {
                    totalPrice = item.sellingPrice
                } else {
                    totalPrice = item.sellingPrice * item.quantity
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
    setSaleDate,
    clearCart,
    calculateTotals,
    setCart,
    setTotal,
} = cartSlice.actions
export default cartSlice.reducer
