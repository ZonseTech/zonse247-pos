// pages/settings/Index.tsx
import { useState } from 'react';
import { Notify, Report } from 'notiflix';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import {
    HiOutlineCog,
    HiOutlineCheck,
    HiOutlineShieldCheck,
    HiOutlineArrowPath,
} from 'react-icons/hi2';
import settingsService from '../../services/settings.service';
import { settingsValidationSchema, SettingsValues } from './types/settings.types';
import SettingsTabs from './partials/SettingsTabs';
import GeneralSettings from './partials/GeneralSettings';
import SalesSettings from './partials/SalesSettings';
import SecuritySettings from './partials/SecuritySettings';
import BackupSettings from './partials/BackupSettings';
import SettingsActions from './partials/SettingsActions';
import ResetConfirmModal from './partials/ResetConfirmModal';

const Index = () => {
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'sales' | 'security' | 'backup'>('general');

    const initialValues: SettingsValues = {
        storeName: 'My Store',
        storeAddress: '123 Main St',
        storePhone: '+1-555-0123',
        storeEmail: 'store@example.com',
        currency: 'USD',
        taxRate: 10,
        receiptFooter: 'Thank you for your purchase!',
        autoLogoutMinutes: 30,
        enableReceiptPrinting: true,
        enableNotifications: true,
        enableDiscounts: true,
        maxDiscountPercentage: 20,
        businessLicense: 'LIC-12345',
        businessTaxId: 'TAX-98765',
        serverUrl: 'https://api.example.com',
        backupEnabled: true,
        backupFrequency: 'daily',
    };

    const tabs = [
        { id: 'general', label: 'General', icon: HiOutlineCog },
        { id: 'sales', label: 'Sales', icon: HiOutlineCheck },
        { id: 'security', label: 'Security', icon: HiOutlineShieldCheck },
        { id: 'backup', label: 'Backup', icon: HiOutlineArrowPath },
    ];

    const handleSubmit = async (values: SettingsValues) => {
        try {
            await settingsService.update(values);
            Report.success('Success!', 'Settings saved successfully', 'Ok');
        } catch (error) {
            Notify.failure('An error occurred while saving settings');
        }
    };

    const handleResetSettings = async () => {
        try {
            await settingsService.reset();
            Report.success('Success!', 'Settings reset to default', 'Ok');
            setShowResetConfirm(false);
        } catch (error) {
            Notify.failure('An error occurred while resetting settings');
        }
    };

    return (
        <div className="min-h-screen">
            <SettingsTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Formik
                    initialValues={initialValues}
                    validationSchema={settingsValidationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            {activeTab === 'general' && <GeneralSettings />}
                            {activeTab === 'sales' && <SalesSettings />}
                            {activeTab === 'security' && <SecuritySettings />}
                            {activeTab === 'backup' && <BackupSettings />}

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
    );
};

export default Index;
