import * as Yup from 'yup';
import { FunctionComponent, useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button } from '../../../components';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import usersService from '../../../services/users.service';

type Props = {
    userId: string;
    onSuccess?: () => void;
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

const MobileChangePasswordForm: FunctionComponent<Props> = ({ userId, onSuccess }) => {
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
            onSuccess?.();
        } catch (error: any) {
            Notify.failure(
                error?.response?.data?.message || 'An error occurred while changing password'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="px-4 pb-6">
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
                                </div>
                                <div className="relative">
                                    <FormInput
                                        type={showNewPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        label="New Password"
                                        required
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div className="relative">
                                    <FormInput
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        label="Confirm New Password"
                                        required
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </FormWrapper>

                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Password Requirements:
                            </p>
                            <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                                <li>• At least 8 characters</li>
                                <li>• One uppercase letter</li>
                                <li>• One lowercase letter</li>
                                <li>• One number</li>
                            </ul>
                        </div>

                        <div className="mt-6">
                            <Button
                                type="submit"
                                loading={isSubmitting}
                                className="w-full py-3"
                            >
                                Change Password
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default MobileChangePasswordForm;
