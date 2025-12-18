import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import { Select } from '../../../components';

const GeneralSettings = () => {
    return (
        <div className="rounded-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                General Settings
            </h2>

            <FormWrapper>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        type="text"
                        name="storeName"
                        label="Store Name"
                        required
                        placeholder="Enter store name"
                    />
                    <FormInput
                        type="email"
                        name="storeEmail"
                        label="Store Email"
                        required
                        placeholder="Enter store email"
                    />
                    <FormInput
                        type="text"
                        name="storeAddress"
                        label="Store Address"
                        required
                        placeholder="Enter store address"
                    />
                    <FormInput
                        type="tel"
                        name="storePhone"
                        label="Store Phone"
                        required
                        placeholder="Enter store phone"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Currency
                        </label>
                        <Select name="currency">
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="ZWL">ZWL - Zimbabwean Dollar</option>
                            <option value="ZAR">ZAR - South African Rand</option>
                            <option value="MWK">MWK - Malawian Kwacha</option>
                        </Select>
                    </div>
                    <FormInput
                        type="number"
                        name="taxRate"
                        label="Tax Rate (%)"
                        step="0.01"
                        min="0"
                        max="100"
                    />
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Receipt Footer Text
                    </label>
                    <textarea
                        name="receiptFooter"
                        placeholder="Enter text to display at the bottom of receipts"
                        maxLength={200}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </FormWrapper>
        </div>
    );
};

export default GeneralSettings;
