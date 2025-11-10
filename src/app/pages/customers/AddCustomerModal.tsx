import { Button, Modal } from '../../components';
import { HiOutlinePlus } from 'react-icons/hi';
import IconButton from '../../components/IconButton';
import { Fragment, FunctionComponent, PropsWithChildren, useState } from 'react'
import FormWrapper from '../../components/FormWrapper';
import FormInput from '../../components/FormInput';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Notify } from 'notiflix';
import customerSerive from '../../services/customers.service';

type Props = {
    handleSelectedCustomer: (customer: Customer) => void
}

const AddCustomerModal: FunctionComponent<PropsWithChildren<Props>> = ({ handleSelectedCustomer }) => {
    const [isOpenForm, setIsOpenForm] = useState(false);

    const initialCustomerValues: Customer = {
        customerId: '',
        name: '',
        phone: '',
        email: '',
        address: ''
    };

    const customerValidationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Customer name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name is too long'),

        phone: Yup.string()
            .nullable()
            .matches(/^[0-9+\-\s]+$/, 'Invalid phone number format')
            .max(20, 'Phone number is too long'),

        email: Yup.string()
            .nullable()
            .email('Invalid email address')
            .max(100, 'Email is too long'),

        address: Yup.string()
            .nullable()
            .max(200, 'Address is too long')
    });

    const handleNewCustomerClicked = () => {
        setIsOpenForm(!isOpenForm);
    }

    const handleSubmit = async (values: Customer) => {
        try {
            const customer = await customerSerive.store(values);
            Notify.success('Customer added successfully');
            handleSelectedCustomer(customer);
            setIsOpenForm(false);
        } catch (error) {
            Notify.failure('Failed to add customer');
        }
    };

    return (
        <Fragment>
            <IconButton
                color='bg-green-500'
                icon={<HiOutlinePlus className='w-3.5 h-3.5' />}
                className='rounded-r-sm rounded-l-none py-4'
                onClick={handleNewCustomerClicked}
            />

            <Modal
                title='New Customer'
                isOpen={isOpenForm}
                onClose={handleNewCustomerClicked}
                className='max-w-xs bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'>

                <Formik
                    initialValues={initialCustomerValues}
                    validationSchema={customerValidationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, }) => (
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
                                    label="Customer Phone"
                                    placeholder="Enter Phone number"
                                />

                                <FormInput
                                    type="email"
                                    name="email"
                                    label="Customer Email"
                                    placeholder="Enter email address"
                                />

                                <FormInput
                                    type="text"
                                    name="address"
                                    label="Customer Address"
                                    placeholder="Enter address"
                                />

                                <Button
                                    type="submit"
                                    block={true}
                                    loading={isSubmitting}
                                >
                                    Submit
                                </Button>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </Fragment>
    )
}


export default AddCustomerModal