import * as Yup from 'yup';
import { FunctionComponent } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { Notify, Report } from 'notiflix';
import Card from '../../../components/card/Card';
import { Button } from '../../../components';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import { User2Icon } from 'lucide-react';
import usersService from '../../../services/users.service';
import { getErrorMessage } from '../../../utils/api-error-handler';

type Props = {
    user: User | null;
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

const EditProfileForm: FunctionComponent<Props> = ({ user }) => {
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
        } catch (error: any) {
            Notify.failure(
                getErrorMessage(error, 'An error occurred while updating profile')
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
                <User2Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Edit Profile
                </h3>
            </div>

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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            </div>
                        </FormWrapper>

                        <div className="flex justify-end mt-6">
                            <Button
                                type="submit"
                                loading={isSubmitting}
                                className="px-6"
                            >
                                Update Profile
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Card>
    );
};

export default EditProfileForm;
