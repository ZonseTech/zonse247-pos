import * as Yup from 'yup'
import { Form, Formik } from 'formik'
import { Notify, Report } from 'notiflix'
import { Button, Modal } from '../../../components'
import FormInput from '../../../components/FormInput'
import FormWrapper from '../../../components/FormWrapper'
import shopsService from '../../../services/shop.service'
import { Fragment, useState } from 'react'
import type { ChangeEvent, FunctionComponent } from 'react'
import FormSelectBox from '../../../components/FormSelectBox'
import FormTextArea from '../../../components/FormTextArea'
import FormStepper from './FormStepper'

interface ShopFormModalProps {
    shop?: IShop;
    isOpen?: boolean;
    onClose?: () => void;
    onShopSaved?: () => void;
}

const ShopFormModal: FunctionComponent<ShopFormModalProps> = ({
    shop,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    onShopSaved
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [isSavingForm, setIsSavingForm] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : isOpenForm;
    const closeModal = externalOnClose || (() => setIsOpenForm(false));

    const steps = ['Basic Info', 'Address', 'Contact', 'Tax & Currency', 'Additional'];

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' }
    ];

    const currencyOptions = [
        { label: 'USD - $', value: 'USD' },
        { label: 'EUR - €', value: 'EUR' },
        { label: 'GBP - £', value: 'GBP' },
        { label: 'MWK - MK', value: 'MWK' },
        { label: 'ZAR - R', value: 'ZAR' },
        { label: 'KES - KSh', value: 'KES' },
        { label: 'UGX - USh', value: 'UGX' },
        { label: 'TZS - TSh', value: 'TZS' }
    ];

    const getCurrencySymbol = (code: string): string => {
        const symbols: Record<string, string> = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'MWK': 'MK',
            'ZAR': 'R',
            'KES': 'KSh',
            'UGX': 'USh',
            'TZS': 'TSh'
        };
        return symbols[code] || '$';
    };

    const generateShopCode = (name: string): string => {
        return name.toUpperCase().replace(/\s+/g, '').substring(0, 6) + Math.random().toString(36).substring(2, 5).toUpperCase();
    };

    const initialShopValues: Omit<IShop, 'id' | 'created_at' | 'updated_at'> = shop ? {
        ...shop
    } : {
        uuid: '',
        client_id: '',
        shop_code: '',
        name: '',
        description: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: '',
        email: '',
        tax_number: '',
        currency_code: 'USD',
        currency_symbol: '$',
        tax_rate: 0,
        charge_tax: false,
        receipt_footer: '',
        logo_url: '',
        status: 'active'
    };

    const basicInfoSchema = Yup.object().shape({
        name: Yup.string()
            .required('Shop name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name is too long'),
        shop_code: Yup.string()
            .required('Shop code is required')
            .min(3, 'Shop code must be at least 3 characters')
            .max(20, 'Shop code is too long')
            .matches(/^[A-Z0-9_-]+$/, 'Shop code can only contain uppercase letters, numbers, hyphens and underscores'),
        client_id: Yup.string().required('Client ID is required'),
        description: Yup.string().max(500, 'Description is too long'),
        status: Yup.string().required('Status is required')
    });

    const addressSchema = Yup.object().shape({
        address_line1: Yup.string().max(255, 'Address line 1 is too long'),
        address_line2: Yup.string().max(255, 'Address line 2 is too long'),
        city: Yup.string().max(100, 'City name is too long'),
        state: Yup.string().max(100, 'State name is too long'),
        postal_code: Yup.string().max(20, 'Postal code is too long'),
        country: Yup.string().max(100, 'Country name is too long')
    });

    const contactSchema = Yup.object().shape({
        phone: Yup.string()
            .matches(/^[\+]?[0-9\s\-\(\)]*$/, 'Invalid phone number format')
            .max(20, 'Phone number is too long'),
        email: Yup.string()
            .email('Invalid email format')
            .max(255, 'Email is too long')
    });

    const taxCurrencySchema = Yup.object().shape({
        currency_code: Yup.string().required('Currency is required'),
        tax_rate: Yup.number()
            .required('Tax rate is required')
            .min(0, 'Tax rate must be 0 or higher')
            .max(100, 'Tax rate cannot exceed 100%'),
        tax_number: Yup.string().max(50, 'Tax number is too long'),
        charge_tax: Yup.boolean()
    });

    const additionalSchema = Yup.object().shape({
        receipt_footer: Yup.string().max(500, 'Receipt footer is too long'),
        logo_url: Yup.string().url('Invalid URL format')
    });

    const shopValidationSchema = Yup.object().shape({
        ...basicInfoSchema.fields,
        ...addressSchema.fields,
        ...contactSchema.fields,
        ...taxCurrencySchema.fields,
        ...additionalSchema.fields
    });

    const stepSchemas = [
        basicInfoSchema,
        addressSchema,
        contactSchema,
        taxCurrencySchema,
        additionalSchema
    ];

    const validateCurrentStep = async (values: any, stepIndex: number): Promise<boolean> => {
        try {
            await stepSchemas[stepIndex].validate(values, { abortEarly: false });
            return true;
        } catch (error) {
            return false;
        }
    };

    const handleNext = async (values: any) => {
        const isValid = await validateCurrentStep(values, currentStep);
        if (isValid) {
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps([...completedSteps, currentStep]);
            }
            if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = async (stepIndex: number, values: any) => {
        if (stepIndex < currentStep || completedSteps.includes(stepIndex)) {
            setCurrentStep(stepIndex);
        } else if (stepIndex === currentStep + 1) {
            await handleNext(values);
        }
    };

    const handleSubmit = async (values: Omit<IShop, 'id' | 'created_at' | 'updated_at'>, { resetForm }: any) => {

        if (currentStep < steps.length - 1) return;

        try {
            setIsSavingForm(true)
            if (shop && shop.uuid) {
                await shopsService.update(shop.uuid, values);
                Report.success("Updated!", "Shop details updated successfully!", "Ok");
            } else {
                await shopsService.store(values);
                Report.success("Great!", "Shop created successfully!", "Ok");
            }

            resetForm();
            closeModal();
            setCurrentStep(0);
            setCompletedSteps([]);

            if (onShopSaved) {
                onShopSaved();
            }
        } catch (error: any) {
            console.error('Error saving shop:', error);
            const errorMessage = error?.response?.data?.message || 'An error occurred while saving the shop';
            Notify.failure(errorMessage);
        } finally {
            setIsSavingForm(false)
        }
    };

    const handleNameChange = (name: string, setFieldValue: Function) => {
        setFieldValue('name', name);
        if (!shop && name) {
            setFieldValue('shop_code', generateShopCode(name));
        }
    };

    const handleCurrencyChange = (currencyCode: string, setFieldValue: Function) => {
        setFieldValue('currency_code', currencyCode);
        setFieldValue('currency_symbol', getCurrencySymbol(currencyCode));
    };

    const renderStepContent = (values: any, setFieldValue: Function) => {
        switch (currentStep) {
            case 0: // Basic Info
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="text"
                            name="name"
                            label="Shop Name"
                            required
                            placeholder="Enter shop name"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                handleNameChange(e.target.value, setFieldValue);
                            }}
                        />

                        <FormInput
                            type="text"
                            name="shop_code"
                            label="Shop Code"
                            required
                            placeholder="Shop code (auto-generated)"
                        />

                        <FormInput
                            type="text"
                            name="client_id"
                            label="Client ID"
                            required
                            placeholder="Enter client ID"
                        />

                        <FormSelectBox
                            label="Status"
                            name="status"
                            required
                            options={statusOptions}
                        />

                        <div className="md:col-span-2">
                            <FormTextArea
                                name="description"
                                label="Description"
                                placeholder="Shop description (optional)"
                                rows={3}
                            />
                        </div>
                    </div>
                );

            case 1: // Address
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="text"
                            name="address_line1"
                            label="Address Line 1"
                            placeholder="Street address"
                        />

                        <FormInput
                            type="text"
                            name="address_line2"
                            label="Address Line 2"
                            placeholder="Apartment, suite, etc. (optional)"
                        />

                        <FormInput
                            type="text"
                            name="city"
                            label="City"
                            placeholder="City"
                        />

                        <FormInput
                            type="text"
                            name="state"
                            label="State/Province"
                            placeholder="State or province"
                        />

                        <FormInput
                            type="text"
                            name="postal_code"
                            label="Postal Code"
                            placeholder="ZIP/Postal code"
                        />

                        <FormInput
                            type="text"
                            name="country"
                            label="Country"
                            placeholder="Country"
                        />
                    </div>
                );

            case 2: // Contact
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="tel"
                            name="phone"
                            label="Phone Number"
                            placeholder="Phone number"
                        />

                        <FormInput
                            type="email"
                            name="email"
                            label="Email Address"
                            placeholder="Email address"
                        />
                    </div>
                );

            case 3: // Tax & Currency
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSelectBox
                            label="Currency"
                            name="currency_code"
                            required
                            options={currencyOptions}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                handleCurrencyChange(e.target.value, setFieldValue);
                            }}
                        />

                        <FormInput
                            type="number"
                            name="tax_rate"
                            label="Tax Rate (%)"
                            required
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            max="100"
                        />

                        <div className="md:col-span-2">
                            <FormInput
                                type="text"
                                name="tax_number"
                                label="Tax Number"
                                placeholder="Tax registration number (optional)"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={values.charge_tax}
                                    onChange={(e) => setFieldValue('charge_tax', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Charge tax on transactions
                                </span>
                            </label>
                            <p className="text-sm text-gray-500 mt-1">
                                Enable this to automatically apply tax to all transactions
                            </p>
                        </div>
                    </div>
                );

            case 4: // Additional
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <FormInput
                            type="url"
                            name="logo_url"
                            label="Logo URL"
                            placeholder="https://example.com/logo.png (optional)"
                        />

                        <FormTextArea
                            name="receipt_footer"
                            label="Receipt Footer"
                            placeholder="Text to display at the bottom of receipts (optional)"
                            rows={3}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Fragment>
            <Modal
                title={shop ? 'Edit Shop' : 'Add New Shop'}
                isOpen={isModalOpen}
                onClose={() => {
                    closeModal();
                    setCurrentStep(0);
                    setCompletedSteps([]);
                }}
                className='max-w-4xl bg-white text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
            >
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialShopValues}
                    validationSchema={shopValidationSchema}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form>
                            <FormWrapper>
                                <FormStepper
                                    steps={steps}
                                    currentStep={currentStep}
                                    completedSteps={completedSteps}
                                    onStepClick={(stepIndex) => handleStepClick(stepIndex, values)}
                                />

                                {JSON.stringify(currentStep + 1)}
                                {JSON.stringify(steps.length)}
                                {JSON.stringify(isSavingForm)}

                                <div className="min-h-[400px]">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">
                                        {steps[currentStep]}
                                    </h3>

                                    {renderStepContent(values, setFieldValue)}
                                </div>

                                <div className="mt-8 pt-4 border-t flex justify-between">
                                    <Button
                                        type="button"
                                        onClick={handlePrevious}
                                        disabled={currentStep === 0}
                                        className={`px-6 py-2 ${currentStep === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                                            }`}
                                    >
                                        Previous
                                    </Button>

                                    {currentStep < steps.length - 1 && <Button
                                        type="submit"
                                        onClick={() => handleNext(values)}
                                        className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2`}
                                    >
                                        Next
                                    </Button>}

                                    {currentStep === steps.length - 1 && <Button
                                        type="submit"
                                        loading={isSavingForm}
                                        className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2`}
                                    >
                                        {
                                            shop ? 'Update Shop' : 'Create Shop'
                                        }
                                    </Button>}
                                </div>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </Fragment>
    )
}

export default ShopFormModal