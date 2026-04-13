import { Notify } from 'notiflix'
import { getErrorMessage } from '../../utils/api-error-handler'
import serviceService from '../../services/service.service'
import { mapServicesToInventoryItems } from '../../utils/product-mapper'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface ServiceState {
    services: Service[]
    items: InventoryItem[]
    loading: boolean
    error: string | null
    lastFetched: number | null
    cacheTimeout: number
}

const initialState: ServiceState = {
    services: [],
    items: [],
    loading: false,
    error: null,
    lastFetched: null,
    cacheTimeout: 5 * 60 * 1000,
}

export const fetchServices = createAsyncThunk(
    'services/fetchServices',
    async (_, { rejectWithValue }) => {
        try {
            const firstPage = await serviceService.list({ limit: 100, isActive: 'true' })
            let allServices = firstPage.services || []

            const totalPages = firstPage.pagination?.totalPages || 1
            if (totalPages > 1) {
                const pagePromises: Promise<ServiceListResponse>[] = []
                for (let page = 2; page <= totalPages; page++) {
                    pagePromises.push(serviceService.list({ page, limit: 100, isActive: 'true' }))
                }
                const pages = await Promise.all(pagePromises)
                pages.forEach(res => {
                    allServices = allServices.concat(res.services || [])
                })
            }

            return {
                services: allServices,
                items: mapServicesToInventoryItems(allServices),
            }
        } catch (error: any) {
            const message = getErrorMessage(error, 'Error fetching services')
            Notify.failure(message)
            return rejectWithValue(message)
        }
    }
)

export const fetchServicesWithCache = createAsyncThunk(
    'services/fetchServicesWithCache',
    async (forceRefresh: boolean = false, { getState, dispatch }) => {
        const state = getState() as { services: ServiceState }
        const now = Date.now()

        if (
            !forceRefresh &&
            state.services.lastFetched &&
            (now - state.services.lastFetched) < state.services.cacheTimeout &&
            state.services.items.length > 0
        ) {
            return
        }

        await dispatch(fetchServices())
    }
)

const serviceSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {
        invalidateServiceCache: (state) => {
            state.lastFetched = null
        },
        clearServices: (state) => {
            state.services = []
            state.items = []
            state.lastFetched = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchServices.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                state.loading = false
                state.services = action.payload.services
                state.items = action.payload.items
                state.lastFetched = Date.now()
            })
            .addCase(fetchServices.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { invalidateServiceCache, clearServices } = serviceSlice.actions
export default serviceSlice.reducer
