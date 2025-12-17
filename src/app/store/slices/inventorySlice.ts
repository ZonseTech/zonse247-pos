import { Notify } from 'notiflix'
import inventoryService from '../../services/inventory.service'
import categoriesService from '../../services/category.service'
import paymentMethodService from '../../services/payment-method.service'
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import paymentServiceProviderService from '../../services/payment-service-provider.service'

interface InventoryState {
    inventory: InventoryItem[]
    categories: Category[]
    paymentMethods: PaymentMethod[]
    paymentServiceProvider: PaymentServiceProvider[]
    loading: boolean
    error: string | null,
    lastFetched: number | null,
    cacheTimeout: number
}

const initialState: InventoryState = {
    inventory: [],
    categories: [],
    paymentMethods: [],
    paymentServiceProvider: [],
    loading: false,
    error: null,
    lastFetched: null,
    cacheTimeout: 5 * 60 * 1000,
}

export const fetchInventory = createAsyncThunk(
    'inventory/fetchInventory',
    async (_, { rejectWithValue }) => {
        try {
            const data = await inventoryService.index()
            return data
        } catch (error) {
            const message = 'Error fetching inventory: ' + error
            Notify.failure(message)
            return rejectWithValue(message)
        }
    }
)

export const fetchCategories = createAsyncThunk(
    'inventory/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const data = await categoriesService.list()
            return data
        } catch (error) {
            const message = 'Error fetching categories: ' + error
            Notify.failure(message)
            return rejectWithValue(message)
        }
    }
)

export const fetchPaymentMethods = createAsyncThunk(
    'inventory/fetchPaymentMethods',
    async (_, { rejectWithValue }) => {
        try {
            const data = await paymentMethodService.list()
            return data
        } catch (error) {
            const message = 'Error fetching payment methods: ' + error
            Notify.failure(message)
            return rejectWithValue(message)
        }
    }
)

export const fetchPaymentServiceProvider = createAsyncThunk(
    'inventory/fetchPaymentServiceProvider',
    async (_, { rejectWithValue }) => {
        try {
            const data = await paymentServiceProviderService.list()
            return data
        } catch (error) {
            const message = 'Error fetching payment service providers: ' + error
            Notify.failure(message)
            return rejectWithValue(message)
        }
    }
)

export const fetchAllInventoryData = createAsyncThunk(
    'inventory/fetchAllInventoryData',
    async (_, { dispatch }) => {
        await Promise.all([
            dispatch(fetchInventory()),
        ])
    }
)

export const fetchAllInventoryDataWithCache = createAsyncThunk(
    'inventory/fetchAllInventoryDataWithCache',
    async (forceRefresh: boolean = false, { getState, dispatch }) => {
        const state = getState() as { inventory: InventoryState }
        const now = Date.now()

        if (!forceRefresh &&
            state.inventory.lastFetched &&
            (now - state.inventory.lastFetched) < state.inventory.cacheTimeout &&
            state.inventory.inventory.length > 0) {

            return
        }

        await Promise.all([
            dispatch(fetchInventory()),
        ])
    }
)

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {
        invalidateCache: (state) => {
            state.lastFetched = null
        },
        updateInventoryStock: (state, action: PayloadAction<{ id: string; newStock: number }>) => {
            const { id, newStock } = action.payload
            const item = state.inventory.find(p => p.productId === id)
            if (item) {
                item.quantity = newStock.toString()
            }
        },
        setCategories: (state, action: PayloadAction<Category[]>) => {
            state.categories = action.payload
        },
        clearInventory: (state) => {
            state.inventory = []
            state.categories = []
            state.paymentMethods = []
            state.paymentServiceProvider = []
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInventory.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchInventory.fulfilled, (state, action) => {
                state.loading = false
                state.inventory = action.payload
                state.lastFetched = Date.now()
            })
            .addCase(fetchInventory.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload
            })
            .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
                state.paymentMethods = action.payload
            })
            .addCase(fetchPaymentServiceProvider.fulfilled, (state, action) => {
                state.paymentServiceProvider = action.payload
            })
            .addCase(fetchAllInventoryDataWithCache.fulfilled, (state) => {
                state.lastFetched = Date.now()
                state.loading = false
            })
            .addCase(fetchAllInventoryData.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchAllInventoryData.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(fetchAllInventoryData.rejected, (state) => {
                state.loading = false
            })
    },
})

export const { updateInventoryStock, setCategories, clearInventory } = inventorySlice.actions
export default inventorySlice.reducer
