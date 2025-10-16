import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';

const SecuritySettings = () => {
    return (
        <div className="rounded-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Security Settings
            </h2>

            <FormWrapper>
                <div className="space-y-6">
                    <FormInput
                        type="number"
                        name="autoLogoutMinutes"
                        label="Auto Logout After (minutes)"
                        min="5"
                        max="120"
                        placeholder="Enter minutes before auto logout"
                    />

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Send alerts for critical system events
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            name="enableNotifications"
                            className="w-5 h-5 rounded"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                        </div>
                    </div>
                </div>
            </FormWrapper>
        </div>
    );
};

export default SecuritySettings;
