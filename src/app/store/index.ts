import uiReducer from './slices/uiSlice'
import cartReducer from './slices/cartSlice'
import { configureStore } from '@reduxjs/toolkit'
import inventoryReducer from './slices/inventorySlice'
import customersReducer from './slices/customerSlice'
import servicesReducer from './slices/serviceSlice'
import staffReducer from './slices/staffSlice'
import dayEndCloseReducer from './slices/dayEndCloseSlice'

export const store = configureStore({
    reducer: {
        inventory: inventoryReducer,
        cart: cartReducer,
        customers: customersReducer,
        services: servicesReducer,
        staff: staffReducer,
        ui: uiReducer,
        dayEndClose: dayEndCloseReducer,
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