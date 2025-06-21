import Modal from 'react-modal'
import { Suspense } from 'react'
import AppRoutes from './routes'
import { HashRouter } from "react-router"
import type { FunctionComponent } from 'react'
import { ToastContainer } from 'react-toastify'
import PageLoader from './components/PageLoader'
import { AppProvider } from './context/AppProvider'
import { AuthProvider } from './context/AuthProvider'
import { ModalProvider } from './context/ModalProvider'
import { ProductsProvider } from './context/ProductsProvider'
import ZonseUIKitContext from './components/ZonseUIKitContext'

Modal.setAppElement('#root')

const App: FunctionComponent = () => {
    return (
        <ModalProvider>
            <ZonseUIKitContext usePreferences>
                <AuthProvider>
                    <AppProvider>
                        <ProductsProvider>
                            <div className="app-container">
                                <HashRouter>
                                    <Suspense fallback={<PageLoader />}>
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