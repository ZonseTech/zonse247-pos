import Modal from 'react-modal'
import { Suspense, useEffect } from 'react'
import AppRoutes from './routes'
import { HashRouter, useLocation } from "react-router"
import type { FunctionComponent } from 'react'
import { ToastContainer } from 'react-toastify'
import PageLoader from './components/PageLoader'
import { AppProvider } from './context/AppProvider'
import { AuthProvider, useAuth } from './context/AuthProvider'
import { ModalProvider } from './context/ModalProvider'
import ZonseUIKitContext from './components/ZonseUIKitContext'
import NProgress from 'nprogress'
import { Provider } from 'react-redux'
import { store } from './store'
import { useAppDispatch } from './hooks/redux'
import { clearProducts, fetchAllProductData, } from './store/slices/productsSlice'
import { clearCustomers, fetchCustomers } from './store/slices/customerSlice'
import { clearUserData, setLoading, setTill, setUser } from './store/slices/uiSlice'
import { clearCart } from './store/slices/cartSlice'

Modal.setAppElement('#root')

NProgress.configure({
    showSpinner: true,
    speed: 500,
    minimum: 0.3
})

const NavigationProgress: FunctionComponent = () => {
    const location = useLocation()

    useEffect(() => {
        NProgress.start()
        const timer = setTimeout(() => {
            NProgress.done()
        }, 100)

        return () => {
            clearTimeout(timer)
            NProgress.done()
        }
    }, [location])

    return null
}

const EnhancedPageLoader: FunctionComponent = () => {
    useEffect(() => {
        NProgress.start()
        return () => {
            NProgress.done()
        }
    }, [])

    return <PageLoader />
}

const DataManager: FunctionComponent = () => {
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

const App: FunctionComponent = () => {
    return (
        <Provider store={store}>
            <ModalProvider>
                <ZonseUIKitContext usePreferences>
                    <AuthProvider>
                        <AppProvider>
                            <DataManager />
                            <div className="app-container">
                                <HashRouter>
                                    <NavigationProgress />
                                    <Suspense fallback={<EnhancedPageLoader />}>
                                        <AppRoutes />
                                    </Suspense>
                                </HashRouter>
                                <ToastContainer />
                            </div>
                        </AppProvider>
                    </AuthProvider>
                </ZonseUIKitContext>
            </ModalProvider>
        </Provider>

    )
}

export default App