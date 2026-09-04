import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import * as Dialog from '@radix-ui/react-dialog';
import { Box, Button, Flex, Select, Text } from '@radix-ui/themes';
import { FunctionComponent, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import FormModal from '../../../components/FormModal';
import TextInput from '../../../components/TextInput';
import SelectField from '../../../components/SelectField';
import SubscriptionPlanSelector from './SubscriptionPlanSelector';
import branchService from '../../../services/branch.service';
import districtService from '../../../services/district.service';
import { businessTypes } from '../../../utils/tenant-status';
import { capitalizeEachWord } from '../../../utils';
import { getBranchValidationSchema } from '../../../schemas/branch.schema';
import { getErrorMessage } from '../../../utils/api-error-handler';

const currencyOptions = [
    { label: 'USD - $', value: 'USD' },
    { label: 'EUR - €', value: 'EUR' },
    { label: 'GBP - £', value: 'GBP' },
    { label: 'MWK - K', value: 'MWK' },
    { label: 'ZAR - R', value: 'ZAR' },
    { label: 'KES - KSh', value: 'KES' },
    { label: 'UGX - USh', value: 'UGX' },
    { label: 'TZS - TSh', value: 'TZS' }
];

interface BranchFormValuesType {
    tenantId: string;
    branchName: string;
    subscriptionPlanId: string;
    subscriptionMonths: number;
    districtId: string;
    location: string;
    businessType: string;
    phoneNumber: string;
    email: string;
    currencyCode: string;
    currencySymbol: string;
    taxRate: number;
    chargeTax: boolean;
    isVirtualWarehouse: boolean;
    isActive: boolean;
    synced: number;
    mraApprovalStatus: string;
    status: string;
}

interface BranchFormModalProps {
    tenantId: string;
    onClose: () => void;
    onSaved: () => void;
}

const branchValidationSchema = getBranchValidationSchema(false, false);

const BranchFormModal: FunctionComponent<BranchFormModalProps> = ({ tenantId, onClose, onSaved }) => {
    const [districtOptions, setDistrictOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(true);

    useEffect(() => {
        districtService.getOptions()
            .then(setDistrictOptions)
            .catch((error) => console.error('Error fetching districts:', error))
            .finally(() => setLoadingDistricts(false));
    }, []);

    const initialValues: BranchFormValuesType = {
        tenantId,
        branchName: '',
        subscriptionPlanId: '',
        subscriptionMonths: 1,
        districtId: '',
        location: '',
        businessType: 'PRODUCT_BASED',
        phoneNumber: '',
        email: '',
        currencyCode: 'MWK',
        currencySymbol: 'K',
        taxRate: 0.00,
        chargeTax: false,
        isVirtualWarehouse: false,
        isActive: true,
        synced: 0,
        mraApprovalStatus: 'PENDING',
        status: 'active'
    };

    const handleSubmit = async (values: BranchFormValuesType) => {
        try {
            await branchService.store(values as CreateBranchRequest);
            Notify.success('Branch created successfully');
            onSaved();
            onClose();
        } catch (error: any) {
            Report.failure('Error', getErrorMessage(error, 'Failed to create branch'), 'Okay');
        }
    };

    const handleNameChange = (name: string, setFieldValue: (field: string, value: any) => void) => {
        setFieldValue('branchName', capitalizeEachWord(name));
    };

    return (
        <Formik
            onSubmit={handleSubmit}
            initialValues={initialValues}
            validationSchema={branchValidationSchema}
        >
            {({ isSubmitting, setFieldValue, values, errors, touched }) => (
                <FormModal
                    open
                    onOpenChange={(open) => { if (!open) onClose(); }}
                    title="New Branch"
                    description="Required fields are marked with an asterisk (*)"
                    size="lg"
                    footer={
                        <Flex justify="end" gap="3" width="100%">
                            <Dialog.Close asChild>
                                <Button type="button" variant="soft" color="gray">Cancel</Button>
                            </Dialog.Close>
                            <Button type="submit" form="branch-create-form" disabled={isSubmitting} loading={isSubmitting}>
                                Create Branch
                            </Button>
                        </Flex>
                    }
                >
                    <Form id="branch-create-form">
                        <Flex direction="column" gap="4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <TextInput
                                    name="branchName"
                                    label="Branch Name"
                                    required
                                    placeholder="Enter branch name"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        handleNameChange(e.target.value, setFieldValue);
                                    }}
                                />

                                <SelectField
                                    label="Business Type"
                                    name="businessType"
                                    required
                                    options={businessTypes}
                                    placeholder="Select business type..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <TextInput
                                    type="tel"
                                    name="phoneNumber"
                                    label="Phone Number"
                                    required
                                    placeholder="Enter phone number"
                                />

                                <TextInput
                                    type="email"
                                    name="email"
                                    label="Email"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectField
                                    label="District"
                                    name="districtId"
                                    required
                                    disabled={loadingDistricts}
                                    options={districtOptions}
                                    placeholder={loadingDistricts ? 'Loading districts...' : 'Select district...'}
                                />

                                <TextInput
                                    name="location"
                                    label="Location"
                                    placeholder="Enter location"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectField
                                    label="Currency"
                                    name="currencyCode"
                                    required
                                    options={currencyOptions}
                                    placeholder="Select currency..."
                                />

                                <Box>
                                    <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                                        Subscription Duration
                                    </Text>
                                    <Select.Root
                                        value={String(values.subscriptionMonths || 1)}
                                        onValueChange={(val) => setFieldValue('subscriptionMonths', Number(val))}
                                    >
                                        <Select.Trigger className="w-full" />
                                        <Select.Content position="popper" className="z-[60]">
                                            <Select.Item value="1">1 month</Select.Item>
                                            <Select.Item value="3">3 months</Select.Item>
                                            <Select.Item value="6">6 months</Select.Item>
                                            <Select.Item value="12">12 months (1 year)</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                </Box>
                            </div>

                            <SubscriptionPlanSelector
                                selectedPlanId={values.subscriptionPlanId || ''}
                                onPlanChange={(planId) => setFieldValue('subscriptionPlanId', planId)}
                                error={errors.subscriptionPlanId as string}
                                touched={touched.subscriptionPlanId as boolean}
                            />
                        </Flex>
                    </Form>
                </FormModal>
            )}
        </Formik>
    );
};

export default BranchFormModal;
