import { Form, Formik } from "formik";
import { Button } from "../../../components";
import FormTextArea from "../../../components/FormTextArea";
import FormWrapper from "../../../components/FormWrapper";

const TenantVerificationStep = ({
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
                {({ isSubmitting }) => (
                    <Form className="max-w-7xl">
                        <div className="mb-3 text-center">
                            <h1 className="text-gray-700 dark:text-gray-400 font-semibold text-xl">
                                Tenant Verification
                            </h1>
                            <p className="text-gray-500 text-sm leading mt-2">
                                Enter your Verification Key to verify your account
                            </p>
                        </div>

                        <FormWrapper>
                            <FormTextArea
                                label='Verification token'
                                id='verificationToken'
                                name='verificationToken'
                                rows={3}
                                className="rounded-sm"
                                required
                                placeholder="Paste verification token from email"
                            />

                            <Button
                                type='submit'
                                className="mt-1 mb-8 bg-[#102f4f]"
                                block
                                loading={isSubmitting}>
                                Verify
                            </Button>
                        </FormWrapper>
                    </Form>)}
            </Formik>
        </div>)
}


export default TenantVerificationStep