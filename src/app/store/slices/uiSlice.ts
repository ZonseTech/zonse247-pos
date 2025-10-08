import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UiState {
    isLoading: boolean
    user: User | null
    till: Till | null
}

const initialState: UiState = {
    isLoading: false,
    user: null,
    till: null,
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload
        },
        setTill: (state, action: PayloadAction<Till | null>) => {
            state.till = action.payload
        },
        clearUserData: (state) => {
            state.user = null
            state.till = null
        },
    },
})

export const { setLoading, setUser, setTill, clearUserData } = uiSlice.actions
export default uiSlice.reducer