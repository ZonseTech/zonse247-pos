import { FunctionComponent } from 'react';
import FormWrapper from '../../components/FormWrapper';
import FormInput from '../../components/FormInput';
import { FormFieldCard, FormSwitch, FormCheckbox, FormRadioGroup } from '../../components';

const ReceiptSettingsPage: FunctionComponent = () => {
    return (
        <FormWrapper>
            <FormFieldCard>
                <FormInput
                    type="text"
                    name="storeName"
                    label="Business Name"
                    placeholder="Enter your business name"
                    required
                />
            </FormFieldCard>

            <FormFieldCard>
                <div className="space-y-2">
                    <FormInput
                        type="tel"
                        name="storePhone"
                        label="Phone Number"
                        placeholder="+265 999 000 111"
                    />
                    <FormCheckbox
                        name="showPhoneOnReceipt"
                        label="Show on receipt"
                        position="right"
                        className="justify-end"
                    />
                </div>
            </FormFieldCard>

            <FormFieldCard>
                <div className="space-y-2">
                    <FormInput
                        type="text"
                        name="storeAddress"
                        label="Business Address"
                        placeholder="123 Main Street, City"
                    />
                    <FormCheckbox
                        name="showAddressOnReceipt"
                        label="Show on receipt"
                        position="right"
                        className="justify-end"
                    />
                </div>
            </FormFieldCard>

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
                            name="businessTaxId"
                            label="Tax Number"
                            placeholder="TAX-12345678"
                        />
                    </div>
                    <FormCheckbox
                        name="showTaxOnReceipt"
                        label="Show on receipt"
                        position="right"
                        className="justify-end"
                    />
                </div>
            </FormFieldCard>

            <FormFieldCard>
                <div className="space-y-2">
                    <FormInput
                        type="url"
                        name="storeWebsite"
                        label="Website"
                        placeholder="https://www.yourbusiness.com"
                    />
                    <FormCheckbox
                        name="showWebsiteOnReceipt"
                        label="Show on receipt"
                        position="right"
                        className="justify-end"
                    />
                </div>
            </FormFieldCard>

            <FormFieldCard>
                <FormInput
                    type="text"
                    name="receiptHeader"
                    label="Receipt Title (Optional)"
                    placeholder="e.g., SALES RECEIPT, INVOICE"
                />
            </FormFieldCard>

            <FormFieldCard>
                <div className="space-y-2">
                    <FormInput
                        type="url"
                        name="logoUrl"
                        label="Business Logo URL"
                        placeholder="https://yourbusiness.com/logo.png"
                    />
                    <FormCheckbox
                        name="showStoreLogo"
                        label="Show on receipt"
                        position="right"
                        className="justify-end"
                    />
                </div>
            </FormFieldCard>

            <FormFieldCard title="Receipt Options">
                <div className="space-y-4">
                    <FormSwitch
                        name="showListPrice"
                        label="Show list price"
                    />

                    <FormSwitch
                        name="showRateInReceipt"
                        label="Show rate in receipt"
                    />

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <FormSwitch
                        name="showTotalMoneySaved"
                        label="Show total money saved by the customer"
                    />

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <FormSwitch
                        name="showCashierName"
                        label="Show cashier name on the receipt"
                    />

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <FormSwitch
                        name="showCustomerPhone"
                        label="Show customer phone number on receipt"
                    />

                    <FormSwitch
                        name="showCustomerAddress"
                        label="Show customer address on receipt"
                    />

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <FormInput
                        type="text"
                        label="Thank You Note"
                        name="thankYouNote"
                        placeholder="Thank you for your purchase!"
                    />

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <FormSwitch
                        name="useAppLanguage"
                        label="Use app language to share/print receipts"
                    />

                    <FormSwitch
                        name="showTotalItemCount"
                        label="Show total item count on receipt"
                    />

                    <FormSwitch
                        name="showChangeReturn"
                        label="Show change return amount on receipt"
                    />

                    <FormSwitch
                        name="showPaymentDetails"
                        label="Show payment details on receipt"
                    />

                    <FormSwitch
                        name="showPoweredBy"
                        label="Show powered by Zonse247"
                    />

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <FormRadioGroup
                        name="orderItemsBy"
                        label="Order items by"
                        options={[
                            { value: 'name', label: 'Name' },
                            { value: 'orderAdded', label: 'Order added' },
                        ]}
                    />
                </div>
            </FormFieldCard>

            <FormFieldCard title="SMS/WhatsApp/Email Template (Subject)">
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

            <FormFieldCard title="Select WhatsApp Share App">
                <FormRadioGroup
                    name="whatsappShareApp"
                    label=""
                    options={[
                        { value: 'whatsapp', label: 'WhatsApp' },
                        { value: 'whatsappBusiness', label: 'WhatsApp Business' },
                    ]}
                />
            </FormFieldCard>
        </FormWrapper>
    );
};

export default ReceiptSettingsPage;
