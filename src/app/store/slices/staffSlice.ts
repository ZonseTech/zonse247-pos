import { Notify } from 'notiflix'
import { getErrorMessage } from '../../utils/api-error-handler'
import staffService from '../../services/staff.service'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface StaffState {
    staff: Staff[]
    loading: boolean
    error: string | null
    lastFetched: number | null
    cacheTimeout: number
}

const initialState: StaffState = {
    staff: [],
    loading: false,
    error: null,
    lastFetched: null,
    cacheTimeout: 5 * 60 * 1000,
}

export const fetchStaff = createAsyncThunk(
    'staff/fetchStaff',
    async (_, { rejectWithValue }) => {
        try {
            const firstPage = await staffService.list({ limit: 100, employmentStatus: 'ACTIVE' })
            let allStaff = firstPage.staff || []

            const totalPages = firstPage.pagination?.totalPages || 1
            if (totalPages > 1) {
                const pagePromises: Promise<StaffListResponse>[] = []
                for (let page = 2; page <= totalPages; page++) {
                    pagePromises.push(staffService.list({ page, limit: 100, employmentStatus: 'ACTIVE' }))
                }
                const pages = await Promise.all(pagePromises)
                pages.forEach(res => {
                    allStaff = allStaff.concat(res.staff || [])
                })
            }

            return allStaff
        } catch (error: any) {
            const message = getErrorMessage(error, 'Error fetching staff')
            Notify.failure(message)
            return rejectWithValue(message)
        }
    }
)

export const fetchStaffWithCache = createAsyncThunk(
    'staff/fetchStaffWithCache',
    async (forceRefresh: boolean = false, { getState, dispatch }) => {
        const state = getState() as { staff: StaffState }
        const now = Date.now()

        if (
            !forceRefresh &&
            state.staff.lastFetched &&
            (now - state.staff.lastFetched) < state.staff.cacheTimeout &&
            state.staff.staff.length > 0
        ) {
            return
        }

        await dispatch(fetchStaff())
    }
)

const staffSlice = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        invalidateStaffCache: (state) => {
            state.lastFetched = null
        },
        clearStaff: (state) => {
            state.staff = []
            state.lastFetched = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStaff.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchStaff.fulfilled, (state, action) => {
                state.loading = false
                state.staff = action.payload
                state.lastFetched = Date.now()
            })
            .addCase(fetchStaff.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { invalidateStaffCache, clearStaff } = staffSlice.actions
export default staffSlice.reducer
