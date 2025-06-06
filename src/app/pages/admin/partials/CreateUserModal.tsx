import * as Yup from 'yup'
import { Form, Formik } from 'formik'
import { Fragment, useState } from 'react'
import { HiOutlinePlus } from 'react-icons/hi'
import { Button, Modal } from '../../../components'
import FormInput from '../../../components/FormInput'
import IconButton from '../../../components/IconButton'
import FormWrapper from '../../../components/FormWrapper'
import { Notify, Report } from 'notiflix'
import usersService from '../../../services/users.service'

const CreateUserModal = ({ user }: { user?: User }) => {
    const [isOpenForm, setIsOpenForm] = useState(false)

    const initialUserValues: User = {
        uuid: '',
        fullname: '',
        username: '',
        password: '',
        status: '',
        permProducts: user?.permProducts ? 1 : 0,
        permCategories: user?.permCategories ? 1 : 0,
        permTransactions: user?.permTransactions ? 1 : 0,
        permUsers: user?.permUsers ? 1 : 0,
        permSettings: user?.permSettings ? 1 : 0
    };

    const userValidationSchema = Yup.object().shape({
        uuid: Yup.string(),
        fullname: Yup.string()
            .required('Full name is required')
            .min(2, 'Name must be at least 3 characters')
            .max(50, 'Name is too long'),
        username: Yup.string()
            .required('Username is required')
            .min(3, 'Username must be at least 3 characters')
            .max(20, 'Username is too long')
            .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
        password: Yup.string()
            .when('id', {
                is: (uuid: string) => !uuid,
                then: () => Yup.string()
                    .required('Password is required')
                    .min(6, 'Password must be at least 6 characters'),
                otherwise: () => Yup.string().notRequired()
            }),
        repeatPassword: Yup.string()
            .when('password', {
                is: (val: string) => val && val.length > 0,
                then: () => Yup.string()
                    .required('Please confirm your password')
                    .oneOf([Yup.ref('password')], 'Passwords must match')
            }),
        permProducts: Yup.number().transform(value => value ? 1 : 0),
        permCategories: Yup.number().transform(value => value ? 1 : 0),
        permTransactions: Yup.number().transform(value => value ? 1 : 0),
        permUsers: Yup.number().transform(value => value ? 1 : 0),
        permSettings: Yup.number().transform(value => value ? 1 : 0)
    });

    const handleAddUserClicked = () => {
        setIsOpenForm(!isOpenForm)
    }

    const handleSubmit = async (values: User) => {
        try {
            await usersService.store(values);

            Report.success("Great!", "User details saved!", "Ok");
            setIsOpenForm(false);
        } catch (error) {
            Notify.failure('An error occurred while saving the user');
        }
    }

    return (
        <Fragment>
            <IconButton
                color='bg-yellow-400'
                className='rounded-r rounded-l-none'
                onClick={handleAddUserClicked}
                icon={<HiOutlinePlus className='w-5 h-5' />}
            />

            <Modal
                title='Add User Account'
                isOpen={isOpenForm}
                onClose={handleAddUserClicked}
                className='max-w-xs bg-white text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
            >
                <Formik
                    initialValues={initialUserValues}
                    validationSchema={userValidationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <FormWrapper>
                                <FormInput
                                    type="text"
                                    name="fullname"
                                    label="Name"
                                    required
                                    placeholder="Enter full name"
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
                                    autoComplete="new-password"
                                />

                                <FormInput
                                    type="password"
                                    name="repeatPassword"
                                    label="Repeat Password"
                                    placeholder="Repeat"
                                    autoComplete="new-password"
                                />

                                <div className="gap-y-8">
                                    <h2 className="mb-4">Permissions</h2>

                                    <FormInput
                                        type='checkbox'
                                        className='my-2'
                                        name="permProducts"
                                        label="Manage Products and Stock"
                                    />

                                    <FormInput
                                        type='checkbox'
                                        className='my-2'
                                        name="permCategories"
                                        label="Manage Product Categories"
                                    />

                                    <FormInput
                                        type='checkbox'
                                        className='my-2'
                                        name="permTransactions"
                                        label="View Transactions"
                                    />

                                    <FormInput
                                        type='checkbox'
                                        className='my-2'
                                        name="permUsers"
                                        label="Manage Users and Permissions"
                                    />

                                    <FormInput
                                        type='checkbox'
                                        className='my-2'
                                        name="permSettings"
                                        label="Manage Settings"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    block={true}
                                    loading={isSubmitting}
                                >
                                    Create User
                                </Button>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </Fragment>
    )
}

export default CreateUserModal