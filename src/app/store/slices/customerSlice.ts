import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import customerService from '../../services/customers.service'
import { getErrorMessage } from '../../utils/api-error-handler'
import { Notify } from 'notiflix'

interface CustomersState {
    customers: Customer[]
    selectedCustomer: Customer | null
    loading: boolean
    error: string | null
    lastFetched: number | null
    cacheTimeout: number
}

const initialState: CustomersState = {
    customers: [],
    selectedCustomer: null,
    loading: false,
    error: null,
    lastFetched: null,
    cacheTimeout: 5 * 60 * 1000,
}

export const fetchCustomers = createAsyncThunk(
    'customers/fetchCustomers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await customerService.list()
            return response
        } catch (error) {
            const message = getErrorMessage(error, 'Error fetching customers')
            Notify.failure(message)
            return rejectWithValue(message)
        }
    }
)

export const fetchCustomersWithCache = createAsyncThunk(
    'customers/fetchCustomersWithCache',
    async (forceRefresh: boolean = false, { getState, dispatch }) => {
        const state = getState() as { customers: CustomersState }
        const now = Date.now()

        if (
            !forceRefresh &&
            state.customers.lastFetched &&
            (now - state.customers.lastFetched) < state.customers.cacheTimeout &&
            state.customers.customers.length > 0
        ) {
            return
        }

        await dispatch(fetchCustomers())
    }
)

const customersSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {
        setSelectedCustomer: (state, action: PayloadAction<Customer>) => {
            state.selectedCustomer = action.payload
        },
        setCustomers: (state, action: PayloadAction<Customer[]>) => {
            state.customers = action.payload
        },
        clearCustomers: (state) => {
            state.customers = []
            state.selectedCustomer = null
            state.lastFetched = null
        },
        invalidateCustomerCache: (state) => {
            state.lastFetched = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false
                state.customers = action.payload
                state.lastFetched = Date.now()
                if (action.payload.length > 0 && !state.selectedCustomer) {
                    state.selectedCustomer = action.payload[0]
                }
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const {
    setSelectedCustomer,
    setCustomers,
    clearCustomers,
    invalidateCustomerCache,
} = customersSlice.actions

export default customersSlice.reducer
