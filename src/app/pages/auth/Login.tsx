import * as Yup from 'yup';
import { useState, useRef } from 'react';
import { Form, Formik, useField } from 'formik';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Callout, Flex, Heading, Text } from '@radix-ui/themes';
import { Eye, EyeOff, Lock, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../context/AuthProvider';
import { useIsEBN } from '../../hooks/useMediaQuery';
import InputKeyboard from '../../components/InputKeyboard';
import { useKeyboardSettings } from '../../hooks/useKeyboardSettings';
import { getErrorMessage } from '../../utils/api-error-handler';
import { ROUTES } from '../../utils/constants';
import type { Dispatch, FunctionComponent, SetStateAction } from 'react';

interface AuthProps {
    password: string;
    username: string;
}

interface FormFieldProps {
    name: keyof AuthProps;
    label: string;
    type?: string;
    placeholder: string;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    onClick?: () => void;
    icon: React.ReactNode;
    onValueChange?: () => void;
}

const FormField: FunctionComponent<FormFieldProps> = ({ name, label, type = 'text', placeholder, inputRef, onClick, icon, onValueChange }) => {
    const [field, meta] = useField(name);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <Box width="100%">
            <Text as="label" htmlFor={name} size="2" weight="medium" className="mb-1.5 block text-slate-700 dark:text-slate-300">
                {label}
            </Text>
            <div className={[
                'flex items-center gap-2 rounded-xl border bg-white px-3 py-0 transition-all duration-150 dark:bg-slate-900',
                meta.touched && meta.error
                    ? 'border-red-400 ring-2 ring-red-400/15'
                    : 'border-slate-200 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 dark:border-slate-700 dark:focus-within:border-sky-500',
            ].join(' ')}>
                <span className="shrink-0 text-slate-400">{icon}</span>
                <input
                    id={name}
                    ref={inputRef as React.Ref<HTMLInputElement>}
                    type={isPassword && showPassword ? 'text' : type}
                    placeholder={placeholder}
                    value={field.value}
                    onChange={(event) => { field.onChange(event); onValueChange?.(); }}
                    onBlur={field.onBlur}
                    onClick={onClick}
                    autoComplete={name === 'password' ? 'current-password' : 'username'}
                    className="h-11 w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                />
                {isPassword ? (
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                ) : null}
            </div>
            {meta.touched && meta.error ? (
                <Text color="red" size="1" className="mt-1 block">{meta.error}</Text>
            ) : null}
        </Box>
    );
};

const Login: FunctionComponent = () => {
    const auth = useAuth();
    const isEBN = useIsEBN();
    const navigate = useNavigate();
    const keyboardSettings = useKeyboardSettings();
    const [authError, setAuthError]: [string, Dispatch<SetStateAction<string>>] = useState('');
    const [activeField, setActiveField] = useState<'username' | 'password' | null>('username');
    const usernameInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const formikRef = useRef<any>(null);

    const loginProps: AuthProps = {
        password: '',
        username: '',
    };

    const loginValidationSchema: Yup.ObjectSchema<{
        password: string;
        username: string;
    }, Yup.AnyObject, {
        password: undefined;
        username: undefined;
    }, ''> = Yup.object({
        password: Yup.string().required('Password is required'),
        username: Yup.string().required('Please enter your username'),
    });

    const handleKeyPress = (key: string) => {
        if (!activeField) return;

        const fieldName = activeField;
        const currentValue = formikRef.current?.values[fieldName] || '';
        const newValue = currentValue + key;

        formikRef.current?.setFieldValue(fieldName, newValue);
    };

    const handleBackspace = () => {
        if (!activeField) return;

        const fieldName = activeField;
        const currentValue = formikRef.current?.values[fieldName] || '';
        const newValue = currentValue.slice(0, -1);

        formikRef.current?.setFieldValue(fieldName, newValue);
    };

    const handleSpace = () => {
        if (!activeField) return;

        const fieldName = activeField;
        const currentValue = formikRef.current?.values[fieldName] || '';
        const newValue = currentValue + ' ';

        formikRef.current?.setFieldValue(fieldName, newValue);
    };

    const handleEnter = () => {
        if (activeField === 'username') {
            setActiveField('password');
            passwordInputRef.current?.focus();
        } else if (activeField === 'password') {
            formikRef.current?.submitForm();
        }
    };

    const handleSubmit = async (values: AuthProps): Promise<void> => {
        try {
            await auth.signin(values);
            navigate(ROUTES.DASHBOARD);
        } catch (error: any) {
            setAuthError(getErrorMessage(error, 'Login failed. Please try again.'));
        }
    };

    return (
        <AuthLayout
            className="max-w-md"
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
                        {/* card */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">

                            {/* accent bar */}
                            <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />

                            {/* header */}
                            <div className="px-8 pb-0 pt-8">
                                <Flex align="start" gap="3" mb="5">
                                    <Box>
                                        <Heading as="h1" size="6" weight="bold" className="text-slate-900 dark:text-white">
                                            Sign in
                                        </Heading>
                                        <Text size="2" className="text-slate-500 dark:text-slate-400">
                                            Access your Zonse247 workspace
                                        </Text>
                                    </Box>
                                </Flex>

                                {authError ? (
                                    <Callout.Root color="red" role="alert" variant="surface" mb="4">
                                        <Callout.Text>{authError}</Callout.Text>
                                    </Callout.Root>
                                ) : null}
                            </div>

                            {/* fields */}
                            <div className="px-8 pb-8 pt-2">
                                <Flex direction="column" gap="4">
                                    <FormField
                                        name="username"
                                        label="Username"
                                        placeholder="Enter your username"
                                        inputRef={usernameInputRef}
                                        onClick={() => { setActiveField('username'); usernameInputRef.current?.focus(); }}
                                        onValueChange={() => setAuthError('')}
                                        icon={<UserRound size={16} />}
                                    />

                                    <FormField
                                        name="password"
                                        label="Password"
                                        type="password"
                                        placeholder="Enter your password"
                                        inputRef={passwordInputRef}
                                        onClick={() => { setActiveField('password'); passwordInputRef.current?.focus(); }}
                                        onValueChange={() => setAuthError('')}
                                        icon={<Lock size={16} />}
                                    />

                                    <Button
                                        type="submit"
                                        size="3"
                                        disabled={isSubmitting}
                                        className="mt-1 h-11 w-full cursor-pointer rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 font-semibold text-white shadow-md shadow-blue-500/30 transition-opacity hover:opacity-90 disabled:opacity-60"
                                    >
                                        <LogIn size={17} />
                                        {isSubmitting ? 'Signing in…' : 'Sign in'}
                                    </Button>
                                </Flex>

                                {/* trust footer */}
                                <Flex align="center" justify="center" gap="1" mt="6">
                                    <ShieldCheck size={13} className="text-slate-400" />
                                    <Text size="1" className="text-slate-400">
                                        Secured with end-to-end encryption
                                    </Text>
                                </Flex>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </AuthLayout>
    );
};

export default Login;