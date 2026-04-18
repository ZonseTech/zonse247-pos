import { FunctionComponent, useEffect } from "react"
import { useAppDispatch } from "../hooks/redux"
import { useAuth } from "../context/AuthProvider"
import { clearInventory, fetchCategories, fetchInventory } from "../store/slices/inventorySlice"
import { clearCustomers, fetchCustomers } from "../store/slices/customerSlice"
import { clearUserData, setLoading, setTill, setUser } from "../store/slices/uiSlice"
import { clearCart } from "../store/slices/cartSlice"
import { clearServices, fetchServices } from "../store/slices/serviceSlice"
import { clearStaff, fetchStaff } from "../store/slices/staffSlice"
import useBusinessFeatures from "../hooks/useBusinessFeatures"
import { useUserSyncCheck } from "../hooks/useUserSyncCheck"

export const DataManager: FunctionComponent = () => {
    const dispatch = useAppDispatch()
    const { isAuthenticated, user: authUser } = useAuth()
    const { showRetail, showServices } = useBusinessFeatures()

    useUserSyncCheck()

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(clearInventory())
            dispatch(clearCustomers())
            dispatch(clearServices())
            dispatch(clearStaff())
            dispatch(clearUserData())
            dispatch(clearCart())
            return
        }

        const initializeData = async () => {
            dispatch(setLoading(true))
            try {
                const fetches: Promise<any>[] = [
                    dispatch(fetchCategories()),
                    dispatch(fetchCustomers()),
                ]

                // Only load products for retail/hybrid businesses
                if (showRetail) {
                    fetches.push(dispatch(fetchInventory({})))
                }

                // Only load services and staff for service-based businesses
                if (showServices) {
                    fetches.push(dispatch(fetchServices()))
                    fetches.push(dispatch(fetchStaff()))
                }

                await Promise.all(fetches)

                dispatch(setUser(authUser))
                dispatch(setTill({} as Till))
            } finally {
                dispatch(setLoading(false))
            }
        }

        initializeData()
    }, [isAuthenticated, dispatch, showRetail, showServices])

    return null
}