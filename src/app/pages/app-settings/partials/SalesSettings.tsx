import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';

const SalesSettings = () => {
    return (
        <div className="rounded-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Sales Settings
            </h2>

            <FormWrapper>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Enable Receipt Printing
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Print receipts automatically after sale
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            name="enableReceiptPrinting"
                            className="w-5 h-5 rounded"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Enable Discounts
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Allow cashiers to apply discounts to transactions
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            name="enableDiscounts"
                            className="w-5 h-5 rounded"
                        />
                    </div>

                    <FormInput
                        type="number"
                        name="maxDiscountPercentage"
                        label="Maximum Discount Percentage"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="Enter maximum discount percentage"
                    />
                </div>
            </FormWrapper>
        </div>
    );
};

export default SalesSettings;
