import { FunctionComponent, useEffect } from "react"
import { useAppDispatch } from "../hooks/redux"
import { useAuth } from "../context/AuthProvider"
import { clearProducts, fetchAllProductData } from "../store/slices/productsSlice"
import { clearCustomers, fetchCustomers } from "../store/slices/customerSlice"
import { clearUserData, setLoading, setTill, setUser } from "../store/slices/uiSlice"
import { clearCart } from "../store/slices/cartSlice"

export const DataManager: FunctionComponent = () => {
    const dispatch = useAppDispatch()
    const { isAuthenticated, user: authUser } = useAuth()

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(clearProducts())
            dispatch(clearCustomers())
            dispatch(clearUserData())
            dispatch(clearCart())
            return
        }

        const initializeData = async () => {
            dispatch(setLoading(true))
            try {
                await Promise.all([
                    dispatch(fetchAllProductData()),
                    dispatch(fetchCustomers()),
                ])

                dispatch(setUser(authUser))
                dispatch(setTill({} as Till))
            } finally {
                dispatch(setLoading(false))
            }
        }

        initializeData()
    }, [isAuthenticated, dispatch])

    return null
}