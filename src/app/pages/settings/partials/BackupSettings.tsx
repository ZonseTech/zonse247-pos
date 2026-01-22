import { HiOutlineCommandLine } from 'react-icons/hi2';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import FormSelectBox from '../../../components/FormSelectBox';
import { Field } from 'formik';

const backupFrequencyOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
];

const BackupSettings = () => {
    return (
        <div className="rounded-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Backup Settings
            </h2>

            <FormWrapper>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700">
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

                    <FormSelectBox
                        label="Backup Frequency"
                        name="backupFrequency"
                        options={backupFrequencyOptions}
                        required
                    />

                    <FormInput
                        type="url"
                        name="serverUrl"
                        label="Server URL"
                        placeholder="Enter backup server URL"
                    />

                    <div className="p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800">
                        <div className="flex gap-3">
                            <HiOutlineCommandLine className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
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
            </FormWrapper>
        </div>
    );
};

export default BackupSettings;