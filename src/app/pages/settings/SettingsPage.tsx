import { Outlet, useLocation } from 'react-router';
import { Form, Formik } from 'formik';
import { settingsValidationSchema } from '../../schemas/settings.schema';
import SettingsActions from './components/SettingsActions';
import ResetConfirmModal from './components/ResetConfirmModal';
import AppLayout from '../../layouts/AppLayout';
import { useSettings } from './hooks/useSettings';
import { sanitizeSettings } from './utils/settingsHelpers';
import { SETTINGS_TABS } from './constants/config';
import { ROUTES } from '../../utils/constants';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { HiOutlineCog, HiXMark, HiCheckCircle } from 'react-icons/hi2';
import { Button } from '../../components';

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
                {({ isSubmitting, submitForm, isValid, dirty }) => (
                    <div className="min-h-screen pb-20 md:pb-0">
                        {isMobile ? (
                            <MobilePageHeader
                                title={`${currentTab.label} Settings`}
                                theme="sky"
                                fixed
                                leftIcon={<HiXMark className="w-5 h-5 text-white" />}
                                rightContent={
                                    <Button
                                        type="button"
                                        onClick={submitForm}
                                        disabled={isSubmitting || !isValid}
                                        theme="success"
                                    >
                                        <HiCheckCircle className="w-4 h-4 mr-1" />
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </Button>
                                }
                            />
                        ) : (
                            <PageHeader
                                title="Settings"
                                description="Manage your application settings and preferences"
                                icon={<HiOutlineCog className="w-8 h-8 text-sky-500" />}
                                compact
                            />
                        )}

                        <div className={`max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ${isMobile ? 'pt-16' : ''}`}>
                            <Form>
                                <Outlet />

                                {!isMobile && (
                                    <SettingsActions
                                        isSubmitting={isSubmitting}
                                        onReset={() => setShowResetConfirm(true)}
                                    />
                                )}
                            </Form>
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
