import { Outlet, useLocation } from 'react-router';
import { Form, Formik } from 'formik';
import { settingsValidationSchema } from '../../schemas/settings.schema';
import SettingsActions from './components/SettingsActions';
import ResetConfirmModal from './components/ResetConfirmModal';
import SettingsSidebar from './components/SettingsSidebar';
import AppLayout from '../../layouts/AppLayout';
import { useSettings } from './hooks/useSettings';
import { SETTINGS_TABS } from './constants/config';
import { ROUTES } from '../../utils/constants';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { HiXMark, HiCheckCircle } from 'react-icons/hi2';
import { Button } from '../../components';
import { sanitizeSettings } from '../../utils';

const SETTINGS_ROUTES: Record<string, string> = {
    general: ROUTES.SETTINGS_GENERAL,
    sales: ROUTES.SETTINGS_SALES,
    receipt: ROUTES.SETTINGS_RECEIPT,
    security: ROUTES.SETTINGS_SECURITY,
};

const SettingsPage = () => {
    const location = useLocation();
    const isMobile = useIsMobile();
    const {
        settings,
        loading,
        showResetConfirm,
        setShowResetConfirm,
        handleSubmit: onSubmit,
        handleResetSettings,
    } = useSettings();

    const currentTab = SETTINGS_TABS.find(
        (tab) => SETTINGS_ROUTES[tab.id] === location.pathname
    ) || SETTINGS_TABS[0];

    const handleSubmit = async (values: any) => {
        const sanitized = sanitizeSettings(values);
        await onSubmit(sanitized);

        setTimeout(() => { window.location.reload(), 200 })
    };

    if (loading || !settings) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-600 dark:text-gray-400">Loading settings...</div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Formik
                initialValues={settings}
                validationSchema={settingsValidationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
                validateOnMount
            >
                {({ isSubmitting, submitForm }) => (
                    <div className="min-h-screen pb-20 md:pb-0">
                        {isMobile && (
                            <MobilePageHeader
                                title={`${currentTab.label} Settings`}
                                theme="sky"
                                fixed
                                leftIcon={<HiXMark className="w-5 h-5 text-white" />}
                                rightContent={
                                    <Button
                                        type="button"
                                        onClick={submitForm}
                                        disabled={isSubmitting}
                                        theme="success"
                                    >
                                        <HiCheckCircle className="w-4 h-4 mr-1" />
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </Button>
                                }
                            />
                        )}

                        <div className={`max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ${isMobile ? 'pt-16' : ''}`}>
                            {isMobile ? (
                                <Form>
                                    <Outlet />
                                </Form>
                            ) : (
                                <div className="flex gap-8">
                                    <SettingsSidebar />
                                    <div className="flex-1 min-w-0">
                                        <div className="mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                                                    <currentTab.icon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                                                </div>
                                                <div>
                                                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                        {currentTab.label} Settings
                                                    </h1>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {currentTab.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Form>
                                            <Outlet />
                                            <SettingsActions
                                                isSubmitting={isSubmitting}
                                                onReset={() => setShowResetConfirm(true)}
                                            />
                                        </Form>
                                    </div>
                                </div>
                            )}
                        </div>

                        {showResetConfirm && (
                            <ResetConfirmModal
                                onConfirm={handleResetSettings}
                                onCancel={() => setShowResetConfirm(false)}
                            />
                        )}
                    </div>
                )}
            </Formik>
        </AppLayout>
    );
};

export default SettingsPage;
