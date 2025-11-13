import { Notify } from 'notiflix'
import productsService from '../../services/products.service'
import categoriesService from '../../services/category.service'
import paymentMethodService from '../../services/payment-method.service'
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import paymentServiceProviderService from '../../services/payment-service-provider.service'

interface ProductsState {
    products: Product[]
    categories: Category[]
    paymentMethods: PaymentMethod[]
    paymentServiceProvider: PaymentServiceProvider[]
    loading: boolean
    error: string | null,
    lastFetched: number | null,
    cacheTimeout: number
}

const initialState: ProductsState = {
    products: [],
    categories: [],
    paymentMethods: [],
    paymentServiceProvider: [],
    loading: false,
    error: null,
    lastFetched: null,
    cacheTimeout: 5 * 60 * 1000,
}

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const data = await productsService.index()
            return data
        } catch (error) {
            const message = 'Error fetching products: ' + error
            Notify.failure(message)
            return rejectWithValue(message)
        }
    }
)

export const fetchCategories = createAsyncThunk(
    'products/fetchCategories',
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
    'products/fetchPaymentMethods',
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
    'products/fetchPaymentServiceProvider',
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

export const fetchAllProductData = createAsyncThunk(
    'products/fetchAllProductData',
    async (_, { dispatch }) => {
        await Promise.all([
            dispatch(fetchProducts()),
        ])
    }
)

export const fetchAllProductDataWithCache = createAsyncThunk(
    'products/fetchAllProductDataWithCache',
    async (forceRefresh: boolean = false, { getState, dispatch }) => {
        const state = getState() as { products: ProductsState }
        const now = Date.now()

        if (!forceRefresh &&
            state.products.lastFetched &&
            (now - state.products.lastFetched) < state.products.cacheTimeout &&
            state.products.products.length > 0) {

            return
        }

        await Promise.all([
            dispatch(fetchProducts()),
        ])
    }
)

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        invalidateCache: (state) => {
            state.lastFetched = null
        },
        updateProductStock: (state, action: PayloadAction<{ id: string; newStock: number }>) => {
            const { id, newStock } = action.payload
            const product = state.products.find(p => p.productId === id)
            if (product) {
                product.quantity = newStock
            }
        },
        setCategories: (state, action: PayloadAction<Category[]>) => {
            state.categories = action.payload
        },
        clearProducts: (state) => {
            state.products = []
            state.categories = []
            state.paymentMethods = []
            state.paymentServiceProvider = []
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false
                state.products = action.payload
                state.lastFetched = Date.now()
            })
            .addCase(fetchProducts.rejected, (state, action) => {
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
            .addCase(fetchAllProductDataWithCache.fulfilled, (state) => {
                state.lastFetched = Date.now()
                state.loading = false
            })
            .addCase(fetchAllProductData.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchAllProductData.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(fetchAllProductData.rejected, (state) => {
                state.loading = false
            })
    },
})

export const { updateProductStock, setCategories, clearProducts } = productsSlice.actions
export default productsSlice.reducer
