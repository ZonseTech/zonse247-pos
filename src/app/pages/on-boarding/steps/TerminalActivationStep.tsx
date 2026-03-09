import * as Yup from 'yup';
import { Form, Formik } from "formik";
import { FunctionComponent } from "react";
import { Button } from "../../../components";
import { LockKeyholeIcon } from "lucide-react";
import FormInput from "../../../components/FormInput";
import FormWrapper from "../../../components/FormWrapper";

interface TerminalActivationStepProps {
    onSubmit: (values: { activationCode: string }) => Promise<void>;
    loading?: boolean;
}

const activationCodeSchema = Yup.object({
    activationCode: Yup.string()
        .required('Activation code is required')
        .min(32, 'Activation code is too short')
        .matches(/^[a-f0-9:]+$/i, 'Invalid activation code format'),
});

const TerminalActivationStep: FunctionComponent<TerminalActivationStepProps> = ({
    onSubmit,
    loading = false
}) => {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                    Enter the activation code provided by your administrator to get started with terminal activation.
                </p>
            </div>

            <Formik
                initialValues={{ activationCode: '' }}
                validationSchema={activationCodeSchema}
                onSubmit={onSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="max-w-md mx-auto">
                        <FormWrapper>
                            <FormInput
                                label='Activation Code'
                                id='activationCode'
                                name='activationCode'
                                className="rounded-sm text-center uppercase tracking-widest font-mono"
                                required
                                placeholder="Enter activation code"
                                autoComplete="off"
                                autoFocus
                            />

                            <Button
                                type='submit'
                                className="mt-4 mb-4 bg-[#102f4f] uppercase tracking-wide font-medium"
                                block
                                loading={isSubmitting || loading}
                                disabled={isSubmitting || loading}
                            >
                                <LockKeyholeIcon className="w-4 h-4 mr-2" />
                                Activate Terminal
                            </Button>
                        </FormWrapper>
                    </Form>
                )}
            </Formik>

            <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    The activation code is a unique identifier for this device.
                    <br />
                    Contact your administrator if you don't have one.
                </p>
            </div>
        </div>
    );
};

export default TerminalActivationStep;
