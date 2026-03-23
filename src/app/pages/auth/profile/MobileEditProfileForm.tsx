import * as Yup from 'yup';
import { FunctionComponent } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { Notify, Report } from 'notiflix';
import { Box, Flex, Button } from '@radix-ui/themes';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import usersService from '../../../services/users.service';
import { getErrorMessage } from '../../../utils/api-error-handler';

type Props = {
    user: User | null;
    onSuccess?: () => void;
};

type ProfileValues = {
    userId: string;
    fullname: string;
    username: string;
    email: string;
    phone: string;
};

const profileValidationSchema = Yup.object().shape({
    fullname: Yup.string()
        .required('Full name is required')
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name is too long'),
    username: Yup.string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username is too long')
        .matches(
            /^[a-zA-Z0-9_]+$/,
            'Username can only contain letters, numbers and underscores'
        ),
    email: Yup.string().required('Email is required').email('Email must be valid'),
    phone: Yup.string().matches(
        /^[0-9\-\+\(\)\s]*$/,
        'Phone number is invalid'
    ),
});

const MobileEditProfileForm: FunctionComponent<Props> = ({ user, onSuccess }) => {
    const initialProfileValues: ProfileValues = {
        userId: user?.userId || '',
        fullname: user?.fullname || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
    };

    const handleProfileSubmit = async (
        values: ProfileValues,
        { setSubmitting }: FormikHelpers<ProfileValues>
    ) => {
        try {
            await usersService.update(values.userId, {
                fullname: values.fullname,
                username: values.username,
                email: values.email,
                phone: values.phone,
            });
            Report.success('Success!', 'Profile updated successfully', 'Ok');
            onSuccess?.();
        } catch (error: any) {
            Notify.failure(
                getErrorMessage(error, 'An error occurred while updating profile')
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box px="4" pb="6">
            <Formik
                initialValues={initialProfileValues}
                validationSchema={profileValidationSchema}
                onSubmit={handleProfileSubmit}
                enableReinitialize
            >
                {({ isSubmitting }) => (
                    <Form>
                        <FormWrapper>
                            <input type="hidden" name="userId" />
                            <Flex direction="column" gap="4">
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
                            </Flex>
                        </FormWrapper>

                        <Box mt="6">
                            <Button
                                type="submit"
                                loading={isSubmitting}
                                className="w-full py-3"
                            >
                                Update Profile
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default MobileEditProfileForm;
