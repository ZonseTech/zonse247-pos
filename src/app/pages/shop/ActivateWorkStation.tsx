import type { Dispatch, FunctionComponent, SetStateAction } from "react"
import { useState } from "react"
import * as Yup from 'yup';
import AuthLayout from "../../layouts/AuthLayout"
import { Form, Formik } from "formik"
import FormWrapper from "../../components/FormWrapper"
import { Alert, Button, } from "../../components"
import { ROUTES } from "../../utils/constants"
import FormInput from "../../components/FormInput";
import { Link } from "react-router-dom";
import FormTextArea from "../../components/FormTextArea";
import ActivatingStep from "./partials/ActivatingStep";
import SuccessStep from "./partials/SuccessStep";
import ErrorStep from "./partials/ErrorStep";
import clientsService from "../../services/client.service";
import { AxiosError } from "axios";

const ActivateWorkStation: FunctionComponent = () => {
    const [step, setStep] = useState<'input' | 'activating' | 'success' | 'error'>('input');
    const [errorMessage, setErrorMessage]: [string, Dispatch<SetStateAction<string>>] = useState('')

    const registerProps: ShopVerificationParams = {
        clientId: '',
        authKey: '',
        os: '',
        hostname: '',
        macAddress: ''
    }

    const registerValidationSchema: Yup.ObjectSchema<{
        authKey: string;
        clientId: string;
    }, Yup.AnyObject, {
        authKey: undefined;
        clientId: undefined;
    }, ""> = Yup.object({
        authKey: Yup.string()
            .required('Auth token is required'),

        clientId: Yup.string()
            .required('Please enter your clientId'),
    })

    const handleSubmit = async (values: ShopVerificationParams): Promise<void> => {
        try {
            setStep('activating');

            await clientsService.verify({
                clientId: values.clientId,
                authKey: values.authKey
            })

            setStep('success');
        } catch (error: any) {

            setErrorMessage((error as any)?.error?.response?.data?.message || 'An error occurred while activating the workstation.');

            setStep('error');
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
                            <p className="text-gray-500 text-sm leading mt-2">Set up your POS Workstation in just a few steps</p>
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
                                id='authKey'
                                name='authKey'
                                rows={3}
                                className="rounded-sm"
                                required
                                placeholder="Paste auth token from email"
                            />

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