import { Form, Formik } from "formik";
import { Link } from "react-router-dom";
import { Button } from "../../../../components";
import FormInput from "../../../../components/FormInput";
import FormTextArea from "../../../../components/FormTextArea";
import FormWrapper from "../../../../components/FormWrapper";
import { ROUTES } from "../../../../utils/constants";

const ClientVerificationStep = ({
    credentials,
    credentialsValidationSchema,
    onSubmit
}) => {
    return (
        <div className="space-y-6">
            <Formik
                initialValues={credentials}
                validationSchema={credentialsValidationSchema}
                onSubmit={onSubmit}
            >
                {({ isSubmitting, values }) => (
                    <Form>
                        <div className="mb-3 text-center">
                            <h1 className="text-gray-700 dark:text-gray-400 font-semibold text-xl">
                                Client Verification
                            </h1>
                            <p className="text-gray-500 text-sm leading mt-2">
                                Enter your Client ID and Auth Key to verify your account
                            </p>
                        </div>

                        <FormWrapper>
                            <FormInput
                                label='Client ID'
                                id='clientUuid'
                                name='clientUuid'
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
                                className="text-[#102f4f] dark:text-sky-500 hover:underline cursor-pointer"
                            >
                                Jump right back in!
                            </Link>
                        </div>

                    </Form>)}
            </Formik>
        </div>)
}


export default ClientVerificationStep