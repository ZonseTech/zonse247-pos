import { HiOutlineCommandLine } from 'react-icons/hi2';
import FormWrapper from '../../components/FormWrapper';
import FormInput from '../../components/FormInput';
import FormSelectBox from '../../components/FormSelectBox';
import { Field } from 'formik';

const backupFrequencyOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
];

const backupLocationOptions = [
    { label: 'Local Storage', value: 'LOCAL' },
    { label: 'Cloud Storage', value: 'CLOUD' },
    { label: 'Both', value: 'BOTH' }
];

const SecuritySettingsPage = () => {
    return (
        <div className="rounded-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Security Settings
            </h2>

            <FormWrapper>
                {/* Offline & Synchronization */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Offline & Synchronization
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Offline Mode
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Allow sales when no internet connection
                                </p>
                            </div>
                            <Field type="checkbox" name="enableOfflineMode" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sync On WiFi Only
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Only sync data when connected to WiFi
                                </p>
                            </div>
                            <Field type="checkbox" name="syncOnWifiOnly" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Auto Sync On Reconnect
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Automatically sync when connection restored
                                </p>
                            </div>
                            <Field type="checkbox" name="autoSyncOnReconnect" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Cloud Sync
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Sync data to cloud storage
                                </p>
                            </div>
                            <Field type="checkbox" name="enableCloudSync" className="w-5 h-5 rounded" />
                        </div>

                        <FormInput
                            type="number"
                            name="offlineDataRetentionDays"
                            label="Offline Data Retention (days)"
                            placeholder="7"
                            min="1"
                            max="30"
                        />

                        <FormInput
                            type="number"
                            name="syncBatchSize"
                            label="Sync Batch Size"
                            placeholder="50"
                            min="10"
                            max="500"
                        />

                        <FormInput
                            type="number"
                            name="syncTimeoutSeconds"
                            label="Sync Timeout (seconds)"
                            placeholder="30"
                            min="10"
                            max="120"
                        />
                    </div>
                </div>

                {/* Session & Access Control */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Session & Access Control
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            type="number"
                            name="sessionTimeoutMinutes"
                            label="Session Timeout (minutes)"
                            min="5"
                            max="120"
                            placeholder="15"
                        />

                        <FormInput
                            type="number"
                            name="pinLength"
                            label="PIN Length"
                            min="4"
                            max="8"
                            placeholder="4"
                        />

                        <FormInput
                            type="number"
                            name="maxLoginAttempts"
                            label="Max Login Attempts"
                            min="3"
                            max="10"
                            placeholder="3"
                        />

                        <FormInput
                            type="number"
                            name="lockoutMinutes"
                            label="Lockout Duration (minutes)"
                            min="5"
                            max="120"
                            placeholder="30"
                        />

                        <FormInput
                            type="password"
                            name="managerOverridePin"
                            label="Manager Override PIN"
                            placeholder="Enter manager PIN"
                        />
                    </div>
                </div>

                {/* PIN Requirements */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        PIN Requirements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Require PIN for Settings
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    PIN required to access settings
                                </p>
                            </div>
                            <Field type="checkbox" name="requirePinForSettings" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Require PIN for Reports
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    PIN required to view reports
                                </p>
                            </div>
                            <Field type="checkbox" name="requirePinForReports" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Require PIN for Void
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    PIN required to void transactions
                                </p>
                            </div>
                            <Field type="checkbox" name="requirePinForVoid" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Require PIN for Discount
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    PIN required to apply discounts
                                </p>
                            </div>
                            <Field type="checkbox" name="requirePinForDiscount" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Require PIN for Return
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    PIN required to process returns
                                </p>
                            </div>
                            <Field type="checkbox" name="requirePinForReturn" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Require Manager for Void
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Manager approval for void transactions
                                </p>
                            </div>
                            <Field type="checkbox" name="requireManagerForVoid" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Audit & Logging */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Audit & Logging
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Audit Log
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Track all user activities
                                </p>
                            </div>
                            <Field type="checkbox" name="auditLogEnabled" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Notifications
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Send alerts for critical events
                                </p>
                            </div>
                            <Field type="checkbox" name="enableNotifications" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Business Information */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            type="text"
                            name="businessLicense"
                            label="Business License Number"
                            placeholder="Enter license number"
                        />
                        <FormInput
                            type="text"
                            name="businessTaxId"
                            label="Business Tax ID"
                            placeholder="Enter tax ID"
                        />
                        <FormInput
                            type="url"
                            name="serverUrl"
                            label="Server URL"
                            placeholder="https://api.example.com"
                            className="md:col-span-2"
                        />
                    </div>
                </div>

                {/* API & Integration Security */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        API & Integration
                    </h3>
                    <div className="mb-6 p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
                        <FormInput
                            type="url"
                            name="apiBaseUrl"
                            label="API Base URL"
                            placeholder="https://api.yourdomain.com"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable API Access
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Allow external API access
                                </p>
                            </div>
                            <Field type="checkbox" name="enableApiAccess" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Webhooks
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Send event notifications via webhooks
                                </p>
                            </div>
                            <Field type="checkbox" name="webhookEnabled" className="w-5 h-5 rounded" />
                        </div>

                        <FormInput
                            type="number"
                            name="apiKeyExpiryDays"
                            label="API Key Expiry (days)"
                            placeholder="90"
                            min="1"
                            max="365"
                        />

                        <FormInput
                            type="number"
                            name="apiRateLimit"
                            label="API Rate Limit (requests/minute)"
                            placeholder="60"
                            min="10"
                            max="1000"
                        />

                        <FormInput
                            type="url"
                            name="webhookUrl"
                            label="Webhook URL"
                            placeholder="https://yourdomain.com/webhook"
                            className="md:col-span-2"
                        />

                        <FormInput
                            type="password"
                            name="webhookSecret"
                            label="Webhook Secret"
                            placeholder="Enter webhook secret key"
                            className="md:col-span-2"
                        />
                    </div>
                </div>

                {/* Backup & Recovery */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Backup & Recovery
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Automatic Backups
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Automatically backup your data regularly
                                </p>
                            </div>
                            <Field type="checkbox" name="backupEnabled" className="w-5 h-5 rounded" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelectBox
                                label="Backup Frequency"
                                name="backupFrequency"
                                options={backupFrequencyOptions}
                                required
                            />

                            <FormSelectBox
                                label="Backup Location"
                                name="backupLocation"
                                options={backupLocationOptions}
                            />

                            <FormInput
                                type="number"
                                name="backupIntervalHours"
                                label="Backup Interval (hours)"
                                placeholder="24"
                                min="1"
                                max="168"
                            />

                            <FormInput
                                type="number"
                                name="maxBackupFiles"
                                label="Maximum Backup Files"
                                placeholder="7"
                                min="1"
                                max="30"
                            />
                        </div>

                        <div className="p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
                            <div className="flex gap-3">
                                <HiOutlineCommandLine className="w-5 h-5 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-sky-900 dark:text-sky-300">
                                        Last Backup
                                    </p>
                                    <p className="text-sm text-sky-700 dark:text-sky-400 mt-1">
                                        2024-01-15 at 02:30 AM
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </FormWrapper>
        </div>
    );
};

export default SecuritySettingsPage;
