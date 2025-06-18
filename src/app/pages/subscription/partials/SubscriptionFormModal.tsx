import * as Yup from 'yup'
import { Form, Formik } from 'formik'
import { Notify, Report } from 'notiflix'
import { HiOutlinePlus } from 'react-icons/hi'
import { Button, Modal } from '../../../components'
import FormInput from '../../../components/FormInput'
import FormWrapper from '../../../components/FormWrapper'
import subscriptionsService from '../../../services/subscriptions.service'
import { Fragment, useState } from 'react'
import type { ChangeEvent, FunctionComponent } from 'react'
import FormSelectBox from '../../../components/FormSelectBox'

interface SubscriptionFormModalProps {
    subscription?: ClientSubscription | null;
    isOpen?: boolean;
    onClose?: () => void;
    onSubscriptionSaved?: () => void;
}

const SubscriptionFormModal: FunctionComponent<SubscriptionFormModalProps> = ({
    subscription,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    onSubscriptionSaved
}) => {
    const [isOpenForm, setIsOpenForm] = useState(false);

    const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : isOpenForm;
    const closeModal = externalOnClose || (() => setIsOpenForm(false));

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Expired', value: 'expired' },
        { label: 'Past Due', value: 'past_due' }
    ];

    const paymentMethodOptions = [
        { label: 'Credit Card', value: 'credit_card' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Stripe', value: 'stripe' },
        { label: 'Cash', value: 'cash' }
    ];

    const planOptions = [
        { label: 'Basic Plan', value: 'basic' },
        { label: 'Standard Plan', value: 'standard' },
        { label: 'Premium Plan', value: 'premium' },
        { label: 'Enterprise Plan', value: 'enterprise' }
    ];

    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const initialSubscriptionValues: ClientSubscription = subscription ? {
        ...subscription,
        starts_at: subscription.starts_at ? new Date(subscription.starts_at).toISOString().split('T')[0] : '',
        ends_at: subscription.ends_at ? new Date(subscription.ends_at).toISOString().split('T')[0] : '',
        last_payment_date: subscription.last_payment_date ? new Date(subscription.last_payment_date).toISOString().split('T')[0] : '',
        next_payment_date: subscription.next_payment_date ? new Date(subscription.next_payment_date).toISOString().split('T')[0] : ''
    } : {
        uuid: generateUUID(),
        client_id: '',
        plan_id: '',
        status: 'active',
        starts_at: new Date().toISOString().split('T')[0],
        ends_at: '',
        auto_renew: true,
        payment_method: '',
        last_payment_date: '',
        next_payment_date: ''
    };

    const subscriptionValidationSchema = Yup.object().shape({
        uuid: Yup.string().required('UUID is required'),
        client_id: Yup.string()
            .required('Client ID is required')
            .min(2, 'Client ID must be at least 2 characters'),
        plan_id: Yup.string()
            .required('Plan is required'),
        status: Yup.string()
            .required('Status is required')
            .oneOf(['active', 'cancelled', 'expired', 'past_due'], 'Invalid status'),
        starts_at: Yup.date()
            .required('Start date is required')
            .typeError('Please enter a valid date'),
        ends_at: Yup.date()
            .nullable()
            .when('starts_at', {
                is: (val: Date) => !!val,
                then: () => Yup.date().min(
                    Yup.ref('starts_at'),
                    'End date must be after start date'
                ).nullable(),
                otherwise: () => Yup.date().nullable()
            }),
        auto_renew: Yup.boolean(),
        payment_method: Yup.string(),
        last_payment_date: Yup.date()
            .nullable()
            .typeError('Please enter a valid date'),
        next_payment_date: Yup.date()
            .nullable()
            .when('auto_renew', {
                is: true,
                then: () => Yup.date().required('Next payment date is required for auto-renewing subscriptions'),
                otherwise: () => Yup.date().nullable()
            })
            .typeError('Please enter a valid date')
    });

    const handleSubmit = async (values: ClientSubscription, { resetForm }: any) => {
        try {
            const submitValues = {
                ...values,
                starts_at: new Date(values.starts_at).toISOString(),
                ends_at: values.ends_at ? new Date(values.ends_at).toISOString() : undefined,
                last_payment_date: values.last_payment_date ? new Date(values.last_payment_date).toISOString() : undefined,
                next_payment_date: values.next_payment_date ? new Date(values.next_payment_date).toISOString() : undefined
            };

            if (subscription && subscription.uuid) {
                await subscriptionsService.update(subscription.uuid, submitValues);
                Report.success("Updated!", "Subscription updated successfully!", "Ok");
            } else {
                await subscriptionsService.store(submitValues);
                Report.success("Great!", "Subscription created successfully!", "Ok");
            }

            resetForm();
            closeModal();

            if (onSubscriptionSaved) {
                onSubscriptionSaved();
            }
        } catch (error: any) {
            console.error('Error saving subscription:', error);
            const errorMessage = error?.response?.data?.message || 'An error occurred while saving the subscription';
            Notify.failure(errorMessage);
        }
    };

    return (
        <Fragment>
            <Modal
                title={subscription ? 'Edit Subscription' : 'Add New Subscription'}
                isOpen={isModalOpen}
                onClose={closeModal}
                className='max-w-2xl bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
            >
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialSubscriptionValues}
                    validationSchema={subscriptionValidationSchema}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form>
                            <FormWrapper>
                                <FormInput
                                    type="text"
                                    name="uuid"
                                    label="UUID"
                                    required
                                    readOnly
                                    placeholder="Subscription UUID"
                                    disabled
                                />

                                <FormInput
                                    type="text"
                                    name="client_id"
                                    label="Client ID"
                                    required
                                    placeholder="Enter client ID"
                                />

                                <FormSelectBox
                                    label="Plan"
                                    name="plan_id"
                                    required
                                    options={planOptions}
                                />

                                <FormSelectBox
                                    label="Status"
                                    name="status"
                                    required
                                    options={statusOptions}
                                />

                                <div className='flex gap-2'>
                                    <FormInput
                                        type="date"
                                        name="starts_at"
                                        label="Start Date"
                                        required
                                    />

                                    <FormInput
                                        type="date"
                                        name="ends_at"
                                        label="End Date"
                                        placeholder="Optional"
                                    />
                                </div>

                                <FormSelectBox
                                    label="Payment Method"
                                    name="payment_method"
                                    options={paymentMethodOptions}
                                />

                                <div className="flex items-center">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={values.auto_renew}
                                            onChange={(e) => setFieldValue('auto_renew', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Auto Renew
                                        </span>
                                    </label>
                                </div>

                                <div className='flex gap-2'>
                                    <FormInput
                                        type="date"
                                        name="last_payment_date"
                                        label="Last Payment Date"
                                        placeholder="Optional"
                                    />

                                    <FormInput
                                        type="date"
                                        name="next_payment_date"
                                        label="Next Payment Date"
                                        placeholder={values.auto_renew ? "Required for auto-renew" : "Optional"}
                                        required={values.auto_renew}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    block={true}
                                    loading={isSubmitting}
                                    className="mt-6"
                                >
                                    {subscription ? 'Update Subscription' : 'Create Subscription'}
                                </Button>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </Fragment>
    )
}

export default SubscriptionFormModal