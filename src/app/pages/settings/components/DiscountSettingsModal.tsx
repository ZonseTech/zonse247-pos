import { FunctionComponent } from 'react';
import FormInput from '../../../components/FormInput';
import { FormSwitch, BottomSheet } from '../../../components';

interface DiscountSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DiscountSettingsModal: FunctionComponent<DiscountSettingsModalProps> = ({
    isOpen,
    onClose,
}) => {
    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Discount Settings"
        >
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <FormSwitch
                            name="enableDiscounts"
                            label="Enable Discounts"
                            description="Allow applying discounts to transactions"
                        />
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <FormSwitch
                            name="requirePinForDiscount"
                            label="Require PIN for Discount"
                            description="Require manager PIN to apply discounts"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Discount Limits
                    </h4>
                    <FormInput
                        type="number"
                        name="maxDiscountPercentage"
                        label="Maximum Discount (%)"
                        placeholder="20"
                        step="0.01"
                        min="0"
                        max="100"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Maximum discount percentage that can be applied to a transaction
                    </p>
                </div>
            </div>
        </BottomSheet>
    );
};

export default DiscountSettingsModal;
