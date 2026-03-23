import * as Yup from 'yup';
import { FunctionComponent, useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { Notify, Report } from 'notiflix';
import { Card, Flex, Box, Text, Heading, Button } from '@radix-ui/themes';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import { KeyIcon } from 'lucide-react';
import usersService from '../../../services/users.service';
import { getErrorMessage } from '../../../utils/api-error-handler';

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
        .required('Current password is required'),
    newPassword: Yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters'),
    confirmPassword: Yup.string()
        .required('Please confirm your new password')
        .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

const initialPasswordValues: PasswordValues = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
};

const ChangePasswordForm: FunctionComponent<Props> = ({ userId, onSuccess }) => {

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
                getErrorMessage(error, 'An error occurred while changing password')
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card size="3">
            <Flex align="center" gap="2" mb="6">
                <KeyIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <Heading as="h3" size="4" weight="bold">
                    Change Password
                </Heading>
            </Flex>

            <Formik
                initialValues={initialPasswordValues}
                validationSchema={passwordValidationSchema}
                onSubmit={handlePasswordSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <FormWrapper>
                            <Box className="space-y-4">
                                <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormInput
                                        type={'password'}
                                        name="oldPassword"
                                        label="Current Password"
                                        required
                                        placeholder="Enter your current password"
                                    />
                                    <FormInput
                                        type={'password'}
                                        name="newPassword"
                                        label="New Password"
                                        required
                                        placeholder="Enter new password"
                                    />
                                    <FormInput
                                        type={'password'}
                                        name="confirmPassword"
                                        label="Confirm New Password"
                                        required
                                        placeholder="Confirm new password"
                                    />
                                </Box>
                            </Box>
                        </FormWrapper>

                        <Flex justify="end" mt="6">
                            <Button
                                type="submit"
                                loading={isSubmitting}
                                className="px-6"
                            >
                                Change Password
                            </Button>
                        </Flex>
                    </Form>
                )}
            </Formik>
        </Card>
    );
};

export default ChangePasswordForm;
