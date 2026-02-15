import { Form, Formik } from 'formik';
import { settingsValidationSchema } from '../../schemas/settings.schema';
import TabContent from './components/TabContent';
import SettingsActions from './partials/SettingsActions';
import ResetConfirmModal from './partials/ResetConfirmModal';
import AppLayout from '../../layouts/AppLayout';
import { useSettings } from './hooks/useSettings';
import { sanitizeSettings } from './utils/settingsHelpers';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { HiOutlineCog } from 'react-icons/hi2';

const Index = () => {
    const {
        settings,
        loading,
        activeTab,
        showResetConfirm,
        setShowResetConfirm,
        handleSubmit: onSubmit,
        handleResetSettings,
    } = useSettings();

    const isMobile = useIsMobile();

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
            <div className="min-h-screen pb-20 md:pb-0">
                {isMobile ? (
                    <MobilePageHeader title="Settings" />
                ) : (
                    <PageHeader
                        title="Settings"
                        description="Manage your application settings and preferences"
                        icon={<HiOutlineCog className="w-8 h-8 text-sky-500" />}
                    />
                )}

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
