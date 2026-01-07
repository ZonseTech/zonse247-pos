import { FunctionComponent, useEffect } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Button, Modal } from '../../../components';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import customerService from '../../../services/customers.service';

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customer: Customer | null;
    customersCount?: number;
}

const CustomerModal: FunctionComponent<CustomerModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    customer,
    customersCount = 0,
}) => {
    const isEditing = !!customer;
    const showDefaultOption = !isEditing && customersCount === 0;

    const initialValues: Customer = {
        customerId: customer?.customerId || '',
        tenantId: customer?.tenantId || '',
        branchId: customer?.branchId || '',
        userId: customer?.userId || '',
        name: customer?.name || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        address: customer?.address || '',
        isDefault: showDefaultOption ? true : (customer?.isDefault || false),
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Customer name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name is too long'),
        phone: Yup.string()
            .nullable()
            .matches(/^[0-9+\-\s]*$/, 'Invalid phone number format')
            .max(20, 'Phone number is too long'),
        email: Yup.string()
            .nullable()
            .email('Invalid email address')
            .max(100, 'Email is too long'),
        address: Yup.string()
            .nullable()
            .max(200, 'Address is too long'),
    });

    const handleSubmit = async (values: Customer) => {
        try {
            if (isEditing) {
                await customerService.update(customer.customerId, {
                    name: values.name,
                    phone: values.phone,
                    email: values.email,
                    address: values.address,
                    isDefault: values.isDefault,
                });
                Notify.success('Customer updated successfully');
            } else {
                await customerService.store(values);
                Notify.success('Customer added successfully');
            }
            onSuccess();
        } catch (error) {
            Notify.failure(isEditing ? 'Failed to update customer' : 'Failed to add customer');
        }
    };

    return (
        <Modal
            title={isEditing ? 'Edit Customer' : 'New Customer'}
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-md bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <FormWrapper>
                            <FormInput
                                type="text"
                                name="name"
                                label="Customer Name*"
                                required
                                placeholder="Enter name"
                            />

                            <FormInput
                                type="text"
                                name="phone"
                                label="Phone Number"
                                placeholder="Enter phone number"
                            />

                            <FormInput
                                type="email"
                                name="email"
                                label="Email Address"
                                placeholder="Enter email address"
                            />

                            <FormInput
                                type="text"
                                name="address"
                                label="Address"
                                placeholder="Enter address"
                            />

                            {showDefaultOption && (
                                <div className="flex items-center space-x-2 pt-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isDefault"
                                            readOnly={true}
                                            disabled={true}
                                            checked={values.isDefault}
                                            onChange={(e) => setFieldValue('isDefault', e.target.checked)}
                                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Set as Default Customer
                                        </span>
                                    </label>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    theme="neutral"
                                    onClick={onClose}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    theme="primary"
                                    loading={isSubmitting}
                                    className="flex-1"
                                >
                                    {isEditing ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </FormWrapper>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default CustomerModal;
