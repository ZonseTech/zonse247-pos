import type { Dispatch, FunctionComponent, SetStateAction } from "react"
import { useState } from "react"
import * as Yup from 'yup';
import AuthLayout from "../../layouts/AuthLayout"
import { Form, Formik } from "formik"
import FormWrapper from "../../components/FormWrapper"
import { Alert, Button, } from "../../components"
import { useAuth } from "../../context/AuthProvider"
import { ROUTES } from "../../utils/constants"
import FormInput from "../../components/FormInput";
import { Link } from "react-router-dom";
import FormTextArea from "../../components/FormTextArea";
import ActivatingStep from "./partials/ActivatingStep";
import SuccessStep from "./partials/SuccessStep";
import ErrorStep from "./partials/ErrorStep";

const ActivateWorkStation: FunctionComponent = () => {
    const auth = useAuth()
    const [step, setStep] = useState<'input' | 'activating' | 'success' | 'error'>('input');
    const [errorMessage, setErrorMessage]: [string, Dispatch<SetStateAction<string>>] = useState('')

    const registerProps: ShopVerificationParams = {
        clientId: '',
        authToken: '',
        workstationName: '',
        os: '',
        hostname: '',
        macAddress: ''
    }

    const registerValidationSchema: Yup.ObjectSchema<{
        authToken: string;
        clientId: string;
    }, Yup.AnyObject, {
        authToken: undefined;
        clientId: undefined;
    }, ""> = Yup.object({
        authToken: Yup.string()
            .required('Auth token is required'),

        clientId: Yup.string()
            .required('Please enter your clientId'),

        workstationName: Yup.string()
            .required('Work station name is required.')
    })

    const handleSubmit = async (values: ShopVerificationParams): Promise<void> => {
        try {
            setStep('activating');

            await auth.signup(values)
                .catch((e) => {
                    throw new Error(e.message || 'Activation failed');
                })

            setStep('success');
        } catch (error: any) {
            setStep('error');
            setErrorMessage(error.message);
        }
    }

    return (
        <AuthLayout>

            {step === 'activating' && <ActivatingStep />}
            {step === 'success' && <SuccessStep />}
            {step === 'error' && <ErrorStep errorMessage={errorMessage}
                setStep={setStep} />}

            {step === 'input' && <Formik
                initialValues={registerProps}
                validationSchema={registerValidationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, values }) => (
                    <Form>
                        <div className="mb-3 text-center">
                            <h1 className="text-gray-700 font-semibold text-xl">
                                Activate Workstation
                            </h1>
                        </div>

                        <FormWrapper>
                            {(errorMessage) && <Alert type="danger">
                                <span>{errorMessage}</span>
                            </Alert>}

                            <input
                                type="hidden"
                                name="os"
                                value={values.os}
                            />
                            <input
                                type="hidden"
                                name="hostname"
                                value={values.hostname}
                            />
                            <input
                                type="hidden"
                                name="macAddress"
                                value={values.macAddress}
                            />

                            <FormInput
                                label='Client ID'
                                id='clientId'
                                name='clientId'
                                type='text'
                                step={1}
                                required
                                placeholder="Enter client ID from email"
                            />

                            <FormTextArea
                                label='Auth token'
                                id='authToken'
                                name='authToken'
                                rows={3}
                                className="rounded-sm"
                                required
                                placeholder="Paste auth token from email"
                            />

                            <FormInput
                                label='Workstation Name'
                                id='workstationName'
                                name='workstationName'
                                type='text'
                                step={3}
                                required
                                placeholder="e.g., Till-01, Counter-A" />

                            <Button
                                type='submit'
                                className="mt-1 mb-8 bg-[#102f4f]"
                                block
                                loading={isSubmitting}>
                                Activate Workstation
                            </Button>
                        </FormWrapper>

                        <div className="text-center text-xs text-gray-500">
                            Already have an account?{' '}
                            <Link
                                to={ROUTES.LOGIN}
                                className="text-[#102f4f] hover:underline cursor-pointer"
                            >
                                Jump right back in!
                            </Link>
                        </div>

                    </Form>)}
            </Formik>}
        </AuthLayout>
    )
}

export default ActivateWorkStation