import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface DayEndCloseStockCountItem {
    id: string
    variantId: string
    productId: string
    name: string
    code: string
    unitPrice: number
    costPrice: number
    bookBalance: number
    goodsReceived: number
    physicalCount: string
    isLoading: boolean
}

interface DayEndCloseState {
    items: DayEndCloseStockCountItem[]
    tradingDate: string
}

const initialState: DayEndCloseState = {
    items: [],
    tradingDate: new Date().toISOString().split('T')[0],
}

const dayEndCloseSlice = createSlice({
    name: 'dayEndClose',
    initialState,
    reducers: {
        addPendingStockCountItem: (state, action: PayloadAction<InventoryItem>) => {
            const item = action.payload
            const id = item.id?.toString() || item.productId.toString()
            const existingItem = state.items.find((countItem) => countItem.id === id)
            if (existingItem) return

            state.items.push({
                id,
                variantId: id,
                productId: item.productId?.toString() || id,
                name: item.displayName || item.name || 'Unknown Item',
                code: item.sku || item.barcode || item.primaryBarcode || '',
                unitPrice: parseFloat(item.sellingPrice?.toString() || '0'),
                costPrice: parseFloat(item.costPrice?.toString() || '0'),
                bookBalance: parseFloat((item.availableQuantity ?? item.quantity ?? 0).toString()),
                goodsReceived: 0,
                physicalCount: '',
                isLoading: true,
            })
        },
        resolveStockCountItem: (
            state,
            action: PayloadAction<{ id: string; bookBalance: number; goodsReceived: number }>
        ) => {
            const { id, bookBalance, goodsReceived } = action.payload
            const item = state.items.find((countItem) => countItem.id === id)
            if (item) {
                item.bookBalance = bookBalance
                item.goodsReceived = goodsReceived
                item.isLoading = false
            }
        },
        updatePhysicalCount: (state, action: PayloadAction<{ id: string; value: string }>) => {
            const { id, value } = action.payload
            const item = state.items.find((countItem) => countItem.id === id)
            if (item) {
                item.physicalCount = value
            }
        },
        removeStockCountItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((countItem) => countItem.id !== action.payload)
        },
        clearStockCount: (state) => {
            state.items = []
        },
        setTradingDate: (state, action: PayloadAction<string>) => {
            state.tradingDate = action.payload
        },
    },
})

export const {
    addPendingStockCountItem,
    resolveStockCountItem,
    updatePhysicalCount,
    removeStockCountItem,
    clearStockCount,
    setTradingDate,
} = dayEndCloseSlice.actions
export default dayEndCloseSlice.reducer
