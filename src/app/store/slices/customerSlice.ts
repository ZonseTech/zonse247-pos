import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import customerService from '../../services/customers.service'
import { Notify } from 'notiflix'

interface CustomersState {
    customers: Customer[]
    selectedCustomer: Customer | null
    loading: boolean
    error: string | null
}

const initialState: CustomersState = {
    customers: [],
    selectedCustomer: null,
    loading: false,
    error: null,
}

export const fetchCustomers = createAsyncThunk(
    'customers/fetchCustomers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await customerService.list()
            return response
        } catch (error) {
            const message = 'Error fetching customers: ' + error?.error?.response?.data?.message
            Notify.failure(message)
            return rejectWithValue(message)
        }
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
    clearCustomers
} = customersSlice.actions

export default customersSlice.reducer
