import { Notify } from 'notiflix'
import productService from '../../services/product.service'
import categoriesService from '../../services/category.service'
import paymentMethodService from '../../services/payment-method.service'
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import paymentServiceProviderService from '../../services/payment-service-provider.service'
import { mapProductsToInventoryItems } from '../../utils/product-mapper'

interface InventoryState {
    inventory: InventoryItem[]
    products: ProductWithInventory[]
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
        itemsPerPage: number
    } | null
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
    products: [],
    pagination: null,
    categories: [],
    paymentMethods: [],
    paymentServiceProvider: [],
    loading: false,
    error: null,
    lastFetched: null,
    cacheTimeout: 5 * 60 * 1000,
}

// Query parameters for fetching products
interface FetchProductsParams {
    page?: number
    perPage?: number
    search?: string
    filter?: string
    status?: string
    categoryId?: string
    includeInactive?: boolean
}

export const fetchInventory = createAsyncThunk(
    'inventory/fetchInventory',
    async (params: FetchProductsParams = {}, { rejectWithValue }) => {
        try {
            // Fetch products with max allowed perPage (100)
            // For POS, we fetch all pages to get complete product list
            const perPage = Math.min(params.perPage || 100, 100) // API max is 100

            const baseParams: ListProductsOptions = {
                page: 1,
                perPage,
                search: params.search,
                filter: params.filter as ListProductsOptions['filter'] || 'active',
                status: params.status,
                categoryId: params.categoryId,
                includeInactive: params.includeInactive || false,
            }

            // Fetch first page
            const firstResponse = await productService.listProducts(baseParams)
            let allProducts = firstResponse.products || []

            // If there are more pages, fetch them all for POS
            const totalPages = firstResponse.pagination?.totalPages || 1
            if (totalPages > 1 && !params.page) {
                const pagePromises = []
                for (let page = 2; page <= totalPages; page++) {
                    pagePromises.push(productService.listProducts({ ...baseParams, page }))
                }
                const additionalResponses = await Promise.all(pagePromises)
                additionalResponses.forEach(res => {
                    allProducts = allProducts.concat(res.products || [])
                })
            }

            // Map ProductWithInventory to InventoryItem for cart compatibility
            const inventoryItems = mapProductsToInventoryItems(allProducts)

            return {
                items: inventoryItems,
                products: allProducts,
                pagination: firstResponse.pagination ? {
                    currentPage: firstResponse.pagination.currentPage || firstResponse.pagination.page || 1,
                    totalPages: firstResponse.pagination.totalPages || 1,
                    totalItems: firstResponse.pagination.totalItems || firstResponse.pagination.total || 0,
                    itemsPerPage: firstResponse.pagination.perPage || firstResponse.pagination.limit || perPage,
                } : null,
            }
        } catch (error: any) {
            const message = 'Error fetching products: ' + (error?.response?.data?.message || error?.message || 'Unknown error')

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
            const message = 'Error fetching categories: ' + error?.error?.response?.data?.message
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
            const message = 'Error fetching payment methods: ' + error?.error?.response?.data?.message
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
            const message = 'Error fetching payment service providers: ' + error?.error?.response?.data?.message
            Notify.failure(message)
            return rejectWithValue(message)
        }
    }
)

export const fetchAllInventoryData = createAsyncThunk(
    'inventory/fetchAllInventoryData',
    async (_, { dispatch }) => {
        await Promise.all([
            dispatch(fetchInventory({})),
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
            dispatch(fetchInventory({})),
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
            state.products = []
            state.pagination = null
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
                state.inventory = action.payload.items
                state.products = action.payload.products
                state.pagination = action.payload.pagination
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
