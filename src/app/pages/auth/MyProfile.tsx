import * as Yup from 'yup';
import { Notify, Report } from 'notiflix';
import { Form, Formik } from 'formik';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import { FunctionComponent, useContext } from 'react'
import usersService from '../../services/users.service';
import { Button, Select } from '../../components';
import FormWrapper from '../../components/FormWrapper';
import FormInput from '../../components/FormInput';
import { ThemeContext } from '../../context/ThemeContext';
import PageHeader from '../../components/page/PageHeader';
import { User2Icon } from 'lucide-react';

type Props = {
    user?: User;
}

type UserValues = {
    userId: string,
    fullname: string,
    username: string,
    email: string,
    phone?: string,
    departmentId?: string,
    roleName: string,
    password?: string,
    repeatPassword?: string,
}

const UserDetailsPage: FunctionComponent<Props> = ({ user }) => {
    const { mode: theme, toggleMode } = useContext(ThemeContext);

    const initialUserValues = {
        password: '',
        repeatPassword: '',
        userId: user?.userId || '',
        fullname: user?.fullname || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        roleName: user?.roleName || 'user',
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

        email: Yup.string()
            .required('Email is required')
            .email('Email must be valid'),

        phone: Yup.string()
            .matches(/^[0-9\-\+\(\)\s]*$/, 'Phone number is invalid'),

        password: Yup.string()
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
            await usersService.update(values.userId.toString(), values);
            Report.success("Success!", "Profile updated successfully", "Ok");
        } catch (error) {
            Notify.failure('An error occurred while saving the user');
        }
    }

    return (
        <div className="max-w-5xl">
            <PageHeader
                title="Personal Information"
                description="Your account details and profile information"
                icon={<User2Icon className="w-8 h-8 text-blue-600" />}
            />

            <Formik
                initialValues={initialUserValues}
                validationSchema={userValidationSchema}
                onSubmit={handleOnSubmit}
            >
                {({ isSubmitting, values }) => (
                    <Form>
                        <FormWrapper>
                            <input type='hidden' name='userId' />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    type="text"
                                    name="fullname"
                                    label="Full Name"
                                    required
                                    placeholder="Enter your full name"
                                />

                                <FormInput
                                    type="text"
                                    name="username"
                                    label="Username"
                                    required
                                    placeholder="Enter your username"
                                />

                                <FormInput
                                    type="email"
                                    name="email"
                                    label="Email Address"
                                    required
                                    placeholder="Enter your email"
                                />

                                <FormInput
                                    type="tel"
                                    name="phone"
                                    label="Phone Number"
                                    placeholder="Enter your phone number"
                                />

                                <FormInput
                                    type="text"
                                    name="department"
                                    label="Department"
                                    placeholder="Enter your department"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Role
                                    </label>
                                    <Select
                                        name="role"
                                        value={values.roleName}
                                        disabled
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed opacity-60"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="cashier">Cashier</option>
                                        <option value="user">User</option>
                                    </Select>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Contact administrator to change your role
                                    </p>
                                </div>
                            </div>
                        </FormWrapper>

                        <div className="mb-6">
                            <div className="py-6 mb-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Security
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Update your password (optional)
                                </p>
                            </div>

                            <FormWrapper>
                                <FormInput
                                    type="password"
                                    name="password"
                                    label="New Password"
                                    placeholder="Leave blank to keep current password"
                                />

                                <FormInput
                                    type="password"
                                    name="repeatPassword"
                                    label="Confirm Password"
                                    placeholder="Confirm your new password"
                                />
                            </FormWrapper>
                        </div>

                        <div className="rounded-2xl shadow-sm mb-6">
                            <div className="py-6 mb-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Appearance
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Customize your display preferences
                                </p>
                            </div>

                            <div className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Theme
                                        </label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Current: <span className="font-medium capitalize">{theme}</span>
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleMode}
                                        className="flex items-center gap-2 px-4 py-2 rounded-sm text-gray-700 dark:text-gray-300 transition-colors font-medium"
                                    >
                                        {theme === 'light' ? (
                                            <>
                                                <HiOutlineMoon className='w-5 h-5' />
                                                Switch to Dark
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlineSun className='w-5 h-5' />
                                                Switch to Light
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <Button
                                type="submit"
                                loading={isSubmitting}
                                className="px-8"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default UserDetailsPage