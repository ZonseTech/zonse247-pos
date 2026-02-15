import { FunctionComponent } from 'react';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import FormSelectBox from '../../../components/FormSelectBox';
import FormTextArea from '../../../components/FormTextArea';
import { Field } from 'formik';

const ReceiptSettings: FunctionComponent = () => {
    const receiptCopiesOptions = [
        { label: '1 Copy', value: '1' },
        { label: '2 Copies', value: '2' },
        { label: '3 Copies', value: '3' }
    ];

    const qrCodeContentOptions = [
        { label: 'None', value: 'none' },
        { label: 'Receipt URL', value: 'receipt_url' },
        { label: 'Store Website', value: 'store_website' },
        { label: 'Transaction ID', value: 'transaction_id' }
    ];

    return (
        <div className="rounded-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Receipt Settings
            </h2>

            <FormWrapper>
                {/* Receipt Header & Footer */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Receipt Header & Footer
                    </h3>
                    <div className="space-y-6">
                        <FormTextArea
                            label="Receipt Header"
                            name="receiptHeader"
                            placeholder="Enter text to display at the top of receipts"
                            maxLength={300}
                            rows={3}
                        />

                        <FormTextArea
                            label="Receipt Footer"
                            name="receiptFooter"
                            placeholder="Enter text to display at the bottom of receipts (e.g., Thank you for your purchase!)"
                            maxLength={300}
                            rows={3}
                        />
                    </div>
                </div>

                {/* Receipt Display Options */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Receipt Display Options
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Cashier Name
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display cashier name on receipts
                                </p>
                            </div>
                            <Field type="checkbox" name="showCashierName" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Terminal ID
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display terminal identifier on receipts
                                </p>
                            </div>
                            <Field type="checkbox" name="showTerminalId" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Tax Breakdown
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display detailed tax information
                                </p>
                            </div>
                            <Field type="checkbox" name="showTaxBreakdown" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Item Codes
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display product codes on receipts
                                </p>
                            </div>
                            <Field type="checkbox" name="showItemCodes" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Store Logo
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display store logo on receipts
                                </p>
                            </div>
                            <Field type="checkbox" name="showStoreLogo" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Print Itemized Receipt
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Show individual item details
                                </p>
                            </div>
                            <Field type="checkbox" name="printItemizedReceipt" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Receipt Format */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Receipt Format
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            type="number"
                            name="receiptWidth"
                            label="Receipt Width (mm)"
                            placeholder="80"
                            min="58"
                            max="80"
                        />

                        <FormSelectBox
                            label="Number of Copies"
                            name="receiptCopies"
                            options={receiptCopiesOptions}
                        />

                        <FormInput
                            type="text"
                            name="receiptNumberPrefix"
                            label="Receipt Number Prefix"
                            placeholder="RCP"
                        />

                        <FormInput
                            type="text"
                            name="receiptNumberSuffix"
                            label="Receipt Number Suffix"
                            placeholder=""
                        />

                        <FormInput
                            type="number"
                            name="receiptStartNumber"
                            label="Receipt Start Number"
                            placeholder="1"
                            min="1"
                        />

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Reset Receipt Number Daily
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Reset receipt counter each day
                                </p>
                            </div>
                            <Field type="checkbox" name="receiptResetDaily" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Print Behavior */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Print Behavior
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Print Duplicate Receipt
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Print a duplicate copy automatically
                                </p>
                            </div>
                            <Field type="checkbox" name="printDuplicateReceipt" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Print Order to Kitchen
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Send order to kitchen printer
                                </p>
                            </div>
                            <Field type="checkbox" name="printOrderKitchen" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Print Order to Bar
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Send order to bar printer
                                </p>
                            </div>
                            <Field type="checkbox" name="printOrderBar" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Printer Names */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Printer Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            type="text"
                            name="kitchenPrinterName"
                            label="Kitchen Printer Name"
                            placeholder="Kitchen Printer"
                        />

                        <FormInput
                            type="text"
                            name="barPrinterName"
                            label="Bar Printer Name"
                            placeholder="Bar Printer"
                        />
                    </div>
                </div>

                {/* QR Code */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        QR Code
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable QR Code
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Include QR code on receipt
                                </p>
                            </div>
                            <Field type="checkbox" name="qrCodeEnabled" className="w-5 h-5 rounded" />
                        </div>

                        <FormSelectBox
                            label="QR Code Content"
                            name="qrCodeContent"
                            options={qrCodeContentOptions}
                        />
                    </div>
                </div>

                {/* Logo */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Store Logo
                    </h3>
                    <div className="space-y-6">
                        <FormInput
                            type="url"
                            name="logoUrl"
                            label="Logo URL"
                            placeholder="https://yourstore.com/logo.png"
                        />
                    </div>
                </div>
            </FormWrapper>
        </div>
    );
};

export default ReceiptSettings;
