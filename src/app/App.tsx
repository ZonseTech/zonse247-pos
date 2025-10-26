import Modal from 'react-modal'
import { Suspense } from 'react'
import AppRoutes from './routes'
import { HashRouter } from "react-router"
import type { FunctionComponent } from 'react'
import { ToastContainer } from 'react-toastify'
import { AppProvider } from './context/AppProvider'
import { AuthProvider } from './context/AuthProvider'
import { ModalProvider } from './context/ModalProvider'
import ZonseUIKitContext from './components/ZonseUIKitContext'
import { Provider } from 'react-redux'
import { store } from './store'
import { NavigationProgress } from './components/loader/NavigationProgress'
import { EnhancedPageLoader } from './components/loader/EnhancedPageLoader'
import { DataManager } from './config/data-manager'

Modal.setAppElement('#root')

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