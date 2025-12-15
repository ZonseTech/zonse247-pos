import * as Yup from 'yup'
import { Form, Formik } from 'formik'
import { Notify, Report } from 'notiflix'
import { Button, Modal } from '../../../components'
import FormInput from '../../../components/FormInput'
import FormWrapper from '../../../components/FormWrapper'
import branchService from '../../../services/branch.service'
import { Fragment, useState } from 'react'
import type { ChangeEvent, FunctionComponent } from 'react'
import FormSelectBox from '../../../components/FormSelectBox'
import FormTextArea from '../../../components/FormTextArea'
import FormStepper from './FormStepper'

interface BranchFormModalProps {
    branch?: Branch;
    isOpen?: boolean;
    onClose?: () => void;
    onBranchSaved?: () => void;
}

const BranchFormModal: FunctionComponent<BranchFormModalProps> = ({
    branch,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    onBranchSaved
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [isSavingForm, setIsSavingForm] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : isOpenForm;
    const closeModal = externalOnClose || (() => setIsOpenForm(false));

    const steps = ['Basic Info', 'Location', 'Contact', 'Tax & Currency', 'Additional'];

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
            'MWK': 'K',
            'ZAR': 'R',
            'KES': 'KSh',
            'UGX': 'USh',
            'TZS': 'TSh'
        };
        return symbols[code] || '$';
    };

    const initialBranchValues: Partial<Branch> = branch ? {
        ...branch
    } : {
        branchId: '',
        tenantId: '',
        branchCode: '',
        branchName: '',
        siteId: '',
        siteName: '',
        description: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        district: '',
        city: '',
        state: '',
        postalCode: '',
        phoneNumber: '',
        email: '',
        currencyCode: 'MWK',
        currencySymbol: 'K',
        taxRate: '0',
        chargeTax: false,
        receiptFooter: '',
        logoUrl: '',
        isVirtualWarehouse: false,
        isActive: true,
        synced: 0,
        mraApprovalStatus: 'PENDING',
        status: 'active'
    };

    const basicInfoSchema = Yup.object().shape({
        branchName: Yup.string()
            .required('Branch name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name is too long'),
        branchCode: Yup.string()
            .required('Branch code is required')
            .min(3, 'Branch code must be at least 3 characters')
            .max(20, 'Branch code is too long')
            .matches(/^[A-Z0-9_-]+$/, 'Branch code can only contain uppercase letters, numbers, hyphens and underscores'),
        tenantId: Yup.string().required('Tenant ID is required'),
        siteId: Yup.string(),
        siteName: Yup.string(),
        description: Yup.string().max(500, 'Description is too long'),
        status: Yup.string().required('Status is required')
    });

    const locationSchema = Yup.object().shape({
        addressLine1: Yup.string().max(255, 'Address line 1 is too long'),
        addressLine2: Yup.string().max(255, 'Address line 2 is too long'),
        addressLine3: Yup.string().max(255, 'Address line 3 is too long'),
        district: Yup.string().max(100, 'District name is too long'),
        city: Yup.string().max(100, 'City name is too long'),
        state: Yup.string().max(100, 'State name is too long'),
        postalCode: Yup.string().max(20, 'Postal code is too long')
    });

    const contactSchema = Yup.object().shape({
        phoneNumber: Yup.string()
            .matches(/^[\+]?[0-9\s\-\(\)]*$/, 'Invalid phone number format')
            .max(20, 'Phone number is too long'),
        email: Yup.string()
            .email('Invalid email format')
            .max(255, 'Email is too long')
    });

    const taxCurrencySchema = Yup.object().shape({
        currencyCode: Yup.string().required('Currency is required'),
        taxRate: Yup.number()
            .required('Tax rate is required')
            .min(0, 'Tax rate must be 0 or higher')
            .max(100, 'Tax rate cannot exceed 100%'),
        chargeTax: Yup.boolean()
    });

    const additionalSchema = Yup.object().shape({
        receiptFooter: Yup.string().max(500, 'Receipt footer is too long'),
        logoUrl: Yup.string().url('Invalid URL format'),
        isVirtualWarehouse: Yup.boolean()
    });

    const branchValidationSchema = Yup.object().shape({
        ...basicInfoSchema.fields,
        ...locationSchema.fields,
        ...contactSchema.fields,
        ...taxCurrencySchema.fields,
        ...additionalSchema.fields
    });

    const stepSchemas = [
        basicInfoSchema,
        locationSchema,
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

    const handleSubmit = async (values: Partial<Branch>, { resetForm }: any) => {

        if (currentStep < steps.length - 1) return;

        try {
            setIsSavingForm(true)
            if (branch && branch.branchId) {
                await branchService.update(branch.branchId, values as UpdateBranchRequest);
                Report.success("Updated!", "Branch details updated successfully!", "Ok");
            } else {
                await branchService.store(values as CreateBranchRequest);
                Report.success("Great!", "Branch created successfully!", "Ok");
            }

            resetForm();
            closeModal();
            setCurrentStep(0);
            setCompletedSteps([]);

            if (onBranchSaved) {
                onBranchSaved();
            }
        } catch (error: any) {
            const errorMessage = error?.error?.response?.data?.message || error?.error?.message || 'An error occurred while saving the branch';
            Notify.failure(errorMessage);
        } finally {
            setIsSavingForm(false)
        }
    };

    const handleNameChange = (name: string, setFieldValue: Function) => {
        setFieldValue('branchName', name);
        if (!branch && name) {
            setFieldValue('branchCode', branchService.generateBranchCode(name));
        }
    };

    const handleCurrencyChange = (currencyCode: string, setFieldValue: Function) => {
        setFieldValue('currencyCode', currencyCode);
        setFieldValue('currencySymbol', getCurrencySymbol(currencyCode));
    };

    const renderStepContent = (values: any, setFieldValue: Function) => {
        switch (currentStep) {
            case 0: // Basic Info
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="text"
                            name="branchName"
                            label="Branch Name"
                            required
                            placeholder="Enter branch name"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                handleNameChange(e.target.value, setFieldValue);
                            }}
                        />

                        <FormInput
                            type="text"
                            name="branchCode"
                            label="Branch Code"
                            required
                            placeholder="Branch code (auto-generated)"
                        />

                        <FormInput
                            type="text"
                            name="tenantId"
                            label="Tenant ID"
                            required
                            placeholder="Enter tenant ID"
                        />

                        <FormSelectBox
                            label="Status"
                            name="status"
                            required
                            options={statusOptions}
                        />

                        <FormInput
                            type="text"
                            name="siteId"
                            label="Site ID"
                            placeholder="Site ID (optional)"
                        />

                        <FormInput
                            type="text"
                            name="siteName"
                            label="Site Name"
                            placeholder="Site name (optional)"
                        />

                        <div className="md:col-span-2">
                            <FormTextArea
                                name="description"
                                label="Description"
                                placeholder="Branch description (optional)"
                                rows={3}
                            />
                        </div>
                    </div>
                );

            case 1: // Location
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="text"
                            name="addressLine1"
                            label="Address Line 1"
                            placeholder="Street address"
                        />

                        <FormInput
                            type="text"
                            name="addressLine2"
                            label="Address Line 2"
                            placeholder="Apartment, suite, etc. (optional)"
                        />

                        <FormInput
                            type="text"
                            name="addressLine3"
                            label="Address Line 3"
                            placeholder="Additional address info (optional)"
                        />

                        <FormInput
                            type="text"
                            name="district"
                            label="District"
                            placeholder="District"
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
                            name="postalCode"
                            label="Postal Code"
                            placeholder="ZIP/Postal code"
                        />
                    </div>
                );

            case 2: // Contact
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="tel"
                            name="phoneNumber"
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
                            name="currencyCode"
                            required
                            options={currencyOptions}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                handleCurrencyChange(e.target.value, setFieldValue);
                            }}
                        />

                        <FormInput
                            type="number"
                            name="taxRate"
                            label="Tax Rate (%)"
                            required
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            max="100"
                        />

                        <div className="md:col-span-2">
                            <label className="flex items-center space-x-2">
                                <FormInput
                                    type="checkbox"
                                    checked={values.chargeTax}
                                    name='chargeTax'
                                    onChange={(e) => setFieldValue('chargeTax', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Charge tax on transactions
                                </span>
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                            name="logoUrl"
                            label="Logo URL"
                            placeholder="https://example.com/logo.png (optional)"
                        />

                        <FormTextArea
                            name="receiptFooter"
                            label="Receipt Footer"
                            placeholder="Text to display at the bottom of receipts (optional)"
                            rows={3}
                        />

                        <div>
                            <label className="flex items-center space-x-2">
                                <FormInput
                                    type="checkbox"
                                    checked={values.isVirtualWarehouse}
                                    name='isVirtualWarehouse'
                                    onChange={(e) => setFieldValue('isVirtualWarehouse', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Virtual Warehouse
                                </span>
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Enable this if this branch operates as a virtual warehouse
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Fragment>
            <Modal
                title={branch ? 'Edit Branch' : 'Add New Branch'}
                isOpen={isModalOpen}
                onClose={() => {
                    closeModal();
                    setCurrentStep(0);
                    setCompletedSteps([]);
                }}
                className='max-w-4xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
            >
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialBranchValues}
                    validationSchema={branchValidationSchema}
                >
                    {({ isSubmitting, values, setFieldValue, errors }) => (
                        <Form>
                            <FormWrapper>
                                <FormStepper
                                    steps={steps}
                                    currentStep={currentStep}
                                    completedSteps={completedSteps}
                                    onStepClick={(stepIndex) => handleStepClick(stepIndex, values)}
                                />

                                <div className="min-h-[400px]">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b pb-2 border-gray-200 dark:border-gray-600">
                                        {steps[currentStep]}
                                    </h3>

                                    {renderStepContent(values, setFieldValue)}
                                </div>

                                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-between">
                                    <Button
                                        type="button"
                                        onClick={handlePrevious}
                                        disabled={currentStep === 0}
                                        className={`px-6 py-2 ${currentStep === 0
                                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-600 hover:bg-gray-700 text-white dark:text-gray-100'
                                            }`}
                                    >
                                        Previous
                                    </Button>

                                    {currentStep < steps.length - 1 && <Button
                                        type="submit"
                                        onClick={() => handleNext(values)}
                                        className={`bg-blue-600 hover:bg-blue-700 text-white dark:text-gray-100 px-6 py-2`}
                                    >
                                        Next
                                    </Button>}

                                    {currentStep === steps.length - 1 && <Button
                                        type="submit"
                                        loading={isSavingForm}
                                        className={`bg-green-600 hover:bg-green-700 text-white dark:text-gray-100 px-6 py-2`}
                                    >
                                        {
                                            branch ? 'Update Branch' : 'Create Branch'
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

export default BranchFormModal