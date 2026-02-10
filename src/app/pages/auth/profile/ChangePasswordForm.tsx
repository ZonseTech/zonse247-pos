import * as Yup from 'yup';
import { FunctionComponent, useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { Notify, Report } from 'notiflix';
import Card from '../../../components/card/Card';
import { Button } from '../../../components';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import { KeyIcon, LockIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import usersService from '../../../services/users.service';

type Props = {
    userId: string;
};

type PasswordValues = {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
};

const passwordValidationSchema = Yup.object().shape({
    oldPassword: Yup.string()
        .required('Current password is required')
        .min(5, 'Password must be at least 5 characters'),
    newPassword: Yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmPassword: Yup.string()
        .required('Please confirm your new password')
        .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

const initialPasswordValues: PasswordValues = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
};

const ChangePasswordForm: FunctionComponent<Props> = ({ userId }) => {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handlePasswordSubmit = async (
        values: PasswordValues,
        { setSubmitting, resetForm }: FormikHelpers<PasswordValues>
    ) => {
        try {
            await usersService.changePassword(userId, {
                currentPassword: values.oldPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
            });
            Report.success('Success!', 'Password changed successfully', 'Ok');
            resetForm();
        } catch (error: any) {
            Notify.failure(
                error?.response?.data?.message || 'An error occurred while changing password'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
                <KeyIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Change Password
                </h3>
            </div>

            <Formik
                initialValues={initialPasswordValues}
                validationSchema={passwordValidationSchema}
                onSubmit={handlePasswordSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <FormWrapper>
                            <div className="space-y-4">
                                <div className="relative">
                                    <FormInput
                                        type={showOldPassword ? 'text' : 'password'}
                                        name="oldPassword"
                                        label="Current Password"
                                        required
                                        placeholder="Enter your current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        {showOldPassword ? (
                                            <EyeOffIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <FormInput
                                            type={showNewPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            label="New Password"
                                            required
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        >
                                            {showNewPassword ? (
                                                <EyeOffIcon className="w-5 h-5" />
                                            ) : (
                                                <EyeIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <FormInput
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            label="Confirm New Password"
                                            required
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOffIcon className="w-5 h-5" />
                                            ) : (
                                                <EyeIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </FormWrapper>

                        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                                <LockIcon className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-amber-700 dark:text-amber-300">
                                    <p className="font-medium mb-1">Password Requirements:</p>
                                    <ul className="list-disc list-inside space-y-0.5">
                                        <li>At least 8 characters long</li>
                                        <li>Contains uppercase and lowercase letters</li>
                                        <li>Contains at least one number</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button
                                type="submit"
                                loading={isSubmitting}
                                className="px-6"
                            >
                                Change Password
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Card>
    );
};

export default ChangePasswordForm;
