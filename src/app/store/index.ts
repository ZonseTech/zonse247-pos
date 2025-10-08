import uiReducer from './slices/uiSlice'
import cartReducer from './slices/cartSlice'
import { configureStore } from '@reduxjs/toolkit'
import productsReducer from './slices/productsSlice'
import customersReducer from './slices/customerSlice'

export const store = configureStore({
    reducer: {
        products: productsReducer,
        cart: cartReducer,
        customers: customersReducer,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch