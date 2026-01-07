import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import FormSelectBox from '../../../components/FormSelectBox';
import FormTextArea from '../../../components/FormTextArea';

const currencyOptions = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'ZWL - Zimbabwean Dollar', value: 'ZWL' },
    { label: 'ZAR - South African Rand', value: 'ZAR' },
    { label: 'MWK - Malawian Kwacha', value: 'MWK' }
];

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
                    <FormSelectBox
                        label="Currency"
                        name="currency"
                        options={currencyOptions}
                        required
                    />
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
                    <FormTextArea
                        label="Receipt Footer Text"
                        name="receiptFooter"
                        placeholder="Enter text to display at the bottom of receipts"
                        maxLength={200}
                        rows={3}
                    />
                </div>
            </FormWrapper>
        </div>
    );
};

export default GeneralSettings;
