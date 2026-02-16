import { FunctionComponent } from 'react';
import FormInput from '../../../components/FormInput';
import { FormSwitch, BottomSheet } from '../../../components';

interface TaxSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TaxSettingsModal: FunctionComponent<TaxSettingsModalProps> = ({
    isOpen,
    onClose,
}) => {
    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Tax Settings"
        >
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <FormSwitch
                            name="autoApplyTax"
                            label="Auto Apply Tax"
                            description="Automatically apply tax to all transactions"
                        />
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <FormSwitch
                            name="taxInclusivePricing"
                            label="Tax Inclusive Pricing"
                            description="Product prices already include tax"
                        />
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <FormSwitch
                            name="showTaxOnReceipt"
                            label="Show Tax on Receipt"
                            description="Display tax breakdown on receipts"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tax Configuration
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            type="number"
                            name="taxRate"
                            label="Default Tax Rate (%)"
                            placeholder="16.5"
                            step="0.01"
                            min="0"
                            max="100"
                        />
                        <FormInput
                            type="text"
                            name="taxTitle"
                            label="Tax Title"
                            placeholder="VAT"
                        />
                    </div>
                </div>
            </div>
        </BottomSheet>
    );
};

export default TaxSettingsModal;
