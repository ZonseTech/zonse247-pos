import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import FormSelectBox from '../../../components/FormSelectBox';
import FormTextArea from '../../../components/FormTextArea';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthProvider';
import { ROUTES } from '../../../utils/constants';

const currencyOptions = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'ZWL - Zimbabwean Dollar', value: 'ZWL' },
    { label: 'ZAR - South African Rand', value: 'ZAR' },
    { label: 'MWK - Malawian Kwacha', value: 'MWK' }
];

const GeneralSettings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleEditBranch = () => {
        navigate(ROUTES.BRANCH_FORM, { state: { branchId: user?.branchId } });
    };

    return (
        <div className="rounded-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                General Settings
            </h2>

            <div className="mb-4 p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-sky-900 dark:text-sky-100">
                        Information
                    </p>
                    <p className="text-sm text-sky-700 dark:text-sky-300 mt-1">
                        These settings are managed at the branch level. To update this information, please{' '}
                        <button
                            type="button"
                            onClick={handleEditBranch}
                            className="font-semibold underline hover:text-sky-900 dark:hover:text-sky-100 transition-colors"
                        >
                            edit the branch details
                        </button>.
                    </p>
                </div>
            </div>

            <FormWrapper>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        type="text"
                        name="storeName"
                        label="Store Name"
                        required
                        placeholder="Enter store name"
                        disabled
                    />
                    <FormInput
                        type="email"
                        name="storeEmail"
                        label="Store Email"
                        required
                        placeholder="Enter store email"
                        disabled
                    />
                    <FormInput
                        type="text"
                        name="storeAddress"
                        label="Store Address"
                        required
                        placeholder="Enter store address"
                        disabled
                    />
                    <FormInput
                        type="tel"
                        name="storePhone"
                        label="Store Phone"
                        required
                        placeholder="Enter store phone"
                        disabled
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <FormSelectBox
                        label="Currency"
                        name="currency"
                        options={currencyOptions}
                        required
                        disabled
                    />
                    <FormInput
                        type="number"
                        name="taxRate"
                        label="Tax Rate (%)"
                        step="0.01"
                        min="0"
                        max="100"
                        disabled
                    />
                </div>

                <div className="mt-6">
                    <FormTextArea
                        label="Receipt Footer Text"
                        name="receiptFooter"
                        placeholder="Enter text to display at the bottom of receipts"
                        maxLength={200}
                        rows={3}
                        disabled
                    />
                </div>
            </FormWrapper>
        </div>
    );
};

export default GeneralSettings;
