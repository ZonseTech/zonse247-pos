import { Form, Formik } from 'formik';
import { settingsValidationSchema } from '../../schemas/settings.schema';
import SettingsTabs from './partials/SettingsTabs';
import TabContent from './components/TabContent';
import SettingsActions from './partials/SettingsActions';
import ResetConfirmModal from './partials/ResetConfirmModal';
import AppLayout from '../../layouts/AppLayout';
import { useSettings } from './hooks/useSettings';
import { SETTINGS_TABS } from './constants/config';
import { sanitizeSettings } from './utils/settingsHelpers';

const Index = () => {
    const {
        settings,
        loading,
        activeTab,
        showResetConfirm,
        setActiveTab,
        setShowResetConfirm,
        handleSubmit: onSubmit,
        handleResetSettings,
    } = useSettings();


    const handleSubmit = async (values: AppSettings) => {
        const sanitized = sanitizeSettings(values);
        await onSubmit(sanitized);

        if (activeTab === 'terminal') {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
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
                <SettingsTabs tabs={SETTINGS_TABS} activeTab={activeTab} setActiveTab={setActiveTab as any} />

                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <Formik
                        initialValues={settings}
                        validationSchema={settingsValidationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <TabContent activeTab={activeTab} />

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

export default Index;
