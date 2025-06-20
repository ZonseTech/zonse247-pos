import * as Yup from 'yup';
import { useState } from "react";
import { Form, Formik } from 'formik'
import { toast } from 'react-toastify'
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import { useNavigate } from 'react-router-dom'
import { ROUTES } from "../../utils/constants";
import AuthLayout from "../../layouts/AuthLayout";
import FormInput from "../../components/FormInput";
import { useAuth } from "../../context/AuthProvider";
import FormWrapper from "../../components/FormWrapper";
import type { Dispatch, FunctionComponent, SetStateAction } from "react";

const Login: FunctionComponent = () => {
    const auth = useAuth()
    const navigate = useNavigate();
    const [authError, setAuthError]: [string, Dispatch<SetStateAction<string>>] = useState('')

    const loginProps: AuthProps = {
        password: '',
        username: '',
    }

    const loginValidationSchema: Yup.ObjectSchema<{
        password: string;
        username: string;
    }, Yup.AnyObject, {
        password: undefined;
        username: undefined;
    }, ""> = Yup.object({
        password: Yup.string()
            .required('Password is required'),

        username: Yup.string()
            .required('Please enter your username'),
    })

    const handleSubmit = async (values: AuthProps): Promise<void> => {
        try {

            const user = await auth.signin(values)

            toast.success('Welcome back! ' + user.user.fullname)

            navigate(ROUTES.DASHBOARD);
            location.reload()
        } catch (error: any) {
            setAuthError(error.message);
        }
    }

    return (
        <AuthLayout className='max-w-4xl'>
            <Formik
                initialValues={loginProps}
                validationSchema={loginValidationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>

                        <h1 className="mb-4 text-xl text-center font-semibold text-gray-700 dark:text-gray-400">
                            Sign in
                        </h1>

                        <FormWrapper>
                            {(authError) && <Alert type="danger"><span>{authError}</span></Alert>}

                            <FormInput label='Username' id='username' name='username' type='text' step={1} required placeholder="johnbob" className="mt-1" />

                            <FormInput label='Password' id='password' name='password' type='password' step={2} required placeholder="***************" />

                            <Button type='submit' className="mt-1 mb-8" block loading={isSubmitting}>
                                Log in
                            </Button>
                        </FormWrapper>

                    </Form>
                )}
            </Formik>
        </AuthLayout>
    )
}


export default Login;