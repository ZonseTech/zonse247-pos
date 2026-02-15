import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import FormSelectBox from '../../../components/FormSelectBox';
import { Field } from 'formik';

const SalesSettings = () => {
    const customerDisplayModeOptions = [
        { label: 'Search', value: 'SEARCH' },
        { label: 'List', value: 'LIST' },
        { label: 'Both', value: 'BOTH' }
    ];

    const changeCalculationModeOptions = [
        { label: 'Auto Calculate', value: 'AUTO' },
        { label: 'Manual Entry', value: 'MANUAL' }
    ];

    const complianceModeOptions = [
        { label: 'Strict - Full MRA Compliance', value: 'STRICT' },
        { label: 'Relaxed - Partial Compliance', value: 'RELAXED' },
        { label: 'Test - Testing Mode', value: 'TEST' }
    ];

    return (
        <div className="rounded-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Business Settings
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

                {/* Payment Methods */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Payment Methods
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Cash Payment Default
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Set cash as default payment method
                                </p>
                            </div>
                            <Field type="checkbox" name="cashPaymentDefault" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Card Payments
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Accept debit/credit cards
                                </p>
                            </div>
                            <Field type="checkbox" name="enableCard" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Mobile Money
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Accept mobile money payments
                                </p>
                            </div>
                            <Field type="checkbox" name="enableMobileMoney" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Gift Cards
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Accept gift card payments
                                </p>
                            </div>
                            <Field type="checkbox" name="giftCardEnabled" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Split Payment Enabled
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Allow splitting payment across methods
                                </p>
                            </div>
                            <Field type="checkbox" name="splitPaymentEnabled" className="w-5 h-5 rounded" />
                        </div>

                        <FormInput
                            type="number"
                            name="maxSplitWays"
                            label="Maximum Split Ways"
                            placeholder="4"
                            min="2"
                            max="10"
                        />

                        <FormSelectBox
                            label="Change Calculation Mode"
                            name="changeCalculationMode"
                            options={changeCalculationModeOptions}
                        />

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Suggest Change Amounts
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Show quick change amount buttons
                                </p>
                            </div>
                            <Field type="checkbox" name="suggestChangeAmounts" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Discounts & Pricing */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Discounts & Pricing
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Discounts
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Allow cashiers to apply discounts to transactions
                                </p>
                            </div>
                            <Field type="checkbox" name="enableDiscounts" className="w-5 h-5 rounded" />
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

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Rounding
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Round final amounts to nearest value
                                </p>
                            </div>
                            <Field type="checkbox" name="roundingEnabled" className="w-5 h-5 rounded" />
                        </div>

                        <FormInput
                            type="number"
                            name="roundingAmount"
                            label="Rounding Amount"
                            step="0.01"
                            min="0"
                            placeholder="0.05"
                        />
                    </div>
                </div>

                {/* Customer Settings */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Customer Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Require Customer Details
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Require customer info for all sales
                                </p>
                            </div>
                            <Field type="checkbox" name="requireCustomerDetails" className="w-5 h-5 rounded" />
                        </div>

                        <FormSelectBox
                            label="Customer Display Mode"
                            name="customerDisplayMode"
                            options={customerDisplayModeOptions}
                        />

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Collect Customer Email
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Ask for customer email address
                                </p>
                            </div>
                            <Field type="checkbox" name="collectCustomerEmail" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Collect Customer Phone
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Ask for customer phone number
                                </p>
                            </div>
                            <Field type="checkbox" name="collectCustomerPhone" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Loyalty Program
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Track customer loyalty points
                                </p>
                            </div>
                            <Field type="checkbox" name="loyaltyPointsEnabled" className="w-5 h-5 rounded" />
                        </div>

                        <FormInput
                            type="number"
                            name="loyaltyPointsPerDollar"
                            label="Loyalty Points Per Dollar"
                            step="0.01"
                            min="0"
                            placeholder="1.00"
                        />
                    </div>
                </div>

                {/* Returns & Refunds */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Returns & Refunds
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Returns
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Allow product returns
                                </p>
                            </div>
                            <Field type="checkbox" name="enableReturns" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Allow Return Without Receipt
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Process returns without receipt
                                </p>
                            </div>
                            <Field type="checkbox" name="allowReturnWithoutReceipt" className="w-5 h-5 rounded" />
                        </div>

                        <FormInput
                            type="number"
                            name="returnPeriodDays"
                            label="Return Period (days)"
                            placeholder="30"
                            min="1"
                            max="365"
                        />
                    </div>
                </div>
            </FormWrapper>
        </div>
    );
};

export default SalesSettings;
