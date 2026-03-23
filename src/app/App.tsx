import Modal from 'react-modal'
import { store } from './store'
import AppRoutes from './routes'
import { Suspense } from 'react'
import { Theme, Flex, Spinner, Text, Box } from '@radix-ui/themes'
import { Provider } from 'react-redux'
import { HashRouter } from "react-router"
import { useEffect, useState } from 'react';
import type { FunctionComponent } from 'react'
import { ToastContainer } from 'react-toastify'
import OnboardingFlow from './pages/on-boarding';
import { useSettings } from './hooks/useSettings';
import { DataManager } from './config/data-manager'
import { AppProvider } from './context/AppProvider'
import { AuthProvider } from './context/AuthProvider'
import { BranchProvider } from './context/BranchContext'
import { LayoutProvider } from './context/LayoutContext'
import ZonseUIKitContext from './components/ZonseUIKitContext'
import { NavigationProgress } from './components/loader/NavigationProgress'
import { EnhancedPageLoader } from './components/loader/EnhancedPageLoader'

const CLIENT_TYPE = import.meta.env.VITE_APP_CLIENT_TYPE || 'desktop'
const isWebOrMobile = CLIENT_TYPE === 'web' || CLIENT_TYPE === 'mobile'

Modal.setAppElement('#root')
const App: FunctionComponent = () => {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { setup, loading, hasSetup, saveSetup } = useSettings();
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (isWebOrMobile) {
            setShowOnboarding(false);
            return;
        }

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
            <Flex align="center" justify="center" height="100vh">
                <Flex direction="column" align="center" gap="4">
                    <Spinner size="3" />
                    <Text size="2" color="gray">Loading...</Text>
                </Flex>
            </Flex>
        );
    }

    return (
        <ZonseUIKitContext usePreferences>
            <Theme appearance="inherit" accentColor="cyan" radius="medium" scaling="100%">
                <Provider store={store}>
                    <AuthProvider>
                        <BranchProvider>
                            <LayoutProvider>
                                <AppProvider>
                                    <DataManager />
                                    {CLIENT_TYPE === 'mobile' && (
                                        <Box
                                            position="fixed"
                                            top="0"
                                            left="0"
                                            right="0"
                                            className="bg-sky-500 z-[9999]"
                                            style={{ height: 'max(var(--safe-area-inset-top), var(--status-bar-height))' }}
                                        />
                                    )}
                                    <Box className="app-container">
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
                                    </Box>
                                </AppProvider>
                            </LayoutProvider>
                        </BranchProvider>
                    </AuthProvider>
                </Provider>
            </Theme>
        </ZonseUIKitContext>
    );
}
export default App