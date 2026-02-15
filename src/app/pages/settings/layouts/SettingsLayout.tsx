import { Outlet } from 'react-router';
import { Form, Formik } from 'formik';
import { settingsValidationSchema } from '../../../schemas/settings.schema';
import SettingsNavbar from '../components/SettingsNavbar';
import SettingsActions from '../partials/SettingsActions';
import ResetConfirmModal from '../partials/ResetConfirmModal';
import AppLayout from '../../../layouts/AppLayout';
import { useSettings } from '../hooks/useSettings';
import { sanitizeSettings } from '../utils/settingsHelpers';
import { SettingsProvider } from '../context/SettingsContext';

const SettingsLayout = () => {
    const {
        settings,
        loading,
        showResetConfirm,
        setShowResetConfirm,
        handleSubmit: onSubmit,
        handleResetSettings,
    } = useSettings();

    const handleSubmit = async (values: AppSettings) => {
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
            <div className="min-h-screen pb-20 md:pb-0">
                <SettingsNavbar />

                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <Formik
                        initialValues={settings}
                        validationSchema={settingsValidationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <SettingsProvider settings={settings}>
                                    <Outlet />
                                </SettingsProvider>

                                <SettingsActions
                                    isSubmitting={isSubmitting}
                                    onReset={() => setShowResetConfirm(true)}
                                />
                            </Form>
                        )}
                    </Formik>
                </div>

                {showResetConfirm && (
                    <ResetConfirmModal
                        onConfirm={handleResetSettings}
                        onCancel={() => setShowResetConfirm(false)}
                    />
                )}
            </div>
        </AppLayout>
    );
};

export default SettingsLayout;
