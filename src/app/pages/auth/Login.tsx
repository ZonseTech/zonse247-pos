import * as Yup from 'yup';
import { useState, useRef } from "react";
import { Form, Formik } from 'formik'
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import { useNavigate } from 'react-router-dom'
import { ROUTES } from "../../utils/constants";
import AuthLayout from "../../layouts/AuthLayout";
import FormInput from "../../components/FormInput";
import { useAuth } from "../../context/AuthProvider";
import FormWrapper from "../../components/FormWrapper";
import { useIsEBN } from '../../hooks/useMediaQuery';
import InputKeyboard from "../../components/InputKeyboard";
import { useKeyboardSettings } from '../../hooks/useKeyboardSettings';
import { getErrorMessage } from '../../utils/api-error-handler';
import type { Dispatch, FunctionComponent, SetStateAction } from "react";

interface AuthProps {
    password: string;
    username: string;
}

const Login: FunctionComponent = () => {
    const auth = useAuth()
    const isEBN = useIsEBN();
    const navigate = useNavigate();
    const keyboardSettings = useKeyboardSettings();
    const [authError, setAuthError]: [string, Dispatch<SetStateAction<string>>] = useState('')
    const [activeField, setActiveField] = useState<'username' | 'password' | null>('username')
    const usernameInputRef = useRef<any>(null)
    const passwordInputRef = useRef<any>(null)
    const formikRef = useRef<any>(null)

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

    const handleKeyPress = (key: string) => {
        if (!activeField) return;

        const fieldName = activeField;
        const currentValue = formikRef.current?.values[fieldName] || '';
        const newValue = currentValue + key;

        formikRef.current?.setFieldValue(fieldName, newValue);
    }

    const handleBackspace = () => {
        if (!activeField) return;

        const fieldName = activeField;
        const currentValue = formikRef.current?.values[fieldName] || '';
        const newValue = currentValue.slice(0, -1);

        formikRef.current?.setFieldValue(fieldName, newValue);
    }

    const handleSpace = () => {
        if (!activeField) return;

        const fieldName = activeField;
        const currentValue = formikRef.current?.values[fieldName] || '';
        const newValue = currentValue + ' ';

        formikRef.current?.setFieldValue(fieldName, newValue);
    }

    const handleEnter = () => {
        if (activeField === 'username') {
            setActiveField('password')
            passwordInputRef.current?.focus()
        } else if (activeField === 'password') {
            formikRef.current?.submitForm()
        }
    }

    const handleSubmit = async (values: AuthProps): Promise<void> => {
        try {
            const user = await auth.signin(values)
            navigate(ROUTES.POS);
        } catch (error: any) {
            setAuthError(getErrorMessage(error, 'Login failed. Please try again.'));
        }
    }

    return (
        <AuthLayout
            className='max-w-md'
            keyboard={
                <InputKeyboard
                    variant="full"
                    onKeyPress={handleKeyPress}
                    onBackspace={handleBackspace}
                    onEnter={handleEnter}
                    onSpace={handleSpace}
                    compact={isEBN}
                    settings={{
                        theme: keyboardSettings.theme,
                        enableSound: keyboardSettings.enableSound,
                        enableHaptic: keyboardSettings.enableHaptic,
                    }}
                />
            }
        >
            <Formik
                innerRef={formikRef}
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

                            <FormInput
                                inputRef={usernameInputRef}
                                label='Username'
                                id='username'
                                name='username'
                                type='text'
                                step={1}
                                required
                                placeholder="johnbob"
                                readOnly={false}
                                onClick={() => {
                                    setActiveField('username')
                                    usernameInputRef.current?.focus()
                                }}
                            />


                            <FormInput
                                inputRef={passwordInputRef}
                                label='Password'
                                id='password'
                                name='password'
                                type='password'
                                step={2}
                                required
                                placeholder="***************"
                                readOnly={false}
                                onClick={() => {
                                    setActiveField('password')
                                    passwordInputRef.current?.focus()
                                }}
                            />

                            <Button type='submit' className="mt-6 mb-8" block loading={isSubmitting}>
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