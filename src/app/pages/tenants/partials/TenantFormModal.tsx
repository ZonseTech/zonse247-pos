import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import * as Dialog from '@radix-ui/react-dialog';
import { Button, Flex, Grid, Text } from '@radix-ui/themes';
import { FunctionComponent, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import FormModal from '../../../components/FormModal';
import TextInput from '../../../components/TextInput';
import SelectField from '../../../components/SelectField';
import { OfflinePlaceholder } from '../../../components';
import CountryPicker from '../../../components/CountryPicker';
import { SelectMenuOption } from '../../../../types/country';
import { COUNTRIES } from '../../../utils/countries';
import { DEFAULT_COUNTRY_CODE } from '../../../constants';
import tenantService from '../../../services/tenant.service';
import { tenantValidationSchema } from '../../../schemas/tenant.schema';
import { getInitialFormValues } from '../../../utils/mergeDeep';
import { capitalizeEachWord } from '../../../utils';
import { useConnectivity } from '../../../hooks/useConnectivity';
import { getErrorMessage } from '../../../utils/api-error-handler';
import { businessTypes } from '../../../utils/tenant-status';

const defaultTenantValues: any = {
    tenantCode: '',
    businessName: '',
    tradingName: '',
    tin: '',
    businessType: 'PRODUCT_BASED',
    ownerName: '',
    email: '',
    phoneNumber: '',
    address: '',
    country: 'MW',
    mraPortalUsername: '',
    msonkhoOnlineStatus: 'PENDING',
    registeredAt: '',
    verificationToken: '',
    status: 'active'
};

interface TenantFormModalProps {
    tenantId?: string;
    onClose: () => void;
    onSaved: () => void;
}

const TenantFormModal: FunctionComponent<TenantFormModalProps> = ({ tenantId, onClose, onSaved }) => {
    const { isOnline } = useConnectivity();
    const isEditMode = !!tenantId;

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tenant, setTenant] = useState<Tenant | null>(null);

    useEffect(() => {
        if (!tenantId) return;
        setLoading(true);
        tenantService.show(tenantId)
            .then((data) => { if (data) setTenant(data); })
            .catch((error) => Notify.failure(getErrorMessage(error, 'Failed to load tenant details')))
            .finally(() => setLoading(false));
    }, [tenantId]);

    const initialTenantValues = getInitialFormValues(defaultTenantValues, {
        ...tenant as unknown as TenantFormValues,
        country: tenant?.country?.replace('Malawi', 'MW') ?? 'MW',
        registeredAt: (tenant?.registeredAt) ?? '',
        businessType: tenant?.businessType ?? 'PRODUCT_BASED',
        msonkhoOnlineStatus: tenant?.msonkhoOnlineStatus ?? 'PENDING',
        status: tenant?.status ?? 'active',
    }, 'tenantId');

    const handleSubmit = async (values: TenantFormValues) => {
        setLoading(true);
        try {
            if (isEditMode) {
                await tenantService.update(tenantId!, values);
                Notify.success('Tenant details updated successfully!');
            } else {
                await tenantService.store(values);
                Notify.success('Tenant details saved!');
            }
            onSaved();
            onClose();
        } catch (error: any) {
            const errorMessage = getErrorMessage(error, 'An error occurred while saving the tenant');
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    const title = isEditMode ? 'Edit Tenant' : 'New Tenant';

    if (!isOnline) {
        return (
            <FormModal open onOpenChange={(open) => { if (!open) onClose(); }} title={title} size="lg">
                <OfflinePlaceholder
                    title="Tenant Management Unavailable Offline"
                    description="Creating or editing tenants requires an internet connection to sync with the server. Please connect to the internet and try again."
                    variant="cloud"
                />
            </FormModal>
        );
    }

    if (loading && !tenant && tenantId) {
        return (
            <FormModal open onOpenChange={(open) => { if (!open) onClose(); }} title={title} size="lg">
                <Flex align="center" justify="center" className="h-64">
                    <Text color="gray">Loading tenant details...</Text>
                </Flex>
            </FormModal>
        );
    }

    return (
        <Formik
            onSubmit={handleSubmit}
            enableReinitialize
            initialValues={initialTenantValues}
            validationSchema={tenantValidationSchema}
        >
            {({ isSubmitting, values, setFieldValue }) => (
                <FormModal
                    open
                    onOpenChange={(open) => { if (!open) onClose(); }}
                    title={title}
                    description="Required fields are marked with an asterisk (*)"
                    size="lg"
                    footer={
                        <Flex justify="end" gap="3" width="100%">
                            <Dialog.Close asChild>
                                <Button type="button" variant="soft" color="gray">Cancel</Button>
                            </Dialog.Close>
                            <Button type="submit" form="tenant-form" disabled={isSubmitting || loading} loading={isSubmitting || loading}>
                                {isEditMode ? 'Update Tenant' : 'Create Tenant'}
                            </Button>
                        </Flex>
                    }
                >
                    <Form id="tenant-form">
                        <input type="hidden" name="verificationToken" value={values.verificationToken || ''} readOnly />

                        <Flex direction="column" gap="4">
                            <Grid columns={{ initial: '1', md: '2' }} gap="4">
                                <TextInput
                                    name="businessName"
                                    label="Business Name"
                                    required
                                    placeholder="Enter business name"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setFieldValue('businessName', capitalizeEachWord(e.target.value));
                                    }}
                                />
                                <SelectField
                                    label="Business Type"
                                    name="businessType"
                                    required
                                    options={businessTypes}
                                    placeholder="Select business type..."
                                />
                            </Grid>

                            <Grid columns={{ initial: '1', md: '2' }} gap="4">
                                <TextInput
                                    name="tin"
                                    label="TIN (Tax ID)"
                                    required
                                    placeholder="Enter tax identification number"
                                />
                                <TextInput
                                    name="ownerName"
                                    label="Owner Name"
                                    required
                                    placeholder="Enter owner full name"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setFieldValue('ownerName', capitalizeEachWord(e.target.value));
                                    }}
                                />
                            </Grid>

                            <Grid columns={{ initial: '1', md: '2' }} gap="4">
                                <TextInput
                                    type="email"
                                    name="email"
                                    label="Email"
                                    required
                                    placeholder="contact@company.com"
                                />
                                <TextInput
                                    type="tel"
                                    name="phoneNumber"
                                    label="Phone"
                                    required
                                    placeholder="Enter phone number"
                                />
                            </Grid>

                            <Grid columns={{ initial: '1', md: '2' }} gap="4">
                                <CountryPicker
                                    id="countries"
                                    open={isOpen}
                                    onToggle={() => setIsOpen(!isOpen)}
                                    onChange={(val) => setFieldValue('country', val)}
                                    selectedValue={COUNTRIES.find(
                                        (option) => option.value === (values.country || DEFAULT_COUNTRY_CODE)
                                    ) as SelectMenuOption}
                                />
                                <TextInput
                                    name="address"
                                    label="Address"
                                    required
                                    className="capitalize"
                                    placeholder="Enter full address"
                                />
                            </Grid>
                        </Flex>
                    </Form>
                </FormModal>
            )}
        </Formik>
    );
};

export default TenantFormModal;
