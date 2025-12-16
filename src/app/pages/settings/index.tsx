import { useState, useEffect } from 'react';
import { Notify, Report } from 'notiflix';
import { Form, Formik } from 'formik';
import {
    HiOutlineCog,
    HiOutlineCheck,
    HiOutlineShieldCheck,
    HiOutlineArrowPath,
    HiOutlineCube,
} from 'react-icons/hi2';
import settingsService from '../../services/settings.service';
import { settingsValidationSchema } from '../../schemas/settings.schema';
import SettingsTabs from './partials/SettingsTabs';
import GeneralSettings from './partials/GeneralSettings';
import SalesSettings from './partials/SalesSettings';
import SecuritySettings from './partials/SecuritySettings';
import BackupSettings from './partials/BackupSettings';
import TerminalSettings from './partials/TerminalSettings';
import DisplaySettings from './partials/DisplaySettings';
import HardwareSettings from './partials/HardwareSettings';
import SettingsActions from './partials/SettingsActions';
import ResetConfirmModal from './partials/ResetConfirmModal';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlineDesktopComputer, HiOutlineViewGrid } from 'react-icons/hi';

const Index = () => {
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'general' | 'sales' | 'security' | 'backup' | 'terminal' | 'display' | 'hardware'>('general');
    const [initialValues, setInitialValues] = useState<AppSettings | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const settings = await settingsService.load();
            // Map API response to form values, provide defaults if not available
            setInitialValues(getDefaultValues(settings));
        } catch (error) {
            console.error('Error loading settings:', error);
            Notify.warning('Using default settings');
            setInitialValues(getDefaultValues());
        } finally {
            setLoading(false);
        }
    };

    const getDefaultValues = (settings?: any): AppSettings => ({
        // General Information
        storeName: settings?.store || 'My Store',
        storeAddress: settings?.addressLine1 || '123 Main St',
        storePhone: settings?.contact || '+265-1-234-567',
        storeEmail: 'store@example.com',
        currency: 'MWK',
        taxRate: Number(settings?.tax) || 16.5,
        businessLicense: 'LIC-12345',
        businessTaxId: 'TAX-98765',

        // Localization & Display Settings
        language: 'en_US',
        timezone: 'Africa/Blantyre',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        currencyDecimalPlaces: 2,
        numberSeparator: 'comma',
        showCurrencySymbol: true,
        currencySymbolPosition: 'before',

        // Transaction Processing
        autoApplyTax: true,
        taxInclusivePricing: false,
        roundTaxAmount: false,
        roundTotalAmount: false,
        roundToNearest: 0.05,
        minimumTransactionAmount: 0,
        maximumTransactionAmount: 10000000,
        holdTransactionMinutes: 30,
        saveDraftTransactions: true,

        // Customer Settings
        requireCustomerDetails: false,
        defaultCustomerType: 'WALK_IN',
        collectCustomerEmail: true,
        collectCustomerPhone: true,
        collectCustomerAddress: false,
        customerDisplayMode: 'SEARCH',

        // Receipt & Printing Settings
        receiptNumberPrefix: 'RCP',
        receiptNumberSuffix: '',
        receiptStartNumber: 1,
        receiptResetDaily: false,
        printDuplicateReceipt: false,
        receiptCopies: 1,
        printOrderKitchen: false,
        printOrderBar: false,
        kitchenPrinterName: '',
        barPrinterName: '',
        printItemizedReceipt: true,
        receiptFooter: settings?.footer || 'Thank you for your purchase!',
        receiptHeader: '',
        showStoreLogo: false,
        logoUrl: '',
        receiptWidth: 80,
        showTaxBreakdown: true,
        showItemCodes: false,
        showCashierName: true,
        showTerminalId: true,
        qrCodeEnabled: false,
        qrCodeContent: 'receipt-id',

        // Payment Processing
        cashPaymentDefault: true,
        cardPaymentDefault: false,
        splitPaymentEnabled: true,
        maxSplitWays: 4,
        changeCalculationMode: 'AUTO',
        suggestChangeAmounts: true,
        giftCardEnabled: false,
        loyaltyPointsEnabled: false,
        enableCash: true,
        enableCard: true,
        enableMobileMoney: true,
        enableCredit: false,
        enableGiftCard: false,
        roundingEnabled: true,
        roundingAmount: 0.05,

        // MRA Compliance
        mraComplianceMode: 'STRICT',
        requireVatNumber: false,
        vatInclusiveDisplay: true,
        zReportAutoGenerate: true,
        zReportTime: '23:00',
        dailySalesReportTime: '22:00',

        // Inventory & Product
        showProductImages: true,
        productDisplayMode: 'GRID',
        productsPerPage: 20,
        quickProductSearch: true,
        barcodeScanMode: 'AUTO',
        scaleIntegrationMode: 'DIRECT',
        allowNegativeStock: false,
        lowStockThreshold: 10,
        showStockLevels: true,
        enableStockAlerts: true,
        autoOrderEnabled: false,

        // Offline & Sync
        enableOfflineMode: true,
        offlineDataRetentionDays: 7,
        syncOnWifiOnly: false,
        autoSyncOnReconnect: true,
        syncBatchSize: 50,
        syncTimeoutSeconds: 30,
        enableCloudSync: true,

        // Security & Access Control
        pinLength: 4,
        sessionTimeoutMinutes: 15,
        maxLoginAttempts: 3,
        lockoutMinutes: 30,
        requirePinForSettings: true,
        requirePinForReports: true,
        requirePinForVoid: true,
        requirePinForDiscount: true,
        requirePinForReturn: true,
        auditLogEnabled: true,
        serverUrl: settings?.serverUrl || 'https://api.example.com',

        // Performance & Storage
        cacheExpiryHours: 24,
        maxCacheSizeMB: 100,
        transactionHistoryDays: 90,
        autoCleanupOldData: true,
        imageCompressionQuality: 80,

        // Hardware & Device
        printerConnectionType: 'BLUETOOTH',
        printerPaperWidth: 80,
        cashDrawerOpenCode: 'ESC p m t1 t2',
        scannerBeepEnabled: true,
        scannerVibrationEnabled: false,
        screenBrightness: 80,
        screenTimeoutSeconds: 60,
        printerType: 'thermal',
        printerName: '',
        autoPrintReceipt: true,
        paperSize: '80mm',
        enableCashDrawer: true,
        cashDrawerOpenOn: 'payment',
        enableBarcodeScanner: true,
        barcodeScannerPrefix: '',
        enableCardReader: true,
        cardReaderType: 'all',

        // Integration & API
        apiBaseUrl: import.meta.env.VITE_API_URL || 'https://api.example.com',
        mraApiTimeoutSeconds: 10,
        mraRetryAttempts: 3,
        webhookEnabled: false,
        webhookUrl: '',
        webhookSecret: '',
        apiKeyExpiryDays: 90,
        enableApiAccess: false,
        apiRateLimit: 60,

        // Business Rules & Workflow
        allowReturnWithoutReceipt: false,
        returnPeriodDays: 30,
        requireManagerForVoid: false,
        managerOverridePin: '',
        autoCloseShift: true,
        shiftCloseTime: '23:59',
        dailyOpeningTime: '08:00',
        enableCashManagement: true,
        requireOpeningFloat: true,
        openingFloatAmount: 1000,
        enableShiftManagement: true,
        enableMultipleUsers: true,
        enableReturns: true,
        enableLayaway: false,
        enableDiscounts: true,
        maxDiscountPercentage: 20,

        // Backup & Recovery
        backupEnabled: true,
        backupFrequency: 'daily',
        autoBackupEnabled: true,
        backupIntervalHours: 24,
        maxBackupFiles: 7,
        backupLocation: 'LOCAL',

        // Display & UI
        theme: 'light',
        fontSize: 'medium',
        navigationMenuType: 'desktop',
        enableAnimations: true,
        enableNotifications: true,
        enableVirtualKeyboard: true,
        virtualKeyboardLayout: 'qwerty',
        virtualKeyboardTheme: 'default',
        virtualKeyboardSound: false,
        virtualKeyboardHaptic: false,

        // Taxes & Fees
        taxInclusive: true,
        showTaxOnReceipt: true,
        multiTaxEnabled: false,
        serviceFeeEnabled: false,
        serviceFeePercentage: 0,

        // Customer Management
        enableLoyaltyProgram: false,
        loyaltyPointsPerDollar: 1,
        enableCustomerAccounts: false,
        enableCustomerCredit: false,
        maxCustomerCredit: 10000,

        // Reporting
        eodReportEnabled: true,
        eodReportTime: '23:00',
        emailReports: false,
        reportEmail: '',

        // Audit & Metadata
        settingsVersion: '1.0.0',
        lastConfiguredBy: '',
        configurationDate: new Date().toISOString(),
        autoLogoutMinutes: 30,
    });

    const tabs = [
        { id: 'general', label: 'General', icon: HiOutlineCog },
        { id: 'terminal', label: 'Terminal', icon: HiOutlineDesktopComputer },
        { id: 'sales', label: 'Sales', icon: HiOutlineCheck },
        { id: 'display', label: 'Display', icon: HiOutlineViewGrid },
        { id: 'hardware', label: 'Hardware', icon: HiOutlineCube },
        { id: 'security', label: 'Security', icon: HiOutlineShieldCheck },
        { id: 'backup', label: 'Backup', icon: HiOutlineArrowPath },
    ];

    const handleSubmit = async (values: AppSettings) => {
        try {
            await settingsService.update(values);
            Report.success('Success!', 'Settings saved successfully', 'Ok');
            await loadSettings(); // Reload settings after save
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'An error occurred while saving settings';
            Notify.failure(errorMessage);
        }
    };

    const handleResetSettings = async () => {
        try {
            await settingsService.reset();
            Report.success('Success!', 'Settings reset to default', 'Ok');
            setShowResetConfirm(false);
            await loadSettings(); // Reload settings after reset
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'An error occurred while resetting settings';
            Notify.failure(errorMessage);
        }
    };

    if (loading || !initialValues) {
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
            <div className="min-h-screen">
                <SettingsTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab as any} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={settingsValidationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                {activeTab === 'general' && <GeneralSettings />}
                                {activeTab === 'terminal' && <TerminalSettings />}
                                {activeTab === 'sales' && <SalesSettings />}
                                {activeTab === 'display' && <DisplaySettings />}
                                {activeTab === 'hardware' && <HardwareSettings />}
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
        </AppLayout>
    );
};

export default Index;
