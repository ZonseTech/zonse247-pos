import Modal from 'react-modal'
import { Suspense, useEffect } from 'react'
import AppRoutes from './routes'
import { HashRouter, useLocation } from "react-router"
import type { FunctionComponent } from 'react'
import { ToastContainer } from 'react-toastify'
import PageLoader from './components/PageLoader'
import { AppProvider } from './context/AppProvider'
import { AuthProvider } from './context/AuthProvider'
import { ModalProvider } from './context/ModalProvider'
import { ProductsProvider } from './context/ProductsProvider'
import ZonseUIKitContext from './components/ZonseUIKitContext'
import NProgress from 'nprogress'

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

const App: FunctionComponent = () => {
    return (
        <ModalProvider>
            <ZonseUIKitContext usePreferences>
                <AuthProvider>
                    <AppProvider>
                        <ProductsProvider>
                            <div className="app-container">
                                <HashRouter>
                                    <NavigationProgress />
                                    <Suspense fallback={<EnhancedPageLoader />}>
                                        <AppRoutes />
                                    </Suspense>
                                </HashRouter>
                                <ToastContainer />
                            </div>
                        </ProductsProvider>
                    </AppProvider>
                </AuthProvider>
            </ZonseUIKitContext>
        </ModalProvider>
    )
}

export default App