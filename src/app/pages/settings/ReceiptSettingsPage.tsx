import { FunctionComponent } from 'react';
import FormWrapper from '../../components/FormWrapper';
import FormInput from '../../components/FormInput';
import { FormFieldCard } from '../../components';
import { Field } from 'formik';

const ReceiptSettingsPage: FunctionComponent = () => {
    return (
        <FormWrapper>
            {/* Business Name */}
            <FormFieldCard>
                <FormInput
                    type="text"
                    name="businessName"
                    label="Business Name"
                    placeholder="Enter your business name"
                    required
                />
            </FormFieldCard>

            {/* Phone Number */}
            <FormFieldCard>
                <div className="space-y-2">
                    <FormInput
                        type="tel"
                        name="businessPhone"
                        label="Phone Number"
                        placeholder="+265 999 000 111"
                    />
                    <div className="flex items-center justify-end gap-2">
                        <label htmlFor="showPhoneOnReceipt" className="text-sm text-gray-600 dark:text-gray-400">
                            Show on receipt
                        </label>
                        <Field
                            type="checkbox"
                            name="showPhoneOnReceipt"
                            id="showPhoneOnReceipt"
                            className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                        />
                    </div>
                </div>
            </FormFieldCard>

            {/* Business Address */}
            <FormFieldCard>
                <div className="space-y-2">
                    <FormInput
                        type="text"
                        name="businessAddress"
                        label="Business Address"
                        placeholder="123 Main Street, City"
                    />
                    <div className="flex items-center justify-end gap-2">
                        <label htmlFor="showAddressOnReceipt" className="text-sm text-gray-600 dark:text-gray-400">
                            Show on receipt
                        </label>
                        <Field
                            type="checkbox"
                            name="showAddressOnReceipt"
                            id="showAddressOnReceipt"
                            className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                        />
                    </div>
                </div>
            </FormFieldCard>

            {/* Tax Title & Tax Number */}
            <FormFieldCard>
                <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="text"
                            name="taxTitle"
                            label="Tax Title"
                            placeholder="VAT / TIN / Tax ID"
                        />
                        <FormInput
                            type="text"
                            name="taxNumber"
                            label="Tax Number"
                            placeholder="TAX-12345678"
                        />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <label htmlFor="showTaxOnReceipt" className="text-sm text-gray-600 dark:text-gray-400">
                            Show on receipt
                        </label>
                        <Field
                            type="checkbox"
                            name="showTaxOnReceipt"
                            id="showTaxOnReceipt"
                            className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                        />
                    </div>
                </div>
            </FormFieldCard>

            {/* Website */}
            <FormFieldCard>
                <div className="space-y-2">
                    <FormInput
                        type="url"
                        name="businessWebsite"
                        label="Website"
                        placeholder="https://www.yourbusiness.com"
                    />
                    <div className="flex items-center justify-end gap-2">
                        <label htmlFor="showWebsiteOnReceipt" className="text-sm text-gray-600 dark:text-gray-400">
                            Show on receipt
                        </label>
                        <Field
                            type="checkbox"
                            name="showWebsiteOnReceipt"
                            id="showWebsiteOnReceipt"
                            className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                        />
                    </div>
                </div>
            </FormFieldCard>

            {/* Receipt Title */}
            <FormFieldCard>
                <FormInput
                    type="text"
                    name="receiptTitle"
                    label="Receipt Title (Optional)"
                    placeholder="e.g., SALES RECEIPT, INVOICE"
                />
            </FormFieldCard>

            {/* Business Logo */}
            <FormFieldCard>
                <div className="space-y-2">
                    <FormInput
                        type="url"
                        name="businessLogo"
                        label="Business Logo URL"
                        placeholder="https://yourbusiness.com/logo.png"
                    />
                    <div className="flex items-center justify-end gap-2">
                        <label htmlFor="showLogoOnReceipt" className="text-sm text-gray-600 dark:text-gray-400">
                            Show on receipt
                        </label>
                        <Field
                            type="checkbox"
                            name="showLogoOnReceipt"
                            id="showLogoOnReceipt"
                            className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                        />
                    </div>
                </div>
            </FormFieldCard>

            {/* Receipt Options */}
            <FormFieldCard>
                <h3 className="text-lg font-semibold text-sky-500 mb-6">
                    Receipt Options
                </h3>
                <div className="space-y-4">
                    {/* Show List Price */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="showListPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show list price
                        </label>
                        <Field name="showListPrice">
                            {({ field }: any) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange({ target: { name: field.name, value: !field.value } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            )}
                        </Field>
                    </div>

                    {/* Show Rate in Receipt */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="showRateInReceipt" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show rate in receipt
                        </label>
                        <Field name="showRateInReceipt">
                            {({ field }: any) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange({ target: { name: field.name, value: !field.value } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            )}
                        </Field>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Show Total Money Saved */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="showTotalMoneySaved" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show total money saved by the customer
                        </label>
                        <Field name="showTotalMoneySaved">
                            {({ field }: any) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange({ target: { name: field.name, value: !field.value } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            )}
                        </Field>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Show Cashier Name */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="showCashierName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show cashier name on the receipt
                        </label>
                        <Field name="showCashierName">
                            {({ field }: any) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange({ target: { name: field.name, value: !field.value } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            )}
                        </Field>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Show Customer Phone */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="showCustomerPhone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show customer phone number on receipt
                        </label>
                        <Field name="showCustomerPhone">
                            {({ field }: any) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange({ target: { name: field.name, value: !field.value } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            )}
                        </Field>
                    </div>

                    {/* Show Customer Address */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="showCustomerAddress" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show customer address on receipt
                        </label>
                        <Field name="showCustomerAddress">
                            {({ field }: any) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange({ target: { name: field.name, value: !field.value } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            )}
                        </Field>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Thank You Note */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Thank You Note
                        </label>
                        <Field
                            type="text"
                            name="thankYouNote"
                            placeholder="Thank you for your purchase!"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Use App Language */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="useAppLanguage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Use app language to share/print receipts
                        </label>
                        <Field name="useAppLanguage">
                            {({ field }: any) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange({ target: { name: field.name, value: !field.value } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            )}
                        </Field>
                    </div>

                    {/* Show Total Item Count */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="showTotalItemCount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show total item count on receipt
                        </label>
                        <Field name="showTotalItemCount">
                            {({ field }: any) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange({ target: { name: field.name, value: !field.value } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            )}
                        </Field>
                    </div>

                    {/* Show Change Return Amount */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="showChangeReturn" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show change return amount on receipt
                        </label>
                        <Field name="showChangeReturn">
                            {({ field }: any) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange({ target: { name: field.name, value: !field.value } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            )}
                        </Field>
                    </div>

                    {/* Show Payment Details */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="showPaymentDetails" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show payment details on receipt
                        </label>
                        <Field name="showPaymentDetails">
                            {({ field }: any) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange({ target: { name: field.name, value: !field.value } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            )}
                        </Field>
                    </div>

                    {/* Show Powered By */}
                    <div className="flex items-center justify-between">
                        <label htmlFor="showPoweredBy" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show powered by Zonse247
                        </label>
                        <Field name="showPoweredBy">
                            {({ field }: any) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange({ target: { name: field.name, value: !field.value } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            )}
                        </Field>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Order Items By */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Order items by
                        </label>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Field
                                    type="radio"
                                    name="orderItemsBy"
                                    value="name"
                                    id="orderByName"
                                    className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                                />
                                <label htmlFor="orderByName" className="text-sm text-gray-700 dark:text-gray-300">
                                    Name
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Field
                                    type="radio"
                                    name="orderItemsBy"
                                    value="orderAdded"
                                    id="orderByAdded"
                                    className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                                />
                                <label htmlFor="orderByAdded" className="text-sm text-gray-700 dark:text-gray-300">
                                    Order added
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </FormFieldCard>

            {/* SMS/WhatsApp/Email Template */}
            <FormFieldCard>
                <h3 className="text-lg font-semibold text-sky-500 mb-6">
                    SMS/WhatsApp/Email Template (Subject)
                </h3>
                <div className="space-y-4">
                    <div>
                        <FormInput
                            type="text"
                            name="messageTemplate"
                            label="Include in the message"
                            placeholder="Total Bill Amount is #total"
                        />
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            It is compulsory to add <span className="font-mono font-semibold">#total</span> which will be replaced with the total amount of receipt/invoice.
                        </p>
                    </div>
                </div>
            </FormFieldCard>

            {/* WhatsApp Share App */}
            <FormFieldCard>
                <h3 className="text-lg font-semibold text-sky-500 mb-6">
                    Select WhatsApp Share App
                </h3>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Field
                            type="radio"
                            name="whatsappShareApp"
                            value="whatsapp"
                            id="whatsappRegular"
                            className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                        />
                        <label htmlFor="whatsappRegular" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            WhatsApp
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Field
                            type="radio"
                            name="whatsappShareApp"
                            value="whatsappBusiness"
                            id="whatsappBusiness"
                            className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                        />
                        <label htmlFor="whatsappBusiness" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            WhatsApp Business
                        </label>
                    </div>
                </div>
            </FormFieldCard>
        </FormWrapper>
    );
};

export default ReceiptSettingsPage;
