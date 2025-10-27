import { useEffect, useState } from 'react';
import { useSettings } from './hooks/useSettings';
import Modal from 'react-modal'
import { Suspense } from 'react'
import AppRoutes from './routes'
import { HashRouter } from "react-router"
import type { FunctionComponent } from 'react'
import { ToastContainer } from 'react-toastify'
import { AppProvider } from './context/AppProvider'
import { AuthProvider } from './context/AuthProvider'
import ZonseUIKitContext from './components/ZonseUIKitContext'
import { Provider } from 'react-redux'
import { store } from './store'
import { NavigationProgress } from './components/loader/NavigationProgress'
import { EnhancedPageLoader } from './components/loader/EnhancedPageLoader'
import { DataManager } from './config/data-manager'
import OnboardingFlow from './pages/on-boarding';

Modal.setAppElement('#root')
const App: FunctionComponent = () => {
    const { setup, loading, hasSetup, saveSetup, error } = useSettings();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !hasSetup) {
            setShowOnboarding(true);
        } else if (!loading && hasSetup) {
            setShowOnboarding(false);
        }
    }, [loading, hasSetup, setup]);

    const handleOnboardingComplete = async (setupData: any) => {
        setSaveError(null);

        const result = await saveSetup(setupData);

        if (result.success) {
            setShowOnboarding(false);
        } else {
            setSaveError(result.error || 'Failed to save setup. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <ZonseUIKitContext usePreferences>
            <Provider store={store}>
                <AuthProvider>
                    <AppProvider>
                        <DataManager />
                        <div className="app-container">
                            <HashRouter>
                                <NavigationProgress />
                                <Suspense fallback={<EnhancedPageLoader />}>
                                    {showOnboarding ? (
                                        <OnboardingFlow
                                            onComplete={handleOnboardingComplete}
                                            error={saveError}
                                        />
                                    ) : <AppRoutes appSettings={setup} />}
                                </Suspense>
                            </HashRouter>
                            <ToastContainer />
                        </div>
                    </AppProvider>
                </AuthProvider>
            </Provider>
        </ZonseUIKitContext>
    );
}
export default App