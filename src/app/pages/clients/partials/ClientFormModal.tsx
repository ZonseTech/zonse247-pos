import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button, Modal } from '../../../components';
import FormInput from '../../../components/FormInput';
import FormWrapper from '../../../components/FormWrapper';
import FormSelectBox from '../../../components/FormSelectBox';
import { Fragment, useState } from 'react';
import type { FunctionComponent } from 'react';
import clientsService from '../../../services/client.service';

interface ClientFormModalProps {
    client?: Client;
    isOpen?: boolean;
    onClose?: () => void;
    onClientSaved?: () => void;
}

const ClientFormModal: FunctionComponent<ClientFormModalProps> = ({
    client,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    onClientSaved
}) => {
    const [isOpenForm, setIsOpenForm] = useState(false);

    const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : isOpenForm;
    const closeModal = externalOnClose || (() => setIsOpenForm(false));

    const subscriptionStatuses = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Trial', value: 'trial' }
    ];

    const statuses = [
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Cancelled', value: 'cancelled' }
    ];

    const timezones = [
        { label: 'UTC', value: 'UTC' },
        { label: 'America/New_York', value: 'America/New_York' },
        { label: 'America/Chicago', value: 'America/Chicago' },
        { label: 'America/Denver', value: 'America/Denver' },
        { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
        { label: 'Europe/London', value: 'Europe/London' },
        { label: 'Europe/Berlin', value: 'Europe/Berlin' },
        { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
        { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
        { label: 'Australia/Sydney', value: 'Australia/Sydney' }
    ];

    const initialClientValues = client ? {
        ...client
    } : {
        uuid: '',
        clientId: '',
        companyName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        country: '',
        timezone: 'UTC',
        registeredAt: '',
        subscriptionStatus: 'trial',
        trialEndsAt: '',
        // authKey: '',
        status: 'pending'
    };

    const clientValidationSchema = Yup.object().shape({
        clientId: Yup.string()
            .notRequired()
            .min(3, 'Client ID must be at least 3 characters')
            .max(20, 'Client ID is too long')
            .matches(/^[a-zA-Z0-9_-]+$/, 'Client ID can only contain letters, numbers, hyphens and underscores'),
        companyName: Yup.string()
            .required('Company name is required')
            .min(2, 'Company name must be at least 2 characters')
            .max(100, 'Company name is too long'),
        ownerName: Yup.string()
            .required('Owner name is required')
            .min(2, 'Owner name must be at least 2 characters')
            .max(50, 'Owner name is too long'),
        email: Yup.string()
            .required('Email is required')
            .email('Please enter a valid email address'),
        phone: Yup.string()
            .required('Phone number is required')
            .min(10, 'Phone number must be at least 10 digits'),
        address: Yup.string().max(200, 'Address is too long'),
        country: Yup.string().max(50, 'Country name is too long'),
        timezone: Yup.string().required('Timezone is required'),
        subscriptionStatus: Yup.string()
            .required('Subscription status is required')
            .oneOf(['active', 'inactive', 'suspended', 'trial']),
        trialEndsAt: Yup.string().when('subscriptionStatus', {
            is: 'trial',
            then: () => Yup.string().required('Trial end date is required for trial subscriptions'),
            otherwise: () => Yup.string().notRequired()
        }),
        status: Yup.string()
            .required('Status is required')
            .oneOf(['pending', 'active', 'suspended', 'cancelled'])
    });

    const handleSubmit = async (values: Client, { resetForm }: any) => {
        try {
            if (client && client.uuid) {
                await clientsService.update(client.uuid, values);
                Report.success("Updated!", "Client details updated successfully!", "Ok");
            } else {
                await clientsService.store(values);
                Report.success("Great!", "Client details saved!", "Ok");
            }

            resetForm();
            closeModal();

            if (onClientSaved) {
                onClientSaved();
            }
        } catch (error: any) {
            console.error('Error saving client:', error);
            const errorMessage = error?.response?.data?.message || 'An error occurred while saving the client';
            Notify.failure(errorMessage);
        }
    };

    return (
        <Fragment>
            <Modal
                title={client ? 'Edit Client' : 'Add Client'}
                isOpen={isModalOpen}
                onClose={closeModal}
                className='max-w-2xl bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
            >
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialClientValues}
                    validationSchema={clientValidationSchema}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form>
                            <FormWrapper>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {values.uuid && <FormInput
                                        type="text"
                                        name="clientId"
                                        label="Client ID"
                                        required
                                        readOnly
                                        placeholder="Unique client identifier"
                                    />}

                                    <FormInput
                                        type="text"
                                        name="companyName"
                                        label="Company Name"
                                        required
                                        placeholder="Company name"
                                    />

                                    <FormInput
                                        type="text"
                                        name="ownerName"
                                        label="Owner Name"
                                        required
                                        placeholder="Owner full name"
                                    />

                                    <FormInput
                                        type="email"
                                        name="email"
                                        label="Email"
                                        required
                                        placeholder="contact@company.com"
                                    />

                                    <FormInput
                                        type="tel"
                                        name="phone"
                                        label="Phone"
                                        required
                                        placeholder="Phone number"
                                    />

                                    <FormInput
                                        type="text"
                                        name="country"
                                        label="Country"
                                        placeholder="Country"
                                    />
                                </div>

                                <FormInput
                                    type="text"
                                    name="address"
                                    label="Address"
                                    placeholder="Full address"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormSelectBox
                                        label="Timezone"
                                        name="timezone"
                                        required
                                        options={timezones}
                                    />

                                    <FormSelectBox
                                        label="Subscription Status"
                                        name="subscriptionStatus"
                                        required
                                        options={subscriptionStatuses}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormSelectBox
                                        label="Status"
                                        name="status"
                                        required
                                        options={statuses}
                                    />

                                    {values.subscriptionStatus === 'trial' && (
                                        <FormInput
                                            type="date"
                                            name="trialEndsAt"
                                            label="Trial Ends At"
                                            required
                                        />
                                    )}
                                </div>

                                <FormInput
                                    type="text"
                                    name="authKey"
                                    label="Auth Key"
                                    readOnly
                                    placeholder="Auto generated authentication key"
                                    className="flex-1"
                                />

                                <Button
                                    type="submit"
                                    block={true}
                                    loading={isSubmitting}
                                >
                                    {client ? 'Update Client' : 'Create Client'}
                                </Button>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </Fragment>
    );
};

export default ClientFormModal;