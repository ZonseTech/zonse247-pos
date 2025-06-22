import * as Yup from 'yup';
import { Notify, Report } from 'notiflix';
import { Form, Formik } from 'formik';
import { HiOutlineUser } from 'react-icons/hi2';
import { Button, Modal } from '../../../components';
import FormInput from '../../../components/FormInput';
import FormWrapper from '../../../components/FormWrapper';
import usersService from '../../../services/users.service';
import { Fragment, FunctionComponent, useState } from 'react'
import IconLabelButton from '../../../components/IconLabelButton';

type Props = {
    user?: User;
}

type UserValues = {
    uuid: string,
    fullname: string,
    username: string,
    password?: string,
    repeatPassword?: string,
}

const AccountInformationModal: FunctionComponent<Props> = ({ user }) => {
    const [isOpenForm, setIsOpenForm] = useState(false);
    const initialUserValues = {
        password: '',
        repeatPassword: '',
        uuid: user?.uuid || '',
        fullname: user?.fullname || '',
        username: user?.username || '',
    }

    const userValidationSchema = Yup.object().shape({
        fullname: Yup.string()
            .required('Full name is required')
            .min(3, 'Name must be at least 3 characters')
            .max(50, 'Name is too long'),

        username: Yup.string()
            .required('Username is required')
            .min(3, 'Username must be at least 3 characters')
            .max(20, 'Username is too long')
            .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
        password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters'),
        repeatPassword: Yup.string()
            .when('password', {
                is: (val: string) => val && val.length > 0,
                then: () => Yup.string()
                    .required('Please confirm your password')
                    .oneOf([Yup.ref('password')], 'Passwords must match')
            }),
    })

    const handleOnSubmit = async (values: UserValues) => {
        try {
            await usersService.update(values.uuid.toString(), values);
            Report.success("Susccess!", "Password reset successfuly", "Ok");

            setIsOpenForm(false);
        } catch (error) {
            Notify.failure('An error occurred while saving the user');
        }
    }

    return (
        <Fragment>
            <IconLabelButton
                text={user?.fullname}
                icon={<HiOutlineUser className='w-5 h-5' />}
                color='bg-green-400 uppercase'
                iconColor='bg-green-500'
                onClick={() => setIsOpenForm(prev => !prev)}
            />

            <Modal
                title='Account Information'
                isOpen={isOpenForm}
                onClose={() => setIsOpenForm(prev => !prev)}
                className='max-w-xs bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'>

                <Formik
                    initialValues={initialUserValues}
                    validationSchema={userValidationSchema}
                    onSubmit={handleOnSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <FormWrapper>
                                <input
                                    type='hidden'
                                    name='uuid' />

                                <FormInput
                                    type="text"
                                    name="fullname"
                                    label="Name"
                                    required
                                    placeholder="Enter name"
                                />

                                <FormInput
                                    type="text"
                                    name="username"
                                    label="Username"
                                    required
                                    placeholder="Login Username"
                                />

                                <FormInput
                                    type="password"
                                    name="password"
                                    label="Password"
                                    placeholder="Password"
                                />

                                <FormInput
                                    type="password"
                                    name="repeatPassword"
                                    label="Repeat Password"
                                    placeholder="Repeat"
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

export default AccountInformationModal