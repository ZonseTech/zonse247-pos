import { FunctionComponent } from 'react';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import FormSelectBox from '../../../components/FormSelectBox';
import { Field } from 'formik';

const TerminalSettings: FunctionComponent = () => {
    const complianceModeOptions = [
        { label: 'Strict - Full MRA Compliance', value: 'STRICT' },
        { label: 'Relaxed - Partial Compliance', value: 'RELAXED' },
        { label: 'Test - Testing Mode', value: 'TEST' }
    ];

    const displayModeOptions = [
        { label: 'Grid View', value: 'GRID' },
        { label: 'List View', value: 'LIST' },
        { label: 'Compact View', value: 'COMPACT' }
    ];

    const backupLocationOptions = [
        { label: 'Local Storage', value: 'LOCAL' },
        { label: 'Cloud Storage', value: 'CLOUD' },
        { label: 'Both', value: 'BOTH' }
    ];

    return (
        <div className="rounded-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Terminal Settings
            </h2>

            <FormWrapper>
                {/* Transaction Processing */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Transaction Processing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Auto Apply Tax
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Automatically apply tax to transactions
                                </p>
                            </div>
                            <Field type="checkbox" name="autoApplyTax" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tax Inclusive Pricing
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Prices include tax
                                </p>
                            </div>
                            <Field type="checkbox" name="taxInclusivePricing" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Round Total Amount
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Round final transaction totals
                                </p>
                            </div>
                            <Field type="checkbox" name="roundTotalAmount" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Save Draft Transactions
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Allow saving incomplete transactions
                                </p>
                            </div>
                            <Field type="checkbox" name="saveDraftTransactions" className="w-5 h-5 rounded" />
                        </div>

                        <FormInput
                            type="number"
                            name="roundToNearest"
                            label="Round To Nearest"
                            placeholder="0.05"
                            step="0.01"
                            min="0"
                        />

                        <FormInput
                            type="number"
                            name="minimumTransactionAmount"
                            label="Minimum Transaction Amount"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />

                        <FormInput
                            type="number"
                            name="maximumTransactionAmount"
                            label="Maximum Transaction Amount"
                            placeholder="1000000.00"
                            step="0.01"
                            min="0"
                        />

                        <FormInput
                            type="number"
                            name="holdTransactionMinutes"
                            label="Hold Transaction Minutes"
                            placeholder="30"
                            min="1"
                        />
                    </div>
                </div>

                {/* MRA Compliance */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        MRA Compliance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelectBox
                            label="MRA Compliance Mode"
                            name="mraComplianceMode"
                            options={complianceModeOptions}
                            required
                        />

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Auto Generate Z-Report
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Automatically generate daily Z-Reports
                                </p>
                            </div>
                            <Field type="checkbox" name="zReportAutoGenerate" className="w-5 h-5 rounded" />
                        </div>

                        <FormInput
                            type="time"
                            name="zReportTime"
                            label="Z-Report Time"
                            placeholder="23:00"
                        />

                        <FormInput
                            type="time"
                            name="dailySalesReportTime"
                            label="Daily Sales Report Time"
                            placeholder="22:00"
                        />

                        <FormInput
                            type="number"
                            name="mraApiTimeoutSeconds"
                            label="MRA API Timeout (seconds)"
                            placeholder="10"
                            min="5"
                            max="60"
                        />

                        <FormInput
                            type="number"
                            name="mraRetryAttempts"
                            label="MRA Retry Attempts"
                            placeholder="3"
                            min="1"
                            max="10"
                        />
                    </div>
                </div>

                {/* Offline & Sync */}
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

                {/* Product Display */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Product Display
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelectBox
                            label="Product Display Mode"
                            name="productDisplayMode"
                            options={displayModeOptions}
                        />

                        <FormInput
                            type="number"
                            name="productsPerPage"
                            label="Products Per Page"
                            placeholder="20"
                            min="5"
                            max="100"
                        />

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Product Images
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display product images in POS
                                </p>
                            </div>
                            <Field type="checkbox" name="showProductImages" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Quick Product Search
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Enable fast product search
                                </p>
                            </div>
                            <Field type="checkbox" name="quickProductSearch" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Backup Settings */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Backup & Recovery
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Auto Backup Enabled
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Automatically backup data
                                </p>
                            </div>
                            <Field type="checkbox" name="autoBackupEnabled" className="w-5 h-5 rounded" />
                        </div>

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
                </div>

                {/* Performance */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Performance & Storage
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            type="number"
                            name="cacheExpiryHours"
                            label="Cache Expiry (hours)"
                            placeholder="24"
                            min="1"
                            max="168"
                        />

                        <FormInput
                            type="number"
                            name="maxCacheSizeMB"
                            label="Max Cache Size (MB)"
                            placeholder="100"
                            min="10"
                            max="1000"
                        />

                        <FormInput
                            type="number"
                            name="transactionHistoryDays"
                            label="Transaction History (days)"
                            placeholder="90"
                            min="30"
                            max="365"
                        />

                        <FormInput
                            type="number"
                            name="imageCompressionQuality"
                            label="Image Compression Quality (%)"
                            placeholder="80"
                            min="10"
                            max="100"
                        />

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Auto Cleanup Old Data
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Automatically remove old data
                                </p>
                            </div>
                            <Field type="checkbox" name="autoCleanupOldData" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>
            </FormWrapper>
        </div>
    );
};

export default TerminalSettings;
